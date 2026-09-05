'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Download,
  Plus,
  CheckCircle2,
  Clock,
  FileBarChart2,
  AlertCircle,
  Search,
  MoreHorizontal,
  Calendar,
} from 'lucide-react';
import { useAppSelector } from '@/store/store';
import Sidebar from '@/components/tadrebk/Sidebar';
import TopBar from '@/components/tadrebk/TopBar';
import { internService } from '@/features/company/services/intern.service';
import { Intern } from '@/features/company/types/management';
import { getErrorMessage } from '@/lib/axios';
import { toastHelper } from '@/lib/toast';

const STATUS_STYLES: Record<string, string> = {
  Active: 'bg-emerald-50 text-emerald-600',
  'In Training': 'bg-blue-50 text-blue-600',
  Pending: 'bg-amber-50 text-amber-600',
  'On Leave': 'bg-slate-100 text-slate-500',
};

function initials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function InternsManagementScreen() {
  const company = useAppSelector((s) => s.company.currentCompany);
  const companyId = company?._id;
  const [interns, setInterns] = useState<Intern[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'active' | 'alumni' | 'all'>('all');

  const fetchInterns = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const res = await internService.listInterns(companyId, {
        status,
        search: search || undefined,
        limit: 20,
      });
      setInterns(res.data);
      setTotal(res.pagination?.total ?? res.data.length);
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [companyId, status, search]);

  useEffect(() => {
    const t = setTimeout(fetchInterns, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchInterns, search]);

  const statusOf = (intern: Intern) => {
    if (!intern.isConfirmed) return 'Pending';
    if (intern.enrolledAt) return 'Active';
    return 'Pending';
  };

  const stats = [
    { label: 'Total Active Interns', value: String(total), icon: CheckCircle2, iconColor: 'text-emerald-600 bg-emerald-50', sub: '+12% from last cohort' },
    { label: 'Pending Onboarding', value: '14', icon: Clock, iconColor: 'text-blue-600 bg-blue-50', sub: 'Starts in next 7 days' },
    { label: 'Avg. Performance', value: '88.4%', icon: FileBarChart2, iconColor: 'text-amber-600 bg-amber-50', sub: 'Target goal: >85%' },
    { label: 'Evaluations Due', value: '09', icon: AlertCircle, iconColor: 'text-rose-500 bg-rose-50', sub: 'Deadline: Friday 5PM' },
  ];

  return (
    <div className="flex bg-slate-50">
      <Sidebar active="Interns" />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar title="Interns Management" />

        <main className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">Program Overview</h2>
              <p className="text-sm text-slate-500">Snapshot of your current internship talent pool.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
                <Download size={15} /> Export Roster
              </button>
              <button className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600">
                <Plus size={16} /> Add New Intern
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-start justify-between">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.iconColor}`}>
                    <s.icon size={18} />
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">This Month</span>
                </div>
                <p className="mt-3 text-2xl font-semibold text-slate-900">{s.value}</p>
                <p className="text-sm text-slate-500">{s.label}</p>
                <p className="mt-1 text-xs text-slate-400">{s.sub}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">Talent Roster</h3>
                <p className="text-sm text-slate-400">Manage and monitor all currently enrolled interns.</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Filter by name, uni, or email..."
                    className="w-64 rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'active' | 'alumni' | 'all')}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="alumni">Alumni</option>
                </select>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              {loading ? (
                <div className="animate-pulse">
                  <div className="flex gap-16 border-b border-slate-100 pb-3 text-xs uppercase tracking-wide text-slate-400">
                    <div className="h-2.5 w-24 rounded-full bg-slate-200" />
                    <div className="h-2.5 w-32 rounded-full bg-slate-200" />
                    <div className="h-2.5 w-20 rounded-full bg-slate-200" />
                    <div className="h-2.5 w-20 rounded-full bg-slate-200" />
                    <div className="h-2.5 w-14 rounded-full bg-slate-200" />
                    <div className="h-2.5 w-16 rounded-full bg-slate-200" />
                  </div>
                  <div className="divide-y divide-slate-50">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center gap-16 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-slate-200" />
                          <div className="space-y-2">
                            <div className="h-3.5 w-28 rounded-full bg-slate-200" />
                            <div className="h-2.5 w-20 rounded-full bg-slate-200" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-3.5 w-36 rounded-full bg-slate-200" />
                          <div className="h-2.5 w-24 rounded-full bg-slate-200" />
                        </div>
                        <div className="h-6 w-20 rounded-full bg-slate-200" />
                        <div className="h-3.5 w-24 rounded-full bg-slate-200" />
                        <div className="h-3.5 w-16 rounded-full bg-slate-200" />
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-slate-200" />
                          <div className="h-8 w-8 rounded-lg bg-slate-200" />
                          <div className="h-8 w-8 rounded-lg bg-slate-200" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <table className="w-full min-w-[800px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                      <th className="py-3 font-medium">Intern Profile</th>
                      <th className="py-3 font-medium">Department & University</th>
                      <th className="py-3 font-medium">Enrollment Status</th>
                      <th className="py-3 font-medium">Start Date</th>
                      <th className="py-3 font-medium">Score</th>
                      <th className="py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {interns.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-sm text-slate-400">
                          No interns found.
                        </td>
                      </tr>
                    ) : (
                      interns.map((i) => {
                        const name = `${i.firstName} ${i.lastName}`.trim();
                        const st = statusOf(i);
                        return (
                          <tr key={i._id}>
                            <td className="py-3.5">
                              <Link href={`/company/admin/interns/${i._id}`} className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-700 text-xs font-semibold text-white">
                                  {initials(name) || '?'}
                                </div>
                                <div>
                                  <p className="font-medium text-slate-900">{name || i.email}</p>
                                  <p className="text-xs text-slate-400">{i.email}</p>
                                </div>
                              </Link>
                            </td>
                            <td className="py-3.5">
                              <p className="text-slate-700">{i.headline || 'â€”'}</p>
                              <p className="text-xs text-slate-400">{i.totalPoints} pts</p>
                            </td>
                            <td className="py-3.5">
                              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[st]}`}>{st}</span>
                            </td>
                            <td className="py-3.5">
                              <span className="flex items-center gap-1.5 text-slate-600">
                                <Calendar size={13} className="text-slate-400" />
                                {i.enrolledAt
                                  ? new Date(i.enrolledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                  : 'â€”'}
                              </span>
                            </td>
                            <td className="py-3.5">
                              {i.totalPoints > 0 ? (
                                <div className="flex items-center gap-2">
                                  <div className="h-1.5 w-16 rounded-full bg-slate-100">
                                    <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${Math.min(i.totalPoints, 100)}%` }} />
                                  </div>
                                  <span className="text-xs font-medium text-slate-700">{i.totalPoints}</span>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-300">N/A</span>
                              )}
                            </td>
                            <td className="py-3.5 text-right">
                              <MoreHorizontal size={16} className="text-slate-300" />
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
              <span>Showing {interns.length} of {total} results</span>
              <div className="flex items-center gap-1">
                <button className="rounded-lg px-3 py-1.5 hover:bg-slate-50">Previous</button>
                <button className="h-8 w-8 rounded-full bg-emerald-500 font-medium text-white">1</button>
                <button className="h-8 w-8 rounded-full hover:bg-slate-50">2</button>
                <button className="rounded-lg px-3 py-1.5 hover:bg-slate-50">Next</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}