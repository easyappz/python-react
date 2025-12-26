import { useCallback, useEffect, useRef } from 'react';
import Lenis from 'lenis';

function prefersReducedMotion() {
  if (typeof window === 'undefined') return true;
  const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  return Boolean(media?.matches);
}

export function useLenisScroll() {
  const lenisRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({
      duration: 1.05,
      smoothWheel: true,
      wheelMultiplier: 0.9,
      smoothTouch: false,
    });

    lenisRef.current = lenis;

    let rafId = 0;
    const raf = (time) => {
      lenis.raf(time);
      rafId = window.requestAnimationFrame(raf);
    };

    rafId = window.requestAnimationFrame(raf);

    return () => {
      window.cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const scrollTo = useCallback((target) => {
    if (typeof window === 'undefined') return;

    const lenis = lenisRef.current;
    if (lenis && typeof lenis.scrollTo === 'function') {
      lenis.scrollTo(target, { offset: -76 });
      return;
    }

    if (typeof target === 'string') {
      const el = document.querySelector(target);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    if (target?.scrollIntoView) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const scrollToId = useCallback(
    (id) => {
      if (!id) return;
      scrollTo(`#${id}`);
    },
    [scrollTo]
  );

  return { scrollTo, scrollToId };
}
