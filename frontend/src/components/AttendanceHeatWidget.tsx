import React from 'react';
import { CalendarDaysIcon } from '@heroicons/react/24/solid';

export default function AttendanceHeatWidget({ heat }: { heat: string }) {
  if (!heat) return null;

  const getHeatColor = (status: string) => {
    switch(status) {
      case 'GOOD': return 'text-green-500 bg-green-50';
      case 'WARNING': return 'text-yellow-600 bg-yellow-50';
      case 'CRITICAL': return 'text-red-500 bg-red-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 h-[140px] flex flex-col justify-center items-center text-center">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${getHeatColor(heat).split(' ')[1]}`}>
        <CalendarDaysIcon className={`w-6 h-6 ${getHeatColor(heat).split(' ')[0]}`} />
      </div>
      <h3 className={`font-bold text-lg ${getHeatColor(heat).split(' ')[0]}`}>{heat}</h3>
      <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">Attendance Heat</p>
    </div>
  );
}
