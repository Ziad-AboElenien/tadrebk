'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { internshipService } from '@/features/internship/services/internship.service';
import InternshipCard from '@/features/company/components/InternshipCard';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import Parallax from './Parallax';
import { fadeUp, scaleIn } from './animations';

export default function FeaturedInternshipsSection() {
  const router = useRouter();
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const result = await internshipService.listInternships({ limit: 20 });
        setInternships(result.internships);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <section className="py-24 relative overflow-hidden bg-gradient-to-b from-white via-emerald-50/30 to-emerald-50/60">
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -left-32 w-80 h-80 bg-sky-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 right-1/3 w-72 h-72 bg-violet-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 relative">
        <Parallax offset={60} className="text-center mb-14">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}
          >
            <motion.h2 variants={fadeUp} custom={0} className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
              Featured Internships
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-gray-400 text-sm mt-3 max-w-md mx-auto">
              Fresh opportunities from top companies in Egypt.
            </motion.p>
          </motion.div>
        </Parallax>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner /></div>
        ) : internships.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-briefcase text-3xl text-gray-300" />
            </div>
            <p className="text-gray-400 font-semibold">No internships available yet.</p>
            <p className="text-gray-300 text-sm mt-1">Check back soon for new opportunities!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {internships.map((intern, i) => (
              <motion.div
                key={intern._id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                variants={scaleIn}
                custom={i}
              >
                <InternshipCard internship={intern} />
              </motion.div>
            ))}
          </div>
        )}

        <div className="text-center mt-14">
          <Button
            onClick={() => router.push('/internships')}
            variant="primary"
            size="lg"
            rightIcon={<i className="fas fa-arrow-right text-sm" />}
          >
            Browse All Internships
          </Button>
        </div>
      </div>
    </section>
  );
}
