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
import StackedBarChart from '@/features/company/components/StackedBarChart';
import LineAreaChart from '@/features/company/components/LineAreaChart';
import DonutGauge from '@/features/company/components/DonutGauge';

const STATS = [
  { label: 'Avg. Attendance', value: '94.2%', icon: Users, delta: '+2.1%', deltaLabel: 'vs last month' },
  { label: 'Task Completion', value: '88.5%', icon: CheckCircle2, delta: '+5.4%', deltaLabel: 'on-time rate' },
  { label: 'Avg. Evaluation', value: '4.6/5.0', icon: Star, delta: '+0.3', deltaLabel: 'skill assessment' },
  { label: 'Time to Complete', value: '2.4 Days', icon: Clock, delta: '-12%', deltaDirection: 'down' as const, deltaLabel: 'per task unit' },
];

const ATTENDANCE: { label: string; values: Record<string, number> }[] = [
  { label: 'Mon', values: { present: 92, remote: 6, absent: 2 } },
  { label: 'Tue', values: { present: 96, remote: 3, absent: 1 } },
  { label: 'Wed', values: { present: 88, remote: 8, absent: 4 } },
  { label: 'Thu', values: { present: 94, remote: 4, absent: 2 } },
  { label: 'Fri', values: { present: 90, remote: 5, absent: 5 } },
];

const ATTENDANCE_COLORS = { present: '#10b981', remote: '#a7f3d0', absent: '#fb7185' };

const COMPLETION_TREND: { label: string; value: number }[] = [
  { label: 'Jan', value: 20 },
  { label: 'Feb', value: 40 },
  { label: 'Mar', value: 55 },
  { label: 'Apr', value: 45 },
  { label: 'May', value: 70 },
  { label: 'Jun', value: 80 },
];

const PERFORMANCE_TREND: { label: string; value: number }[] = [
  { label: 'W1', value: 10 },
  { label: 'W2', value: 30 },
  { label: 'W3', value: 40 },
  { label: 'W4', value: 25 },
  { label: 'W5', value: 60 },
  { label: 'W6', value: 55 },
  { label: 'W7', value: 50 },
  { label: 'W8', value: 90 },
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
              <div className="mt-6">
                <StackedBarChart data={ATTENDANCE} colors={ATTENDANCE_COLORS} height={224} />
              </div>
              <div className="mt-2 flex gap-5 text-xs text-slate-500">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Present</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-200" /> Remote</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-400" /> Absent</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="font-semibold text-slate-900">Task Completion Trends</h3>
              <p className="text-sm text-slate-400">Monthly trend of completed task volume.</p>
              <div className="mt-6">
                <LineAreaChart data={COMPLETION_TREND} fill height={224} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="font-semibold text-slate-900">Overall Performance Progress</h3>
              <p className="text-sm text-slate-400">Aggregated cohort performance score across the last 8 weeks.</p>
              <div className="mt-6">
                <LineAreaChart data={PERFORMANCE_TREND} height={224} />
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
                <DonutGauge value={65} />
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