'use client';

import { useState } from 'react';
import {
  Plus,
  Sliders,
  TrendingUp,
  Trophy,
  CheckCircle2,
  Search,
  CalendarCheck,
  CheckCircle,
  BarChart2,
  MessageCircle,
} from 'lucide-react';
import Sidebar from '@/components/tadrebk/Sidebar';
import TopBar from '@/components/tadrebk/TopBar';

const STATS = [
  { label: 'ACTIVE RULES', value: '12', icon: Sliders, badge: '5 categories configured' },
  { label: 'AVG. POINTS/MONTH', value: '850', icon: TrendingUp, badge: '+12% from last month' },
  { label: 'TOTAL REDEMPTIONS', value: '142', icon: Trophy, badge: 'Milestones reached' },
  { label: 'SYSTEM HEALTH', value: 'Optimal', icon: CheckCircle2, badge: 'Engine version 2.4' },
];

const TABS = ['Earning Rules', 'Milestones & Levels', 'General Settings'];

const RULES = [
  { icon: CalendarCheck, title: 'Daily Attendance Check-in', category: 'Attendance', categoryColor: 'bg-blue-50 text-blue-600', points: '+5', frequency: 'Daily', status: 'ACTIVE' },
  { icon: CheckCircle, title: 'Task Completed on Time', category: 'Tasks', categoryColor: 'bg-emerald-50 text-emerald-600', points: '+20', frequency: 'Per Task', status: 'ACTIVE' },
  { icon: CheckCircle, title: 'Task Completed Early', category: 'Tasks', categoryColor: 'bg-emerald-50 text-emerald-600', points: '+35', frequency: 'Per Task', status: 'ACTIVE' },
  { icon: BarChart2, title: 'Weekly Report Submission', category: 'Performance', categoryColor: 'bg-purple-50 text-purple-600', points: '+50', frequency: 'Weekly', status: 'ACTIVE' },
  { icon: MessageCircle, title: 'Mentoring a Peer', category: 'Community', categoryColor: 'bg-orange-50 text-orange-600', points: '+40', frequency: 'One-time', status: 'ACTIVE' },
  { icon: CalendarCheck, title: 'Perfect Attendance Week', category: 'Attendance', categoryColor: 'bg-blue-50 text-blue-600', points: '+100', frequency: 'Weekly', status: 'INACTIVE' },
];

type Rule = (typeof RULES)[number];

export default function PointsConfigurationScreen() {
  const [activeTab, setActiveTab] = useState(TABS[0]);

  return (
    <div className="flex bg-slate-50">
      <Sidebar active="Points" />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar title="Points Configuration" />

        <main className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Points & Rewards Engine</h2>
              <p className="text-sm text-slate-500">
                Configure how interns earn points and reach performance milestones.
              </p>
            </div>
            <button className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600">
              <Plus size={16} /> New Rule
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-start justify-between">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{s.label}</p>
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <s.icon size={18} />
                  </span>
                </div>
                <p className="mt-3 text-2xl font-semibold text-slate-900">{s.value}</p>
                <p className="mt-2 text-xs text-slate-400">{s.badge}</p>
              </div>
            ))}
          </div>

          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'Earning Rules' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">Activity Point Rules</h3>
                  <p className="text-sm text-slate-400">Define how many points are awarded for specific intern actions.</p>
                </div>
                <div className="relative">
                  <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    placeholder="Search activities..."
                    className="rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                      <th className="py-3 font-medium">Activity Description</th>
                      <th className="py-3 font-medium">Category</th>
                      <th className="py-3 font-medium">Points</th>
                      <th className="py-3 font-medium">Frequency</th>
                      <th className="py-3 font-medium">Status</th>
                      <th className="py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {RULES.map((r: Rule) => (
                      <tr key={r.title}>
                        <td className="flex items-center gap-3 py-3.5">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                            <r.icon size={15} />
                          </span>
                          <span className="font-medium text-slate-900">{r.title}</span>
                        </td>
                        <td className="py-3.5">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${r.categoryColor}`}>
                            {r.category}
                          </span>
                        </td>
                        <td className="py-3.5">
                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                            {r.points}
                          </span>
                        </td>
                        <td className="py-3.5 text-slate-600">{r.frequency}</td>
                        <td className="py-3.5">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              r.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="py-3.5">
                          <button className="text-sm font-medium text-emerald-600 hover:underline">Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button className="mt-4 w-full rounded-lg border border-dashed border-slate-200 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50">
                Load more rules
              </button>
            </div>
          )}

          {activeTab !== 'Earning Rules' && (
            <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-sm text-slate-400">
              {activeTab} content goes here.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}