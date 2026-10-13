'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, ChevronDown, Building2 } from 'lucide-react';
import { heroPointer, heroScroll } from './landing-hero-state';
import './landing-brand.css';

// The 3D layer is its own lazy chunk, client-only, never rendered on the server.
const Scene = dynamic(() => import('./LandingScene'), { ssr: false });

const H1_LINE_1 = ['Find', 'internships', 'that'];
const H1_LINE_2 = ['launch', 'your', 'career'];

const QUICK_TAGS = ['Software', 'Fintech', 'Design', 'Data', 'Marketing'];
const UNIVERSITIES = ['Cairo University', 'Ain Shams', 'Alexandria', 'GUC', 'BUE'];
const LOCATIONS = ['Cairo, Egypt', 'Giza, Egypt', 'Alexandria, Egypt', 'Remote'];

export default function LandingHero() {
  const router = useRouter();
  const heroRef = useRef<HTMLElement>(null);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');

  function webglAvailable() {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
    } catch {
      return false;
    }
  }

  // Mount the 3D scene only when: motion allowed + WebGL ok + desktop viewport
  // + browser idle. Phones skip the chunk entirely to save battery.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.innerWidth < 768) return;
    if (!webglAvailable()) return;
    const w = window as unknown as {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    let mounted = true;
    const load = import('./LandingScene');
    const go = () => {
      load.then(() => {
        if (mounted) setReady(true);
      }).catch(() => {});
    };
    const id = w.requestIdleCallback
      ? w.requestIdleCallback(go, { timeout: 350 })
      : window.setTimeout(go, 200);
    return () => {
      mounted = false;
      if (w.cancelIdleCallback) w.cancelIdleCallback(id);
      else window.clearTimeout(id);
    };
  }, []);

  // Cursor parallax + scroll progress for the scene (plain listeners).
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const onMove = (e: PointerEvent) => {
      heroPointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      heroPointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    const onScroll = () => {
      const max = Math.max(document.body.scrollHeight - window.innerHeight, 1);
      heroScroll.p = Math.min(window.scrollY / max, 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const go = (q: string, loc: string) => {
    const params = new URLSearchParams();
    if (q.trim()) params.set('title', q.trim());
    if (loc.trim()) params.set('location', loc.trim());
    const qs = params.toString();
    router.push(`/internships${qs ? `?${qs}` : ''}`);
  };

  return (
    <section id="hero" ref={heroRef} className="hero" aria-label="Find internships">
      <div className="hero__bg" aria-hidden="true" />
      <div className="hero__canvas" data-hero-canvas aria-hidden="true">
        {ready ? <Scene heroRef={heroRef} /> : null}
      </div>

      <div className="tbk-container hero__inner">
        <h1 className="hero__title">
          <span className="hero__line">
            {H1_LINE_1.map((word, i) => (
              <span
                key={word}
                className="hero__word"
                style={{ ['--i' as string]: i }}
              >
                {word}
              </span>
            ))}
          </span>
          <span className="hero__line hero__line--grad">
            {H1_LINE_2.map((word, i) => (
              <span
                key={word}
                className="hero__word"
                style={{ ['--i' as string]: i + H1_LINE_1.length }}
              >
                {word}
              </span>
            ))}
          </span>
        </h1>

        <p className="hero__sub">
          Egypt&rsquo;s first platform connecting university students with top internship
          opportunities — all in one organized, professional place.
        </p>

        <form
          className="hero__search"
          role="search"
          aria-label="Search internships"
          onSubmit={(e) => {
            e.preventDefault();
            go(query, location);
          }}
        >
          <div className="hero__field">
            <Search size={18} className="hero__field-icon" aria-hidden="true" />
            <input
              type="search"
              name="q"
              placeholder="Search internships…"
              aria-label="Search internships by keyword"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="hero__divider" aria-hidden="true" />
          <div className="hero__field">
            <MapPin size={18} className="hero__field-icon" aria-hidden="true" />
            <input
              type="text"
              name="location"
              placeholder="Location"
              aria-label="Filter by location"
              list="hero-locations"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <datalist id="hero-locations">
              {LOCATIONS.map((l) => (
                <option key={l} value={l} />
              ))}
            </datalist>
          </div>
          <button type="submit" className="tbk-btn tbk-btn--primary hero__submit">
            Search
          </button>
        </form>

        <div className="hero__tags">
          <span className="hero__tags-label">Quick search:</span>
          {QUICK_TAGS.map((tag) => (
            <button key={tag} type="button" className="tbk-pill" onClick={() => go(tag, '')}>
              {tag}
            </button>
          ))}
        </div>

        <div className="hero__trust">
          <p className="hero__trust-label">
            <Building2 size={14} aria-hidden="true" />
            Trusted by students from
          </p>
          <ul className="hero__unis" aria-label="Partner universities">
            {UNIVERSITIES.map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="hero__scrollcue" aria-hidden="true">
        <span>Scroll</span>
        <ChevronDown size={16} />
      </div>
    </section>
  );
}
