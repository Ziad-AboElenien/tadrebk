'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { internshipService } from '@/features/internship/services/internship.service';
import InternshipCard from '@/features/company/components/InternshipCard';
import MediaImage from '@/components/ui/MediaImage';
import { getCompanyImgUrl } from '@/features/company/types';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import { scaleIn } from './animations';

function companyOf(intern) {
  if (intern.company) return intern.company;
  if (intern.companyId && typeof intern.companyId === 'object') return intern.companyId;
  return null;
}

/** Compact horizontal row — mobile list view. */
function InternshipListRow({ intern }) {
  const company = companyOf(intern);
  const logoUrl = company ? getCompanyImgUrl(company.logo) : null;
  return (
    <Link
      href={`/internships/${intern._id}`}
      className="flex items-center gap-3.5 rounded-2xl border border-white/70 bg-white/35 p-4 shadow-sm backdrop-blur-xl transition-all active:scale-[0.99]"
    >
      <MediaImage
        src={logoUrl}
        alt=""
        boxClassName="h-12 w-12 shrink-0 rounded-xl overflow-hidden ring-2 ring-white/70"
        imgClassName="w-full h-full object-cover"
        iconClassName="fas fa-building text-base text-slate-300"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-bold uppercase tracking-wide text-emerald-600">
          {company?.name || 'Unknown Company'}
        </p>
        <p className="truncate text-sm font-bold text-slate-900">{intern.title}</p>
        <p className="mt-0.5 truncate text-xs capitalize text-slate-400">
          {[intern.location, intern.workingTime].filter(Boolean).join(' · ')}
        </p>
      </div>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md shadow-emerald-200">
        <i className="fas fa-arrow-right text-xs" />
      </span>
    </Link>
  );
}

export default function FeaturedInternshipsSection({
  title = 'Featured Internships',
  subtitle = 'Fresh opportunities from top companies in Egypt.',
  ctaLabel = 'Browse All Internships',
  ctaHref = '/internships',
  mode = 'featured',
  companyId = null,
  emptyTitle = 'No internships available yet.',
  emptySubtitle = 'Check back soon for new opportunities!',
}) {
  const router = useRouter();
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const result =
          mode === 'company' && companyId
            ? await internshipService.listInternships({ companyId, limit: 6 })
            : await internshipService.listInternships({ limit: 6 });
        setInternships(result.internships);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    })();
  }, [mode, companyId]);

  return (
    <section className="py-24 relative overflow-hidden bg-transparent">
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -left-32 w-80 h-80 bg-sky-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 right-1/3 w-72 h-72 bg-violet-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 relative">
        <div className="text-center mb-14">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
              {title}
            </h2>
            <p className="text-slate-400 text-sm mt-3 max-w-md mx-auto">
              {subtitle}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner /></div>
        ) : internships.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-briefcase text-3xl text-slate-300" />
            </div>
            <p className="text-slate-400 font-semibold">{emptyTitle}</p>
            <p className="text-slate-300 text-sm mt-1">{emptySubtitle}</p>
          </div>
        ) : (
          <>
            {/* Mobile: horizontal list rows */}
            <div className="flex flex-col gap-3 md:hidden">
              {internships.map((intern) => (
                <InternshipListRow key={intern._id} intern={intern} />
              ))}
            </div>
            {/* Tablet & desktop: cards grid */}
            <div className="hidden grid-cols-1 gap-8 md:grid md:grid-cols-2 lg:grid-cols-3">
              {internships.map((intern, i) => (
                <motion.div
                  key={intern._id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '100px' }}
                  variants={scaleIn}
                  custom={i}
                >
                  <InternshipCard internship={intern} />
                </motion.div>
              ))}
            </div>
          </>
        )}

        <div className="text-center mt-10">
          <Button
            onClick={() => router.push(ctaHref)}
            variant="primary"
            size="md"
            rightIcon={<i className="fas fa-arrow-right text-xs" />}
          >
            {ctaLabel}
          </Button>
        </div>
      </div>
    </section>
  );
}
