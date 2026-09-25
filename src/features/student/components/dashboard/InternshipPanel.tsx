'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, Star } from 'lucide-react';
import InternAvatar from '@/components/ui/InternAvatar';

export type InternshipTab = 'Overview' | 'Requirements' | 'Feedback' | 'Messages';

const TABS: InternshipTab[] = ['Overview', 'Requirements', 'Feedback', 'Messages'];

export interface PanelInternship {
  company: string;
  period: string;
  department: string;
  supervisor: string;
  supervisorRole: string;
  status: string;
  companyLogo?: string | null;
  supervisorAvatar?: string | null;
  programId?: string;
}

export interface PanelRequirement {
  title: string;
  due: string;
  status: string;
}

export interface PanelFeedback {
  author: string;
  authorAvatar?: string | null;
  date: string;
  body: string;
  skillRating?: number;
  teamworkRating?: number;
}

interface InternshipPanelProps {
  internship: PanelInternship;
  requirements?: PanelRequirement[];
  feedback?: PanelFeedback[];
  initialTab?: InternshipTab;
}

function Stars({ value }: { value: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={12}
          className={i <= Math.round(value) ? 'fill-emerald-500 text-emerald-500' : 'text-slate-200'}
        />
      ))}
    </span>
  );
}

export default function InternshipPanel({
  internship,
  requirements = [],
  feedback = [],
  initialTab = 'Overview',
}: InternshipPanelProps) {
  const [active, setActive] = useState<InternshipTab>(initialTab);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          {internship.companyLogo ? (
            <img src={internship.companyLogo} alt={`${internship.company} logo`} loading="lazy" decoding="async" className="h-10 w-10 rounded-full object-cover" />
          ) : (
            <div className="h-10 w-10 shrink-0 rounded-full bg-slate-200" />
          )}
          <div className="min-w-0">
            <p className="truncate font-bold text-slate-900">{internship.company}</p>
            <p className="truncate text-sm text-slate-400">{internship.period}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <div className="text-right">
            <p className="truncate text-sm font-semibold text-slate-900">{internship.supervisor}</p>
            <p className="truncate text-xs text-slate-400">{internship.supervisorRole}</p>
          </div>
          <InternAvatar
            src={internship.supervisorAvatar}
            firstName={internship.supervisor.split(' ')[0]}
            lastName={internship.supervisor.split(' ').slice(1).join(' ')}
          />
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
            {internship.status}
          </span>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-b border-slate-100">
        <div className="flex gap-6 overflow-x-auto text-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActive(tab)}
              className={`whitespace-nowrap border-b-2 pb-3 transition-colors ${
                active === tab
                  ? 'border-emerald-500 font-semibold text-emerald-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {active === 'Overview' && (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {[
            { label: 'COMPANY', value: internship.company },
            { label: 'SUPERVISOR', value: internship.supervisor },
            { label: 'DEPARTMENT', value: internship.department },
            { label: 'INTERNSHIP PERIOD', value: internship.period },
          ].map((f) => (
            <div key={f.label}>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{f.label}</p>
              <p className="mt-1 break-words text-sm font-semibold text-slate-900">{f.value}</p>
            </div>
          ))}
        </div>
      )}

      {active === 'Requirements' && (
        <div className="mt-5 space-y-3">
          {requirements.length === 0 ? (
            <p className="rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-400">
              No requirements assigned yet.
            </p>
          ) : (
            requirements.map((r) => (
              <div
                key={r.title}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 px-5 py-4"
              >
                <div className="min-w-0">
                  <p className="break-words text-sm font-semibold text-slate-900">{r.title}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
                    <Calendar size={12} /> {r.due}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-xs font-semibold ${
                    r.status === 'Action Needed' ? 'text-rose-500' : 'text-slate-500'
                  }`}
                >
                  {r.status}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {active === 'Feedback' && (
        <div className="mt-5 space-y-4">
          {feedback.length === 0 ? (
            <p className="rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-400">
              No feedback shared with you yet.
            </p>
          ) : (
            feedback.map((f) => (
              <div key={`${f.author}-${f.date}`} className="rounded-2xl bg-slate-900 p-6 text-white">
                <div className="flex flex-wrap items-center gap-2">
                  <InternAvatar
                    src={f.authorAvatar}
                    firstName={f.author.split(' ')[0]}
                    lastName={f.author.split(' ').slice(1).join(' ')}
                    className="h-8 w-8 text-[10px]"
                  />
                  <p className="text-sm font-semibold">{f.author}</p>
                  {(f.skillRating != null || f.teamworkRating != null) && (
                    <span className="ml-auto flex items-center gap-2">
                      {f.skillRating != null && <Stars value={f.skillRating} />}
                    </span>
                  )}
                </div>
                <p className="mt-4 break-words text-sm italic text-slate-300">“{f.body}”</p>
                <p className="mt-4 text-xs text-slate-500">{f.date}</p>
              </div>
            ))
          )}
        </div>
      )}

      {active === 'Messages' && (
        <div className="mt-5 rounded-xl bg-slate-50 p-5 text-center">
          <p className="text-sm font-medium text-slate-600">Messages aren’t available yet</p>
          <p className="mt-1 text-xs text-slate-400">
            In-app messaging is coming soon. Meanwhile, check your{' '}
            <Link href="/notifications" className="font-medium text-emerald-600 hover:underline">
              notifications
            </Link>
            .
          </p>
        </div>
      )}
    </section>
  );
}
