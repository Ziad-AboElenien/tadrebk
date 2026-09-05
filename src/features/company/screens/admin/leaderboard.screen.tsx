'use client';

import {
  Calendar,
  Download,
  Users,
  Target,
  Trophy,
  TrendingUp,
  Search,
  ChevronDown,
  MoreVertical,
  Crown,
  Medal,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import Sidebar from '@/components/tadrebk/Sidebar';
import TopBar from '@/components/tadrebk/TopBar';

const SUMMARY = [
  { label: 'TOTAL INTERNS', value: '124', icon: Users, color: 'text-blue-500' },
  { label: 'AVG. POINTS', value: '1,420', icon: Target, color: 'text-emerald-500' },
  { label: 'COMPLETED TASKS', value: '3,842', icon: Trophy, color: 'text-amber-500' },
  { label: 'TOP PERFORMER', value: '98%', icon: TrendingUp, color: 'text-fuchsia-500' },
];

const PODIUM = [
  { place: 2, name: 'Sara Mahmoud', track: 'UI/UX Design', points: '2,310', tasks: 38, perf: '96%' },
  { place: 1, name: 'Ahmed Hassan', track: 'Software Engineering', points: '2,450', tasks: 42, perf: '98%' },
  { place: 3, name: 'Omar Khaled', track: 'Data Science', points: '2,180', tasks: 35, perf: '94%' },
];

const RANKING = [
  { rank: 1, name: 'Ahmed Hassan', id: 'int-001', track: 'Software Engineering', points: '2,450', perf: '98%', tasks: 42, attendance: '100%', trend: 'up' },
  { rank: 2, name: 'Sara Mahmoud', id: 'int-002', track: 'UI/UX Design', points: '2,310', perf: '96%', tasks: 38, attendance: '98%', trend: 'up' },
  { rank: 3, name: 'Omar Khaled', id: 'int-003', track: 'Data Science', points: '2,180', perf: '94%', tasks: 35, attendance: '95%', trend: 'flat' },
  { rank: 4, name: 'Laila Youssef', id: 'int-004', track: 'Fintech Solutions', points: '1,950', perf: '92%', tasks: 31, attendance: '100%', trend: 'down' },
  { rank: 5, name: 'Mostafa Ibrahim', id: 'int-005', track: 'Software Engineering', points: '1,840', perf: '89%', tasks: 28, attendance: '92%', trend: 'up' },
  { rank: 6, name: 'Nour El-Din', id: 'int-006', track: 'Digital Marketing', points: '1,720', perf: '87%', tasks: 25, attendance: '96%', trend: 'flat' },
];

function Avatar({ name, ring }: { name: string; ring?: string }) {
  return (
    <div className={`flex h-11 w-11 items-center justify-center rounded-full bg-blue-700 text-sm font-semibold text-white ${ring || ''}`}>
      {name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
    </div>
  );
}

export default function LeaderboardScreen() {
  return (
    <div className="flex bg-slate-50">
      <Sidebar active="Leaderboard" />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar title="Internship Leaderboard" />

        <main className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Top Talent Ranking</h2>
              <p className="max-w-2xl text-sm text-slate-500">
                Real-time ranking of our active interns based on points earned through task
                completion, engagement, and technical evaluations.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
                <Calendar size={15} /> Monthly View
              </button>
              <button className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-600">
                <Download size={15} /> Export Report
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {SUMMARY.map((s) => (
              <div key={s.label} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5">
                <s.icon size={20} className={s.color} />
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">{s.label}</p>
                  <p className="text-xl font-semibold text-slate-900">{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {PODIUM.map((p) => (
              <div
                key={p.name}
                className={`relative rounded-2xl border p-6 text-center ${
                  p.place === 1 ? 'border-emerald-200 bg-emerald-50 sm:-translate-y-2' : 'border-slate-200 bg-white'
                }`}
              >
                <span className="absolute right-4 top-4">
                  {p.place === 1 ? (
                    <Crown size={18} className="text-amber-500" />
                  ) : (
                    <Medal size={18} className={p.place === 2 ? 'text-slate-400' : 'text-orange-400'} />
                  )}
                </span>
                <div className="flex justify-center">
                  <Avatar name={p.name} ring={p.place === 1 ? 'ring-4 ring-emerald-200' : ''} />
                </div>
                <p className="mt-3 font-semibold text-slate-900">{p.name}</p>
                <p className="text-xs text-slate-400">{p.track}</p>
                <p className="mt-3 text-2xl font-bold text-emerald-600">{p.points}</p>
                <p className="text-xs uppercase tracking-wide text-slate-400">Points</p>
                <div className="mt-4 flex justify-around border-t border-slate-200/70 pt-3 text-xs">
                  <div>
                    <p className="text-slate-400">TASKS</p>
                    <p className="font-semibold text-slate-900">{p.tasks}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">PERF.</p>
                    <p className="font-semibold text-slate-900">{p.perf}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">Performance Ranking</h3>
                <p className="text-sm text-slate-400">Detailed breakdown of all participating interns</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    placeholder="Search by name or track..."
                    className="rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
                <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600">
                  All Tracks <ChevronDown size={14} />
                </button>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                    <th className="py-3 font-medium">Rank</th>
                    <th className="py-3 font-medium">Intern Name</th>
                    <th className="py-3 font-medium">Track</th>
                    <th className="py-3 font-medium">Points</th>
                    <th className="py-3 font-medium">Performance</th>
                    <th className="py-3 font-medium">Tasks</th>
                    <th className="py-3 font-medium">Attendance</th>
                    <th className="py-3 font-medium">Trend</th>
                    <th className="py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {RANKING.map((r) => (
                    <tr key={r.id}>
                      <td className="py-3">
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                            r.rank <= 3 ? 'bg-amber-100 text-amber-700' : 'text-slate-500'
                          }`}
                        >
                          {r.rank <= 3 ? r.rank : `#${r.rank}`}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={r.name} />
                          <div>
                            <p className="font-medium text-slate-900">{r.name}</p>
                            <p className="text-xs text-slate-400">{r.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 font-medium text-emerald-600">{r.track}</td>
                      <td className="py-3 font-semibold text-slate-900">{r.points}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900">{r.perf}</span>
                          <div className="h-1.5 w-16 rounded-full bg-slate-100">
                            <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: r.perf }} />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-slate-600">{r.tasks}</td>
                      <td className="py-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            r.attendance === '100%' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                          }`}
                        >
                          {r.attendance}
                        </span>
                      </td>
                      <td className="py-3">
                        {r.trend === 'up' && <ArrowUpRight size={16} className="text-emerald-500" />}
                        {r.trend === 'down' && <ArrowDownRight size={16} className="text-rose-500" />}
                        {r.trend === 'flat' && <span className="text-slate-300">â€”</span>}
                      </td>
                      <td className="py-3 text-right">
                        <MoreVertical size={16} className="text-slate-300" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
              <span>Showing 6 interns in the current view</span>
              <div className="flex items-center gap-1">
                <button className="rounded-lg px-3 py-1.5 hover:bg-slate-50">Previous</button>
                <button className="h-8 w-8 rounded-full bg-emerald-500 font-medium text-white">1</button>
                <button className="h-8 w-8 rounded-full hover:bg-slate-50">2</button>
                <button className="h-8 w-8 rounded-full hover:bg-slate-50">3</button>
                <button className="rounded-lg px-3 py-1.5 hover:bg-slate-50">Next</button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-slate-900 p-8 text-white">
            <div className="max-w-xl">
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                <Trophy size={18} className="text-emerald-400" /> Upcoming Achievement Check
              </h3>
              <p className="mt-2 text-sm text-slate-300">
                The next &quot;Excellence Badge&quot; will be awarded on the 30th of this month to interns
                with points exceeding 2,500.
              </p>
              <button className="mt-4 flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium hover:bg-emerald-600">
                View Achievement Rules â†—
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}