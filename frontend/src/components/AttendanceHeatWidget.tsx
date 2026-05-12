'use client';
import Link from 'next/link';

interface Props {
  heat: string;
  percentage?: string; // e.g. "92.0%"
}

export default function AttendanceHeatWidget({ heat, percentage }: Props) {
  const pctNum = percentage ? parseFloat(percentage) : null;

  const cfg = {
    GOOD:            { bar: 'bg-green-500',  pill: 'text-green-700 bg-green-100',  icon: '📅' },
    AVERAGE:         { bar: 'bg-yellow-500', pill: 'text-yellow-700 bg-yellow-100', icon: '📅' },
    'NEEDS ATTENTION': { bar: 'bg-red-500',  pill: 'text-red-700 bg-red-100',      icon: '📅' },
  }[heat] ?? { bar: 'bg-gray-400', pill: 'text-gray-600 bg-gray-100', icon: '📅' };

  return (
    <Link href="/parent/analytics" className="flex flex-col justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-orange-200 hover:bg-orange-50 transition-all cursor-pointer h-full">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-gray-500 font-semibold">Attendance</p>
        <span className="text-base">{cfg.icon}</span>
      </div>
      <p className="text-2xl font-black text-gray-900 leading-none">
        {pctNum !== null ? `${Math.round(pctNum)}%` : heat}
      </p>
      <div className="mt-2">
        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${cfg.bar} rounded-full transition-all duration-700`}
            style={{ width: `${pctNum ?? (heat === 'GOOD' ? 92 : heat === 'AVERAGE' ? 75 : 60)}%` }}
          />
        </div>
        <p className="text-[10px] text-gray-400 mt-1">This month</p>
      </div>
    </Link>
  );
}
