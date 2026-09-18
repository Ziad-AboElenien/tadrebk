'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { KeyRound, Mail, ShieldAlert, UserCog } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { logout } from '@/store/authSlice';
import { clearUser } from '@/store/userSlice';
import { clearCompany } from '@/store/companySlice';
import * as authService from '@/features/auth/server/auth.service';
import { userService } from '@/features/student/services/user.service';
import { getErrorMessage } from '@/lib/axios';
import { toastHelper } from '@/lib/toast';
import Button from '@/components/ui/Button';
import ConfirmModal from '@/components/ui/ConfirmModal';
import ChangePasswordForm from '@/features/auth/components/ChangePasswordForm';
import ChangeEmailForm from '@/features/auth/components/ChangeEmailForm';
import SettingsShell from '@/features/profiles/components/SettingsShell';
import StudentEditProfile from '@/features/profiles/components/StudentEditProfile';

const TABS = [
  { key: 'edit-profile', label: 'Edit Profile', desc: 'Photos, info, skills & more', icon: UserCog },
  { key: 'password', label: 'Change Password', desc: 'Update your password', icon: KeyRound },
  { key: 'email', label: 'Change Email', desc: 'Update your email address', icon: Mail },
  { key: 'account', label: 'Account', desc: 'Danger zone', icon: ShieldAlert },
];

function AccountPanel() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const userId = useAppSelector((s) => s.auth.userId);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!userId) return;
    setDeleting(true);
    try {
      await userService.deleteAccount(userId);
      await authService.logout();
      dispatch(logout());
      dispatch(clearUser());
      dispatch(clearCompany());
      document.cookie = 'tadrebk_access_token=; Max-Age=0; path=/';
      document.cookie = 'tadrebk_user_role=; Max-Age=0; path=/';
      toastHelper.success('Account deleted');
      router.push('/');
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <div>
      <h3 className="font-bold text-slate-900">Danger zone</h3>
      <p className="mb-4 mt-1 text-sm text-slate-400">Irreversible actions for your account.</p>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50/50 px-4 py-4">
        <div>
          <p className="text-sm font-bold text-slate-900">Delete account</p>
          <p className="text-xs text-slate-500">Removes your profile, applications and all data.</p>
        </div>
        <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>
          Delete account
        </Button>
      </div>
      <ConfirmModal
        open={confirmDelete}
        title="Delete your account?"
        message="This cannot be undone. All your data will be permanently removed."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

export default function StudentSettingsScreen() {
  const searchParams = useSearchParams();
  const user = useAppSelector((s) => s.user.currentUser);
  const tab = searchParams.get('tab');

  return (
    <SettingsShell
      title="Settings"
      subtitle="Manage your profile, security and account."
      basePath="/settings"
      activeTab={tab}
      items={TABS}
    >
      {tab === 'password' && (
        <div className="mx-auto max-w-lg">
          <h3 className="mb-1 font-bold text-slate-900">Change password</h3>
          <p className="mb-5 text-sm text-slate-400">Pick a strong, unique password.</p>
          <ChangePasswordForm />
        </div>
      )}
      {tab === 'email' && (
        <div className="mx-auto max-w-lg">
          <h3 className="mb-1 font-bold text-slate-900">Change email</h3>
          <p className="mb-5 text-sm text-slate-400">We&apos;ll send a code to verify the new address.</p>
          <ChangeEmailForm />
        </div>
      )}
      {tab === 'account' && <AccountPanel />}
      {tab !== 'password' && tab !== 'email' && tab !== 'account' && (
        <>
          {user ? (
            <StudentEditProfile key={user._id} user={user} />
          ) : (
            <p className="py-10 text-center text-sm text-slate-400">Sign in to edit your profile.</p>
          )}
        </>
      )}
    </SettingsShell>
  );
}
