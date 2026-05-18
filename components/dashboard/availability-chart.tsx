'use client';

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

type AvailabilityChartProps = {
  data: Array<{ name: string; value: number }>;
};

const colors = ['#5eead4', '#60a5fa', '#f59e0b', '#fb7185'];

export function AvailabilityChart({ data }: AvailabilityChartProps) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={78} outerRadius={118} paddingAngle={4}>
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: '#08111f',
              border: '1px solid rgba(148, 163, 184, 0.18)',
              borderRadius: 16,
              color: '#e2e8f0'
            }}
            formatter={(value: number) => new Intl.NumberFormat('en-US').format(value)}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
