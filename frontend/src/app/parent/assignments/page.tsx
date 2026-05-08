'use client';

import { useState, useEffect } from 'react';
import TopBar from '@/components/TopBar';
import { fetchAssignmentsHistory } from '@/lib/api';
import { useDashboardState } from '@/lib/useDashboardState';

export default function AssignmentsHistory() {
  const { studentId, setStudentId, language, setLanguage } = useDashboardState();
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true);
      try {
        const result = await fetchAssignmentsHistory(studentId);
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
            <span className="text-3xl">📄</span>
            <h1 className="text-2xl font-bold text-gray-800">Assignments History</h1>
          </div>
          {isLoading ? (
            <div className="flex justify-center h-64 items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {data.length === 0 ? (
                <div className="p-8 text-center text-gray-500 italic">No assignments found.</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {data.map((assignment, idx) => {
                    const getStatusColor = (status: string) => {
                      if (status === 'Completed') return 'border-green-200 text-green-600 bg-green-50';
                      if (status === 'Pending') return 'border-orange-200 text-orange-500 bg-orange-50';
                      return 'border-red-200 text-red-500 bg-red-50';
                    };
                    return (
                      <div key={idx} className="p-6 hover:bg-gray-50 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <h3 className="font-bold text-gray-800 text-lg">{assignment.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">Subject: <span className="font-medium text-gray-700">{assignment.subject}</span></p>
                          <p className="text-sm text-gray-500">Due Date: {new Date(assignment.due_date).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          {assignment.marks_obtained !== null && (
                            <div className="text-sm font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-lg">
                              Marks: {assignment.marks_obtained}
                            </div>
                          )}
                          <div className={`px-4 py-1.5 rounded-full text-sm font-bold border flex items-center gap-1 ${getStatusColor(assignment.status)}`}>
                            {assignment.status}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
