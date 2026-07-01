'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAppSelector } from '@/store/store';
import { internshipService } from '@/services/internship.service';
import { Internship } from '@/types/internship';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
import { toast } from 'react-toastify';
import { getErrorMessage } from '@/lib/axios';

type Tab = 'active' | 'closed';

export default function CompanyDashboardPage() {
  const company = useAppSelector((s) => s.company.currentCompany);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('active');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!company?._id) { setLoading(false); return; }
    try {
      const res = await internshipService.listInternships({ companyId: company._id, limit: 100 });
      setInternships(res.internships);
    } catch { setInternships([]); }
    finally { setLoading(false); }
  }, [company?._id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = internships.filter((i) =>
    tab === 'active' ? !i.closed : i.closed,
  );

  async function handleToggleStatus(intern: Internship) {
    if (!company) return;
    setToggling(intern._id);
    try {
      const updated = await internshipService.updateInternship(company._id, intern._id, {
        closed: !intern.closed,
      });
      setInternships((prev) =>
        prev.map((i) => (i._id === intern._id ? updated : i)),
      );
      toast.success(updated.closed ? 'Internship closed' : 'Internship reopened');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setToggling(null);
    }
  }

  async function handleDelete(internId: string) {
    if (!company) return;
    if (!window.confirm('Are you sure you want to delete this internship?')) return;
    setDeleting(internId);
    try {
      await internshipService.deleteInternship(company._id, internId);
      setInternships((prev) => prev.filter((i) => i._id !== internId));
      toast.success('Internship deleted');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(null);
    }
  }

  if (!company) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">Complete your company profile to access the dashboard.</p>
        <Link href="/company/onboarding"><Button>Complete Company Profile</Button></Link>
      </div>
    );
  }

  const activeCount = internships.filter((i) => !i.closed).length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Pending approval banner */}
      {!company.approvedByAdmin && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
          <i className="fas fa-clock text-amber-600 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900">Pending admin approval</p>
            <p className="text-sm text-amber-800">Your company profile is under review. You can still manage internships.</p>
          </div>
        </div>
      )}

      {/* Company header */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold text-lg">
              {company.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-dark">{company.name}</h1>
              <p className="text-sm text-gray-500">{company.industry} &middot; {company.companyEmail}</p>
            </div>
          </div>
          <Badge variant={company.approvedByAdmin ? 'success' : 'warning'}>
            {company.approvedByAdmin ? 'Approved' : 'Pending'}
          </Badge>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <p className="text-2xl font-black text-dark">{internships.length}</p>
          <p className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-wide">Total internships</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <p className="text-2xl font-black text-emerald-600">{activeCount}</p>
          <p className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-wide">Active</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <p className="text-2xl font-black text-dark">{internships.length - activeCount}</p>
          <p className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-wide">Closed</p>
        </div>
        <Link href="/company/settings" className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:border-primary/30 transition-colors">
          <p className="text-sm font-semibold text-primary flex items-center gap-2">
            <i className="fas fa-cog" />
            Settings
          </p>
          <p className="text-xs text-gray-400 mt-1">Manage company profile</p>
        </Link>
      </div>

      {/* Internships section */}
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-dark">Internships</h2>
            <Link href="/company/post-internship">
              <Button size="sm" leftIcon={<i className="fas fa-plus text-xs" />}>
                Post internship
              </Button>
            </Link>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-5 bg-gray-50 rounded-xl p-1 w-fit">
            <button
              onClick={() => setTab('active')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${tab === 'active' ? 'bg-white text-dark shadow-sm' : 'text-gray-500 hover:text-dark'}`}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => setTab('closed')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${tab === 'closed' ? 'bg-white text-dark shadow-sm' : 'text-gray-500 hover:text-dark'}`}
            >
              Closed ({internships.length - activeCount})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <i className="fas fa-briefcase text-3xl mb-3 block" />
            <p className="font-semibold">
              {tab === 'active' ? 'No active internships' : 'No closed internships'}
            </p>
            <p className="text-sm mt-1">Post your first internship to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((intern) => (
              <div key={intern._id} className="p-6 sm:p-8 hover:bg-gray-50/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-dark truncate">{intern.title}</h3>
                      <Badge variant={intern.closed ? 'neutral' : 'success'} size="sm">
                        {intern.closed ? 'Closed' : 'Active'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      <i className="fas fa-location-dot text-xs mr-1" />
                      {intern.location} &middot; {intern.workingTime}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/company/internships/${intern._id}/applications`}>
                      <Button variant="ghost" size="sm">
                        <i className="fas fa-users text-xs" />
                        Applicants
                      </Button>
                    </Link>
                    <Link href={`/company/internships/${intern._id}/edit`}>
                      <Button variant="ghost" size="sm">
                        <i className="fas fa-pen text-xs" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      loading={toggling === intern._id}
                      onClick={() => handleToggleStatus(intern)}
                    >
                      {intern.closed ? <i className="fas fa-play text-xs" /> : <i className="fas fa-stop text-xs" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      loading={deleting === intern._id}
                      onClick={() => handleDelete(intern._id)}
                      className="text-red-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <i className="fas fa-trash text-xs" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
