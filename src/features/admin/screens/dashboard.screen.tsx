'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAppSelector } from '@/store/store';
import { adminService } from '@/features/admin/services/admin.service';
import { Company, getCompanyImgUrl } from '@/features/company/types';
import MediaImage from '@/components/ui/MediaImage';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import ConfirmModal from '@/components/ui/ConfirmModal';
import GlassFilter from '@/components/ui/GlassFilter';
import Link from 'next/link';
import { getErrorMessage } from '@/lib/axios';
import { toastHelper } from '@/lib/toast';

type Tab = 'pending' | 'approved' | 'all';

export default function AdminDashboardScreen() {
  const user = useAppSelector((s) => s.user.currentUser);
  const role = useAppSelector((s) => s.auth.role);

  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [tab, setTab] = useState<Tab>('pending');
  const [actionId, setActionId] = useState<string | null>(null);
  const [banTarget, setBanTarget] = useState<Company | null>(null);

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      let result: { companies: Company[]; pagination: { pages: number } };
      if (tab === 'pending') {
        result = await adminService.getPendingCompanies(page, 20);
      } else if (tab === 'approved') {
        result = await adminService.getAllCompanies(page, 50, true);
      } else {
        // All tab: get approved + pending, prefer the pending source so a
        // genuinely-pending company is never relabeled "Approved".
        const [approved, pending] = await Promise.all([
          adminService.getAllCompanies(1, 200, true),
          adminService.getPendingCompanies(1, 200),
        ]);
        const merged = new Map<string, Company>();
        for (const c of approved.companies) merged.set(c._id, c);
        for (const c of pending.companies) merged.set(c._id, c);
        result = { companies: Array.from(merged.values()), pagination: { pages: 1 } };
      }
      setCompanies(result.companies);
      setTotalPages(result.pagination.pages);
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [tab, page]);

  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);
  useEffect(() => { setPage(1); }, [tab]);

  async function handleApprove(companyId: string) {
    setActionId(companyId);
    try {
      await adminService.approveCompany(companyId);
      toastHelper.success('Company approved');
      fetchCompanies();
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setActionId(null);
    }
  }

  async function handleBan(companyId: string) {
    setActionId(companyId);
    try {
      await adminService.banCompany(companyId);
      toastHelper.success('Company banned');
      fetchCompanies();
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setActionId(null);
    }
  }

  async function handleUnban(companyId: string) {
    setActionId(companyId);
    try {
      await adminService.unbanCompany(companyId);
      toastHelper.success('Company unbanned');
      fetchCompanies();
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setActionId(null);
    }
  }

  if (role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-500 mb-4">You do not have admin access.</p>
        <Link href="/"><Button>Go Home</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white font-bold">
            <i className="fas fa-shield-halved" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-500 text-sm">Manage companies, approvals, and bans</p>
          </div>
        </div>
      </div>

{/* Tabs */}
<div className="mb-6 w-fit">
<GlassFilter
options={[
{ key: 'pending', label: 'Pending' },
{ key: 'approved', label: 'Approved' },
{ key: 'all', label: 'All' },
]}
value={tab}
onChange={(key) => setTab(key as Tab)}
ariaLabel="Filter companies"
/>
</div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4">
              <div className="h-12 w-12 shrink-0 rounded-2xl bg-slate-100" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/2 rounded-full bg-slate-100" />
                <div className="h-3 w-1/3 rounded-full bg-slate-100" />
              </div>
              <div className="h-8 w-20 shrink-0 rounded-lg bg-slate-100" />
            </div>
          ))}
        </div>
      ) : companies.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm text-center py-16 text-slate-400">
          <i className="fas fa-building text-3xl mb-3 block" />
          <p className="font-semibold">No companies found</p>
          <p className="text-sm mt-1">{tab === 'pending' ? 'No pending approvals.' : 'No companies match this filter.'}</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {companies.map((company) => (
              <div key={company._id} className="p-6 sm:p-8 hover:bg-slate-50/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <MediaImage
                      src={getCompanyImgUrl(company.logo)}
                      alt={company.name}
                      boxClassName="w-12 h-12 rounded-xl shrink-0 overflow-hidden"
                      imgClassName="w-full h-full object-cover"
                      iconClassName="fas fa-building text-lg text-slate-300"
                    />
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 truncate">{company.name}</h3>
                      <p className="text-sm text-slate-500 truncate">
                        {company.industry && <span className="mr-3">{company.industry}</span>}
                        {company.companyEmail && <span>{company.companyEmail}</span>}
                      </p>
                      {(() => {
                        const legal = company.legalAttachment;
                        const url =
                          typeof legal === 'string'
                            ? legal
                            : legal && typeof legal.secure_url === 'string'
                              ? legal.secure_url
                              : null;
                        return url ? (
                          <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:underline"
                          >
                            <i className="fas fa-file-contract" /> View legal document
                          </a>
                        ) : null;
                      })()}
                      {company.createdAt && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          Created {new Date(company.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'short', day: 'numeric',
                          })}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {company.bannedAt ? (
                      <Badge variant="danger">Banned</Badge>
                    ) : company.approvedByAdmin ? (
                      <Badge variant="success">Approved</Badge>
                    ) : (
                      <Badge variant="warning">Pending</Badge>
                    )}

                    {/* Pending tab: Approve + Ban */}
                    {tab === 'pending' && !company.approvedByAdmin && !company.bannedAt && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          loading={actionId === company._id}
                          onClick={() => handleApprove(company._id)}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setBanTarget(company)}
                          className="border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300"
                        >
                          Ban
                        </Button>
                      </>
                    )}

                    {/* Approved tab: Ban only */}
                    {tab === 'approved' && company.approvedByAdmin && !company.bannedAt && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setBanTarget(company)}
                        className="border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300"
                      >
                        Ban
                      </Button>
                    )}

                    {/* All tab: no buttons, just state badge */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      <ConfirmModal
        open={!!banTarget}
        title="Ban Company"
        message={`Are you sure you want to ban "${banTarget?.name}"? This action can be reversed later.`}
        confirmLabel="Ban"
        confirmVariant="danger"
        loading={actionId === banTarget?._id}
        onConfirm={() => {
          if (banTarget) handleBan(banTarget._id);
          setBanTarget(null);
        }}
        onCancel={() => setBanTarget(null)}
      />
    </div>
  );
}

