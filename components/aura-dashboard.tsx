'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import type { InventoryItem, SortKey } from '@/lib/inventory-data';

type InventoryResponse = {
  items: InventoryItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

type AnalyticsResponse = {
  restockPriority: Array<{ name: string; stock: number; sku: string }>;
  summary: {
    totalSkus: number;
    inventoryValue: number;
    outOfStock: number;
  };
  valuationByCategory: Array<{ name: string; value: number }>;
};

const categories = ['All', 'Electronics', 'Apparel', 'Home Goods', 'Beauty', 'Toys', 'Industrial'];
const barColors = ['#59d4b4', '#7bb5ff', '#ffd166', '#ff8e8e', '#c4a7ff', '#8dd3c7'];

const sortLabels: Record<SortKey, string> = {
  sku: 'SKU',
  name: 'Name',
  category: 'Category',
  stock: 'Stock',
  price: 'Price'
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(value);
}

function buildQuery(params: Record<string, string | number>) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    searchParams.set(key, String(value));
  }

  return searchParams.toString();
}

function useDebouncedValue<T>(value: T, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(timeoutId);
  }, [value, delay]);

  return debouncedValue;
}

export function AuraDashboard() {
  const [searchInput, setSearchInput] = useState('');
  const [category, setCategory] = useState('All');
  const [maxStock, setMaxStock] = useState(120);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(320);
  const [sortKey, setSortKey] = useState<SortKey>('stock');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [table, setTable] = useState<InventoryResponse | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [loadingTable, setLoadingTable] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [exporting, setExporting] = useState(false);
  const debouncedSearch = useDebouncedValue(searchInput, 500);

  const queryString = useMemo(
    () =>
      buildQuery({
        search: debouncedSearch,
        category,
        maxStock,
        minPrice,
        maxPrice,
        sortKey,
        sortDir,
        page,
        pageSize: 50
      }),
    [debouncedSearch, category, maxStock, minPrice, maxPrice, sortKey, sortDir, page]
  );

  useEffect(() => {
    const controller = new AbortController();
    setLoadingAnalytics(true);

    fetch('/api/analytics', { signal: controller.signal })
      .then((response) => response.json())
      .then((data: AnalyticsResponse) => setAnalytics(data))
      .catch(() => undefined)
      .finally(() => setLoadingAnalytics(false));

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoadingTable(true);

    fetch(`/api/inventory?${queryString}`, { signal: controller.signal })
      .then((response) => response.json())
      .then((data: InventoryResponse) => {
        setTable(data);
      })
      .catch(() => undefined)
      .finally(() => setLoadingTable(false));

    return () => controller.abort();
  }, [queryString]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category, maxStock, minPrice, maxPrice, sortKey, sortDir]);

  const totalPages = table?.totalPages ?? 1;
  const pageButtons = useMemo(() => {
    const visiblePages: number[] = [];
    const radius = 2;

    for (let candidate = Math.max(1, page - radius); candidate <= Math.min(totalPages, page + radius); candidate += 1) {
      visiblePages.push(candidate);
    }

    if (visiblePages[0] !== 1) {
      visiblePages.unshift(1);
    }

    if (visiblePages[visiblePages.length - 1] !== totalPages) {
      visiblePages.push(totalPages);
    }

    return [...new Set(visiblePages)];
  }, [page, totalPages]);

  async function handleExport() {
    setExporting(true);

    try {
      const response = await fetch(
        `/api/inventory?${buildQuery({
          search: debouncedSearch,
          category,
          maxStock,
          minPrice,
          maxPrice,
          sortKey,
          sortDir,
          page: 1,
          pageSize: 10000
        })}`
      );
      const exportData: InventoryResponse = await response.json();
      const csvRows = [
        ['SKU', 'Name', 'Category', 'Stock', 'Price', 'Location'],
        ...exportData.items.map((item) => [item.sku, item.name, item.category, String(item.stock), item.price.toFixed(2), item.location])
      ];
      const csv = csvRows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `aura-engine-inventory-${new Date().toISOString().slice(0, 10)}.csv`;
      anchor.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  function toggleSort(nextKey: SortKey) {
    if (nextKey === sortKey) {
      setSortDir((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortKey(nextKey);
    setSortDir(nextKey === 'price' ? 'desc' : 'asc');
  }

  const summaryCards = [
    { label: 'Total SKUs', value: analytics ? formatCompactNumber(analytics.summary.totalSkus) : '—' },
    { label: 'Total Inventory Value', value: analytics ? formatCurrency(analytics.summary.inventoryValue) : '—' },
    { label: 'Out of Stock Items', value: analytics ? formatCompactNumber(analytics.summary.outOfStock) : '—' }
  ];

  const currentCount = table?.items.length ?? 0;
  const totalCount = table?.total ?? 0;

  return (
    <main>
      <div className="shell">
        <section className="hero">
          <div className="hero-card">
            <p className="kicker">Aura Engine</p>
            <h1>Inventory control for high-volume retail operations.</h1>
            <p>
              A fast, enterprise-grade command center for SKU discovery, restock risk analysis, and real-time filtering over thousands of inventory records.
            </p>
            <div className="hero-meta">
              <span className="badge">Server-side pagination</span>
              <span className="badge">500ms debounced search</span>
              <span className="badge">CSV export ready</span>
            </div>
          </div>

          <div className="status-panel">
            <span className="status-chip">Live operational view</span>
            <div className="metric-grid">
              {summaryCards.map((card) => (
                <article key={card.label} className="metric">
                  <label>{card.label}</label>
                  <strong>{loadingAnalytics ? 'Loading…' : card.value}</strong>
                </article>
              ))}
            </div>
            <p style={{ color: 'var(--muted)', lineHeight: 1.6 }}>
              Managers can search the dataset, narrow by category, stock, or price, and export the filtered set without freezing the browser.
            </p>
          </div>
        </section>

        <section className="panel" style={{ borderRadius: 28, padding: 20 }}>
          <div className="toolbar">
            <div className="field">
              <span>Omnisearch</span>
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search SKU, product, category, or warehouse"
              />
            </div>

            <div className="field">
              <span>Category</span>
              <select value={category} onChange={(event) => setCategory(event.target.value)}>
                {categories.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <span>Stock ceiling</span>
              <div className="range-wrap">
                <input type="range" min={0} max={120} value={maxStock} onChange={(event) => setMaxStock(Number(event.target.value))} />
                <div className="range-value">At or below {maxStock} units</div>
              </div>
            </div>

            <div className="field">
              <span>Price range</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <input type="number" min={0} step={1} value={minPrice} onChange={(event) => setMinPrice(Number(event.target.value))} placeholder="Min" />
                <input type="number" min={0} step={1} value={maxPrice} onChange={(event) => setMaxPrice(Number(event.target.value))} placeholder="Max" />
              </div>
            </div>

            <button className="button" onClick={handleExport} disabled={exporting || loadingTable}>
              {exporting ? 'Preparing CSV…' : 'Export to CSV'}
            </button>
          </div>
        </section>

        <section className="section-grid">
          <div className="chart-stack">
            <article className="chart-card">
              <div className="card-header">
                <div>
                  <h2>Restock Priority</h2>
                  <p>Top 10 products with the lowest stock levels.</p>
                </div>
              </div>
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={analytics?.restockPriority ?? []} layout="vertical" margin={{ left: 20, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(173, 198, 233, 0.12)" />
                    <XAxis type="number" stroke="#9bb0c9" />
                    <YAxis type="category" dataKey="name" width={160} stroke="#9bb0c9" />
                    <Tooltip contentStyle={{ background: '#0d1b2d', border: '1px solid rgba(173, 198, 233, 0.18)', borderRadius: 16 }} />
                    <Bar dataKey="stock" radius={[0, 12, 12, 0]}>
                      {(analytics?.restockPriority ?? []).map((entry, index) => (
                        <Cell key={entry.sku} fill={barColors[index % barColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="chart-card">
              <div className="card-header">
                <div>
                  <h2>Filtered Inventory</h2>
                  <p>
                    {loadingTable ? 'Loading matched records…' : `${currentCount} of ${formatCompactNumber(totalCount)} matching items shown on this page.`}
                  </p>
                </div>
                <div className="status-chip" style={{ background: 'rgba(123, 181, 255, 0.1)', color: '#dbe8fb' }}>
                  Page {table?.page ?? 1} of {table?.totalPages ?? 1}
                </div>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      {(['sku', 'name', 'category', 'stock', 'price'] as SortKey[]).map((column) => (
                        <th key={column}>
                          <button className="sort-button" onClick={() => toggleSort(column)}>
                            {sortLabels[column]}
                            {sortKey === column ? <span className="sort-indicator">{sortDir === 'asc' ? '↑' : '↓'}</span> : null}
                          </button>
                        </th>
                      ))}
                      <th>Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {table?.items.length ? (
                      table.items.map((item) => (
                        <tr key={item.sku}>
                          <td>{item.sku}</td>
                          <td>{item.name}</td>
                          <td>{item.category}</td>
                          <td>{item.stock}</td>
                          <td>{formatCurrency(item.price)}</td>
                          <td>{item.location}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="table-empty">
                          No inventory matches the current filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="table-footer">
                <div>
                  Showing {currentCount} rows per page out of {formatCompactNumber(totalCount)} filtered records.
                </div>
                <div className="pagination" aria-label="Pagination">
                  <button onClick={() => setPage(1)} disabled={(table?.page ?? 1) <= 1}>
                    First
                  </button>
                  <button onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={(table?.page ?? 1) <= 1}>
                    Previous
                  </button>
                  {pageButtons.map((pageNumber) => (
                    <button key={pageNumber} onClick={() => setPage(pageNumber)} aria-current={pageNumber === (table?.page ?? 1) ? 'page' : undefined}>
                      {pageNumber}
                    </button>
                  ))}
                  <button onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={(table?.page ?? 1) >= totalPages}>
                    Next
                  </button>
                  <button onClick={() => setPage(totalPages)} disabled={(table?.page ?? 1) >= totalPages}>
                    Last
                  </button>
                </div>
              </div>
            </article>
          </div>

          <div className="chart-stack">
            <article className="chart-card">
              <div className="card-header">
                <div>
                  <h2>Portfolio Distribution</h2>
                  <p>Inventory valuation by category.</p>
                </div>
              </div>
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={analytics?.valuationByCategory ?? []}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={72}
                      outerRadius={112}
                      paddingAngle={4}
                    >
                      {(analytics?.valuationByCategory ?? []).map((entry, index) => (
                        <Cell key={entry.name} fill={barColors[index % barColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#0d1b2d', border: '1px solid rgba(173, 198, 233, 0.18)', borderRadius: 16 }} formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="chart-card">
              <div className="card-header">
                <div>
                  <h2>Operational Snapshot</h2>
                  <p>Fast access signals for managers and executives.</p>
                </div>
              </div>
              <div className="metric-grid">
                <article className="metric">
                  <label>Search latency target</label>
                  <strong>500ms</strong>
                </article>
                <article className="metric">
                  <label>Rows fetched per page</label>
                  <strong>50</strong>
                </article>
                <article className="metric">
                  <label>Browser-safe dataset size</label>
                  <strong>{formatCompactNumber(5120)}</strong>
                </article>
              </div>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
