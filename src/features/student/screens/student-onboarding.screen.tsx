'use client';

import { useState, useCallback } from 'react';
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

const STEPS = [1, 2, 3];

export default function StudentOnboardingScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const userId = useAppSelector((s) => s.auth.userId);
  const currentUser = useAppSelector((s) => s.user.currentUser);

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
      router.replace('/dashboard');
    } catch {
      toastHelper.error('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [userId, selectedTracks, dispatch, router]);

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.96,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -300 : 300,
      opacity: 0,
      scale: 0.96,
    }),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex flex-col">
      {/* Top Progress */}
      <div className="w-full max-w-xl mx-auto px-6 pt-10 pb-4">
        <div className="flex items-center justify-between mb-2">
          {STEPS.map((s) => (
            <div key={s} className="flex items-center gap-2">
              <motion.div
                className={`flex items-center justify-center rounded-full text-xs font-bold transition-colors duration-500 ${
                  s <= step
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                    : 'bg-gray-200 text-gray-400'
                }`}
                animate={{
                  width: s === step ? 40 : 32,
                  height: s === step ? 40 : 32,
                  scale: s === step ? 1.1 : 1,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                {s < step ? (
                  <i className="fas fa-check text-[11px]" />
                ) : (
                  s
                )}
              </motion.div>
              {s < 3 && (
                <div className="w-12 sm:w-20 h-1 rounded-full bg-gray-200 overflow-hidden">
                  <motion.div
                    className="h-full bg-emerald-500 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{
                      width: s < step ? '100%' : s === step ? '50%' : '0%',
                    }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-gray-400 font-medium">
          Step {step} of 3
        </p>
      </div>

      {/* Step Content */}
      <div className="flex-1 flex items-center justify-center px-4 pb-10 overflow-hidden">
        <div className="w-full max-w-xl relative" style={{ minHeight: 480 }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.3 },
                scale: { duration: 0.3 },
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
