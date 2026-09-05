'use client';

import {
  Calendar,
  Filter,
  Download,
  Users,
  CheckCircle2,
  Star,
  Clock,
  TrendingUp,
} from 'lucide-react';
import Sidebar from '@/components/tadrebk/Sidebar';
import TopBar from '@/components/tadrebk/TopBar';
import StatCard from '@/components/tadrebk/StatCard';

const STATS = [
  { label: 'Avg. Attendance', value: '94.2%', icon: Users, delta: '+2.1%', deltaLabel: 'vs last month' },
  { label: 'Task Completion', value: '88.5%', icon: CheckCircle2, delta: '+5.4%', deltaLabel: 'on-time rate' },
  { label: 'Avg. Evaluation', value: '4.6/5.0', icon: Star, delta: '+0.3', deltaLabel: 'skill assessment' },
  { label: 'Time to Complete', value: '2.4 Days', icon: Clock, delta: '-12%', deltaDirection: 'down' as const, deltaLabel: 'per task unit' },
];

const ATTENDANCE = [
  { day: 'Mon', present: 92, remote: 6, absent: 2 },
  { day: 'Tue', present: 96, remote: 3, absent: 1 },
  { day: 'Wed', present: 88, remote: 8, absent: 4 },
  { day: 'Thu', present: 94, remote: 4, absent: 2 },
  { day: 'Fri', present: 90, remote: 5, absent: 5 },
];

const SKILLS = [
  { label: 'Technical Skills', pct: 85 },
  { label: 'Communication', pct: 78 },
  { label: 'Teamwork', pct: 92 },
  { label: 'Punctuality', pct: 95 },
  { label: 'Problem Solving', pct: 82 },
];

const TOP_INTERNS = [
  { name: 'Ahmed Mansour', tasks: 42, score: '98%', trend: 'RISING' },
  { name: 'Sara El-Sayed', tasks: 38, score: '95%', trend: 'RISING' },
  { name: 'Omar Khaled', tasks: 35, score: '92%', trend: 'STEADY' },
  { name: 'Laila Hassan', tasks: 31, score: '90%', trend: 'RISING' },
];

export default function PerformanceReportsScreen() {
  return (
    <div className="flex bg-slate-50">
      <Sidebar active="Reports" />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar title="Performance Reports" />

        <main className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Program Analytics</h2>
              <p className="text-sm text-slate-500">
                Comprehensive overview of intern performance and engagement metrics.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
                <Calendar size={15} /> Last 30 Days
              </button>
              <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
                <Filter size={15} /> Filters
              </button>
              <button className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-600">
                <Download size={15} /> Export Data
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="font-semibold text-slate-900">Weekly Attendance Status</h3>
              <p className="text-sm text-slate-400">Daily breakdown of presence vs remote work.</p>
              <div className="mt-6 flex h-56 items-end justify-between gap-4">
                {ATTENDANCE.map((d) => (
                  <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                    <div className="flex h-44 w-full items-end justify-center gap-1">
                      <div className="w-2.5 rounded-t bg-emerald-500" style={{ height: `${d.present}%` }} />
                      <div className="w-2.5 rounded-t bg-emerald-200" style={{ height: `${d.remote}%` }} />
                      <div className="w-2.5 rounded-t bg-rose-400" style={{ height: `${d.absent}%` }} />
                    </div>
                    <span className="text-xs text-slate-400">{d.day}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex gap-5 text-xs text-slate-500">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Present</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-200" /> Remote</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-400" /> Absent</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="font-semibold text-slate-900">Task Completion Trends</h3>
              <p className="text-sm text-slate-400">Monthly volume of closed tasks vs overdue items.</p>
              <div className="mt-6 h-56">
                <svg viewBox="0 0 300 120" className="h-full w-full" preserveAspectRatio="none">
                  <polyline
                    fill="url(#trendFill)"
                    stroke="#10b981"
                    strokeWidth="2"
                    points="0,80 50,60 100,45 150,55 200,30 250,20 300,15 300,120 0,120"
                  />
                  <defs>
                    <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m) => (
                  <span key={m}>{m}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="font-semibold text-slate-900">Overall Performance Progress</h3>
              <p className="text-sm text-slate-400">Weekly aggregated performance score across all active cohorts.</p>
              <div className="mt-6 h-56">
                <svg viewBox="0 0 300 120" className="h-full w-full" preserveAspectRatio="none">
                  <polyline
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    points="0,100 40,70 80,60 120,75 160,40 200,45 240,50 280,10"
                  />
                </svg>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                {['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'].map((w) => (
                  <span key={w}>{w}</span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="font-semibold text-slate-900">Skill Evaluation Metrics</h3>
              <p className="text-sm text-slate-400">Average scores by core competency category.</p>
              <div className="mt-5 space-y-4">
                {SKILLS.map((s) => (
                  <div key={s.label}>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">{s.label}</span>
                      <span className="font-medium text-slate-900">{s.pct}%</span>
                    </div>
                    <div className="mt-1.5 h-2 rounded-full bg-slate-100">
                      <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${s.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700">
                <TrendingUp size={14} className="mt-0.5 shrink-0" />
                <p><span className="font-semibold">Key Insight:</span> Teamwork and Punctuality are at record highs. Consider more collaborative group projects.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">Top Performing Interns</h3>
                  <p className="text-sm text-slate-400">Recognizing excellence based on cumulative points and feedback.</p>
                </div>
                <button className="text-sm font-medium text-emerald-600">View Leaderboard</button>
              </div>
              <div className="mt-4 space-y-3">
                {TOP_INTERNS.map((i) => (
                  <div key={i.name} className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-700 text-xs font-semibold text-white">
                      {i.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{i.name}</p>
                      <p className="text-xs text-slate-400">{i.tasks} tasks completed</p>
                    </div>
                    <div className="text-right text-xs">
                      <p className="font-semibold text-slate-900">{i.score}</p>
                      <p className={i.trend === 'RISING' ? 'text-emerald-600' : 'text-rose-500'}>{i.trend}</p>
                    </div>
                    <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
                      Profile
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="font-semibold text-slate-900">Cohort Progress Overview</h3>
              <p className="text-sm text-slate-400">Current stage of the Summer 2024 Internship Program.</p>
              <div className="mt-6 flex justify-center">
                <div className="relative flex h-40 w-40 items-center justify-center rounded-full border-8 border-slate-100">
                  <div
                    className="absolute inset-0 rounded-full border-8 border-emerald-500"
                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 65%)' }}
                  />
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900">65%</p>
                    <p className="text-xs text-slate-400">Program Complete</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">Time Remaining</p>
                  <p className="text-lg font-semibold text-slate-900">14 Days</p>
                  <div className="mt-2 h-1.5 rounded-full bg-slate-200"><div className="h-1.5 w-2/3 rounded-full bg-emerald-500" /></div>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">Pending Reviews</p>
                  <p className="text-lg font-semibold text-slate-900">28 Items</p>
                  <div className="mt-2 h-1.5 rounded-full bg-slate-200"><div className="h-1.5 w-1/3 rounded-full bg-emerald-500" /></div>
                </div>
              </div>
              <button className="mt-4 w-full rounded-lg bg-emerald-500 py-2.5 text-sm font-medium text-white hover:bg-emerald-600">
                Generate Final Graduation Report
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}