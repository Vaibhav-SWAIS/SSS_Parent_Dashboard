'use client';

import { useState, useEffect } from 'react';
import TopBar from '@/components/TopBar';
import SubjectPerformanceChart from '@/components/SubjectPerformanceChart';
import MonthlyTrendChart from '@/components/MonthlyTrendChart';
import AssignmentCompletionChart from '@/components/AssignmentCompletionChart';
import { fetchAnalytics } from '@/lib/api';
import { useDashboard } from '@/lib/DashboardContext';

export default function AnalyticsPage() {
  const { studentId, setStudentId, language, setLanguage } = useDashboard();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      setIsLoading(true);
      try {
        const result = await fetchAnalytics(studentId);
        setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadAnalytics();
  }, [studentId]);

  return (
    <div className="min-h-full flex flex-col bg-[#F9FAFB] text-gray-800 font-sans">
      <TopBar 
        studentId={studentId} 
        setStudentId={setStudentId} 
        language={language} 
        setLanguage={setLanguage} 
        isLoading={isLoading} 
      />

      <div className="flex-1 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="mb-6">
            <h1 className="text-3xl font-black text-gray-800">Academic Health Report</h1>
            <p className="text-gray-500 mt-2">Deep dive into {data?.student?.full_name || 'your child'}'s performance and engagement.</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          ) : data ? (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 col-span-2">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-gray-800">Subject Performance</h3>
                    <span className="text-sm bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-semibold">
                      Strongest: {data.strongest_subject}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">Comparison with class average</p>
                  <SubjectPerformanceChart data={data.subject_performance} />
                </div>
                
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-800 mb-2">Assignment Consistency</h3>
                  <p className="text-sm text-gray-500 mb-4">Submission rates overview</p>
                  <AssignmentCompletionChart data={data.assignment_completion} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-gray-800">Monthly Progress</h3>
                    <span className="text-sm text-green-600 font-bold bg-green-50 px-2 py-1 rounded-md">{data.growth_percent} Growth</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">Overall academic progression</p>
                  <MonthlyTrendChart data={data.monthly_trends} />
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-800 mb-4">Attendance Heatmap</h3>
                  <div className="flex flex-wrap gap-2">
                    {data.attendance_heatmap.map((day: any, idx: number) => (
                      <div 
                        key={idx} 
                        className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold text-white
                          ${day.status === 'Present' ? 'bg-green-500' : 'bg-red-500'}`}
                        title={`${day.date}: ${day.status}`}
                      >
                        {new Date(day.date).getDate()}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-500 rounded-sm"></div> Present</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-500 rounded-sm"></div> Absent</div>
                  </div>
                </div>
              </div>

            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
