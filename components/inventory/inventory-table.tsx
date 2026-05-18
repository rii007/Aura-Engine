'use client';

import { useMemo } from 'react';
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  functionalUpdate,
  useReactTable
} from '@tanstack/react-table';
import type { InventoryItem } from '@/lib/inventory-data';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

type InventoryTableProps = {
  data: InventoryItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  sorting: SortingState;
  onSortingChange: (updater: SortingState | ((oldState: SortingState) => SortingState)) => void;
  onPageChange: (page: number) => void;
  loading?: boolean;
};

const statusTone: Record<InventoryItem['status'], string> = {
  healthy: 'bg-emerald-400/15 text-emerald-200',
  low: 'bg-amber-400/15 text-amber-200',
  critical: 'bg-rose-400/15 text-rose-200',
  out: 'bg-slate-400/15 text-slate-200'
};

export function InventoryTable({
  data,
  total,
  page,
  pageSize,
  totalPages,
  sorting,
  onSortingChange,
  onPageChange,
  loading
}: InventoryTableProps) {
  const columns = useMemo<ColumnDef<InventoryItem>[]>(
    () => [
      {
        accessorKey: 'sku',
        header: 'SKU',
        cell: (info) => <span className="font-medium text-slate-50">{info.getValue<string>()}</span>
      },
      {
        accessorKey: 'name',
        header: 'Item'
      },
      {
        accessorKey: 'category',
        header: 'Category'
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: (info) => {
          const status = info.getValue<InventoryItem['status']>();
          return <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusTone[status]}`}>{status}</span>;
        }
      },
      {
        accessorKey: 'stock',
        header: 'Stock',
        cell: (info) => <span className="tabular-nums">{info.getValue<number>()}</span>
      },
      {
        accessorKey: 'price',
        header: 'Price',
        cell: (info) => <span className="tabular-nums">{formatCurrency(info.getValue<number>())}</span>
      },
      {
        accessorKey: 'inventoryValue',
        header: 'Inventory Value',
        cell: (info) => <span className="tabular-nums">{formatCurrency(info.getValue<number>())}</span>
      },
      {
        accessorKey: 'location',
        header: 'Location'
      },
      {
        accessorKey: 'supplier',
        header: 'Supplier'
      }
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting
    },
    manualSorting: true,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: (updater) => onSortingChange(functionalUpdate(updater, sorting)),
    enableMultiSort: false
  });

  const visiblePages = useMemo(() => {
    const windowSize = 2;
    const start = Math.max(1, page - windowSize);
    const end = Math.min(totalPages, page + windowSize);
    const pages = Array.from({ length: end - start + 1 }, (_, index) => start + index);

    if (!pages.includes(1)) {
      pages.unshift(1);
    }

    if (!pages.includes(totalPages)) {
      pages.push(totalPages);
    }

    return [...new Set(pages)];
  }, [page, totalPages]);

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-aura backdrop-blur-xl lg:p-6">
      <div className="mb-5 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Inventory grid</p>
          <h2 className="mt-2 font-display text-2xl text-white">Server-side paginated records</h2>
        </div>
        <p className="text-sm text-slate-300">
          Showing {data.length} of {new Intl.NumberFormat('en-US').format(total)} records on page {page}.
        </p>
      </div>

      <div className="overflow-hidden rounded-[1.5rem] border border-white/10">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="bg-slate-950/80 text-left text-xs uppercase tracking-[0.24em] text-slate-400">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-4 font-medium">
                    {header.isPlaceholder ? null : (
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 transition hover:text-white"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() ? (
                          <span className="text-[0.7rem] text-cyan-300">{header.column.getIsSorted() === 'asc' ? '↑' : '↓'}</span>
                        ) : null}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-white/8 bg-slate-950/45 text-sm text-slate-200">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-14 text-center text-slate-400">
                  Loading inventory data...
                </td>
              </tr>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="transition hover:bg-white/5">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-4 align-top">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-14 text-center text-slate-400">
                  No inventory matches the active filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-5 text-sm text-slate-300 lg:flex-row lg:items-center lg:justify-between">
        <p>
          Page size {pageSize}. Page {page} of {totalPages}.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onPageChange(1)}
            disabled={page <= 1}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            First
          </button>
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Prev
          </button>
          {visiblePages.map((currentPage) => (
            <button
              key={currentPage}
              type="button"
              onClick={() => onPageChange(currentPage)}
              aria-current={currentPage === page ? 'page' : undefined}
              className={`rounded-xl border px-3 py-2 transition ${
                currentPage === page
                  ? 'border-cyan-300/40 bg-cyan-400/20 text-cyan-50'
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              {currentPage}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            disabled={page >= totalPages}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Last
          </button>
        </div>
      </div>
    </section>
  );
}
