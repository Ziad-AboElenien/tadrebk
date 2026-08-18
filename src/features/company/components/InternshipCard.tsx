'use client';

import Link from 'next/link';
import { useMemo, useState, useEffect, useCallback, memo } from 'react';
import { Internship, getInternshipTracks } from '@/features/internship/types';
import type { Company } from '@/features/company/types';
import { getCompanyImgUrl } from '@/features/company/types';
import { CATEGORY_LABELS } from '@/features/student/types';
import MediaImage from '@/components/ui/MediaImage';
import Badge from '@/components/ui/Badge';

const LS_SAVED = 'tadrebk_saved_internships';

const locationIcons: Record<string, string> = {
  'on-site': 'fas fa-map-marker-alt',
  remote: 'fas fa-globe',
  hybrid: 'fas fa-code-branch',
};

const locationLabels: Record<string, string> = { 'on-site': 'On-site', remote: 'Remote', hybrid: 'Hybrid' };

function isSaved(id: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const saved = JSON.parse(localStorage.getItem(LS_SAVED) || '[]');
    return saved.includes(id);
  } catch { return false; }
}

function toggleSaved(id: string): boolean {
  try {
    const saved: string[] = JSON.parse(localStorage.getItem(LS_SAVED) || '[]');
    const idx = saved.indexOf(id);
    if (idx > -1) { saved.splice(idx, 1); localStorage.setItem(LS_SAVED, JSON.stringify(saved)); return false; }
    else { saved.push(id); localStorage.setItem(LS_SAVED, JSON.stringify(saved)); return true; }
  } catch { return false; }
}

interface InternshipCardProps {
  internship: Internship;
  compact?: boolean;
}

function companyFromInternship(internship: Internship): Company | null {
  if (internship.company) return internship.company as Company;
  if (typeof internship.companyId === 'object' && internship.companyId) return internship.companyId as Company;
  return null;
}

function InternshipCardInner({
  internship,
  compact = false,
}: InternshipCardProps) {
  const [saved, setSaved] = useState(false);
  const company = useMemo(() => companyFromInternship(internship), [internship]);
  const logoUrl = useMemo(() => (company ? getCompanyImgUrl(company.logo) : null), [company]);
  const tracks = useMemo(() => getInternshipTracks(internship), [internship]);

  useEffect(() => { setSaved(isSaved(internship._id)); }, [internship._id]);

  const handleSave = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const now = toggleSaved(internship._id);
    setSaved(now);
  }, [internship._id]);

  if (compact) {
    return (
      <Link href={`/internships/${internship._id}`}>
        <div className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-slate-900 line-clamp-2 mb-2">
            {internship.title}
          </h3>
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="info"><i className={`${locationIcons[internship.location] || 'fas fa-map-marker-alt'} text-xs mr-1`} />{internship.location}</Badge>
            <Badge variant="info"><i className="fas fa-clock text-xs mr-1" />{internship.workingTime}</Badge>
          </div>
          <p className="text-sm text-slate-600 line-clamp-2 mb-3">
            {internship.description}
          </p>
          {tracks.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {tracks.slice(0, 2).map((track) => (
                <span key={track} className="inline-block px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded">
                  {CATEGORY_LABELS[track as keyof typeof CATEGORY_LABELS] || track}
                </span>
              ))}
              {tracks.length > 2 && (
                <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded">+{tracks.length - 2}</span>
              )}
            </div>
          )}
          <div className="flex flex-wrap gap-1">
            {internship.technicalSkills?.slice(0, 2)?.map((skill) => (
              <span key={skill} className="inline-block px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded">{skill}</span>
            ))}
            {!!internship.technicalSkills && internship.technicalSkills.length > 2 && (
              <span className="inline-block px-2 py-1 text-xs text-slate-500">+{internship.technicalSkills.length - 2}</span>
            )}
          </div>

          {company && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
              <MediaImage
                src={logoUrl}
                alt=""
                boxClassName="w-5 h-5 rounded overflow-hidden shrink-0"
                imgClassName="w-full h-full object-cover"
                iconClassName="fas fa-building text-[9px] text-gray-400"
              />
              <span className="text-xs text-slate-500">{company.name}</span>
            </div>
          )}
        </div>
      </Link>
    );
  }

  return (
    <div className="group flex flex-col rounded-2xl bg-white/60 backdrop-blur-xl border border-white/70 shadow-[0_8px_32px_rgba(0,0,0,0.07)] hover:shadow-[0_16px_40px_rgba(16,185,129,0.15)] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
      <Link href={`/internships/${internship._id}`} className="flex flex-col flex-1">
        <div className="p-5 pb-0 flex-1">
          {/* Logo + badges row */}
          <div className="flex items-start justify-between mb-4">
            <MediaImage
              src={logoUrl}
              alt=""
              boxClassName="h-12 w-12 flex-shrink-0 rounded-xl overflow-hidden ring-2 ring-white/70 group-hover:ring-emerald-200 transition-all"
              imgClassName="w-full h-full object-cover"
              iconClassName="fas fa-building text-lg text-gray-300"
            />
            <div className="flex flex-col items-end gap-1.5">
              {internship.location && (
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  internship.location === 'remote' ? 'bg-violet-50 text-violet-600' :
                  internship.location === 'hybrid' ? 'bg-blue-50 text-blue-600' :
                  'bg-amber-50 text-amber-600'
                }`}>
                  <i className={`fas fa-${
                    internship.location === 'remote' ? 'globe' :
                    internship.location === 'hybrid' ? 'code-branch' : 'map-marker-alt'
                  } text-[9px]`} />
                  {locationLabels[internship.location] || internship.location}
                </span>
              )}
              {internship.workingTime && (
                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold bg-white/70 text-gray-600">
                  <i className="fas fa-clock text-[9px]" />
                  {internship.workingTime === 'full-time' ? 'Full-time' : 'Part-time'}
                </span>
              )}
            </div>
          </div>

          {/* Company name */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">
              {company?.name || 'Unknown Company'}
            </span>
            {internship.closed && (
              <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600 leading-none">
                Closed
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-base font-bold leading-snug text-gray-900 line-clamp-2 group-hover:text-emerald-600 transition-colors">
            {internship.title}
          </h3>

          {/* Details */}
          <div className="mt-3 space-y-2 text-sm text-gray-500">
            <p className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500 shrink-0">
                <i className="fas fa-map-marker-alt text-[10px]" />
              </span>
              {company?.address || locationLabels[internship.location] || internship.location}
            </p>
            {(() => {
              const skills = Array.isArray(internship.technicalSkills) ? internship.technicalSkills : [];
              if (skills.length === 0) return null;
              return (
                <p className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500 shrink-0">
                    <i className="fas fa-code text-[10px]" />
                  </span>
                  <span className="truncate">
                    {skills.slice(0, 2).join(', ')}
                    {skills.length > 2 && ` +${skills.length - 2}`}
                  </span>
                </p>
              );
            })()}
          </div>
        </div>
      </Link>

      {/* Tracks */}
      {(() => {
        if (tracks.length === 0) return null;
        const visible = tracks.slice(0, 2);
        const rest = tracks.length - visible.length;
        return (
          <div className="flex flex-wrap gap-1.5 px-5 pt-3 mb-4">
            {visible.map((track) => (
              <span
                key={track}
                className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-100"
              >
                {CATEGORY_LABELS[track as keyof typeof CATEGORY_LABELS] || track}
              </span>
            ))}
            {rest > 0 && (
              <span className="inline-flex items-center rounded-full bg-white/70 px-2.5 py-0.5 text-[11px] font-semibold text-gray-500">
                +{rest}
              </span>
            )}
          </div>
        );
      })()}

      {/* Actions */}
      <div className="flex items-center gap-2 px-5 pt-5 pb-4 border-t border-white/40 mt-auto">
        <Link
          href={`/internships/${internship._id}`}
          className="flex-1 rounded-xl py-2.5 text-sm font-bold text-center transition-all bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-sm hover:shadow-md hover:from-emerald-600 hover:to-emerald-700 active:scale-[0.98]"
        >
          Apply Now
        </Link>
        <button
          onClick={handleSave}
          aria-label="Save internship"
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border-2 transition-all ${
            saved
              ? 'border-emerald-200 bg-emerald-50 text-emerald-500'
              : 'border-white/70 bg-white/40 text-gray-400 hover:border-emerald-200 hover:text-emerald-500 hover:bg-emerald-50'
          }`}
        >
          <i className="fas fa-bookmark" />
        </button>
      </div>
    </div>
  );
}

const InternshipCard = memo(InternshipCardInner);
export default InternshipCard;
