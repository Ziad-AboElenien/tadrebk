'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Mousewheel, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import CursorFollow from './CursorFollow';
import Parallax from './Parallax';

const quickTags = ['Software', 'Fintech', 'Design', 'Data'];
const universities = ['Cairo University', 'Ain Shams', 'Alexandria', 'GUC', 'BUE'];

function SlideContent({ active, children, className = '' }) {
  return (
    <motion.div
      initial={false}
      animate={active ? { opacity: 1, y: 0 } : { opacity: 0.4, y: 24 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function HeroSection() {
  const router = useRouter();
  const [searchTitle, setSearchTitle] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [activeSlide, setActiveSlide] = useState(0);

  function handleSearch(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTitle) params.set('title', searchTitle);
    if (searchLocation) params.set('location', searchLocation);
    router.push(`/internships?${params.toString()}`);
  }

  return (
    <>
      <CursorFollow />

      <section className="relative h-[100svh] min-h-[620px] bg-gradient-to-b from-emerald-50/80 to-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <Parallax offset={150} className="absolute -top-40 -right-40">
            <div className="w-96 h-96 bg-green-200/30 rounded-full blur-3xl animate-float" />
          </Parallax>
          <Parallax offset={110} className="absolute -bottom-40 -left-40">
            <div className="w-80 h-80 bg-emerald-200/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
          </Parallax>
        </div>

        <Swiper
          direction="vertical"
          className="h-full w-full"
          modules={[Mousewheel, Pagination]}
          speed={800}
          slidesPerView={1}
          spaceBetween={0}
          mousewheel={{ forceToAxis: true, releaseOnEdges: true }}
          touchReleaseOnEdges
          threshold={0}
          pagination={{ clickable: true }}
          onSlideChange={(s) => setActiveSlide(s.activeIndex)}
        >
          <SwiperSlide>
            <div className="h-full w-full flex flex-col items-center justify-center px-4 sm:px-8 pt-32 sm:pt-16 pb-10 text-center">
              <SlideContent active={activeSlide === 0} className="max-w-4xl w-full">
                <motion.h1
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="text-4xl sm:text-6xl md:text-7xl font-black text-gray-900 leading-[1.05] tracking-tight mb-6"
                >
                  Find internships that<br />
                  <span className="bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">
                    launch your career
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                  className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-8 font-medium leading-relaxed"
                >
                  Egypt&apos;s first platform connecting university students with top internship opportunities — all in one organized, professional place.
                </motion.p>

                <motion.form
                  onSubmit={handleSearch}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="max-w-2xl mx-auto mb-4"
                >
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center bg-white rounded-2xl shadow-lg shadow-emerald-100/50 ring-1 ring-gray-100 overflow-hidden transition-all duration-300">
                    <div className="flex items-center flex-1 gap-3 px-5 py-4">
                      <i className="fas fa-search text-gray-400 shrink-0" />
                      <input
                        type="text"
                        placeholder="Search internships..."
                        className="w-full text-sm sm:text-sm text-gray-800 placeholder:text-gray-400 bg-transparent outline-none ring-0 focus:ring-0 focus:outline-none"
                        style={{ fontSize: 'max(16px, 1rem)' }}
                        value={searchTitle}
                        onChange={(e) => setSearchTitle(e.target.value)}
                      />
                    </div>
                    <div className="hidden sm:block w-px self-stretch bg-gray-100" />
                    <div className="flex items-center flex-1 gap-3 border-t border-gray-100 sm:border-0 px-5 py-4">
                      <i className="fas fa-location-dot text-emerald-500 shrink-0" />
                      <input
                        type="text"
                        placeholder="Location"
                        className="w-full text-sm sm:text-sm text-gray-800 placeholder:text-gray-400 bg-transparent outline-none ring-0 focus:ring-0 focus:outline-none"
                        style={{ fontSize: 'max(16px, 1rem)' }}
                        value={searchLocation}
                        onChange={(e) => setSearchLocation(e.target.value)}
                      />
                    </div>
                    <div className="p-2">
                      <button type="submit" className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-3 rounded-xl font-bold text-sm hover:from-emerald-600 hover:to-teal-600 hover:shadow-lg hover:shadow-emerald-200/50 transition-all duration-300 active:scale-[0.97]">
                        Search
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                    <span className="text-sm font-semibold text-gray-400">Quick search:</span>
                    {quickTags.map((term) => (
                      <motion.button
                        key={term}
                        type="button"
                        whileHover={{ scale: 1.05, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.push(`/internships?title=${encodeURIComponent(term)}`)}
                        className="rounded-full border border-gray-200 bg-white px-4 py-1 text-sm text-gray-600 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all duration-200"
                      >
                        {term}
                      </motion.button>
                    ))}
                  </div>
                </motion.form>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="mt-14"
                >
                  <p className="mb-4 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                    <i className="fas fa-landmark text-sm" />
                    Trusted by students from
                  </p>
                  <div className="border-y border-gray-100 bg-white/80 py-4 overflow-hidden">
                    <div className="flex items-center justify-center gap-0 overflow-x-auto scrollbar-none min-w-0">
                      {universities.map((u, i) => (
                        <span key={u} className="flex items-center shrink-0">
                          <span className="whitespace-nowrap px-4 sm:px-10 text-xs sm:text-sm font-bold text-gray-800 hover:text-emerald-600 transition-colors cursor-default">{u}</span>
                          {i < universities.length - 1 && <span className="h-4 w-px bg-gray-200 shrink-0" />}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
                </motion.div>
              </SlideContent>
            </div>
          </SwiperSlide>
        </Swiper>

        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-gray-300 pointer-events-none">
          <span className="text-[10px] font-semibold uppercase tracking-widest">Scroll</span>
          <i className="fas fa-chevron-down text-sm animate-bounce" />
        </div>

        <style>{`
          .swiper-pagination-vertical { right: 16px !important; }
          .swiper-pagination-vertical .swiper-pagination-bullet { width: 8px; height: 8px; background: #10b981; opacity: 0.3; transition: all 0.3s ease; }
          .swiper-pagination-vertical .swiper-pagination-bullet-active { height: 24px; border-radius: 6px; opacity: 1; }
        `}</style>
      </section>
    </>
  );
}
