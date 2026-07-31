'use client';

import { Provider } from 'react-redux';
import { store } from '@/store/store';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SessionLoader from '@/components/shared/SessionLoader';
import NotificationPoller from '@/features/notifications/components/NotificationPoller';
import OnboardingGate from '@/components/shared/OnboardingGate';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <SessionLoader>{children}</SessionLoader>
      <NotificationPoller />
      <OnboardingGate />
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="light"
        toastClassName="!rounded-2xl !shadow-xl !font-medium !border !border-gray-100 !bg-white"
        progressClassName="!bg-emerald-500"
      />
    </Provider>
  );
}
