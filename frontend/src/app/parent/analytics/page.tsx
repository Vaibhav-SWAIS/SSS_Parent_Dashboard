'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import TopBar from '@/components/TopBar';
import { fetchDashboardData, fetchAssignmentAnalytics } from '@/lib/api';
import { useDashboard } from '@/lib/DashboardContext';

export default function AnalyticsPage() {
  const { studentId, setStudentId, language, setLanguage } = useDashboard();
  const [data, setData] = useState<any>(null);
  const [assignmentsData, setAssignmentsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [dash, assignAnalytics] = await Promise.all([
          fetchDashboardData(studentId),
          fetchAssignmentAnalytics(studentId)
        ]);
        setData(dash);
        setAssignmentsData(assignAnalytics);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [studentId]);

  if (isLoading || !data) {
    return (
      <div className="min-h-full flex flex-col bg-[#F9FAFB]">
        <TopBar studentId={studentId} setStudentId={setStudentId} language={language} setLanguage={setLanguage} isLoading={true} />
        <div className="flex-1 flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  // Derived values
  const studentName = data.student?.full_name || 'Student';
  const attendancePct = data.attendance_trend?.percentage || '0%';
  const subjectPerf = data.subject_performance || [];
  const strongest = data.performance_summary?.strongest_subject || 'N/A';
  const weakest = data.performance_summary?.weakest_subject || 'N/A';
  const avgScore = data.performance_summary?.avg_score || 0;
  
  // Assignment Status
  const completed = assignmentsData?.submitted || 0;
  const graded = assignmentsData?.graded || 0;
  const pending = assignmentsData?.pending || 0;
  const overdue = assignmentsData?.overdue || 0;

  return (
    <div className="min-h-full flex flex-col bg-[#F9FAFB] text-gray-800 font-sans">
      <TopBar studentId={studentId} setStudentId={setStudentId} language={language} setLanguage={setLanguage} isLoading={false} />

      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="mb-2">
            <h1 className="text-2xl font-black text-gray-900">Academic Analytics</h1>
            <p className="text-sm text-gray-500 mt-1">Detailed performance report for {studentName}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* A. Attendance Trend */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
              <h3 className="font-bold text-gray-900 mb-4">Attendance Trend</h3>
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="w-24 h-24 rounded-full border-8 border-green-100 flex items-center justify-center mb-4">
                  <span className="text-3xl font-black text-green-600">{attendancePct}</span>
                </div>
                <p className="text-sm text-gray-500 font-medium">Current Month</p>
                <div className="mt-4 w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: attendancePct }}></div>
                </div>
              </div>
            </div>

            {/* D. Quiz Insights */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
              <h3 className="font-bold text-gray-900 mb-4">Quiz Insights</h3>
              <div className="space-y-4 flex-1">
                <div className="flex justify-between items-end border-b border-gray-50 pb-3">
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Average Score</p>
                    <p className="text-3xl font-black text-gray-900 leading-none mt-1">{avgScore}%</p>
                  </div>
                  <span className="text-xl">📊</span>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Strongest</p>
                    <p className="text-sm font-black text-green-600 mt-1">{strongest}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Weakest</p>
                    <p className="text-sm font-black text-red-500 mt-1">{weakest}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* C. Assignment Status */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900">Assignment Status</h3>
                <Link href="/parent/assignments" className="text-xs text-orange-500 font-bold hover:underline">View All</Link>
              </div>
              <div className="space-y-3 flex-1">
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500">✅</span>
                    <span className="text-sm font-bold text-emerald-800">Submitted</span>
                  </div>
                  <span className="text-lg font-black text-emerald-700">{completed + graded}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-100">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-500">⏳</span>
                    <span className="text-sm font-bold text-amber-800">Pending</span>
                  </div>
                  <span className="text-lg font-black text-amber-700">{pending}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-100">
                  <div className="flex items-center gap-2">
                    <span className="text-red-500">⚠️</span>
                    <span className="text-sm font-bold text-red-800">Overdue</span>
                  </div>
                  <span className="text-lg font-black text-red-700">{overdue}</span>
                </div>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* B. Subject Performance */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-5">Subject Performance</h3>
              <div className="space-y-4">
                {subjectPerf.length === 0 ? (
                  <p className="text-sm text-gray-400 py-4 text-center">No quiz data available yet.</p>
                ) : (
                  subjectPerf.map((s: any, idx: number) => {
                    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-teal-500', 'bg-orange-500', 'bg-pink-500'];
                    const color = colors[idx % colors.length];
                    return (
                      <div key={idx}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-semibold text-gray-700">{s.subject}</span>
                          <span className="font-black text-gray-900">{s.score}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${Math.min(100, s.score)}%` }}></div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* E. Recent Activity */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-5">Recent Activity</h3>
              <div className="space-y-3">
                {data.assignments?.slice(0, 2).map((a: any, i: number) => (
                  <div key={`a-${i}`} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-xl">📝</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{a.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Assignment • {a.status}</p>
                    </div>
                  </div>
                ))}
                {data.quiz?.slice(0, 1).map((q: any, i: number) => (
                  <div key={`q-${i}`} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-xl">🧠</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{q.subject} Quiz</p>
                      <p className="text-xs text-gray-500 mt-0.5">Score: {q.score}/{q.total}</p>
                    </div>
                  </div>
                ))}
                {data.remarks?.slice(0, 1).map((r: any, i: number) => (
                  <div key={`r-${i}`} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-xl">💬</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Remark from {r.teacher_name}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{r.comment}</p>
                    </div>
                  </div>
                ))}
                {(!data.assignments?.length && !data.quiz?.length && !data.remarks?.length) && (
                  <p className="text-sm text-gray-400 py-4 text-center">No recent activity.</p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
