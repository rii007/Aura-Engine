'use client';

import { useEffect, useMemo, useState } from 'react';
import type { SortingState } from '@tanstack/react-table';
import type { InventoryPageResult, InventoryQuery } from '@/lib/inventory-data';
import { ExportButton } from './export-button';
import { Filters, type FiltersState } from './filters';
import { InventoryTable } from './inventory-table';
import { SearchBar } from './search-bar';

const inventoryCategories = ['All', 'Electronics', 'Apparel', 'Home Goods', 'Beauty', 'Toys', 'Industrial'];

type InventoryClientProps = {
  initialData: InventoryPageResult;
  initialQuery: InventoryQuery;
};

function toQueryString(query: URLSearchParams) {
  return query.toString();
}

function toFiltersState(initialQuery: InventoryQuery): FiltersState {
  const filters = initialQuery.filters ?? {};

  return {
    category: filters.category ?? 'All',
    status: filters.status ?? 'all',
    minStock: filters.minStock?.toString() ?? '',
    maxStock: filters.maxStock?.toString() ?? '',
    minPrice: filters.minPrice?.toString() ?? '',
    maxPrice: filters.maxPrice?.toString() ?? '',
    pageSize: initialQuery.pageSize ?? 20
  };
}

export function InventoryClient({ initialData, initialQuery }: InventoryClientProps) {
  const [search, setSearch] = useState(initialQuery.search ?? '');
  const [filters, setFilters] = useState<FiltersState>(() => toFiltersState(initialQuery));
  const [page, setPage] = useState(initialData.page);
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: initialQuery.sort?.field ?? 'stock',
      desc: initialQuery.sort?.direction === 'desc'
    }
  ]);
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);

  const queryString = useMemo(() => {
    const query = new URLSearchParams();
    query.set('page', String(page));
    query.set('pageSize', String(filters.pageSize));
    if (search.trim()) query.set('search', search.trim());
    if (filters.category !== 'All') query.set('category', filters.category);
    if (filters.status !== 'all') query.set('status', filters.status);
    if (filters.minStock.trim()) query.set('minStock', filters.minStock.trim());
    if (filters.maxStock.trim()) query.set('maxStock', filters.maxStock.trim());
    if (filters.minPrice.trim()) query.set('minPrice', filters.minPrice.trim());
    if (filters.maxPrice.trim()) query.set('maxPrice', filters.maxPrice.trim());
    query.set('sortField', sorting[0]?.id ?? 'stock');
    query.set('sortDirection', sorting[0]?.desc ? 'desc' : 'asc');
    return toQueryString(query);
  }, [filters, page, search, sorting]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    fetch(`/api/inventory?${queryString}`, { signal: controller.signal })
      .then((response) => response.json())
      .then((payload: InventoryPageResult) => setData(payload))
      .catch(() => undefined)
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [queryString]);

  function handleFiltersChange(nextValue: FiltersState) {
    setFilters(nextValue);
    setPage(1);
  }

  return (
    <main className="min-h-screen px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-aura backdrop-blur-xl lg:p-8">
          <p className="text-xs uppercase tracking-[0.32em] text-cyan-300/90">Aura Enterprise Engine</p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <h1 className="font-display text-4xl text-white sm:text-5xl">Inventory operations at enterprise scale.</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300">
                Search and filter 50,000 records with server-side pagination, TanStack Table, and debounced omnisearch.
              </p>
            </div>
            <ExportButton query={queryString} disabled={loading} />
          </div>
        </header>

        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-aura backdrop-blur-xl lg:p-6">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
            <SearchBar value={search} onChange={(nextValue) => {
              setSearch(nextValue);
              setPage(1);
            }} />
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-300">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Data scope</p>
              <p className="mt-2 leading-6">
                Browsing {new Intl.NumberFormat('en-US').format(data.total)} filtered rows across {new Intl.NumberFormat('en-US').format(data.totalPages)} pages.
              </p>
            </div>
          </div>

          <div className="mt-5">
            <Filters value={filters} categories={inventoryCategories} onChange={handleFiltersChange} />
          </div>
        </section>

        <InventoryTable
          data={data.items}
          total={data.total}
          page={data.page}
          pageSize={data.pageSize}
          totalPages={data.totalPages}
          sorting={sorting}
          onSortingChange={(nextSorting) => {
            setSorting(nextSorting);
            setPage(1);
          }}
          onPageChange={setPage}
          loading={loading}
        />
      </div>
    </main>
  );
}
