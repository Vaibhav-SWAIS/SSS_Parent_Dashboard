'use client';

import { useState, useEffect } from 'react';
import TopBar from '@/components/TopBar';
import RemarksCard from '@/components/RemarksCard';
import { fetchRemarksHistory } from '@/lib/api';
import { useDashboardState } from '@/lib/useDashboardState';

export default function RemarksHistory() {
  const { studentId, setStudentId, language, setLanguage } = useDashboardState();
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true);
      try {
        const result = await fetchRemarksHistory(studentId);
        setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadHistory();
  }, [studentId]);

  return (
    <div className="min-h-full flex flex-col bg-[#F9FAFB] text-gray-800 font-sans">
      <TopBar studentId={studentId} setStudentId={setStudentId} language={language} setLanguage={setLanguage} isLoading={isLoading} />
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">💬</span>
            <h1 className="text-2xl font-bold text-gray-800">Teacher Remarks History</h1>
          </div>
          {isLoading ? (
            <div className="flex justify-center h-64 items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            <RemarksCard remarks={data} currentLang={language} />
          )}
        </div>
      </div>
    </div>
  );
}
