'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

type OverviewChartProps = {
  data: Array<{ name: string; value: number }>;
};

export function OverviewChart({ data }: OverviewChartProps) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
          <XAxis dataKey="name" tick={{ fill: '#cbd5e1', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#cbd5e1', fontSize: 12 }} axisLine={false} tickLine={false} width={54} />
          <Tooltip
            cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
            contentStyle={{
              background: '#08111f',
              border: '1px solid rgba(148, 163, 184, 0.18)',
              borderRadius: 16,
              color: '#e2e8f0'
            }}
            formatter={(value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)}
          />
          <Bar dataKey="value" radius={[16, 16, 0, 0]} fill="#60a5fa" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
