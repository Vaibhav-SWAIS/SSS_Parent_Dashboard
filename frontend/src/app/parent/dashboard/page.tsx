'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import TopBar from '@/components/TopBar';
import { fetchDashboardData, fetchAssignmentAnalytics } from '@/lib/api';
import { useDashboard } from '@/lib/DashboardContext';
import AcademicHealthWidget from '@/components/AcademicHealthWidget';
import AttendanceHeatWidget from '@/components/AttendanceHeatWidget';
import AssignmentCompletionChart from '@/components/AssignmentCompletionChart';

// ── Skeleton Components ────────────────────────────────────────
const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
);

function MetricCardSkeleton() {
  return (
    <div className="flex flex-col items-center text-center p-3 rounded-xl bg-gray-50 border border-gray-100 gap-2">
      <Skeleton className="w-10 h-10 rounded-full" />
      <Skeleton className="w-20 h-3" />
      <Skeleton className="w-14 h-7" />
      <Skeleton className="w-16 h-4 rounded-full" />
    </div>
  );
}

function HeroSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex items-start gap-4 md:w-56 shrink-0">
          <Skeleton className="w-16 h-16 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="w-32 h-6" />
            <Skeleton className="w-40 h-3" />
          </div>
        </div>
        <div className="hidden md:block w-px bg-gray-100 self-stretch" />
        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <MetricCardSkeleton key={i} />)}
        </div>
      </div>
    </div>
  );
}

function RankStreakSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="w-20 h-3" />
            <Skeleton className="w-28 h-7" />
            <Skeleton className="w-36 h-3" />
          </div>
        </div>
      ))}
    </div>
  );
}

function TwoColSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
          <Skeleton className="w-40 h-5" />
          {[...Array(4)].map((_, j) => (
            <div key={j} className="flex gap-3 items-center">
              <Skeleton className="w-16 h-8 rounded-md" />
              <div className="flex-1 space-y-1">
                <Skeleton className="w-full h-3" />
                <Skeleton className="w-2/3 h-3" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function NotificationsSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <Skeleton className="w-44 h-5 mb-4" />
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-50">
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="w-full h-3" />
            <Skeleton className="w-12 h-3" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────
const notifIconMap: Record<string, { icon: string; color: string }> = {
  announcement: { icon: '📢', color: 'bg-green-100' },
  warning:      { icon: '📋', color: 'bg-orange-100' },
  success:      { icon: '✅', color: 'bg-blue-100' },
  info:         { icon: '💬', color: 'bg-purple-100' },
  ticket_reply: { icon: '💬', color: 'bg-blue-100' },
};

const recIconMap: Record<string, string> = {
  attendance: '🏠',
  task:       '📋',
  academic:   '📘',
  praise:     '🎯',
};

const priorityStyle: Record<string, { label: string; cls: string }> = {
  HIGH:   { label: 'HIGH',   cls: 'text-red-600 bg-red-50' },
  MEDIUM: { label: 'MEDIUM', cls: 'text-orange-600 bg-orange-50' },
  LOW:    { label: 'LOW',    cls: 'text-green-600 bg-green-50' },
};

const subjectColors = [
  'bg-green-500', 'bg-blue-500', 'bg-purple-500',
  'bg-yellow-500', 'bg-red-500', 'bg-teal-500',
];

function timeAgo(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const diffMs = Date.now() - d.getTime();
  const diffM = Math.floor(diffMs / 60000);
  if (diffM < 60) return `${diffM}m ago`;
  const diffH = Math.floor(diffM / 60);
  if (diffH < 24) return `${diffH}h ago`;
  return `${Math.floor(diffH / 24)}d ago`;
}

// ── Main Component ─────────────────────────────────────────────
export default function ParentDashboard() {
  const { studentId, setStudentId, language, setLanguage } = useDashboard();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true); setError(null); setData(null);
      try {
        const dash = await fetchDashboardData(studentId);
        setData(dash);
      } catch {
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [studentId]);

  // ── Derived values ──────────────────────────────────────────
  const studentName = data?.student?.full_name ?? 'Student';
  const attendanceHeat = data?.attendance_heat ?? 'GOOD';
  const engScore = data?.engagement_indicator?.score ?? 0;
  const engLevel = data?.engagement_indicator?.level ?? 'N/A';
  const weeklyProgress = data?.weekly_progress?.trend_percentage ?? '+0%';
  const classRank = data?.class_rank?.percentile ?? '—';
  const streak = data?.academic_streak?.[0] ?? '0 Weeks';
  const alerts: any[] = data?.alerts ?? [];
  const deadlines: any[] = data?.upcoming_deadlines ?? [];
  const recommendations: any[] = data?.smart_recommendations ?? [];
  const notifications: any[] = data?.notifications ?? [];
  const subjectPerf: any[] = data?.subject_performance ?? [];
  const strongest = data?.performance_summary?.strongest_subject ?? '—';
  const improvement = data?.performance_summary?.improvement_percent ?? '—';
  const avgScore = data?.performance_summary?.avg_score ?? 0;

  return (
    <div className="min-h-full flex flex-col bg-[#F9FAFB] text-gray-800 font-sans">
      <TopBar studentId={studentId} setStudentId={setStudentId} language={language} setLanguage={setLanguage} isLoading={isLoading} />

      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-5">

          {error && (
            <div className="bg-red-50 text-red-600 p-6 rounded-xl text-center border border-red-100">{error}</div>
          )}

          {/* ── SECTION 1: Hero Welcome + 4 Metric Cards ── */}
          {isLoading ? <HeroSkeleton /> : data && (
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
                    <h2 className="text-xl font-black text-gray-900">Hello<br />Parent! 👋</h2>
                    <p className="text-xs text-gray-500 mt-1">Here's {studentName}'s academic overview today.</p>
                  </div>
                </div>

                {/* Divider */}
                <div className="hidden md:block w-px bg-gray-100 self-stretch" />

                {/* Right: 4 metric cards */}
                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 h-full">
                  <AttendanceHeatWidget heat={attendanceHeat} percentage={data?.attendance_trend?.percentage} />
                  <AcademicHealthWidget data={data?.academic_health} />

                  {/* Engagement Score */}
                  <Link href="/parent/analytics" className="flex flex-col items-center justify-center text-center p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-orange-200 hover:bg-orange-50 transition-all cursor-pointer h-full">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                      <span className="text-purple-500 text-lg">⭐</span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">Engagement</p>
                    <p className="text-2xl font-black text-gray-900 mt-1">{engScore}<span className="text-sm font-medium text-gray-400">/100</span></p>
                  </Link>

                  {/* Weekly Progress */}
                  <Link href="/parent/analytics" className="flex flex-col items-center justify-center text-center p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-orange-200 hover:bg-orange-50 transition-all cursor-pointer h-full">
                    <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center mb-2">
                      <span className="text-teal-600 text-lg">📈</span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">Weekly Progress</p>
                    <p className={`text-2xl font-black mt-1 ${weeklyProgress.startsWith('+') ? 'text-green-600' : 'text-red-500'}`}>{weeklyProgress}</p>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* ── SECTION 2: Class Rank + Academic Streak ── */}
          {isLoading ? <RankStreakSkeleton /> : data && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/parent/analytics" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-center gap-4 hover:border-orange-200 transition-all cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center text-xl shrink-0">🏆</div>
                <div className="flex flex-col">
                  <p className="text-sm font-black text-gray-900">{classRank}</p>
                  <p className="text-xs text-gray-500 font-medium">Class Rank</p>
                </div>
              </Link>
              <Link href="/parent/assignments" className="bg-white rounded-2xl shadow-sm border border-orange-100 p-4 flex items-center justify-center gap-4 hover:border-orange-200 transition-all cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-xl shrink-0">🔥</div>
                <div className="flex flex-col">
                  <p className="text-sm font-black text-orange-500">{streak}</p>
                  <p className="text-xs text-gray-500 font-medium">Academic Streak</p>
                </div>
              </Link>
            </div>
          )}

          {/* ── SECTION 3: Action Required + Performance Summary ── */}
          {isLoading ? <TwoColSkeleton /> : data && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Action Required */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-900 text-base">Action Required</h3>
                  <Link href="/parent/assignments" className="text-xs text-orange-500 font-bold bg-orange-50 px-2 py-1 rounded-lg hover:bg-orange-100">
                    {alerts.length} Items →
                  </Link>
                </div>
                <div className="space-y-2">
                  {alerts.length === 0 ? (
                    <div className="text-center py-6 text-sm text-gray-400">
                      <span className="text-2xl block mb-1">🎉</span>
                      No action required! Everything is on track.
                    </div>
                  ) : alerts.map((item: any, i: number) => {
                    const p = item.priority ?? (item.type === 'warning' ? 'HIGH' : item.type === 'medium' ? 'MEDIUM' : 'LOW');
                    const style = priorityStyle[p] ?? priorityStyle['LOW'];
                    return (
                      <Link key={i} href="/parent/assignments" className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all cursor-pointer">
                        <span className={`text-[10px] font-black px-2 py-1 rounded-md shrink-0 ${style.cls}`}>{style.label}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{item.message}</p>
                          <p className="text-xs text-gray-400">{item.subject}</p>
                        </div>
                        <span className={`text-[10px] font-bold shrink-0 ${p === 'HIGH' ? 'text-red-500' : 'text-gray-400'}`}>{item.due} →</span>
                      </Link>
                    );
                  })}
                </div>
                <Link href="/parent/assignments" className="mt-4 w-full block text-center text-sm text-orange-500 font-bold hover:underline">
                  View All Assignments →
                </Link>
              </div>

              {/* Performance Summary */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-900 text-base">Performance Summary</h3>
                  <Link href="/parent/analytics" className="text-xs text-orange-500 font-semibold hover:underline">View Analytics →</Link>
                </div>

                <p className="text-xs font-semibold text-gray-500 mb-3">Subject Performance</p>
                <div className="space-y-2.5">
                  {subjectPerf.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-3">No quiz data available yet.</p>
                  ) : subjectPerf.map((s: any, i: number) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs text-gray-700 w-28 shrink-0 truncate">{s.subject}</span>
                      <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${subjectColors[i % subjectColors.length]} rounded-full transition-all duration-500`}
                          style={{ width: `${Math.min(100, s.score)}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-gray-700 w-14 text-right">{s.score}%</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xs text-gray-400">Average Score</p>
                    <p className="text-xl font-black text-gray-900">{avgScore > 0 ? `${avgScore}%` : '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Strongest Subject</p>
                    <p className="text-sm font-black text-green-600">{strongest}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Improvement</p>
                    <p className="text-sm font-black text-blue-600">{improvement}<br /><span className="text-[10px] text-gray-400 font-normal">vs last month</span></p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── SECTION 4: Upcoming Deadlines + Smart Recommendations ── */}
          {isLoading ? <TwoColSkeleton /> : data && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Upcoming Deadlines */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-900 text-base">Upcoming Deadlines</h3>
                  <Link href="/parent/assignments" className="text-xs text-gray-500 font-medium flex items-center gap-1 hover:text-orange-500 transition-colors">📅 View All</Link>
                </div>
                <div className="space-y-2">
                  {deadlines.length === 0 ? (
                    <div className="text-center py-6 text-sm text-gray-400">
                      <span className="text-2xl block mb-1">✅</span>
                      No upcoming deadlines!
                    </div>
                  ) : deadlines.map((d: any, i: number) => {
                    const dateObj = d.due_date ? new Date(d.due_date) : null;
                    const month = dateObj ? dateObj.toLocaleString('en-US', { month: 'short' }).toUpperCase() : '';
                    const day = dateObj ? dateObj.getDate() : '';
                    const isUrgent = d.days_left <= 2;
                    return (
                      <Link key={i} href="/parent/assignments" className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 cursor-pointer transition-all">
                        <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 ${isUrgent ? 'bg-red-50' : 'bg-orange-50'}`}>
                          <span className={`text-[8px] font-black uppercase ${isUrgent ? 'text-red-400' : 'text-orange-400'}`}>{month}</span>
                          <span className={`text-lg font-black leading-none ${isUrgent ? 'text-red-600' : 'text-orange-600'}`}>{day}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{d.title}</p>
                          <p className="text-xs text-gray-400">{d.type}</p>
                        </div>
                        <span className={`text-xs font-bold shrink-0 ${isUrgent ? 'text-red-500' : d.days_left <= 5 ? 'text-orange-500' : 'text-gray-400'}`}>
                          {d.days_left}d left →
                        </span>
                      </Link>
                    );
                  })}
                </div>
                <Link href="/parent/assignments" className="mt-4 w-full block text-center text-sm text-orange-500 font-bold hover:underline">
                  View All Deadlines →
                </Link>
              </div>

              {/* Smart Recommendations */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">💡 Smart Recommendations</h3>
                </div>
                <div className="space-y-2">
                  {recommendations.length === 0 ? (
                    <div className="text-center py-6 text-sm text-gray-400">
                      <span className="text-2xl block mb-1">🎯</span>
                      Great job! No recommendations at this time.
                    </div>
                  ) : recommendations.map((r: any, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 cursor-pointer transition-all">
                      <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-lg shrink-0">
                        {recIconMap[r.type] ?? '💡'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800">{r.message}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{r.action_text}</p>
                      </div>
                      <span className="text-gray-300 text-lg shrink-0">›</span>
                    </div>
                  ))}
                </div>
                <button className="mt-4 w-full text-center text-sm text-orange-500 font-bold hover:underline">
                  View All Recommendations →
                </button>
              </div>
            </div>
          )}

          {/* ── SECTION 5: Latest Notifications ── */}
          {isLoading ? <NotificationsSkeleton /> : data && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">🔔 Latest Notifications</h3>
                <Link href="/parent/notices" className="text-xs text-orange-500 font-bold hover:underline">View All Notifications →</Link>
              </div>
              {notifications.length === 0 ? (
                <div className="text-center py-6 text-sm text-gray-400">
                  <span className="text-2xl block mb-1">🔔</span>
                  No new notifications.
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {notifications.map((n: any, i: number) => {
                    const meta = notifIconMap[n.type] ?? { icon: '🔔', color: 'bg-yellow-100' };
                    return (
                      <Link key={i} href={n.link ?? '#'} className="flex flex-col items-center text-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-orange-200 hover:bg-orange-50 transition-all cursor-pointer">
                        <div className={`w-10 h-10 rounded-full ${meta.color} flex items-center justify-center text-xl`}>{meta.icon}</div>
                        <p className="text-xs text-gray-700 font-medium leading-tight line-clamp-2">{n.title}: {n.message}</p>
                        <span className="text-[10px] text-gray-400">{timeAgo(n.date)}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── SECTION 6: Bottom Motivational Banner ── */}
          {!isLoading && data && (
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-100 rounded-2xl p-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">
                🎉 {data.motivational_message ?? `Great progress this month! Keep it up, ${studentName.split(' ')[0]}!`}
              </p>
              <button className="text-gray-400 hover:text-red-400 transition-colors text-xl">♡</button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
