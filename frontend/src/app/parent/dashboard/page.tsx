'use client';

import { useState, useEffect } from 'react';
import TopBar from '@/components/TopBar';
import { fetchDashboardData, fetchAssignmentAnalytics } from '@/lib/api';
import { useDashboard } from '@/lib/DashboardContext';
import AcademicHealthWidget from '@/components/AcademicHealthWidget';
import AttendanceHeatWidget from '@/components/AttendanceHeatWidget';
import AssignmentCompletionChart from '@/components/AssignmentCompletionChart';

export default function ParentDashboard() {
  const { studentId, setStudentId, language, setLanguage } = useDashboard();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true); setError(null); setData(null); setAnalytics(null);
      try { 
        setData(await fetchDashboardData(studentId)); 
        setAnalytics(await fetchAssignmentAnalytics(studentId));
      }
      catch { setError('Failed to load dashboard data. Please try again.'); }
      finally { setIsLoading(false); }
    };
    load();
  }, [studentId]);

  const attendancePct = data?.attendance_trend?.percentage ?? '92%';
  const healthScore = data?.health_score ?? 78;
  const engScore = data?.engagement_indicator?.score ?? 63;
  const weeklyProgress = data?.weekly_progress?.trend_percentage ?? '+7%';
  const classRank = data?.class_rank?.percentile ?? 'Top 19%';
  const streak = data?.academic_streak?.[1] ?? '3 Weeks';
  const alerts = data?.alerts ?? [];
  const deadlines = data?.upcoming_deadlines ?? [];
  const recommendations = data?.smart_recommendations ?? [];
  const notices = data?.notices ?? [];
  const remarks = data?.remarks ?? [];
  const assignments = data?.assignments ?? [];
  const studentName = data?.student?.full_name ?? 'Student';
  const strongest = data?.performance_summary?.strongest_subject ?? 'Mathematics';
  const improvement = data?.performance_summary?.improvement_percent ?? '+7%';

  const subjectPerf = [
    { name: 'Mathematics', score: 78, color: 'bg-green-500' },
    { name: 'English', score: 70, color: 'bg-blue-500' },
    { name: 'Science', score: 65, color: 'bg-purple-500' },
    { name: 'Social Science', score: 60, color: 'bg-yellow-500' },
    { name: 'Hindi', score: 55, color: 'bg-red-500' },
  ];

  const priorityMap: Record<string, { label: string; cls: string }> = {
    warning: { label: 'HIGH', cls: 'text-red-600 bg-red-50 border-red-200' },
    error:   { label: 'HIGH', cls: 'text-red-600 bg-red-50 border-red-200' },
    info:    { label: 'LOW',  cls: 'text-green-700 bg-green-50 border-green-200' },
  };

  const staticAlerts = [
    { type: 'warning', message: '27 assignments overdue', sub: 'Various subjects', due: 'Due dates passed' },
    { type: 'medium',  message: 'English Chapter 3 Practice', sub: 'English', due: 'Due in 2 days' },
    { type: 'medium',  message: 'Mathematics Assignment', sub: 'Mathematics', due: 'Due in 3 days' },
    { type: 'info',    message: 'Science Lab Report', sub: 'Science', due: 'Due in 5 days' },
  ];

  const staticDeadlines = [
    { date: 'MAY 15', title: 'Mathematics Assignment', type: 'Assignment • Mathematics', daysLeft: 2, urgent: true },
    { date: 'MAY 18', title: 'English Chapter 3 Practice', type: 'Assignment • English', daysLeft: 5, urgent: false },
    { date: 'MAY 21', title: 'Science Lab Report', type: 'Submission • Science', daysLeft: 8, urgent: false },
  ];

  const staticRecs = [
    { icon: '🏠', title: 'Focus on improving English', desc: 'Your scores can improve by 15% with consistent practice.' },
    { icon: '📘', title: 'Revise Mathematics concepts', desc: 'Practice 3 more assignments to strengthen your score.' },
    { icon: '🎯', title: 'Maintain attendance above 90%', desc: 'Great job! Keep it consistent for better results.' },
  ];

  const staticNotifs = [
    { icon: '💬', color: 'bg-blue-100', title: 'Mrs. Anjali Verma replied to your ticket', time: '2m ago' },
    { icon: '📋', color: 'bg-orange-100', title: 'Assignment submitted late', time: '1h ago' },
    { icon: '📢', color: 'bg-green-100', title: 'Sports Day (10th Grade) announced', time: '3h ago' },
    { icon: '📅', color: 'bg-purple-100', title: 'PTM scheduled for this Friday', time: '1d ago' },
    { icon: '🔔', color: 'bg-yellow-100', title: 'New notice published', time: '1d ago' },
  ];

  return (
    <div className="min-h-full flex flex-col bg-[#F9FAFB] text-gray-800 font-sans">
      <TopBar studentId={studentId} setStudentId={setStudentId} language={language} setLanguage={setLanguage} isLoading={isLoading} />

      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-5">

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-6 rounded-xl text-center border border-red-100">{error}</div>
          ) : (
            <>
              {/* ── SECTION 1: Hero Welcome + 4 Metric Cards ── */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Left: greeting */}
                  <div className="flex items-start gap-4 md:w-56 shrink-0">
                    <img
                      src={`https://i.pravatar.cc/150?u=${studentId + 10}`}
                      alt="Parent"
                      className="w-16 h-16 rounded-full object-cover border-2 border-orange-200 shrink-0"
                    />
                    <div>
                      <h2 className="text-xl font-black text-gray-900">Hello<br />Priya Sharma! 👋</h2>
                      <p className="text-xs text-gray-500 mt-1">Here's {studentName}'s academic overview today.</p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="hidden md:block w-px bg-gray-100 self-stretch"></div>

                  {/* Right: 4 metric cards */}
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Attendance */}
                    <AttendanceHeatWidget heat={data?.attendance_heat ?? 'GOOD'} />
                    {/* Health Score */}
                    <AcademicHealthWidget data={data?.academic_health} />
                    {/* Engagement Score */}
                    <div className="flex flex-col items-center text-center p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                        <span className="text-purple-500 text-lg">⭐</span>
                      </div>
                      <p className="text-xs text-gray-500 font-medium">Engagement Score</p>
                      <p className="text-2xl font-black text-gray-900 mt-1">{engScore}<span className="text-sm font-medium text-gray-400">/100</span></p>
                      <span className="text-[10px] font-bold text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full mt-1">Average</span>
                      <button className="text-[10px] text-orange-500 font-semibold mt-2 hover:underline">More details →</button>
                    </div>
                    {/* Weekly Progress */}
                    <div className="flex flex-col items-center text-center p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center mb-2">
                        <span className="text-teal-600 text-lg">📈</span>
                      </div>
                      <p className="text-xs text-gray-500 font-medium">Weekly Progress</p>
                      <p className="text-2xl font-black text-green-600 mt-1">{weeklyProgress}</p>
                      <span className="text-[10px] font-bold text-teal-600 bg-teal-100 px-2 py-0.5 rounded-full mt-1">Improving</span>
                      <button className="text-[10px] text-orange-500 font-semibold mt-2 hover:underline">More details →</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── SECTION 2: Class Rank + Academic Streak ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center text-2xl shrink-0">🏆</div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-medium">Class Rank</p>
                    <p className="text-2xl font-black text-gray-900">{classRank}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Keep it up! You're doing great.</p>
                  </div>
                  <button className="text-xs text-orange-500 font-semibold whitespace-nowrap hover:underline">More details →</button>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-2xl shrink-0">🔥</div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-medium">Academic Streak</p>
                    <p className="text-2xl font-black text-orange-500">3 Weeks</p>
                    <p className="text-xs text-gray-400 mt-0.5">Excellent! Keep your streak alive.</p>
                  </div>
                  <button className="text-xs text-orange-500 font-semibold whitespace-nowrap hover:underline">More details →</button>
                </div>
              </div>

              {/* ── SECTION 3: Action Required + Performance Summary ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Action Required */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-900 text-base">Action Required</h3>
                    <span className="text-xs text-orange-500 font-bold bg-orange-50 px-2 py-1 rounded-lg cursor-pointer hover:bg-orange-100">28 Items →</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { priority: 'HIGH', msg: '27 assignments overdue', sub: 'Various subjects', due: 'Due dates passed', urgent: true },
                      { priority: 'MEDIUM', msg: 'English Chapter 3 Practice', sub: 'English', due: 'Due in 2 days', urgent: false },
                      { priority: 'MEDIUM', msg: 'Mathematics Assignment', sub: 'Mathematics', due: 'Due in 3 days', urgent: false },
                      { priority: 'LOW', msg: 'Science Lab Report', sub: 'Science', due: 'Due in 5 days', urgent: false },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all cursor-pointer">
                        <span className={`text-[10px] font-black px-2 py-1 rounded-md shrink-0 ${
                          item.priority === 'HIGH' ? 'text-red-600 bg-red-50' :
                          item.priority === 'MEDIUM' ? 'text-orange-600 bg-orange-50' :
                          'text-green-600 bg-green-50'
                        }`}>{item.priority}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{item.msg}</p>
                          <p className="text-xs text-gray-400">{item.sub}</p>
                        </div>
                        <span className={`text-[10px] font-bold shrink-0 ${item.urgent ? 'text-red-500' : 'text-gray-400'}`}>{item.due} →</span>
                      </div>
                    ))}
                  </div>
                  <button className="mt-4 w-full text-center text-sm text-orange-500 font-bold hover:underline">View All Assignments →</button>
                </div>

                {/* Performance Summary */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-900 text-base">Performance Summary</h3>
                    <select className="text-xs text-gray-600 border border-gray-200 rounded-lg px-2 py-1 outline-none">
                      <option>This Month</option>
                      <option>Last Month</option>
                    </select>
                  </div>
                  
                  <div className="mb-4 border-b border-gray-100 pb-4">
                    <p className="text-xs font-semibold text-gray-500 mb-2">Assignment Completion</p>
                    <AssignmentCompletionChart data={analytics} />
                  </div>

                  <p className="text-xs font-semibold text-gray-500 mb-3">Subject Performance</p>
                  <div className="space-y-2.5">
                    {subjectPerf.map((s, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs text-gray-700 w-28 shrink-0">{s.name}</span>
                        <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full ${s.color} rounded-full`} style={{ width: `${s.score}%` }}></div>
                        </div>
                        <span className="text-xs font-bold text-gray-700 w-12 text-right">{s.score}/100</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-xs text-gray-400">Average Score</p>
                      <p className="text-xl font-black text-gray-900">65%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Strongest Subject</p>
                      <p className="text-sm font-black text-green-600">{strongest}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Improvement</p>
                      <p className="text-sm font-black text-blue-600">{improvement}<br/><span className="text-[10px] text-gray-400 font-normal">vs last month</span></p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── SECTION 4: Upcoming Deadlines + Smart Recommendations ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Upcoming Deadlines */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-900 text-base">Upcoming Deadlines</h3>
                    <button className="text-xs text-gray-500 font-medium flex items-center gap-1 hover:text-orange-500 transition-colors">📅 View Calendar</button>
                  </div>
                  <div className="space-y-2">
                    {staticDeadlines.map((d, i) => (
                      <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 cursor-pointer transition-all">
                        <div className="w-12 h-12 rounded-xl bg-orange-50 flex flex-col items-center justify-center shrink-0">
                          <span className="text-[8px] font-black text-orange-400 uppercase">{d.date.split(' ')[0]}</span>
                          <span className="text-lg font-black text-orange-600 leading-none">{d.date.split(' ')[1]}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{d.title}</p>
                          <p className="text-xs text-gray-400">{d.type}</p>
                        </div>
                        <span className={`text-xs font-bold shrink-0 ${d.urgent ? 'text-red-500' : d.daysLeft <= 5 ? 'text-orange-500' : 'text-gray-400'}`}>{d.daysLeft} days left →</span>
                      </div>
                    ))}
                  </div>
                  <button className="mt-4 w-full text-center text-sm text-orange-500 font-bold hover:underline">View All Deadlines →</button>
                </div>

                {/* Smart Recommendations */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">💡 Smart Recommendations</h3>
                  </div>
                  <div className="space-y-2">
                    {staticRecs.map((r, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 cursor-pointer transition-all">
                        <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-lg shrink-0">{r.icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800">{r.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{r.desc}</p>
                        </div>
                        <span className="text-gray-300 text-lg shrink-0">›</span>
                      </div>
                    ))}
                  </div>
                  <button className="mt-4 w-full text-center text-sm text-orange-500 font-bold hover:underline">View All Recommendations →</button>
                </div>
              </div>

              {/* ── SECTION 5: Latest Notifications ── */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">🔔 Latest Notifications</h3>
                  <button className="text-xs text-orange-500 font-bold hover:underline">View All Notifications →</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {staticNotifs.map((n, i) => (
                    <div key={i} className="flex flex-col items-center text-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-orange-200 hover:bg-orange-50 transition-all cursor-pointer">
                      <div className={`w-10 h-10 rounded-full ${n.color} flex items-center justify-center text-xl`}>{n.icon}</div>
                      <p className="text-xs text-gray-700 font-medium leading-tight line-clamp-2">{n.title}</p>
                      <span className="text-[10px] text-gray-400">{n.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── SECTION 6: Bottom Motivational Banner ── */}
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-100 rounded-2xl p-4 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-700">🎉 Great progress this month! Keep up the excellent work, {studentName.split(' ')[0]}!</p>
                <button className="text-gray-400 hover:text-red-400 transition-colors text-xl">♡</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
