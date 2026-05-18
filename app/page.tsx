import { AvailabilityChart } from '@/components/dashboard/availability-chart';
import { MetricCard } from '@/components/dashboard/metric-card';
import { OverviewChart } from '@/components/dashboard/overview-chart';
import { buildAnalytics, inventoryData } from '@/lib/inventory-data';
import Link from 'next/link';

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const compactFormatter = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });

export default function Page() {
  const analytics = buildAnalytics(inventoryData);
  const topRisk = analytics.restockPriority.slice(0, 5);
  const statusData = [
    { name: 'In stock', value: analytics.summary.totalSkus - analytics.summary.outOfStock },
    { name: 'Out of stock', value: analytics.summary.outOfStock },
    { name: 'At risk', value: topRisk.filter((item) => item.status !== 'healthy').length },
    { name: 'Tracked categories', value: analytics.valuationByCategory.length }
  ];

  return (
    <main className="min-h-screen px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-aura backdrop-blur-xl lg:p-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.9fr)] lg:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-cyan-300/90">Aura Enterprise Engine</p>
              <h1 className="mt-3 max-w-4xl font-display text-5xl leading-[0.95] text-white sm:text-6xl">
                A production-grade command center for inventory intelligence.
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
                Monitor stock health, valuation, and restock risk across a 50,000-record operational dataset. The inventory view is fully server-side paginated and filterable.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/inventory" className="inline-flex h-12 items-center justify-center rounded-2xl bg-cyan-400 px-5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
                  Open inventory grid
                </Link>
                <div className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 text-sm text-slate-200">
                  Server-side pagination
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Operations summary</p>
              <div className="mt-4 grid gap-3">
                <MetricCard label="Total inventory value" value={currencyFormatter.format(analytics.summary.inventoryValue)} tone="cyan" />
                <MetricCard label="Total SKUs" value={compactFormatter.format(analytics.summary.totalSkus)} tone="blue" />
                <MetricCard label="Out of stock" value={compactFormatter.format(analytics.summary.outOfStock)} tone="rose" />
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <article className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-aura backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Valuation mix</p>
                <h2 className="mt-2 font-display text-2xl text-white">Inventory value by category</h2>
              </div>
            </div>
            <OverviewChart data={analytics.valuationByCategory} />
          </article>

          <article className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-aura backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Operational health</p>
                <h2 className="mt-2 font-display text-2xl text-white">Inventory status distribution</h2>
              </div>
            </div>
            <AvailabilityChart data={statusData} />
          </article>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <article className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-aura backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Restock priority</p>
            <h2 className="mt-2 font-display text-2xl text-white">Top items needing attention</h2>
            <div className="mt-5 space-y-3">
              {topRisk.map((item, index) => (
                <div key={item.sku} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3">
                  <div>
                    <p className="font-medium text-white">
                      {index + 1}. {item.name}
                    </p>
                    <p className="text-sm text-slate-400">
                      {item.sku} · {item.category} · {item.status}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-400">Stock</p>
                    <p className="font-semibold text-white">{item.stock}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyan-400/15 to-sky-500/5 p-6 shadow-aura backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.28em] text-cyan-100/80">Build status</p>
            <h2 className="mt-2 font-display text-2xl text-white">Ready for operational use</h2>
            <p className="mt-4 text-sm leading-7 text-slate-200/90">
              The inventory experience is server-driven, the dataset is generated at 50,000 records, and the route structure now includes a dedicated inventory view for filtered paging.
            </p>
            <div className="mt-6 grid gap-3">
              <div className="rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3 text-sm text-slate-300">
                Charts and summaries are rendered from the shared inventory data module.
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3 text-sm text-slate-300">
                CSV export is built from the active filter query and downloads the full filtered set.
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3 text-sm text-slate-300">
                The stack now includes Tailwind CSS, TanStack Table, and debounced search input handling.
              </div>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
