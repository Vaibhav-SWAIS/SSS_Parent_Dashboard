'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

import { useTTS, translateCached } from '@/lib/multilingual';

import TopBar from '@/components/TopBar';

import {
  fetchAssignmentsHistory,
  fetchAssignmentAnalytics,
  submitAssignment
} from '@/lib/api';

import {
  fetchDueDateAlert
} from '@/lib/aiService';

import { useDashboard } from '@/lib/DashboardContext';
import AIInsightPanel from '@/components/AIInsightPanel';

type Assignment = {
  assignment_id: number; assignment_title: string; assignment_text?: string | null;
  subject: string; chapter_name?: string;
  teacher_name?: string; due_date: string; status: string;
  marks_obtained?: number | null; total_marks?: number | null;
  submitted_at?: string | null; submission_text?: string | null;
  teacher_remarks?: string | null; file_path?: string | null;
};
type Analytics = { total: number; submitted: number; pending: number; overdue: number; graded: number; completion_pct: number };

const S: Record<string, { bg: string; text: string; border: string }> = {
  Upcoming:  { bg: '#F3E8FF', text: '#7E22CE', border: '#D8B4FE' },
  Ongoing:   { bg: '#E0F2FE', text: '#0369A1', border: '#7DD3FC' },
  Submitted: { bg: '#DBEAFE', text: '#1D4ED8', border: '#93C5FD' },
  Graded:    { bg: '#DCFCE7', text: '#15803D', border: '#86EFAC' },
  Overdue:   { bg: '#FEE2E2', text: '#DC2626', border: '#FCA5A5' },
};

const TABS = ['All','Upcoming','Ongoing','Submitted','Graded','Overdue'] as const;
type Tab = typeof TABS[number];

const fmt = (d?: string|null) => d ? new Date(d).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : '–';

const daysTag = (due: string, status: string) => {
  if (!due || status==='Graded'||status==='Submitted') return null;
  const d = Math.ceil((new Date(due).getTime()-Date.now())/86400000);
  if (d<0) return {t:`${Math.abs(d)}d overdue`,c:'#DC2626'};
  if (d===0) return {t:'Due today',c:'#EA580C'};
  if (d===1) return {t:'Tomorrow',c:'#EA580C'};
  return {t:`${d} days left`,c:d<=7?'#EA580C':'#6B7280'};
};

const Badge = ({status}:{status:string}) => {
  const s = S[status]||{bg:'#F3F4F6',text:'#374151',border:'#D1D5DB'};
  return <span style={{background:s.bg,color:s.text,border:`1px solid ${s.border}`}} className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg">{status}</span>;
};

export default function AssignmentsPage() {
  const { studentId, setStudentId, parentId, language, setLanguage } = useDashboard();
  const router = useRouter();
  const { speak } = useTTS();
  const [aiStatus, setAiStatus] = useState<
  'idle' | 'loading' | 'success' | 'error'
>('idle');

const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
const [aiErrorType, setAiErrorType] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [analytics, setAnalytics] = useState<Analytics>({total:0,submitted:0,pending:0,overdue:0,graded:0,completion_pct:0});
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('All');
  const [search, setSearch] = useState('');
  const [subj, setSubj] = useState('All');
  const [statusF, setStatusF] = useState('All');
  const [drawer, setDrawer] = useState<Assignment|null>(null);
  const [modal, setModal] = useState(false);
  const [target, setTarget] = useState<Assignment|null>(null);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{m:string;ok:boolean}|null>(null);
  const [aiAlert, setAiAlert] = useState<any>(null);
  const [aiInsight, setAiInsight] = useState("");
  const [aiLoading, setAiLoading] = useState(false);


  const notify = (m:string,ok=true) => { setToast({m,ok}); setTimeout(()=>setToast(null),3000); };
const generateAssignmentInsight = async () => {
  try {
    setAiStatus("loading");
    setAiErrorType(null);

    // Temporary frontend-generated insight.
    // No AI analytics endpoint is called.
    await new Promise((resolve) => setTimeout(resolve, 800));

    const total = analytics.total;
    const submitted = analytics.submitted + analytics.graded;
    const pending = analytics.pending;
    const overdue = analytics.overdue;
    const completion = analytics.completion_pct;

    let insight = "";

    if (total === 0) {
      insight =
        "There are currently no assignments available for this student.";
    } else if (overdue > 0) {
      insight =
        `The student has ${overdue} overdue assignment${
          overdue > 1 ? "s" : ""
        }. Please review the pending work and help the student complete it as soon as possible.`;
    } else if (completion >= 80) {
      insight =
        `The student is performing well in assignment completion. ${submitted} out of ${total} assignments have been completed, with an overall completion rate of ${completion}%.`;
    } else {
      insight =
        `The student has completed ${submitted} out of ${total} assignments. There are ${pending} pending assignment${
          pending !== 1 ? "s" : ""
        }. Regular follow-up can help improve assignment completion.`;
    }

    // Translate into the language selected in the TopBar
    const translatedInsight = await translateCached(
      insight,
      language
    );

    setAiAnalysis(translatedInsight);
    setAiStatus("success");
  } catch (error) {
    console.error("Assignment insight error:", error);

    setAiStatus("error");
    setAiErrorType("ai-unavailable");
  }
};
  const load = async () => {
    if (!studentId) return; // wait for real studentId
    setIsLoading(true);
    console.log('[SSS] Assignments: fetching for student_id', studentId);
    const [a,an] = await Promise.all([fetchAssignmentsHistory(studentId),fetchAssignmentAnalytics(studentId)]);
    setAssignments(a); setAnalytics(an); setIsLoading(false);
  };

  useEffect(()=>{ load(); setDrawer(null); setTab('All'); },[studentId]);

  const subjects = useMemo(()=>['All',...Array.from(new Set(assignments.map(a=>a.subject)))],[assignments]);

  const rows = useMemo(()=>assignments.filter(a=>{
    if(tab!=='All'&&a.status!==tab) return false;
    if(subj!=='All'&&a.subject!==subj) return false;
    if(statusF!=='All'&&a.status!==statusF) return false;
    if(search){const q=search.toLowerCase();if(!a.assignment_title.toLowerCase().includes(q)&&!a.subject.toLowerCase().includes(q)&&!(a.chapter_name||'').toLowerCase().includes(q))return false;}
    return true;
  }),[assignments,tab,subj,statusF,search]);

  const counts = useMemo(()=>TABS.reduce((acc,t)=>({...acc,[t]:t==='All'?assignments.length:assignments.filter(a=>a.status===t).length}),{} as Record<Tab,number>),[assignments]);

  const doSubmit = async () => {
    if(!text.trim()||!target) return;
    setSubmitting(true);
    try {
      const up = await submitAssignment({assignment_id:target.assignment_id,student_id:studentId,submission_text:text});
      setAssignments(p=>p.map(a=>a.assignment_id===up.assignment_id?up:a));
      if(drawer?.assignment_id===up.assignment_id) setDrawer(up);
      await load(); setModal(false); setText(''); notify('Submitted successfully!');
    } catch { notify('Submission failed.',false); }
    finally { setSubmitting(false); }
  };
 const handleDueDateAlert = async (assignment: Assignment) => {
  try {
    const response = await fetchDueDateAlert({
      student_name: "Rahul",
      assignment_title: assignment.assignment_title,
      subject: assignment.subject,
      due_date: assignment.due_date,
      description: assignment.assignment_text || "",
    });

    console.log("Due Date Alert:", response);

    const translatedMessage = await translateCached(
      response.notification_message,
      language
    );

    const translatedAction = await translateCached(
      response.suggested_parent_action,
      language
    );

    setAiAlert({
      alert_title: response.alert_title,
      notification_message: translatedMessage,
      suggested_parent_action: translatedAction,
      status: response.status,
    });

    await speak(
      translatedMessage,
      language,
      `due-alert-${assignment.assignment_id}`
    );
  } catch (error) {
    console.error("Due Date Alert Error:", error);
  }
};
  const openModal = (a?:Assignment) => { setTarget(a||null); setText(''); setModal(true); };

  const cards = [
    {label:'Total',val:analytics.total,note:'All assignments',icon:'📋',c:'#6366F1'},
    {label:'Ongoing',val:analytics.pending,note:'Due within 7 days',icon:'⚡',c:'#0369A1'},
    {label:'Submitted',val:analytics.submitted+analytics.graded,note:`${analytics.completion_pct}% done`,icon:'✅',c:'#15803D'},
    {label:'Overdue',val:analytics.overdue,note:'Need attention',icon:'🚨',c:'#DC2626'},
    {label:'Graded',val:analytics.graded,note:'Marks received',icon:'🎯',c:'#D97706'},
  ];

  return (
    <div className="min-h-full flex flex-col font-sans">
      <TopBar studentId={studentId} setStudentId={setStudentId} parentId={parentId} language={language} setLanguage={setLanguage} isLoading={isLoading}/>

      {toast&&<div className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl shadow-lg text-sm font-semibold text-white ${toast.ok?'bg-green-600':'bg-red-600'}`}>{toast.m}</div>}

      <div className="flex-1 p-4 md:p-5">
        <div className="max-w-7xl mx-auto space-y-4">

          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
             <h1 className="text-2xl font-black" style={{color:'#F8FAFC'}}>Assignments</h1>
              <p className="text-sm mt-0.5" style={{color:'#94A3B8'}}>Track, submit, and monitor all assignments.</p>
            </div>
            <button onClick={()=>openModal()} className="text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm hover:opacity-90 transition-opacity flex items-center gap-2" style={{background:'#EA580C'}}>
              + New Submission
            </button>
          </div>

          {isLoading?(
            <div className="flex justify-center items-center h-60"><div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{borderColor:'#EA580C'}}></div></div>
          ):(
            <>
         {/* Overall AI Assignment Insight */}
<div
  className="bg-white rounded-2xl border shadow-sm overflow-hidden"
  style={{ borderColor: "#FED7AA" }}
>
  <div
    className="px-5 py-4 flex items-center gap-3"
    style={{ background: "#FFF7ED" }}
  >
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
      style={{ background: "#FFEDD5" }}
    >
      ✨
    </div>

    <div>
      <h2
        className="text-base font-black"
        style={{ color: "#111827" }}
      >
        Overall Assignment AI Insight
      </h2>

      <p
        className="text-xs mt-0.5"
        style={{ color: "#9A3412" }}
      >
        Summary based on assignment progress
      </p>
    </div>
  </div>

  <div className="px-5 py-2">
    <AIInsightPanel
      status={aiStatus}
      analysis={aiAnalysis}
      errorType={aiErrorType}
      onGenerate={generateAssignmentInsight}
      buttonLabel="Generate Overall Assignment Insight"
      insightLabel="Overall Assignment AI Insight"
    />
  </div>
</div>
              {/* Metric Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {cards.map(c=>(
                  <div key={c.label} className="bg-slate-800 rounded-xl border p-4" style={{borderColor:'rgba(255,255,255,0.1)'}}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base" style={{background:c.c+'18'}}>{c.icon}</div>
                      <span className="text-xs font-semibold" style={{color:'#94A3B8'}}>{c.label}</span>
                    </div>
                    <p className="text-2xl font-black" style={{color:'#F8FAFC'}}>{c.val}</p>
                    <p className="text-[11px] mt-0.5" style={{color:'#64748B'}}>{c.note}</p>
                  </div>
                ))}
              </div>

              {/* Filters */}
               <div className="bg-slate-800 rounded-xl border p-3 flex flex-wrap gap-2.5 items-center" style={{borderColor:'rgba(255,255,255,0.1)'}}>
                <select value={subj} onChange={e=>setSubj(e.target.value)}
                  className="text-sm font-medium rounded-lg px-3 py-2 border outline-none cursor-pointer"
                  style={{color:'#F8FAFC',borderColor:'rgba(255,255,255,0.1)',background:'#334155'}}>
                  {subjects.map(s=><option key={s} value={s} style={{background:'#334155',color:'#F8FAFC'}}>{s==='All'?'All Subjects':s}</option>)}
                </select>
                <select value={statusF} onChange={e=>setStatusF(e.target.value)}
                  className="text-sm font-medium rounded-lg px-3 py-2 border outline-none cursor-pointer"
                  style={{color:'#F8FAFC',borderColor:'rgba(255,255,255,0.1)',background:'#334155'}}>
                  {['All','Upcoming','Ongoing','Submitted','Graded','Overdue'].map(s=><option key={s} value={s} style={{background:'#334155',color:'#F8FAFC'}}>{s==='All'?'All Status':s}</option>)}
                </select>
                <div className="flex-1 relative min-w-[200px]">
                  <span className="absolute left-3 top-2.5 text-base">🔍</span>
                  <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by title, subject, chapter..."
                     className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg outline-none placeholder:text-slate-400"
                    style={{color:'#F8FAFC',borderColor:'rgba(255,255,255,0.1)',background:'#334155'}}/>
                </div>
                {(search||subj!=='All'||statusF!=='All')&&(
                  <button onClick={()=>{setSearch('');setSubj('All');setStatusF('All');}} className="text-xs font-semibold" style={{color:'#EA580C'}}>Clear ×</button>
                )}
              </div>

              {/* Tabs */}
               <div className="flex border-b overflow-x-auto" style={{borderColor:'rgba(255,255,255,0.1)'}}>
                {TABS.map(t=>(
                  <button key={t} onClick={()=>setTab(t)} className="px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 -mb-px transition-colors flex items-center gap-1.5"
                     style={{borderColor:tab===t?'#EA580C':'transparent',color:tab===t?'#EA580C':'#94A3B8'}}>
                    {t}
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{background:tab===t?'rgba(234,88,12,0.15)':'rgba(255,255,255,0.08)',color:tab===t?'#EA580C':'#64748B'}}>
                      {counts[t]}
                    </span>
                  </button>
                ))}
              </div>

              {/* Table */}
             <div className="bg-slate-900 rounded-xl border overflow-hidden" style={{borderColor:'rgba(255,255,255,0.1)'}}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                     <thead style={{background:'#1e293b',borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
                      <tr>
                        {['Assignment','Subject','Due Date','Submitted On','Marks','Status','Action'].map(h=>(
                           <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider" style={{color:'#94A3B8'}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.length===0?(
                        <tr><td colSpan={7} className="text-center py-14">
                          <div className="text-3xl mb-2">📭</div>
                              <p className="font-semibold" style={{color:'#CBD5E1'}}>No assignments found</p>
                          <p className="text-xs mt-1" style={{color:'#64748B'}}>Try adjusting your filters</p>
                        </td></tr>
                      ):rows.map((a,i)=>{
                        const dt=daysTag(a.due_date,a.status);
                        return(
                          <tr key={i} onClick={()=>setDrawer(a)}
                             className="transition-colors border-b cursor-pointer" style={{borderColor:'rgba(255,255,255,0.05)'}}
                            onMouseEnter={e=>(e.currentTarget.style.background='rgba(234,88,12,0.1)')}
                            onMouseLeave={e=>(e.currentTarget.style.background='')}>
                            <td className="px-4 py-3">
                              <p className="font-bold hover:text-orange-600 transition-colors" style={{color:'#F8FAFC'}}>{a.assignment_title}</p>
                              <p className="text-xs mt-0.5" style={{color:'#64748B'}}>{a.chapter_name}</p>
                            </td>
                            <td className="px-4 py-3 font-medium whitespace-nowrap" style={{color:'#4B5563'}}>{a.subject}</td>
                            <td className="px-4 py-3">
                                <p className="whitespace-nowrap" style={{color:'#CBD5E1'}}>{fmt(a.due_date)}</p>
                              {dt&&<p className="text-[11px] font-semibold mt-0.5" style={{color:dt.c}}>{dt.t}</p>}
                            </td>
                             <td className="px-4 py-3 whitespace-nowrap" style={{color:'#94A3B8'}}>{a.submitted_at?fmt(a.submitted_at):'–'}</td>
                            <td className="px-4 py-3 font-bold whitespace-nowrap" style={{color:'#F8FAFC'}}>
                              {a.marks_obtained!=null?<>{a.marks_obtained}<span style={{color:'#64748B',fontWeight:400}}> /{a.total_marks||'–'}</span></>:'–'}
                            </td>
                            <td className="px-4 py-3"><Badge status={a.status}/></td>
                            <td className="px-4 py-3" onClick={e=>e.stopPropagation()}>
                              <button onClick={()=>setDrawer(a)} className="text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors hover:border-orange-400 hover:text-orange-600" style={{color:'#E2E8F0',borderColor:'rgba(255,255,255,0.1)'}}>View</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                 <div className="px-4 py-2.5 border-t text-xs" style={{borderColor:'rgba(255,255,255,0.05)',color:'#64748B'}}>
                  Showing {rows.length} of {analytics.total} assignments
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── ASSIGNMENT DETAILS MODAL (centered) ── */}
      {drawer&&(
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-20 md:pt-24" onClick={()=>setDrawer(null)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-[100]"/>
           <div className="relative bg-slate-800 border border-white/10 rounded-2xl shadow-2xl flex flex-col w-full overflow-hidden z-[110]"
            style={{maxWidth:'820px', maxHeight:'85vh'}}
            onClick={e=>e.stopPropagation()}>

            {/* ── MODAL HEADER ── */}
            <div className="shrink-0 px-6 pt-7 pb-6 border-b sticky top-0 z-20" style={{background:'rgba(255,255,255,0.05)',borderColor:'rgba(255,255,255,0.1)'}}>
              <div className="flex items-start justify-between gap-4">
                {/* Left: title block */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-3xl font-black break-words leading-tight" style={{color:'#F8FAFC'}}>{drawer.assignment_title}</h2>
                  {drawer.chapter_name&&(
                    <p className="text-sm mt-1.5 flex items-center gap-1.5" style={{color:'#94A3B8'}}>
                      <span>📖</span><span className="font-medium">{drawer.chapter_name}</span>
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2.5 mt-4">
                    <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{background:'rgba(234,88,12,0.15)',color:'#EA580C'}}>{drawer.subject}</span>
                    <Badge status={drawer.status}/>
                  </div>
                </div>
                {/* Right: close */}
                <button onClick={()=>setDrawer(null)}
                  className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-2xl hover:bg-white/10 transition-colors mt-0.5"
                  style={{color:'#94A3B8'}}>×</button>
              </div>
            </div>

          {/* ── SCROLLABLE BODY ── */}
<div className="flex-1 overflow-y-auto">
  <div className="p-6 space-y-5">

    {/* SECTION 1 — Description */}
    <div>
      <p
        className="text-xs font-bold uppercase tracking-wider mb-2"
        style={{color:'#64748B' }}
      >
        Description
      </p>

      <div
        className="rounded-xl p-4"
        style={{
          background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)'
        }}
      >
        <p
          className="text-sm leading-relaxed"
          style={{
            color: drawer.assignment_text ? '#E2E8F0' : '#64748B',
            fontStyle: drawer.assignment_text ? "normal" : "italic",
          }}
        >
          {drawer.assignment_text || "No description provided."}
        </p>
      </div>
    </div>

    {/* SECTION 2 — Assignment Information */}
    <div>
        <p className="text-xs font-bold uppercase tracking-wider mb-2.5" style={{color:'#64748B'}}>Assignment Information</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          {
            icon: "👤",
            l: "Teacher",
            v: drawer.teacher_name || "–",
          },
          {
            icon: "📅",
            l: "Due Date",
            v: fmt(drawer.due_date),
          },
          {
            icon: "📤",
            l: "Submitted On",
            v: drawer.submitted_at
              ? fmt(drawer.submitted_at)
              : "Not submitted",
          },
          {
            icon: "🎯",
            l: "Marks Obtained",
            v:
              drawer.marks_obtained != null
                ? `${drawer.marks_obtained}`
                : "–",
          },
          {
            icon: "📊",
            l: "Total Marks",
            v:
              drawer.total_marks != null
                ? `${drawer.total_marks}`
                : "–",
          },
          {
            icon: "📋",
            l: "Chapter",
            v: drawer.chapter_name || "–",
          },
        ].map(({ icon, l, v }) => (
           <div key={l} className="rounded-xl p-3.5" style={{background:'rgba(255,255,255,0.05)',border:'1px solid #E5E7EB'}}>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1" style={{color:'#64748B'}}><span>{icon}</span>{l}</p>
              <p className="text-sm font-bold" style={{color:'#F8FAFC'}}>{v}</p>
          </div>
        ))}
      </div>
    </div>

    {/* SECTION 3 — Status */}
    {(() => {
      const dt = daysTag(drawer.due_date, drawer.status);

      type C = {
        bg: string;
        bd: string;
        tx: string;
        icon: string;
        msg: string;
      };

      let c: C | null = null;

      if (drawer.status === "Overdue")
        c = {
          bg: "#FEF2F2",
          bd: "#FECACA",
          tx: "#DC2626",
          icon: "⚠️",
          msg: dt
            ? `Assignment overdue by ${dt.t.replace(
                "d overdue",
                " days"
              )}.`
            : "Assignment is overdue.",
        };
      else if (drawer.status === "Ongoing")
        c = {
          bg: "#EFF6FF",
          bd: "#BFDBFE",
          tx: "#1D4ED8",
          icon: "⏰",
          msg: dt ? `Due in ${dt.t}.` : "Assignment is active.",
        };
      else if (drawer.status === "Upcoming")
        c = {
          bg: "#F3E8FF",
          bd: "#D8B4FE",
          tx: "#7E22CE",
          icon: "📌",
          msg: dt ? `Upcoming — ${dt.t}.` : "Assignment is upcoming.",
        };
      else if (drawer.status === "Submitted")
        c = {
          bg: "#EFF6FF",
          bd: "#BFDBFE",
          tx: "#1D4ED8",
          icon: "📩",
          msg: "Submission sent. Waiting for evaluation.",
        };
      else if (drawer.status === "Graded")
        c = {
          bg: "#F0FDF4",
          bd: "#BBF7D0",
          tx: "#15803D",
          icon: "✅",
          msg: "Assignment evaluated successfully.",
        };

      return c ? (
        <div
          className="rounded-xl p-4 flex items-center gap-3"
          style={{
            background: c.bg,
            border: `1px solid ${c.bd}`,
          }}
        >
          <span className="text-xl">{c.icon}</span>

          <p
            className="text-sm font-semibold"
            style={{ color: c.tx }}
          >
            {c.msg}
          </p>
        </div>
      ) : null;
    })()}

    {/* AI Reminder Card */}
    {aiAlert && (
      <div
        className="rounded-xl p-4"
        style={{
          background: "#F0FDF4",
          border: "1px solid #BBF7D0",
        }}
      >
        <p className="font-bold text-sm mb-2">
          🤖 {aiAlert.alert_title}
        </p>

        <p className="text-sm leading-relaxed">
          {aiAlert.notification_message}
        </p>

        <p className="text-xs mt-3">
          <b>Parent Action:</b>{" "}
          {aiAlert.suggested_parent_action}
        </p>
      </div>
    )}

    {/* SECTION 4 — Teacher Remarks */}
    <div>
      <p
        className="text-xs font-bold uppercase tracking-wider mb-2"
        style={{ color: "#9CA3AF" }}
      >
        Teacher Remarks
      </p>

      {drawer.teacher_remarks ? (
        <div
          className="rounded-xl p-4"
          style={{
            background: "#EFF6FF",
            border: "1px solid #BFDBFE",
          }}
        >
          <p
            className="text-[10px] font-bold uppercase mb-1.5"
            style={{ color: "#1D4ED8" }}
          >
            💬 Feedback from {drawer.teacher_name || "Teacher"}
          </p>

          <p
            className="text-sm"
            style={{ color: "#1E40AF" }}
          >
            "{drawer.teacher_remarks}"
          </p>
        </div>
      ) : (
         <p className="text-sm italic py-1" style={{color:'#64748B'}}>No remarks added yet.</p>
      )}
    </div>


    {/* SECTION 5 — Student Submission */}
    <div>
      <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{color:'#64748B'}}>Student Submission</p>

      {drawer.submission_text ? (
        <div
          className="rounded-xl p-4"
          style={{
            background: "#F0FDF4",
            border: "1px solid #BBF7D0",
          }}
        >
          <p
            className="text-sm whitespace-pre-wrap"
            style={{ color: "#166534" }}
          >
            {drawer.submission_text}
          </p>
        </div>
      ) : (
          <div className="rounded-xl p-5 text-center" style={{background:'rgba(255,255,255,0.05)',border:'1px dashed #E5E7EB'}}>
          <p className="text-2xl">📭</p>

          <p className="text-sm font-semibold" style={{color:'#94A3B8'}}>No submission uploaded yet.</p>
        </div>
      )}
    </div>

  </div>
</div>
            {/* ── STICKY FOOTER ── */}
              <div className="shrink-0 px-6 py-4 border-t flex flex-wrap gap-3" style={{borderColor:'rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.05)'}}>
              {['Upcoming','Ongoing','Overdue'].includes(drawer.status)?(
                <button onClick={()=>{setTarget(drawer);openModal(drawer);setDrawer(null);}}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white hover:opacity-90 transition-opacity"
                  style={{background:'#EA580C'}}>Submit Assignment</button>
              ):drawer.status==='Submitted'?(
                <button onClick={()=>{setTarget(drawer);openModal(drawer);setDrawer(null);}}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm border hover:border-orange-400 hover:text-orange-600 transition-colors"
                  style={{color:'#CBD5E1',borderColor:'rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.05)'}}>Update Submission</button>
              ):drawer.status==='Graded'?(
                <div className="flex-1 rounded-xl py-2.5 text-center" style={{background:'#F0FDF4',border:'1px solid #BBF7D0'}}>
                  <p className="text-sm font-bold" style={{color:'#15803D'}}>✅ Graded — {drawer.marks_obtained} marks received</p>
                </div>
              ):null}
              <button
  onClick={()=>handleDueDateAlert(drawer)}
  className="px-4 py-2.5 rounded-xl font-semibold text-sm border transition-colors hover:border-orange-400 hover:text-orange-600 flex items-center gap-1.5"
  style={{
    color:'#EA580C',
    borderColor:'#FED7AA',
    background:'#FFF7ED'
  }}
>
🤖 AI Reminder
</button>
              <button
                onClick={()=>{
                  const subject = encodeURIComponent(`Re: ${drawer.assignment_title} (${drawer.subject})`);
                  router.push(`/parent/communication?new=1&subject=${subject}&category=Academic`);
                  setDrawer(null);
                }}
                className="px-4 py-2.5 rounded-xl font-semibold text-sm border transition-colors hover:border-blue-400 hover:text-blue-600 flex items-center gap-1.5"
                style={{color:'#1D4ED8',borderColor:'#BFDBFE',background:'#EFF6FF'}}>
                💬 Ask Teacher
              </button>
              <button onClick={()=>setDrawer(null)}
                className="px-5 py-2.5 rounded-xl font-semibold text-sm border transition-colors hover:bg-white/10"
                style={{color:'#94A3B8',borderColor:'rgba(255,255,255,0.1)'}}>Close</button>
            </div>
          </div>
        </div>
      )}


      {/* Submit Modal */}

      {modal&&(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-[100]"/>
           <div className="relative bg-slate-800 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden z-[110]">
            <div className="p-5 border-b flex justify-between items-center" style={{borderColor:'rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.05)'}}>
              <h3 className="font-black text-lg" style={{color:'#F8FAFC'}}>Submit Assignment</h3>
              <button onClick={()=>{setModal(false);setText('');}} className="text-2xl leading-none hover:opacity-60" style={{color:'#64748B'}}>×</button>
            </div>
            <div className="p-5 space-y-4">
              {/* Assignment selector */}
              {!target?(
                <div>
                  <label className="block text-xs font-bold mb-1.5 uppercase tracking-wide" style={{color:'#E2E8F0'}}>Select Assignment</label>
                  <select onChange={e=>{const f=assignments.find(a=>a.assignment_id===Number(e.target.value));setTarget(f||null);}}
                    className="w-full border rounded-xl px-3 py-2.5 text-sm font-medium outline-none"
                      style={{color:'#F8FAFC',borderColor:'rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.05)'}}>
                    <option value="" style={{color:'#64748B'}}>— Choose an assignment —</option>
                    {assignments.filter(a=>['Upcoming','Ongoing','Overdue'].includes(a.status)).map(a=>(
                      <option key={a.assignment_id} value={a.assignment_id} style={{color:'#F8FAFC'}}>
                        {a.assignment_title} · {a.subject} · Due {fmt(a.due_date)}
                      </option>
                    ))}
                  </select>
                </div>
              ):(
                 <div className="rounded-xl p-4" style={{background:'rgba(234,88,12,0.1)',border:'1px solid rgba(234,88,12,0.25)'}}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider" style={{color:'#EA580C'}}>Submitting for</p>
                      <p className="font-bold mt-0.5" style={{color:'#F8FAFC'}}>{target.assignment_title}</p>
                      <p className="text-xs mt-0.5" style={{color:'#94A3B8'}}>{target.subject} · Due {fmt(target.due_date)}</p>
                      {target.teacher_name&&<p className="text-xs mt-0.5" style={{color:'#94A3B8'}}>Teacher: {target.teacher_name}</p>}
                    </div>
                    <button onClick={()=>setTarget(null)} className="text-xs font-bold" style={{color:'#EA580C'}}>Change</button>
                  </div>
                </div>
              )}

              <div>
                 <label className="block text-xs font-bold mb-1.5 uppercase tracking-wide" style={{color:'#E2E8F0'}}>
                  Submission Text <span style={{color:'#DC2626'}}>*</span>
                </label>
                <textarea rows={5} value={text} onChange={e=>setText(e.target.value)}
                  placeholder="Write your answer or describe your submission..."
                  className="w-full border rounded-xl px-4 py-3 text-sm outline-none resize-none bg-slate-700 placeholder:text-slate-500"
                  style={{color:'#F8FAFC',borderColor:'rgba(255,255,255,0.1)',lineHeight:'1.6'}}
                  onFocus={e=>e.target.style.borderColor='#EA580C'}
                  onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.1)'}/>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5 uppercase tracking-wide" style={{color:'#E2E8F0'}}>Attachment (optional)</label>
                <div className="border-2 border-dashed rounded-xl p-4 text-center" style={{borderColor:'rgba(255,255,255,0.1)'}}>
                  <p className="text-sm" style={{color:'#9CA3AF'}}>📎 Drag & drop or paste a file link</p>
                  <input type="text" placeholder="https://drive.google.com/..." className="mt-2 w-full text-sm border rounded-lg px-3 py-2 outline-none"
                    style={{color:'#F8FAFC',borderColor:'rgba(255,255,255,0.1)'}}/>
                </div>
              </div>

              <button onClick={doSubmit} disabled={!text.trim()||!target||submitting}
                className="w-full py-3 rounded-xl font-bold text-sm text-white transition-opacity"
                style={{background:(!text.trim()||!target||submitting)?'#FED7AA':'#EA580C',cursor:(!text.trim()||!target||submitting)?'not-allowed':'pointer'}}>
                {submitting?'Submitting…':'Submit Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
            );{aiAlert && (
<div
 className="rounded-xl p-4"
 style={{
  background:'#F0FDF4',
  border:'1px solid #BBF7D0'
 }}
>
<p className="font-bold text-sm mb-2">
🤖 {aiAlert.alert_title}
</p>

<p className="text-sm">
{aiAlert.notification_message}
</p>

<p className="text-xs mt-3">
<b>Parent Action:</b> {aiAlert.suggested_parent_action}
</p>

</div>
)}
}
