'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Pencil, Plus, Search, Send, Trash2, UserCheck, UserPlus, UserX, Users } from 'lucide-react';
import Sidebar from '@/components/tadrebk/Sidebar';
import TopBar from '@/components/tadrebk/TopBar';
import GlassFilter from '@/components/ui/GlassFilter';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useAppSelector } from '@/store/store';
import { roleService, type CompanyRole, type CreateRolePayload } from '@/features/company/services/role.service';
import { staffService, type StaffMember } from '@/features/company/services/staff.service';
import { permissionService, type PermissionEntry } from '@/features/company/services/permission.service';
import { useCompanyPermissions } from '@/features/company/hooks/use-company-permissions';
import { getErrorMessage } from '@/lib/axios';
import { toastHelper } from '@/lib/toast';

type Tab = 'members' | 'roles';

function initialsOf(firstName?: string, lastName?: string, email?: string): string {
  const n = `${firstName || ''} ${lastName || ''}`.trim();
  if (n) {
    return n
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
  return (email || '?').slice(0, 2).toUpperCase();
}

function displayName(m: StaffMember): string {
  return `${m.firstName || ''} ${m.lastName || ''}`.trim() || m.email;
}

export default function TeamScreen() {
  const company = useAppSelector((s) => s.company.currentCompany);
  const companyId = company?._id;
  const perms = useCompanyPermissions(companyId);

  const [tab, setTab] = useState<Tab>('members');
  const [members, setMembers] = useState<StaffMember[]>([]);
  const [roles, setRoles] = useState<CompanyRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [inviteOpen, setInviteOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<StaffMember | null>(null);
  const [removeTarget, setRemoveTarget] = useState<StaffMember | null>(null);
  const [roleModal, setRoleModal] = useState<{ open: boolean; role?: CompanyRole }>({ open: false });
  const [deleteRole, setDeleteRole] = useState<CompanyRole | null>(null);
  const [acting, setActing] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const [membersRes, rolesRes] = await Promise.all([
        staffService.listStaff(companyId, 'all').catch(() => [] as StaffMember[]),
        roleService.listRoles(companyId).catch(() => [] as CompanyRole[]),
      ]);
      setMembers(membersRes);
      setRoles(rolesRes);
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    const t = setTimeout(fetchAll, 0);
    return () => clearTimeout(t);
  }, [fetchAll]);

  const activeMembers = useMemo(() => members.filter((m) => m.status !== 'removed'), [members]);
  const removedMembers = useMemo(() => members.filter((m) => m.status === 'removed'), [members]);
  const visibleMembers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) =>
      `${m.firstName} ${m.lastName} ${m.email} ${m.roleName || ''}`.toLowerCase().includes(q),
    );
  }, [members, search]);

  const canInvite = perms.can('staff.invite');
  const canManageMembers = perms.canAny(['staff.update', 'staff.remove', 'staff.resend_invite']);
  const canManageRoles = perms.canAny(['roles.create', 'roles.update', 'roles.delete']);

  const handleRemove = async () => {
    if (!companyId || !removeTarget) return;
    setActing(true);
    try {
      await staffService.removeStaff(companyId, removeTarget._id);
      toastHelper.success('Access revoked');
      setRemoveTarget(null);
      fetchAll();
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setActing(false);
    }
  };

  const handleResend = async (m: StaffMember) => {
    if (!companyId) return;
    try {
      await staffService.resendInvite(companyId, m._id);
      toastHelper.success('Invite resent');
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    }
  };

  const handleDeleteRole = async () => {
    if (!companyId || !deleteRole) return;
    setActing(true);
    try {
      await roleService.deleteRole(companyId, deleteRole._id);
      toastHelper.success('Role deleted');
      setDeleteRole(null);
      fetchAll();
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setActing(false);
    }
  };

  if (!companyId) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar active="Team" />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <TopBar title="Team" />
          <main className="mx-auto w-full max-w-2xl px-4 py-16 text-center">
            <p className="font-semibold text-slate-900">No company selected</p>
            <p className="mt-1 text-sm text-slate-400">Sign in with a company account to manage your team.</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar active="Team" />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar title="Team" />
        <main className="flex-1 space-y-6 px-[2.5%] py-4 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">Team Management</h2>
              <p className="text-sm text-slate-500">Invite staff, assign roles and control permissions.</p>
            </div>
            {tab === 'members' && canInvite && (
              <button
                onClick={() => setInviteOpen(true)}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
              >
                <UserPlus size={16} /> Invite Staff
              </button>
            )}
            {tab === 'roles' && canManageRoles && (
              <button
                onClick={() => setRoleModal({ open: true })}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
              >
                <Plus size={16} /> New Role
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
            {[
              { label: 'Total Staff', value: members.length, icon: Users, tint: 'bg-blue-50 text-blue-600' },
              { label: 'Active', value: activeMembers.length, icon: UserCheck, tint: 'bg-emerald-50 text-emerald-600' },
              { label: 'Removed', value: removedMembers.length, icon: UserX, tint: 'bg-slate-100 text-slate-500' },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-3.5 text-center sm:p-5">
                <div className="flex justify-center">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-lg sm:h-9 sm:w-9 ${s.tint}`}>
                    <s.icon size={17} />
                  </span>
                </div>
                <p className="mt-2.5 text-xl font-semibold text-slate-900 sm:mt-3 sm:text-2xl">{loading ? '—' : s.value}</p>
                <p className="truncate text-xs text-slate-500 sm:text-sm">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="w-fit max-w-full">
            <GlassFilter
              options={[
                { key: 'members', label: 'Members' },
                { key: 'roles', label: `Roles${roles.length > 0 ? ` (${roles.length})` : ''}` },
              ]}
              value={tab}
              onChange={(key) => setTab(key as Tab)}
              ariaLabel="Team sections"
            />
          </div>

          {tab === 'members' ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
              <div className="relative mb-4">
                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, email or role..."
                  aria-label="Search team members"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 sm:max-w-xs"
                />
              </div>
              {loading ? (
                <div className="space-y-2 animate-pulse">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                      <div className="h-10 w-10 shrink-0 rounded-full bg-slate-100" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-1/3 rounded-full bg-slate-100" />
                        <div className="h-3 w-1/4 rounded-full bg-slate-100" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : visibleMembers.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="font-semibold text-slate-900">No team members yet</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {search ? 'No one matches your search.' : 'Invite your first staff member to get started.'}
                  </p>
                  {!search && canInvite && (
                    <button
                      onClick={() => setInviteOpen(true)}
                      className="mt-4 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-600"
                    >
                      Invite Staff
                    </button>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {visibleMembers.map((m) => {
                    const removed = m.status === 'removed';
                    return (
                      <div key={m._id} className="flex flex-wrap items-center gap-3 py-3.5">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold text-white">
                          {initialsOf(m.firstName, m.lastName, m.email)}
                        </span>
                        <span className="min-w-0 flex-1 basis-40">
                          <span className="block truncate text-sm font-semibold text-slate-900">
                            {displayName(m)}
                          </span>
                          <span className="block truncate text-xs text-slate-400">{m.email}</span>
                        </span>
                        {m.roleName && (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                            {m.roleName}
                          </span>
                        )}
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                            removed ? 'bg-slate-100 text-slate-400' : 'bg-emerald-50 text-emerald-600'
                          }`}
                        >
                          {removed ? 'Removed' : 'Active'}
                        </span>
                        {canManageMembers && !removed && (
                          <span className="ml-auto flex shrink-0 items-center gap-1">
                            <button
                              onClick={() => setRenameTarget(m)}
                              aria-label={`Rename ${displayName(m)}`}
                              title="Rename"
                              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => handleResend(m)}
                              aria-label={`Resend invite to ${displayName(m)}`}
                              title="Resend invite"
                              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            >
                              <Send size={15} />
                            </button>
                            <button
                              onClick={() => setRemoveTarget(m)}
                              aria-label={`Remove ${displayName(m)}`}
                              title="Remove"
                              className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-500"
                            >
                              <Trash2 size={15} />
                            </button>
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          ) : (
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {loading ? (
                [0, 1, 2].map((i) => (
                  <div key={i} className="h-44 animate-pulse rounded-2xl bg-slate-100" />
                ))
              ) : roles.length === 0 ? (
                <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-10 text-center">
                  <p className="font-semibold text-slate-900">No roles yet</p>
                  <p className="mt-1 text-sm text-slate-400">Create a custom role to get started.</p>
                </div>
              ) : (
                roles.map((r) => (
                  <div key={r._id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold text-slate-900">{r.name}</h3>
                        {r.description && (
                          <p className="mt-0.5 line-clamp-2 break-words text-xs text-slate-400">{r.description}</p>
                        )}
                      </div>
                      {r.isSystem && (
                        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                          Built-in
                        </span>
                      )}
                    </div>
                    <p className="mt-3 text-xs text-slate-400">
                      <span className="font-bold text-slate-900">{r.permissions.length}</span> permissions
                    </p>
                    <div className="mt-2 flex max-h-24 flex-wrap gap-1 overflow-hidden">
                      {r.permissions.slice(0, 6).map((p) => (
                        <span key={p} className="rounded-full bg-emerald-50 px-2 py-0.5 font-mono text-[10px] text-emerald-700">
                          {p}
                        </span>
                      ))}
                      {r.permissions.length > 6 && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">
                          +{r.permissions.length - 6} more
                        </span>
                      )}
                    </div>
                    {canManageRoles && (!r.isSystem || !r.isOwnerRole) && (
                      <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">
                        <button
                          onClick={() => setRoleModal({ open: true, role: r })}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                        >
                          <Pencil size={13} /> Edit
                        </button>
                        {!r.isSystem && (
                          <button
                            onClick={() => setDeleteRole(r)}
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-rose-200 px-3 py-2 text-xs font-medium text-rose-500 hover:bg-rose-50"
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </section>
          )}
        </main>
      </div>

      {inviteOpen && companyId && (
        <InviteStaffModal
          companyId={companyId}
          roles={roles}
          onClose={() => setInviteOpen(false)}
          onDone={() => {
            setInviteOpen(false);
            fetchAll();
          }}
        />
      )}
      {renameTarget && companyId && (
        <RenameStaffModal
          companyId={companyId}
          member={renameTarget}
          onClose={() => setRenameTarget(null)}
          onDone={() => {
            setRenameTarget(null);
            fetchAll();
          }}
        />
      )}
      {roleModal.open && companyId && (
        <RoleModal
          companyId={companyId}
          role={roleModal.role}
          onClose={() => setRoleModal({ open: false })}
          onDone={() => {
            setRoleModal({ open: false });
            fetchAll();
          }}
        />
      )}
      <ConfirmModal
        open={removeTarget !== null}
        title="Remove staff member?"
        message={`${removeTarget ? displayName(removeTarget) : ''} will lose access immediately. This can be undone by inviting them again.`}
        confirmLabel="Remove"
        loading={acting}
        onConfirm={handleRemove}
        onCancel={() => setRemoveTarget(null)}
      />
      <ConfirmModal
        open={deleteRole !== null}
        title="Delete role?"
        message={`${deleteRole?.name} will be removed. Roles in use by active staff cannot be deleted.`}
        confirmLabel="Delete"
        loading={acting}
        onConfirm={handleDeleteRole}
        onCancel={() => setDeleteRole(null)}
      />
    </div>
  );
}

function InviteStaffModal({
  companyId,
  roles,
  onClose,
  onDone,
}: {
  companyId: string;
  roles: CompanyRole[];
  onClose: () => void;
  onDone: () => void;
}) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [roleId, setRoleId] = useState(roles.find((r) => r.name === 'Instructor')?._id ?? roles[0]?._id ?? '');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const selectedRole = roles.find((r) => r._id === roleId);

  const handleSend = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setError('First and last name are required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }
    if (!roleId) {
      setError('Choose a role for this staff member.');
      return;
    }
    setError('');
    setSending(true);
    try {
      await staffService.inviteStaff(companyId, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        roleId,
        note: note.trim() || undefined,
      });
      toastHelper.success('Invite sent! They will confirm by email, then set a password.');
      onDone();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center" role="dialog" aria-modal="true" aria-label="Invite staff member">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-slate-50/80 px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">Invite Staff Member</p>
            <p className="text-xs text-slate-400">They confirm by email, then set a password.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <span aria-hidden="true">✕</span>
          </button>
        </div>
        <div className="space-y-4 p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="invite-first" className="text-xs font-semibold uppercase tracking-wide text-slate-400">First name</label>
              <input
                id="invite-first"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Layla"
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>
            <div>
              <label htmlFor="invite-last" className="text-xs font-semibold uppercase tracking-wide text-slate-400">Last name</label>
              <input
                id="invite-last"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Hassan"
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>
          </div>
          <div>
            <label htmlFor="invite-email" className="text-xs font-semibold uppercase tracking-wide text-slate-400">Login email</label>
            <input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="layla@example.com"
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
          <div>
            <label htmlFor="invite-role" className="text-xs font-semibold uppercase tracking-wide text-slate-400">Role</label>
            <Select
              id="invite-role"
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              options={roles.map((r) => ({ value: r._id, label: `${r.name} (${r.permissions.length})` }))}
              placeholder="Select a role"
              className="mt-2"
            />
            {selectedRole && (
              <p className="mt-1.5 text-xs text-slate-400">
                {selectedRole.permissions.length} permissions
                {selectedRole.description ? ` · ${selectedRole.description}` : ''}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="invite-note" className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Note <span className="font-normal normal-case text-slate-300">(optional)</span>
            </label>
            <textarea
              id="invite-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Welcome to the team…"
              className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
          {error && <p className="text-xs font-medium text-rose-500">{error}</p>}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={sending}
              className="rounded-xl bg-emerald-500 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
            >
              {sending ? 'Sending…' : 'Send Invite'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RenameStaffModal({
  companyId,
  member,
  onClose,
  onDone,
}: {
  companyId: string;
  member: StaffMember;
  onClose: () => void;
  onDone: () => void;
}) {
  const [firstName, setFirstName] = useState(member.firstName || '');
  const [lastName, setLastName] = useState(member.lastName || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setError('First and last name are required.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await staffService.renameStaff(companyId, member._id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      toastHelper.success('Name updated');
      onDone();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center" role="dialog" aria-modal="true" aria-label="Rename staff member">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-slate-50/80 px-5 py-4">
          <p className="text-sm font-semibold text-slate-900">Rename {displayName(member)}</p>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <span aria-hidden="true">✕</span>
          </button>
        </div>
        <div className="space-y-4 p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="rename-first" className="text-xs font-semibold uppercase tracking-wide text-slate-400">First name</label>
              <input
                id="rename-first"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>
            <div>
              <label htmlFor="rename-last" className="text-xs font-semibold uppercase tracking-wide text-slate-400">Last name</label>
              <input
                id="rename-last"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>
          </div>
          {error && <p className="text-xs font-medium text-rose-500">{error}</p>}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl bg-emerald-500 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RoleModal({
  companyId,
  role,
  onClose,
  onDone,
}: {
  companyId: string;
  role?: CompanyRole;
  onClose: () => void;
  onDone: () => void;
}) {
  const isNew = !role;
  const nameLocked = !!role?.isSystem;
  const [name, setName] = useState(role?.name ?? '');
  const [description, setDescription] = useState(role?.description ?? '');
  const [checked, setChecked] = useState<string[]>(role?.permissions ?? []);
  const [registry, setRegistry] = useState<PermissionEntry[]>([]);
  const [loadingRegistry, setLoadingRegistry] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    permissionService
      .listPermissions()
      .then(setRegistry)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoadingRegistry(false));
  }, []);

  const groups = useMemo(() => {
    const map = new Map<string, PermissionEntry[]>();
    registry.forEach((p) => {
      const list = map.get(p.group) ?? [];
      list.push(p);
      map.set(p.group, list);
    });
    return Array.from(map.entries());
  }, [registry]);

  const toggle = (key: string) => {
    setChecked((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Role name is required.');
      return;
    }
    if (checked.length === 0) {
      setError('Pick at least one permission.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      const payload: CreateRolePayload = {
        name: name.trim(),
        description: description.trim() || undefined,
        permissions: checked,
      };
      if (isNew) {
        await roleService.createRole(companyId, payload);
        toastHelper.success('Role created');
      } else if (role) {
        await roleService.updateRole(companyId, role._id, { ...payload, name: nameLocked ? undefined : payload.name });
        toastHelper.success('Role updated');
      }
      onDone();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center" role="dialog" aria-modal="true" aria-label={isNew ? 'Create role' : `Edit ${role?.name}`}>
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-slate-50/80 px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">{isNew ? 'Create Custom Role' : `Edit ${role?.name}`}</p>
            <p className="text-xs text-slate-400">
              {isNew ? 'Pick permissions from the registry.' : role?.isSystem ? 'Built-in role — name is locked.' : 'Pick permissions from the registry.'}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <span aria-hidden="true">✕</span>
          </button>
        </div>
        <div className="space-y-4 p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="role-name" className="text-xs font-semibold uppercase tracking-wide text-slate-400">Name</label>
              <input
                id="role-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={nameLocked}
                placeholder="Marketing Lead"
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>
            <div>
              <label htmlFor="role-desc" className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Description <span className="font-normal normal-case text-slate-300">(optional)</span>
              </label>
              <input
                id="role-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this role for?"
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Permissions <span className="ml-1 rounded-full bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700">{checked.length} selected</span>
            </p>
            {loadingRegistry ? (
              <div className="mt-2 space-y-2 animate-pulse">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-14 rounded-xl bg-slate-100" />
                ))}
              </div>
            ) : registry.length === 0 ? (
              <p className="mt-2 rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-400">
                Couldn&apos;t load the permission registry.
              </p>
            ) : (
              <div className="mt-2 max-h-72 space-y-4 overflow-y-auto rounded-xl border border-slate-200 p-3">
                {groups.map(([group, perms]) => (
                  <div key={group}>
                    <div className="mb-1 flex items-center justify-between px-1">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{group}</p>
                      <button
                        type="button"
                        onClick={() => {
                          const keys = perms.map((p) => p.key);
                          const allOn = keys.every((k) => checked.includes(k));
                          setChecked((prev) => (allOn ? prev.filter((k) => !keys.includes(k)) : [...new Set([...prev, ...keys])]));
                        }}
                        className="text-[11px] font-semibold text-emerald-600 hover:underline"
                      >
                        {perms.every((p) => checked.includes(p.key)) ? 'Clear group' : 'Select group'}
                      </button>
                    </div>
                    <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-100">
                      {perms.map((p) => {
                        const on = checked.includes(p.key);
                        return (
                          <button
                            key={p.key}
                            type="button"
                            role="checkbox"
                            aria-checked={on}
                            aria-label={p.label}
                            onClick={() => toggle(p.key)}
                            className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${on ? 'bg-emerald-50/60' : 'hover:bg-slate-50'}`}
                          >
                            <span
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                                on ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 bg-white'
                              }`}
                            >
                              {on && (
                                <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={3.5}>
                                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-medium text-slate-800">{p.label}</span>
                              <span className="block font-mono text-[10px] text-slate-400">{p.key}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {error && <p className="text-xs font-medium text-rose-500">{error}</p>}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || loadingRegistry}
              className="rounded-xl bg-emerald-500 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
            >
              {saving ? 'Saving…' : isNew ? 'Create Role' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
