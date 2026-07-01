'use client';

import Link from 'next/link';
import { Company } from '@/types/company';
import Badge from './Badge';

interface CompanyCardProps {
  company: Company;
  internshipCount?: number;
}

export default function CompanyCard({
  company,
  internshipCount = 0,
}: CompanyCardProps) {
  // Generate fallback gradient avatar from company name
  const generateGradient = (name: string) => {
    const colors = [
      'from-blue-400 to-blue-600',
      'from-purple-400 to-purple-600',
      'from-pink-400 to-pink-600',
      'from-green-400 to-green-600',
      'from-orange-400 to-orange-600',
      'from-red-400 to-red-600',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const initials = company.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Link href={`/companies/${company._id}`}>
      <div className="p-6 border border-slate-200 rounded-lg hover:shadow-lg transition-all duration-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            <div
              className={`w-12 h-12 rounded-lg bg-gradient-to-br ${generateGradient(
                company.name
              )} flex items-center justify-center text-white font-bold text-lg`}
            >
              {initials}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 line-clamp-1">
                {company.name}
              </h3>
              <p className="text-xs text-slate-500">{company.industry}</p>
            </div>
          </div>
          {!company.approvedByAdmin && (
            <Badge variant="warning" className="ml-2">
              Pending
            </Badge>
          )}
        </div>

        <p className="text-sm text-slate-600 mb-4 line-clamp-2">
          {company.description || 'No description provided'}
        </p>

        <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
          <div className="p-2 bg-slate-50 rounded">
            <p className="text-slate-500 text-xs">Size</p>
            <p className="font-semibold text-slate-900">{company.numberOfEmployees}</p>
          </div>
          <div className="p-2 bg-slate-50 rounded">
            <p className="text-slate-500 text-xs">Internships</p>
            <p className="font-semibold text-slate-900">{internshipCount}</p>
          </div>
        </div>

        <div className="text-xs text-slate-500">
          <i className="fas fa-map-marker-alt mr-1" />{company.address}
        </div>
      </div>
    </Link>
  );
}
