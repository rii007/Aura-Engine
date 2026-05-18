'use client';

import Papa from 'papaparse';

type ExportButtonProps = {
  query: string;
  disabled?: boolean;
};

export function ExportButton({ query, disabled }: ExportButtonProps) {
  async function handleExport() {
    const exportParams = new URLSearchParams(query);
    exportParams.set('page', '1');
    exportParams.set('pageSize', '50000');

    const response = await fetch(`/api/inventory?${exportParams.toString()}`);
    const payload: { items: Array<Record<string, string | number>> } = await response.json();
    const csv = Papa.unparse(payload.items);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `aura-enterprise-engine-inventory-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleExport}
      className="inline-flex h-12 items-center justify-center rounded-2xl border border-cyan-300/25 bg-cyan-400/15 px-5 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-400/25 disabled:cursor-not-allowed disabled:opacity-60"
    >
      Export CSV
    </button>
  );
}
