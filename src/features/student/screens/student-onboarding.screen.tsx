'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { setUser } from '@/store/userSlice';
import { userService } from '@/features/student/services/user.service';
import { toastHelper } from '@/lib/toast';
import type { Category } from '@/features/student/types';
import Step1Tracks from '@/features/student/components/onboarding/Step1Tracks';
import Step2Preferences from '@/features/student/components/onboarding/Step2Preferences';
import Step3Recommendations from '@/features/student/components/onboarding/Step3Recommendations';

const STEPS = [
  { n: 1, label: 'Interests', icon: 'fa-layer-group' },
  { n: 2, label: 'Preferences', icon: 'fa-sliders' },
  { n: 3, label: 'Matches', icon: 'fa-sparkles' },
];

export default function StudentOnboardingScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const userId = useAppSelector((s) => s.auth.userId);
  const role = useAppSelector((s) => s.auth.role);
  const currentUser = useAppSelector((s) => s.user.currentUser);

  // Company accounts never belong here — bounce them to their own track.
  useEffect(() => {
    if (role === 'company') router.replace('/company/admin');
  }, [role, router]);

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [selectedTracks, setSelectedTracks] = useState<Category[]>([]);
  const [preferences, setPreferences] = useState<{
    location?: 'on-site' | 'remote' | 'hybrid';
    type?: 'full-time' | 'part-time';
  }>({});
  const [saving, setSaving] = useState(false);

  const goNext = useCallback(() => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, 3));
  }, []);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  }, []);

  const handleFinish = useCallback(async () => {
    if (!userId) return;
    setSaving(true);
    try {
      await userService.updateProfile(userId, {
        categories: selectedTracks,
      });
      const fresh = await userService.getUserProfile(userId);
      dispatch(setUser(fresh));
      toastHelper.success('Profile updated! Welcome to Tadrebk.');
      router.replace('/guide/student?welcome=1');
    } catch {
      toastHelper.error('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [userId, selectedTracks, dispatch, router]);

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 120 : -120,
      opacity: 0,
      scale: 0.98,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -120 : 120,
      opacity: 0,
      scale: 0.98,
    }),
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#f4faf7]">
      {/* Backdrop decor */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-teal-200/40 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-cyan-100/30 blur-3xl" />
      </div>

      {/* Top bar */}
      <div className="relative mx-auto w-full max-w-2xl px-4 pb-2 pt-8 sm:pt-10">
        <div className="flex items-center justify-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200">
            <i className="fas fa-graduation-cap text-sm" />
          </span>
          <span className="text-lg font-black tracking-tight text-slate-900">Tadrebk</span>
        </div>
        <p className="mt-2 text-center text-sm text-slate-500">
          Let&apos;s set up your profile in <span className="font-bold text-slate-700">3 quick steps</span>
        </p>

        {/* Stepper */}
        <div className="mt-6">
          <div className="flex items-start">
            {STEPS.map((s, i) => {
              const done = s.n < step;
              const current = s.n === step;
              return (
                <div key={s.n} className={`flex ${i < STEPS.length - 1 ? 'flex-1' : ''}`}>
                  <div className="flex flex-col items-center">
                    <motion.div
                      animate={current ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                      transition={{ duration: 0.4 }}
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl text-sm transition-all duration-300 ${
                        done
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                          : current
                            ? 'bg-white text-emerald-600 shadow-[inset_0_0_0_2px_#10b981,0_8px_20px_-8px_rgba(16,185,129,0.6)]'
                            : 'bg-white text-slate-300 shadow-[inset_0_0_0_2px_#e8eef4]'
                      }`}
                    >
                      {done ? <i className="fas fa-check text-xs" /> : <i className={`fas ${s.icon}`} />}
                    </motion.div>
                    <span
                      className={`mt-1.5 text-[10px] font-bold uppercase tracking-wider ${
                        current ? 'text-emerald-600' : done ? 'text-slate-500' : 'text-slate-300'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="relative mx-2 mt-[22px] h-0.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                      <motion.div
                        className="absolute inset-0 origin-left rounded-full bg-emerald-500"
                        initial={false}
                        animate={{ scaleX: s.n < step ? 1 : 0 }}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="relative mx-auto flex w-full max-w-2xl flex-1 items-stretch px-4 pb-8 pt-4 sm:pb-10">
        <div className="relative max-h-[640px] min-h-[540px] w-full">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 320, damping: 32 },
                opacity: { duration: 0.25 },
                scale: { duration: 0.25 },
              }}
              className="absolute inset-0"
            >
              {step === 1 && (
                <Step1Tracks
                  selected={selectedTracks}
                  onToggle={(cat) =>
                    setSelectedTracks((prev) =>
                      prev.includes(cat)
                        ? prev.filter((c) => c !== cat)
                        : [...prev, cat]
                    )
                  }
                  onNext={goNext}
                />
              )}
              {step === 2 && (
                <Step2Preferences
                  preferences={preferences}
                  onChange={setPreferences}
                  onNext={goNext}
                  onBack={goPrev}
                />
              )}
              {step === 3 && (
                <Step3Recommendations
                  selectedTracks={selectedTracks}
                  onBack={goPrev}
                  onFinish={handleFinish}
                  saving={saving}
                  userName={currentUser?.firstName || 'there'}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
