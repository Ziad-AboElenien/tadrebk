'use client';

import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';

interface Preferences {
  location?: 'on-site' | 'remote' | 'hybrid';
  type?: 'full-time' | 'part-time';
}

interface Props {
  preferences: Preferences;
  onChange: (p: Preferences) => void;
  onNext: () => void;
  onBack: () => void;
}

const LOCATION_OPTIONS = [
  { value: 'on-site' as const, label: 'On-site', icon: 'fa-building', desc: 'Work from office' },
  { value: 'remote' as const, label: 'Remote', icon: 'fa-house-laptop', desc: 'Work from anywhere' },
  { value: 'hybrid' as const, label: 'Hybrid', icon: 'fa-arrows-left-right', desc: 'Mix of both' },
];

const TYPE_OPTIONS = [
  { value: 'full-time' as const, label: 'Full-time', icon: 'fa-clock', desc: '40 hours / week' },
  { value: 'part-time' as const, label: 'Part-time', icon: 'fa-hourglass-half', desc: 'Less hours' },
];

export default function Step2Preferences({ preferences, onChange, onNext, onBack }: Props) {
  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 h-full flex flex-col">
      <div className="mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.1 }}
          className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"
        >
          <i className="fas fa-sliders text-lg" />
        </motion.div>
        <h2 className="text-xl sm:text-2xl font-black text-gray-900">
          Any preferences?
        </h2>
        <p className="mt-2 text-sm text-gray-400 leading-relaxed">
          Help us narrow down the best internships for you.
        </p>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto scrollbar-none">
        {/* Location */}
        <div>
          <p className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wide">
            Work Location
          </p>
          <div className="grid grid-cols-3 gap-2.5">
            {LOCATION_OPTIONS.map((opt, i) => {
              const isSelected = preferences.location === opt.value;
              return (
                <motion.button
                  key={opt.value}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.3 }}
                  onClick={() =>
                    onChange({
                      ...preferences,
                      location: isSelected ? undefined : opt.value,
                    })
                  }
                  className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-center transition-all duration-300 ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-100'
                      : 'border-gray-100 bg-gray-50 hover:border-gray-200 hover:bg-white'
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      isSelected
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    } transition-colors duration-300`}
                  >
                    <i className={`fas ${opt.icon} text-sm`} />
                  </div>
                  <span className="text-xs font-bold text-gray-700">{opt.label}</span>
                  <span className="text-[10px] text-gray-400">{opt.desc}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Type */}
        <div>
          <p className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wide">
            Internship Type
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {TYPE_OPTIONS.map((opt, i) => {
              const isSelected = preferences.type === opt.value;
              return (
                <motion.button
                  key={opt.value}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.08, duration: 0.3 }}
                  onClick={() =>
                    onChange({
                      ...preferences,
                      type: isSelected ? undefined : opt.value,
                    })
                  }
                  className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-center transition-all duration-300 ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-100'
                      : 'border-gray-100 bg-gray-50 hover:border-gray-200 hover:bg-white'
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      isSelected
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    } transition-colors duration-300`}
                  >
                    <i className={`fas ${opt.icon} text-sm`} />
                  </div>
                  <span className="text-xs font-bold text-gray-700">{opt.label}</span>
                  <span className="text-[10px] text-gray-400">{opt.desc}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex gap-3">
        <Button variant="secondary" onClick={onBack} className="flex-1">
          <i className="fas fa-arrow-left text-xs mr-2" />
          Back
        </Button>
        <Button onClick={onNext} className="flex-1">
          Finish
          <i className="fas fa-check text-xs ml-2" />
        </Button>
      </div>
    </div>
  );
}
