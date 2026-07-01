'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import * as authService from '@/features/auth/server/auth.service';
import { getErrorMessage } from '@/lib/axios';
import { useAppDispatch } from '@/store/store';
import { setTokens } from '@/store/authSlice';
import { setUser } from '@/store/userSlice';
import { setCompany } from '@/store/companySlice';
import { companyService } from '@/services/company.service';
import { userService } from '@/services/user.service';

function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) =>
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''));
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export function useGoogleAuth() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const initialized = useRef(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (initialized.current || !GOOGLE_CLIENT_ID) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => {
      toast.error('Failed to load Google Identity Services. Please refresh and try again.');
    };
    document.body.appendChild(script);

    initialized.current = true;

    return () => {};
  }, []);

  const handleGoogleCredential = useCallback(
    async (response: { credential: string }) => {
      try {
        const { tokens } = await authService.googleAuth({ idToken: response.credential });

        const decoded = parseJwt(tokens.accessToken);
        const userId: string = decoded?.id;

        const user = await userService.getUserProfile(userId);

        if (decoded?.role === 'admin' || (user as any).role === 'admin') {
          dispatch(setTokens({ tokens, userId, role: 'admin' }));
          dispatch(setUser(user));
          toast.success(`Welcome, ${user.firstName}!`);
          router.push('/admin/dashboard');
          return;
        }

        const { companies } = await companyService.listCompanies({ limit: 50 });

        let role: 'student' | 'company' = 'student';
        const owned = companies.find((c) => {
          const createdBy =
            typeof c.createdBy === 'object' && c.createdBy !== null
              ? (c.createdBy as { _id: string })._id
              : (c.createdBy as string);
          return createdBy === userId;
        });
        if (owned) {
          role = 'company';
          dispatch(setCompany(owned));
        }

        dispatch(setTokens({ tokens, userId, role }));
        dispatch(setUser(user));

        toast.success(`Welcome, ${user.firstName}!`);

        if (role === 'company') {
          router.push('/company/dashboard');
        } else {
          router.push('/dashboard');
        }
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    },
    [dispatch, router],
  );

  const signInWithGoogle = useCallback(() => {
    if (!GOOGLE_CLIENT_ID) {
      toast.error('Google sign-in is not configured. Ask the dev team to add NEXT_PUBLIC_GOOGLE_CLIENT_ID.');
      return;
    }

    if (!scriptLoaded) {
      toast.info('Google services are still loading. Please wait a moment and try again.');
      return;
    }

    const google = (window as any).google;
    if (!google?.accounts?.id) {
      toast.error('Google Identity Services failed to load. Please refresh and try again.');
      return;
    }

    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCredential,
      cancel_on_tap_outside: false,
    });

    google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed()) {
        toast.warning('Google One Tap did not appear. Check that the OAuth consent screen is configured in Google Cloud Console (APIs & Services > OAuth consent screen). If it is, try using a different browser or disabling third-party cookie blockers.');
      }
    });
  }, [handleGoogleCredential, scriptLoaded]);

  return { signInWithGoogle, enabled: !!GOOGLE_CLIENT_ID, scriptLoaded };
}
