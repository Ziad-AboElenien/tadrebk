'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';

const team = [
  {
    name: 'Ziad Elsayed Abo Elenien',
    role: 'Frontend Developer',
    title: 'CEO & Co-Founder',
    email: 'ziadelsayed202201590@gmail.com',
    phone: '01007634616',
    linkedin: 'https://www.linkedin.com/in/ziad-3lsayed',
    github: 'https://github.com/Ziad-AboElenien',
    cv: 'https://drive.google.com/file/d/1qLrSM7yeOADmBFg5xEZRZM7Lp60n0wfd/view',
    image: '/images/ziadddd.jpeg',
  },
  {
    name: 'Ammar Sobhi Amer',
    role: 'Frontend Developer',
    title: 'CTO & Co-Founder',
    email: 'ammar.sobhi.amer@gmail.com',
    phone: '01090022847',
    linkedin: 'https://linkedin.com/in/ammar-sobhi-amer-shehata',
    github: 'https://github.com/AmmarSobhi',
    cv: 'https://drive.google.com/file/d/16i_EqrlgLAggbIbH78AOKWGT_bgtnZu9/view',
    image: '/images/ammar.jpeg',
  },
  {
    name: 'Emad Abd Elaaty',
    role: 'UI/UX & Frontend Developer',
    title: 'CDO & Co-Founder',
    email: 'emadabdelaaty7@gmail.com',
    phone: '01140245079',
    linkedin: 'https://www.linkedin.com/in/emadabdelaaty',
    github: '#',
    cv: '#',
    image: '/images/emad.jpeg',
  },
  {
    name: 'Aly Khalid',
    role: 'Backend Developer',
    title: 'Backend Developer',
    email: 'alykhalid327@gmail.com',
    phone: '01023129345',
    linkedin: 'https://www.linkedin.com/in/aly-khalid',
    github: 'https://github.com/alyKhalid3',
    cv: 'https://drive.google.com/file/d/15fJmhh514zyRyWTNNuNZ6a0oBBjl7-uS/view',
    image: '/images/aly.jpeg',
  },
  {
    name: 'Mostafa Rafat',
    role: 'Full Stack Developer',
    title: 'Full Stack Developer',
    email: 'rafatkandel533@gmail.com',
    phone: '01027807676',
    linkedin: 'https://linkedin.com/in/mostafa-rafat7',
    github: 'https://github.com/mostafarafat529',
    cv: 'https://drive.google.com/file/d/1iTwmbaHIoGgLObCElu3w5u5ZA5Wf70Mc/view',
    image: '/images/mostafa.jpeg',
  },
  {
    name: 'Khaled Manaa Abdelfadeel',
    role: 'Backend Developer',
    title: 'Backend Developer',
    email: '#',
    phone: '01011738567',
    linkedin: '#',
    github: 'https://github.com/manaa-khaled-2025',
    cv: '#',
    image: '/images/khaled.jpeg',
  },
];

function TeamCard({ member, index }: { member: (typeof team)[number]; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('opacity-100', 'translate-y-0');
          el.classList.remove('opacity-0', 'translate-y-8');
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className="group relative bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 opacity-0 translate-y-8"
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Image full-height with info overlay at bottom */}
      <div className="relative h-[540px] rounded-3xl overflow-hidden bg-gray-100">
        <Image
          src={member.image}
          alt={member.name}
          fill
          className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
        />
        {/* Gradient overlay at bottom for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Social links - top right */}
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
          {member.linkedin !== '#' && (
            <a
              href={member.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-blue-600 hover:bg-white hover:scale-110 transition-all shadow-md"
            >
              <i className="fab fa-linkedin-in text-sm" />
            </a>
          )}
          {member.github !== '#' && (
            <a
              href={member.github}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-800 hover:bg-white hover:scale-110 transition-all shadow-md"
            >
              <i className="fab fa-github text-sm" />
            </a>
          )}
        </div>

        {/* Info overlaid at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
          <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
            {member.name}
          </h3>
          <p className="text-sm font-medium text-emerald-300 mt-0.5">{member.title}</p>
          <p className="text-xs text-gray-400 mt-0.5">{member.role}</p>

          <div className="mt-3 space-y-1.5 text-xs text-gray-300">
            {member.email !== '#' && (
              <a href={`mailto:${member.email}`} className="flex items-center gap-2 hover:text-white transition-colors">
                <i className="fas fa-envelope w-3.5 text-center" />
                {member.email}
              </a>
            )}
            {member.phone !== '#' && (
              <a href={`tel:${member.phone}`} className="flex items-center gap-2 hover:text-white transition-colors">
                <i className="fas fa-phone w-3.5 text-center" />
                {member.phone}
              </a>
            )}
          </div>

          {member.cv !== '#' && (
            <a
              href={member.cv}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 w-full justify-center rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold text-sm px-4 py-2.5 transition-all backdrop-blur-sm border border-white/10 group/btn"
            >
              <i className="fas fa-file-pdf text-xs group-hover/btn:animate-bounce" />
              View CV
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AboutScreen() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const t = titleRef.current;
    const d = descRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-6');
          }
        });
      },
      { threshold: 0.3 },
    );
    if (t) observer.observe(t);
    if (d) observer.observe(d);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 py-20 sm:py-28">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-white" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1
            ref={titleRef}
            className="text-3xl sm:text-5xl lg:text-6xl font-black text-white opacity-0 translate-y-6 transition-all duration-700"
          >
            About Us
          </h1>
          <p
            ref={descRef}
            className="mt-5 text-lg sm:text-xl text-emerald-100 max-w-2xl mx-auto leading-relaxed opacity-0 translate-y-6 transition-all duration-700 delay-200"
          >
            We are the team behind <span className="font-bold text-white">Tadrebk</span> — a platform built to bridge the gap between talented students and forward-thinking companies.
          </p>
        </div>
      </section>

      {/* Team Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center mb-14">
          <h2 className="text-2xl sm:text-3xl font-black text-dark">Meet the Team</h2>
          <p className="text-gray-400 mt-2 text-sm">The people who made Tadrebk happen</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {team.map((member, i) => (
            <TeamCard key={member.name} member={member} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
