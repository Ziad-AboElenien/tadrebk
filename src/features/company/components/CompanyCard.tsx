'use client';

import Link from 'next/link';
import { useMemo, memo } from 'react';
import { Company, getCompanyImgUrl } from '@/features/company/types';
import MediaImage from '@/components/ui/MediaImage';

interface CompanyCardProps {
  company: Company;
  internshipCount?: number;
}

function CompanyCardInner({
  company,
  internshipCount = 0,
}: CompanyCardProps) {
  const logoUrl = useMemo(() => getCompanyImgUrl(company.logo), [company.logo]);

  return (
    <Link href={`/companies/${company._id}`}>
      <div className="p-6 border border-slate-200 rounded-lg hover:shadow-lg transition-all duration-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            <MediaImage
              src={logoUrl}
              alt={company.name}
              boxClassName="w-12 h-12 rounded-lg overflow-hidden shrink-0"
              imgClassName="w-full h-full object-cover"
              iconClassName="fas fa-building text-xl text-gray-300"
            />
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 line-clamp-1">
                {company.name}
              </h3>
              <p className="text-xs text-slate-500">{company.industry}</p>
            </div>
          </div>
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

const CompanyCard = memo(CompanyCardInner);
export default CompanyCard;
