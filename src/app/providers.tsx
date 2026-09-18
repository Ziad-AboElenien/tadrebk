'use client';

import { Provider } from 'react-redux';
import { store } from '@/store/store';
import { useAppSelector } from '@/store/store';
import AppNotificationsProvider from '@/components/ui/AppNotifications';
import dynamic from 'next/dynamic';
import SessionLoader from '@/components/shared/SessionLoader';

const FontAwesomeLoader = dynamic(() => import('@/components/shared/FontAwesomeLoader'), { ssr: false });
const NotificationPoller = dynamic(() => import('@/features/notifications/components/NotificationPoller'));
const OnboardingGate = dynamic(() => import('@/components/shared/OnboardingGate'));

function AuthGatedServices({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  return (
    <>
      <SessionLoader>{children}</SessionLoader>
      {isAuthenticated && <NotificationPoller />}
      {isAuthenticated && <OnboardingGate />}
    </>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AppNotificationsProvider>
        <FontAwesomeLoader />
        <AuthGatedServices>{children}</AuthGatedServices>
      </AppNotificationsProvider>
    </Provider>
  );
}
