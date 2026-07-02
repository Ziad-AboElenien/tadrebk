'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Internship } from '@/features/internship/types';
import type { Company } from '@/features/company/types';
import { getImgUrl } from '@/features/company/types';
import Badge from './Badge';
import Button from './Button';
import { useState, useEffect, useCallback } from 'react';

const LS_SAVED = 'tadrebk_saved_internships';

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

export default function InternshipCard({
  internship,
  compact = false,
}: InternshipCardProps) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const company = companyFromInternship(internship);
  const companyId = company?._id || (typeof internship.companyId === 'string' ? internship.companyId : null);
  const logoUrl = company ? getImgUrl(company.logo) : null;

  useEffect(() => { setSaved(isSaved(internship._id)); }, [internship._id]);

  const handleSave = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const now = toggleSaved(internship._id);
    setSaved(now);
  }, [internship._id]);

  const handleApply = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/internships/${internship._id}`);
  }, [internship._id, router]);

  const locationIcons: Record<string, string> = {
    'on-site': 'fas fa-map-marker-alt',
    remote: 'fas fa-globe',
    hybrid: 'fas fa-code-branch',
  };

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
              {logoUrl ? (
                <img src={logoUrl} alt="" className="w-5 h-5 rounded object-cover" />
              ) : (
                <div className="w-5 h-5 rounded bg-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-500">{company.name[0]}</div>
              )}
              <span className="text-xs text-slate-500">{company.name}</span>
            </div>
          )}
        </div>
      </Link>
    );
  }

  return (
    <div className="p-6 border border-slate-200 rounded-lg hover:shadow-lg transition-all duration-200">
      <Link href={`/internships/${internship._id}`}>
        <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
          {internship.title}
        </h3>
      </Link>

      {company && companyId && (
        <Link href={`/companies/${companyId}`} className="inline-flex items-center gap-2 mb-3 hover:opacity-80 transition-opacity">
          {logoUrl ? (
            <img src={logoUrl} alt="" className="w-6 h-6 rounded object-cover" />
          ) : (
            <div className="w-6 h-6 rounded bg-emerald-100 flex items-center justify-center text-[10px] font-bold text-emerald-700">{company.name[0]}</div>
          )}
          <span className="text-sm text-slate-600">{company.name}</span>
        </Link>
      )}

      <Link href={`/internships/${internship._id}`}>
        <p className="text-sm text-slate-600 mb-4 line-clamp-3">
          {internship.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="info"><i className={`${locationIcons[internship.location] || 'fas fa-map-marker-alt'} text-xs mr-1`} />{internship.location}</Badge>
          <Badge variant="info"><i className="fas fa-clock text-xs mr-1" />{internship.workingTime}</Badge>
          {internship.closed && <Badge variant="danger">Closed</Badge>}
        </div>
      </Link>

      <div className="flex flex-wrap gap-2 mb-4">
        {internship.technicalSkills?.slice(0, 3)?.map((skill) => (
          <span key={skill} className="inline-block px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded">{skill}</span>
        ))}
        {!!internship.technicalSkills && internship.technicalSkills.length > 3 && (
          <span className="inline-block px-2 py-1 text-xs text-slate-500">+{internship.technicalSkills.length - 3}</span>
        )}
      </div>

      <div className="flex gap-2 pt-4 border-t border-slate-100">
        <Button variant="primary" size="md" onClick={handleApply} className="flex-1">
          Apply Now
        </Button>
        <Button variant="outline" size="md" onClick={handleSave} className="flex-1">
          <i className={`${saved ? 'fas fa-heart text-red-500' : 'far fa-heart'} mr-1`} /> {saved ? 'Saved' : 'Save'}
        </Button>
      </div>
    </div>
  );
}
