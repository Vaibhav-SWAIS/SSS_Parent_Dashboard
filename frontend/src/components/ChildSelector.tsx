'use client';

import { useState, useEffect } from 'react';
import { fetchParentChildren } from '@/lib/api';

interface ChildSelectorProps {
  currentStudentId: number;
  onSelect: (id: number) => void;
  disabled?: boolean;
  parentId?: number;
}

export default function ChildSelector({ currentStudentId, onSelect, disabled, parentId = 1 }: ChildSelectorProps) {
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChildren = async () => {
      try {
        const data = await fetchParentChildren(parentId);
        setChildren(data);
        if (data.length > 0 && !data.find((c: any) => c.student_id === currentStudentId)) {
          onSelect(data[0].student_id);
        }
      } catch (error) {
        console.error('Failed to load children', error);
      } finally {
        setLoading(false);
      }
    };
    loadChildren();
  }, [parentId, currentStudentId, onSelect]);

  const activeChild = children.find(c => c.student_id === currentStudentId);

  if (loading) {
    return <div className="h-14 w-48 bg-gray-200 animate-pulse rounded-full"></div>;
  }

  return (
    <div className="flex flex-col">
      <label className="text-xs font-semibold text-gray-500 mb-1 ml-1">Select Child</label>
      <div className="flex items-center bg-white border border-gray-200 rounded-full px-3 py-1.5 shadow-sm">
        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold mr-2">
          {activeChild?.full_name.charAt(0) || 'S'}
        </div>
        <select
          value={currentStudentId}
          onChange={(e) => onSelect(Number(e.target.value))}
          disabled={disabled || loading}
          className="bg-transparent focus:outline-none disabled:opacity-50 text-gray-800 text-sm font-semibold appearance-none pr-6 cursor-pointer"
          style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right center', backgroundSize: '1em' }}
        >
          {children.map((child) => (
            <option key={child.student_id} value={child.student_id}>
              {child.full_name} • {child.class_name} {child.section}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
