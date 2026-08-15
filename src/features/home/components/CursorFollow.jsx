'use client';

import { useEffect, useState } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from 'framer-motion';

export default function CursorFollow() {
  const reduced = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);

  const x = useMotionValue(-500);
  const y = useMotionValue(-500);

  // Dot + ring: nearly instant, glued to the cursor.
  const dotX = useSpring(x, { stiffness: 1400, damping: 60, mass: 0.2 });
  const dotY = useSpring(y, { stiffness: 1400, damping: 60, mass: 0.2 });

  // Glow: smooth but fast, stays close behind the cursor.
  const glowX = useSpring(x, { stiffness: 500, damping: 38, mass: 0.4 });
  const glowY = useSpring(y, { stiffness: 500, damping: 38, mass: 0.4 });

  useEffect(() => {
    if (reduced) return;
    if (typeof window === 'undefined') return;
    const fine = window.matchMedia?.('(pointer: fine)')?.matches ?? false;
    if (!fine) return;
    setEnabled(true);

    const onMove = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
    };
    const onLeave = () => setVisible(false);

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseout', onLeave);
    document.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseout', onLeave);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, [reduced, x, y]);

  if (!enabled) return null;

  return (
    <>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[70] hidden md:block -translate-x-1/2 -translate-y-1/2"
        style={{ x: glowX, y: glowY, opacity: visible ? 1 : 0 }}
        transition={{ opacity: { duration: 0.2 } }}
      >
        <div className="h-[30rem] w-[30rem] rounded-full bg-gradient-to-br from-emerald-400/15 via-teal-400/10 to-transparent blur-[90px]" />
      </motion.div>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[71] hidden md:block -translate-x-1/2 -translate-y-1/2"
        style={{ x: dotX, y: dotY, opacity: visible ? 1 : 0 }}
        transition={{ opacity: { duration: 0.2 } }}
      >
        <div className="relative">
          <div className="h-2 w-2 rounded-full bg-emerald-400/90 shadow-[0_0_12px_rgba(16,185,129,0.9)]" />
          <div className="absolute left-0 top-0 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-400/40" />
        </div>
      </motion.div>
    </>
  );
}
