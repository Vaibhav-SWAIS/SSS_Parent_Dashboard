'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import TopBar from '@/components/TopBar';
import { useDashboard } from '@/lib/DashboardContext';
import { fetchAttendanceData, fetchLeaveRequests, submitLeaveRequest } from '@/lib/api';

// ── Types ────────────────────────────────────────────────────────────────

interface AttendanceDay {
  date: string;
  status: 'Present' | 'Absent' | 'HalfDay' | 'Holiday';
}

interface AttendanceOverview {
  percentage: number;
  present_days: number;
  absent_days: number;
  half_days: number;
  total_school_days: number;
}

interface LeaveRequest {
  leave_request_id: number;
  from_date: string;
  to_date: string;
  reason: string;
  parent_note?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  created_at: string;
}

// ── Constants ─────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  Present: 'bg-green-500',
  HalfDay: 'bg-green-200',
  Absent:  'bg-red-400',
  Holiday: 'bg-gray-100',
};

const STATUS_BORDER: Record<string, string> = {
  Present: 'border-green-600',
  HalfDay: 'border-green-300',
  Absent:  'border-red-500',
  Holiday: 'border-gray-200',
};

const STATUS_TEXT: Record<string, string> = {
  Present: 'text-white',
  HalfDay: 'text-green-700',
  Absent:  'text-white',
  Holiday: 'text-gray-300',
};

const STATUS_LABEL: Record<string, string> = {
  Present: 'Present',
  HalfDay: 'Half Day',
  Absent:  'Absent',
  Holiday: 'Holiday / No School',
};

const MONTH_FULL = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

// ── Academic Year Helpers ─────────────────────────────────────────────────

/** Returns { year, month (0-indexed) } objects for the current academic year
 *  up to and including the current month.
 *  Indian academic year: April (3) → March (2) of next year. */
function getAcademicYearMonths(): { year: number; month: number; label: string }[] {
  const today = new Date();
  const curYear  = today.getFullYear();
  const curMonth = today.getMonth(); // 0-indexed

  // Academic year starts in April (month 3)
  const ayStartYear = curMonth >= 3 ? curYear : curYear - 1;

  const months: { year: number; month: number; label: string }[] = [];

  // April of start year → March of next year, but only up to current month
  for (let m = 3; m <= 11; m++) {
    if (ayStartYear === curYear && m > curMonth) break;
    months.push({ year: ayStartYear, month: m, label: `${MONTH_FULL[m]} ${ayStartYear}` });
  }
  for (let m = 0; m <= 2; m++) {
    const y = ayStartYear + 1;
    if (y > curYear || (y === curYear && m > curMonth)) break;
    months.push({ year: y, month: m, label: `${MONTH_FULL[m]} ${y}` });
  }

  return months;
}

function toMonthKey(year: number, month: number) {
  return `${year}-${String(month).padStart(2, '0')}`;
}

// ── Heatmap Grid Builder ──────────────────────────────────────────────────

/** Builds a column-per-week, row-per-weekday grid for a given month. */
function buildWeekGrid(
  allRecords: AttendanceDay[],
  year: number,
  month: number
): (AttendanceDay | null)[][] {
  const dayMap: Record<string, string> = {};
  for (const r of allRecords) dayMap[r.date] = r.status;

  const first = new Date(year, month, 1);
  const last  = new Date(year, month + 1, 0);

  // weeks[weekIndex][dayIndex 0=Mon…4=Fri]
  const weeks: (AttendanceDay | null)[][] = [];
  let week: (AttendanceDay | null)[] = new Array(5).fill(null);

  for (let d = new Date(first); d <= last; d.setDate(d.getDate() + 1)) {
    const dow = d.getDay(); // 0=Sun … 6=Sat
    if (dow === 0 || dow === 6) continue;
    const col = dow - 1;
    const iso = d.toISOString().slice(0, 10);
    week[col] = { date: iso, status: (dayMap[iso] as AttendanceDay['status']) || 'Holiday' };
    if (dow === 5) {
      weeks.push([...week]);
      week = new Array(5).fill(null);
    }
  }
  if (week.some(Boolean)) weeks.push(week);
  return weeks;
}

// ── Month Stats ───────────────────────────────────────────────────────────

function calcMonthStats(records: AttendanceDay[], year: number, month: number) {
  const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const monthRecs = records.filter(r => r.date.startsWith(prefix));
  let present = 0, absent = 0, half = 0, holiday = 0;
  for (const r of monthRecs) {
    if (r.status === 'Present') present++;
    else if (r.status === 'Absent') absent++;
    else if (r.status === 'HalfDay') half++;
    else holiday++;
  }
  const schoolDays = present + absent + half;
  const pct = schoolDays > 0 ? Math.round((present + half * 0.5) / schoolDays * 100) : 0;
  return { present, absent, half, holiday, schoolDays, pct };
}

// ── Heatmap Component ─────────────────────────────────────────────────────

function MonthHeatmap({
  records,
  year,
  month,
}: {
  records: AttendanceDay[];
  year: number;
  month: number;
}) {
  const weeks = buildWeekGrid(records, year, month);

  if (weeks.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-10">
        No attendance data for this month.
      </p>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="inline-flex gap-0 min-w-max">
        {/* Row-label column */}
        <div className="flex flex-col pt-8 pr-3">
          {DAY_LABELS.map(d => (
            <div key={d} className="h-10 flex items-center justify-end">
              <span className="text-[11px] font-semibold text-gray-400 w-7 text-right">{d}</span>
            </div>
          ))}
        </div>

        {/* Week columns */}
        <div className="flex flex-col">
          {/* Week-number header row */}
          <div className="flex gap-1.5 mb-1 pl-0.5">
            {weeks.map((_, wi) => (
              <div key={wi} className="w-10 flex items-center justify-center">
                <span className="text-[10px] text-gray-300 font-medium">W{wi + 1}</span>
              </div>
            ))}
          </div>

          {/* Day rows */}
          {DAY_LABELS.map((_, di) => (
            <div key={di} className="flex gap-1.5 mb-1.5">
              {weeks.map((week, wi) => {
                const cell = week[di];
                if (!cell) {
                  return <div key={wi} className="w-10 h-10" />;
                }
                const day = new Date(cell.date).getDate();
                const isToday = cell.date === new Date().toISOString().slice(0, 10);
                return (
                  <div
                    key={wi}
                    title={`${cell.date} — ${STATUS_LABEL[cell.status]}`}
                    className={`
                      w-10 h-10 rounded-lg flex items-center justify-center
                      text-xs font-bold border cursor-default
                      transition-transform hover:scale-110 hover:z-10 relative
                      ${STATUS_COLOR[cell.status]}
                      ${STATUS_BORDER[cell.status]}
                      ${STATUS_TEXT[cell.status]}
                      ${isToday ? 'ring-2 ring-orange-400 ring-offset-1' : ''}
                    `}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-5 mt-4 pt-3 border-t border-gray-100">
        {Object.entries(STATUS_LABEL).map(([k, label]) => (
          <div key={k} className="flex items-center gap-1.5">
            <div className={`w-4 h-4 rounded-md border ${STATUS_COLOR[k]} ${STATUS_BORDER[k]}`} />
            <span className="text-xs text-gray-500">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Overview Cards ────────────────────────────────────────────────────────

function OverviewCard({
  icon, label, value, colorClass,
}: {
  icon: string; label: string; value: string | number; colorClass: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${colorClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-black text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

// ── Status Badge ──────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === 'Approved' ? 'bg-green-100 text-green-700' :
    status === 'Rejected' ? 'bg-red-100 text-red-600' :
    'bg-yellow-100 text-yellow-700';
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cls}`}>
      {status}
    </span>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────

export default function AttendancePage() {
  const { studentId, setStudentId, language, setLanguage } = useDashboard();

  const [isLoading,   setIsLoading]   = useState(true);
  const [overview,    setOverview]    = useState<AttendanceOverview | null>(null);
  const [records,     setRecords]     = useState<AttendanceDay[]>([]);
  const [leaves,      setLeaves]      = useState<LeaveRequest[]>([]);
  const [submitting,  setSubmitting]  = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Academic year months (stable — only changes across renders if month ticks over)
  const ayMonths = useMemo(() => getAcademicYearMonths(), []);

  // Default to current month
  const today = new Date();
  const defaultKey = toMonthKey(today.getFullYear(), today.getMonth());
  const [selectedKey, setSelectedKey] = useState(defaultKey);

  const selectedMonth = useMemo(
    () => ayMonths.find(m => toMonthKey(m.year, m.month) === selectedKey) ?? ayMonths[ayMonths.length - 1],
    [ayMonths, selectedKey],
  );

  // Month-scoped stats derived from full records
  const monthStats = useMemo(
    () => calcMonthStats(records, selectedMonth.year, selectedMonth.month),
    [records, selectedMonth],
  );

  const [form, setForm] = useState({ from_date: '', to_date: '', reason: '', note: '' });

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [attData, leaveData] = await Promise.all([
        fetchAttendanceData(studentId),
        fetchLeaveRequests(studentId),
      ]);
      if (attData) {
        setOverview(attData.overview);
        setRecords(attData.records);
      }
      setLeaves(leaveData || []);
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => { load(); }, [load]);

  const handleSubmitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.from_date || !form.to_date || !form.reason.trim()) return;
    setSubmitting(true);
    try {
      await submitLeaveRequest({
        student_id:  studentId,
        parent_id:   1,
        from_date:   form.from_date,
        to_date:     form.to_date,
        reason:      form.reason,
        parent_note: form.note || undefined,
      });
      setForm({ from_date: '', to_date: '', reason: '', note: '' });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
      const leaveData = await fetchLeaveRequests(studentId);
      setLeaves(leaveData || []);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-full flex flex-col bg-[#F9FAFB] text-gray-800 font-sans">
      <TopBar
        studentId={studentId}
        setStudentId={setStudentId}
        language={language}
        setLanguage={setLanguage}
        isLoading={isLoading}
      />

      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-5">

          {/* Page Header */}
          <div>
            <h1 className="text-2xl font-black text-gray-900">Attendance</h1>
            <p className="text-sm text-gray-500 mt-1">
              Track attendance, view calendar history, and manage leave requests.
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
            </div>
          ) : (
            <>
              {/* ── SECTION 1: Overview Cards (full year) ── */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <OverviewCard
                  icon="📊"
                  label="Overall Attendance"
                  value={`${overview?.percentage ?? 0}%`}
                  colorClass="bg-orange-50"
                />
                <OverviewCard
                  icon="✅"
                  label="Present Days"
                  value={overview?.present_days ?? 0}
                  colorClass="bg-green-50"
                />
                <OverviewCard
                  icon="❌"
                  label="Absent Days"
                  value={overview?.absent_days ?? 0}
                  colorClass="bg-red-50"
                />
                <OverviewCard
                  icon="🌗"
                  label="Half Days"
                  value={overview?.half_days ?? 0}
                  colorClass="bg-yellow-50"
                />
              </div>

              {/* ── SECTION 2: Heatmap with Month Selector ── */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">

                {/* Header row: title + month picker + month stats */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                  <div className="flex-1">
                    <h2 className="text-base font-bold text-gray-900">Attendance Calendar</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Day-by-day view for the selected month</p>
                  </div>

                  {/* Month dropdown */}
                  <div className="flex items-center gap-2 shrink-0">
                    <label className="text-xs text-gray-500 font-semibold whitespace-nowrap">Month</label>
                    <select
                      value={selectedKey}
                      onChange={e => setSelectedKey(e.target.value)}
                      className="border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium text-gray-700 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100 bg-white cursor-pointer"
                    >
                      {ayMonths.map(m => {
                        const key = toMonthKey(m.year, m.month);
                        return (
                          <option key={key} value={key}>{m.label}</option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Month-level stats pill */}
                  <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 shrink-0">
                    <div className="text-center">
                      <p className="text-[10px] text-gray-400 font-medium">This month</p>
                      <p className="text-xl font-black text-orange-500 leading-tight">{monthStats.pct}%</p>
                    </div>
                    <div className="w-px h-8 bg-gray-200" />
                    <div className="flex gap-3 text-center">
                      <div>
                        <p className="text-[10px] text-gray-400">Present</p>
                        <p className="text-sm font-black text-green-600">{monthStats.present}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400">Absent</p>
                        <p className="text-sm font-black text-red-500">{monthStats.absent}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400">Half</p>
                        <p className="text-sm font-black text-yellow-500">{monthStats.half}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Heatmap */}
                <MonthHeatmap
                  records={records}
                  year={selectedMonth.year}
                  month={selectedMonth.month}
                />
              </div>

              {/* ── SECTION 3: Leave Request + History (unchanged) ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Request Form */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-base font-bold text-gray-900 mb-4">Request Leave</h2>

                  {showSuccess && (
                    <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm font-medium px-4 py-3 rounded-xl">
                      Leave request submitted successfully.
                    </div>
                  )}

                  <form onSubmit={handleSubmitLeave} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500 font-semibold block mb-1">From Date</label>
                        <input
                          type="date"
                          required
                          value={form.from_date}
                          onChange={e => setForm(f => ({ ...f, from_date: e.target.value }))}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 font-semibold block mb-1">To Date</label>
                        <input
                          type="date"
                          required
                          value={form.to_date}
                          min={form.from_date}
                          onChange={e => setForm(f => ({ ...f, to_date: e.target.value }))}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-gray-500 font-semibold block mb-1">
                        Reason <span className="text-red-400">*</span>
                      </label>
                      <select
                        required
                        value={form.reason}
                        onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100 bg-white"
                      >
                        <option value="">Select a reason</option>
                        <option value="Medical / Illness">Medical / Illness</option>
                        <option value="Family Function">Family Function</option>
                        <option value="Travel">Travel</option>
                        <option value="Emergency">Emergency</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-gray-500 font-semibold block mb-1">
                        Additional Note <span className="text-gray-300">(optional)</span>
                      </label>
                      <textarea
                        rows={3}
                        value={form.note}
                        onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                        placeholder="Any additional details for the teacher..."
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold py-3 rounded-xl text-sm transition-colors"
                    >
                      {submitting ? 'Submitting…' : 'Submit Leave Request'}
                    </button>
                  </form>
                </div>

                {/* Leave History */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-base font-bold text-gray-900 mb-4">Leave History</h2>

                  {leaves.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-center">
                      <span className="text-4xl mb-3">📋</span>
                      <p className="text-sm text-gray-400 font-medium">No leave requests yet.</p>
                      <p className="text-xs text-gray-300 mt-1">Submit your first request using the form.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                      {leaves.map(l => (
                        <div
                          key={l.leave_request_id}
                          className="border border-gray-100 rounded-xl p-4 hover:border-orange-100 hover:bg-orange-50/30 transition-all"
                        >
                          <div className="flex justify-between items-start gap-2 mb-1">
                            <p className="text-sm font-semibold text-gray-800">{l.reason}</p>
                            <StatusBadge status={l.status} />
                          </div>
                          <p className="text-xs text-gray-500">
                            {new Date(l.from_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            {' → '}
                            {new Date(l.to_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                          {l.parent_note && (
                            <p className="text-xs text-gray-400 mt-1 italic">{l.parent_note}</p>
                          )}
                          <p className="text-[10px] text-gray-300 mt-2">
                            Submitted {new Date(l.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </>
          )}
        </div>
      </div>
    </div>
  );
}
