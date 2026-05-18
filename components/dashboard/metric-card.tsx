type MetricCardProps = {
  label: string;
  value: string;
  tone?: 'cyan' | 'blue' | 'gold' | 'rose';
  description?: string;
};

const toneClasses: Record<NonNullable<MetricCardProps['tone']>, string> = {
  cyan: 'from-cyan-400/18 to-cyan-400/6 border-cyan-300/20 text-cyan-100',
  blue: 'from-sky-400/18 to-sky-400/6 border-sky-300/20 text-sky-100',
  gold: 'from-amber-400/18 to-amber-400/6 border-amber-300/20 text-amber-100',
  rose: 'from-rose-400/18 to-rose-400/6 border-rose-300/20 text-rose-100'
};

export function MetricCard({ label, value, tone = 'cyan', description }: MetricCardProps) {
  return (
    <article className={`rounded-3xl border bg-gradient-to-br p-5 shadow-aura ${toneClasses[tone]}`}>
      <p className="text-xs uppercase tracking-[0.32em] text-slate-300">{label}</p>
      <strong className="mt-3 block font-display text-3xl leading-none text-white">{value}</strong>
      {description ? <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p> : null}
    </article>
  );
}
