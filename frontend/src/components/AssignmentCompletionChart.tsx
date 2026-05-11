'use client';
import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function AssignmentCompletionChart({ data }: { data: any }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="h-64 w-full mt-4 bg-gray-50 animate-pulse rounded-xl"></div>;
  if (!data) return null;

  const chartData = [
    { name: 'Completed', value: data.completed, color: '#10B981' },
    { name: 'Pending', value: data.pending, color: '#F59E0B' },
    { name: 'Overdue', value: data.overdue, color: '#EF4444' }
  ].filter(item => item.value > 0);

  if (chartData.length === 0) return <p className="text-gray-500 text-sm mt-4 text-center">No assignment data available.</p>;

  return (
    <div className="h-64 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
