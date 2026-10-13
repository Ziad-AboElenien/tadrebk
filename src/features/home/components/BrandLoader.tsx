'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import './landing-brand.css';

const FLAG = 'tbk-loader';
const NAV_LOGO_SELECTOR = '.tbk-nav-logo';

/**
 * Brand intro: the wordmark draws in, fills with the brand gradient, then
 * swaps to the cap logo — which flies home into its navbar slot (FLIP
 * handoff to the real header logo). Plays once per tab session; skipped
 * for reduced-motion users and repeat visits. WAAPI-powered, no extra deps.
 */
export default function BrandLoader() {
  const [done, setDone] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let seen = false;
    try {
      seen = sessionStorage.getItem(FLAG) === '1';
    } catch {
      /* private mode — just play it */
    }
    if (reduce || seen) {
      // Hero entrance animations are gated on .js — enable even when skipping.
      html.classList.add('js');
      setDone(true);
      return;
    }
    html.classList.add('is-loading');
    // Hero entrance animations wait for the curtain.
    html.classList.add('js');

    let cancelled = false;
    const finish = () => {
      if (cancelled) return;
      cancelled = true;
      html.classList.remove('is-loading');
      try {
        sessionStorage.setItem(FLAG, '1');
      } catch {
        /* ignore */
      }
      setDone(true);
    };

    const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
    const animate = (
      el: HTMLElement | null,
      keyframes: Keyframe[],
      opts: KeyframeAnimationOptions,
    ): Promise<void> => {
      if (!el || typeof el.animate !== 'function') return wait(Number(opts.duration) || 0);
      try {
        const anim = el.animate(keyframes, { ...opts, fill: 'forwards' });
        return anim.finished.then(
          () => {},
          () => {},
        );
      } catch {
        return wait(Number(opts.duration) || 0);
      }
    };

    (async () => {
      // 1. wordmark in + progress line + gradient fill
      await Promise.all([
        animate(
          markRef.current,
          [
            { opacity: '0', transform: 'translateY(26px)' },
            { opacity: '1', transform: 'translateY(0)' },
          ],
          { duration: 450, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
        ),
        animate(lineRef.current, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], {
          duration: 1000,
          easing: 'linear',
        }),
      ]);
      if (cancelled) return;
      await animate(
        fillRef.current,
        [{ clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)' }],
        { duration: 550, easing: 'cubic-bezier(0.65, 0, 0.35, 1)' },
      );
      if (cancelled) return;
      await wait(120);

      // 2. swap wordmark → cap logo
      await Promise.all([
        animate(
          markRef.current,
          [
            { opacity: '1', transform: 'scale(1) translateY(0)' },
            { opacity: '0', transform: 'scale(0.6) translateY(-14px)' },
          ],
          { duration: 300, easing: 'cubic-bezier(0.55, 0, 1, 0.45)' },
        ),
        animate(
          brandRef.current,
          [
            { opacity: '0', transform: 'scale(0.7)' },
            { opacity: '1', transform: 'scale(1)' },
          ],
          { duration: 350, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
        ),
      ]);
      if (cancelled) return;

      // 3. FLIP fly home to the navbar logo as the curtain lifts
      const brandEl = brandRef.current;
      const logoEl = document.querySelector<HTMLElement>(NAV_LOGO_SELECTOR);
      let dx = 0;
      let dy = -140;
      let scale = 0.4;
      if (brandEl && logoEl) {
        const from = brandEl.getBoundingClientRect();
        const to = logoEl.getBoundingClientRect();
        if (from.width > 0 && to.height > 0) {
          dx = to.left + to.width / 2 - (from.left + from.width / 2);
          dy = to.top + to.height / 2 - (from.top + from.height / 2);
          scale = to.height / from.height;
        }
      }
      html.classList.remove('is-loading');
      await Promise.all([
        animate(
          brandRef.current,
          [
            { opacity: '1', transform: 'scale(1) translate(0px, 0px)' },
            { opacity: '0', transform: `scale(${scale}) translate(${dx}px, ${dy}px)` },
          ],
          { duration: 850, easing: 'cubic-bezier(0.76, 0, 0.24, 1)' },
        ),
        animate(rootRef.current, [{ transform: 'translateY(0)' }, { transform: 'translateY(-100%)' }], {
          duration: 850,
          delay: 100,
          easing: 'cubic-bezier(0.76, 0, 0.24, 1)',
        }),
        animate(lineRef.current, [{ opacity: '1' }, { opacity: '0' }], { duration: 250 }),
      ]);
      finish();
    })();

    // hard fallback: never trap the visitor behind the loader
    const fallback = window.setTimeout(finish, 4500);
    return () => {
      window.clearTimeout(fallback);
      html.classList.remove('is-loading');
      cancelled = true;
    };
  }, []);

  if (done) return null;

  return (
    <div className="loader" ref={rootRef} aria-hidden="true">
      <div className="loader__inner">
        <div className="loader__mark" ref={markRef}>
          <span className="loader__stroke">tadrebk</span>
          <span className="loader__fill" ref={fillRef}>
            tadrebk
          </span>
        </div>
        <div className="loader__brand" ref={brandRef}>
          <Image
            src="/images/logoandfav@2x.webp"
            alt=""
            width={232}
            height={193}
            priority
            style={{ height: 120, width: 'auto' }}
          />
        </div>
        <span className="loader__line" ref={lineRef} />
      </div>
    </div>
  );
}
