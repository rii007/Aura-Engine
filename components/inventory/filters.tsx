'use client';

type FiltersState = {
  category: string;
  status: string;
  minStock: string;
  maxStock: string;
  minPrice: string;
  maxPrice: string;
  pageSize: number;
};

type FiltersProps = {
  value: FiltersState;
  categories: string[];
  onChange: (nextValue: FiltersState) => void;
};

function updateFilters(value: FiltersState, patch: Partial<FiltersState>) {
  return { ...value, ...patch };
}

export function Filters({ value, categories, onChange }: FiltersProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-6">
      <label className="flex flex-col gap-2 lg:col-span-2">
        <span className="text-xs uppercase tracking-[0.28em] text-slate-400">Category</span>
        <select
          value={value.category}
          onChange={(event) => onChange(updateFilters(value, { category: event.target.value }))}
          className="h-12 rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-slate-100 outline-none transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-[0.28em] text-slate-400">Status</span>
        <select
          value={value.status}
          onChange={(event) => onChange(updateFilters(value, { status: event.target.value }))}
          className="h-12 rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-slate-100 outline-none transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
        >
          {['all', 'healthy', 'low', 'critical', 'out'].map((status) => (
            <option key={status} value={status}>
              {status === 'all' ? 'All' : status[0].toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-[0.28em] text-slate-400">Min stock</span>
        <input
          type="number"
          min={0}
          value={value.minStock}
          onChange={(event) => onChange(updateFilters(value, { minStock: event.target.value }))}
          className="h-12 rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-[0.28em] text-slate-400">Max stock</span>
        <input
          type="number"
          min={0}
          value={value.maxStock}
          onChange={(event) => onChange(updateFilters(value, { maxStock: event.target.value }))}
          className="h-12 rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-[0.28em] text-slate-400">Min price</span>
        <input
          type="number"
          min={0}
          step="0.01"
          value={value.minPrice}
          onChange={(event) => onChange(updateFilters(value, { minPrice: event.target.value }))}
          className="h-12 rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-[0.28em] text-slate-400">Max price</span>
        <input
          type="number"
          min={0}
          step="0.01"
          value={value.maxPrice}
          onChange={(event) => onChange(updateFilters(value, { maxPrice: event.target.value }))}
          className="h-12 rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
        />
      </label>

      <label className="flex flex-col gap-2 lg:col-span-2">
        <span className="text-xs uppercase tracking-[0.28em] text-slate-400">Rows per page</span>
        <select
          value={value.pageSize}
          onChange={(event) => onChange(updateFilters(value, { pageSize: Number(event.target.value) }))}
          className="h-12 rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-slate-100 outline-none transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
        >
          {[10, 20, 50, 100].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

export type { FiltersState };
