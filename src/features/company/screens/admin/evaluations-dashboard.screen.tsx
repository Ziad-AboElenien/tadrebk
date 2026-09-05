'use client';

import {
  ClipboardCheck,
  CalendarDays,
  Trophy,
  TrendingUp,
  Download,
  Search,
  Filter,
  Plus,
  Star,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  MoreHorizontal,
  GraduationCap,
} from 'lucide-react';
import Sidebar from '@/components/tadrebk/Sidebar';
import TopBar from '@/components/tadrebk/TopBar';

const STATS = [
  { label: 'Total Evaluations', value: '124', icon: ClipboardCheck, badge: '+12% this month', sub: '24 pending review' },
  { label: 'Avg. Attendance', value: '94.2%', icon: CalendarDays, badge: null, sub: 'Above company target (90%)' },
  { label: 'Avg. Skill Rating', value: '4.4/5.0', icon: Trophy, badge: '+0.3 improvement', sub: 'Based on 482 peer reviews' },
  { label: 'Engagement Score', value: '88%', icon: TrendingUp, badge: null, sub: '12% increase in teamwork' },
];

const ALERTS = [
  { icon: AlertTriangle, color: 'bg-rose-50 text-rose-500', title: 'Low Attendance', body: 'Laila Hassan dropped below 75% attendance this week.', action: 'Check Logs' },
  { icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600', title: 'Evaluation Ready', body: 'Monthly report for Omar Khaled is ready for sign-off.', action: 'Review Now' },
  { icon: Clock3, color: 'bg-blue-50 text-blue-600', title: 'Deadline Approaching', body: 'Mid-term peer reviews end in 48 hours for Batch A.', action: 'Send Reminder' },
];

const INTERNS = [
  { name: 'Ahmed Mansour', uni: 'Cairo University', status: 'Completed', statusColor: 'bg-emerald-50 text-emerald-600', attendance: 98, skills: 4.5, teamwork: 4.8, updated: '2 hours ago' },
  { name: 'Sara El-Sayed', uni: 'Ain Shams', status: 'In Progress', statusColor: 'bg-blue-50 text-blue-600', attendance: 85, skills: 4.2, teamwork: 4.0, updated: '5 hours ago' },
  { name: 'Omar Khaled', uni: 'Alexandria Uni', status: 'Completed', statusColor: 'bg-emerald-50 text-emerald-600', attendance: 100, skills: 4.9, teamwork: 4.7, updated: '1 day ago' },
  { name: 'Laila Hassan', uni: 'GUC', status: 'Action Required', statusColor: 'bg-rose-50 text-rose-500', attendance: 72, skills: 3.8, teamwork: 3.5, updated: '3 days ago' },
  { name: 'Youssef Ali', uni: 'BUE', status: 'In Progress', statusColor: 'bg-blue-50 text-blue-600', attendance: 94, skills: 4.0, teamwork: 4.2, updated: '4 days ago' },
];

function Stars({ value }: { value: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={12}
          className={i <= Math.round(value) ? 'fill-emerald-500 text-emerald-500' : 'text-slate-200'}
        />
      ))}
    </span>
  );
}

export default function EvaluationsDashboardScreen() {
  return (
    <div className="flex bg-slate-50">
      <Sidebar active="Evaluations" />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar title="Evaluations Dashboard" />

        <main className="flex-1 space-y-6 overflow-y-auto p-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-start justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <s.icon size={18} />
                  </span>
                  {s.badge && (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">
                      {s.badge}
                    </span>
                  )}
                </div>
                <p className="mt-3 text-sm text-slate-500">{s.label}</p>
                <p className="text-2xl font-semibold text-slate-900">{s.value}</p>
                <p className="mt-1 text-xs text-slate-400">{s.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">Performance Trends</h3>
                  <p className="text-sm text-slate-400">Average intern metrics over the last 5 months</p>
                </div>
                <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">
                  <Download size={14} /> Export
                </button>
              </div>
              <div className="mt-6 flex h-56 items-end justify-between gap-6">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May'].map((m, i) => {
                  const heights = [
                    [90, 82, 88],
                    [75, 68, 80],
                    [95, 78, 87],
                    [92, 85, 90],
                    [88, 90, 93],
                  ][i];
                  return (
                    <div key={m} className="flex flex-1 flex-col items-center gap-1">
                      <div className="flex h-44 items-end gap-1">
                        <div className="w-3 rounded-t bg-emerald-500" style={{ height: `${heights[0]}%` }} />
                        <div className="w-3 rounded-t bg-slate-900" style={{ height: `${heights[1]}%` }} />
                        <div className="w-3 rounded-t bg-emerald-200" style={{ height: `${heights[2]}%` }} />
                      </div>
                      <span className="text-xs text-slate-400">{m}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 flex gap-5 text-xs text-slate-500">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Attendance</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-900" /> Skills</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-200" /> Teamwork</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="font-semibold text-slate-900">Recent Alerts</h3>
              <p className="text-sm text-slate-400">Action items requiring attention</p>
              <div className="mt-4 space-y-3">
                {ALERTS.map((a) => (
                  <div key={a.title} className={`rounded-xl p-4 ${a.color.split(' ')[0]}`}>
                    <div className="flex gap-2">
                      <a.icon size={16} className={a.color.split(' ')[1]} />
                      <div>
                        <p className={`text-sm font-semibold ${a.color.split(' ')[1]}`}>{a.title}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{a.body}</p>
                        <button className={`mt-1 text-xs font-semibold underline ${a.color.split(' ')[1]}`}>
                          {a.action}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">Intern Evaluations</h3>
                <p className="text-sm text-slate-400">Manage and view performance metrics for all active interns.</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    placeholder="Search interns..."
                    className="rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
                <button className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50">
                  <Filter size={15} />
                </button>
                <button className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-600">
                  <Plus size={15} /> New Evaluation
                </button>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                    <th className="py-3 font-medium">Intern Details</th>
                    <th className="py-3 font-medium">Status</th>
                    <th className="py-3 font-medium">Attendance</th>
                    <th className="py-3 font-medium">Skills Rating</th>
                    <th className="py-3 font-medium">Teamwork</th>
                    <th className="py-3 font-medium">Last Updated</th>
                    <th className="py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {INTERNS.map((i) => (
                    <tr key={i.name}>
                      <td className="py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-700 text-xs font-semibold text-white">
                            {i.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{i.name}</p>
                            <p className="text-xs text-slate-400">{i.uni}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${i.statusColor}`}>{i.status}</span>
                      </td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 rounded-full bg-slate-100">
                            <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${i.attendance}%` }} />
                          </div>
                          <span className="text-xs text-slate-500">{i.attendance}%</span>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900">{i.skills}</span>
                          <Stars value={i.skills} />
                        </div>
                      </td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900">{i.teamwork}</span>
                          <Stars value={i.teamwork} />
                        </div>
                      </td>
                      <td className="py-3.5 text-slate-400">{i.updated}</td>
                      <td className="py-3.5 text-right">
                        <MoreHorizontal size={16} className="text-slate-300" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
              <span>Showing 5 of 124 interns</span>
              <div className="flex gap-2">
                <button className="rounded-lg border border-slate-200 px-3 py-1.5">Previous</button>
                <button className="rounded-lg bg-slate-900 px-3 py-1.5 font-medium text-white">Next</button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Evaluation Completion Rate</p>
              <div className="mt-2 flex items-baseline gap-3">
                <p className="text-3xl font-bold text-slate-900">82%</p>
                <span className="text-sm font-medium text-emerald-600">↗ +5%</span>
                <span className="ml-auto text-sm text-slate-400">102/124 Completed</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-slate-100">
                <div className="h-2 w-4/5 rounded-full bg-emerald-500" />
              </div>
              <p className="mt-2 text-xs text-slate-400">Target is 100% by the end of the internship period (30 days remaining).</p>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Top Performing University</p>
                <p className="mt-2 flex items-center gap-2 text-lg font-semibold text-slate-900">
                  <GraduationCap size={18} className="text-emerald-500" /> Cairo University
                </p>
                <p className="text-sm text-slate-400">4.6 avg. performance score</p>
              </div>
              <button className="text-sm font-medium text-emerald-600">Details →</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}