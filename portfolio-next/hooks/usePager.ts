'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type PagerState = {
  /** posição contínua (0 … count-1), já com easing */
  f: number;
  /** página parada atual */
  idx: number;
  from: number;
  to: number;
  /** progresso linear da transição (0 … 1) */
  u: number;
  anim: boolean;
};

const DUR = 1100;
const COOLDOWN = 350;
const ease = (t: number) => (t < 0.5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2);

/**
 * Paginação travada: cada gesto (wheel, swipe, teclado) anda exatamente uma página.
 * O estado por frame vive em refs (sem re-render); só `target` e `near` são state do React.
 */
export function usePager(count: number) {
  const state = useRef<PagerState>({ f: 0, idx: 0, from: 0, to: 0, u: 0, anim: false });
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const timing = useRef({ t0: 0, dur: DUR, until: 0, reduce: false });
  const [target, setTarget] = useState(0); // página de destino (contador)
  const [near, setNear] = useState(0); // página mais próxima (ativa o texto)

  const go = useCallback(
    (to: number) => {
      const s = state.current;
      const i = Math.max(0, Math.min(count - 1, to));
      if (s.anim || i === s.idx) return;
      const tm = timing.current;
      s.from = s.idx;
s.to = i;
s.u = 0;
s.f = s.idx;
tm.t0 = performance.now();
      tm.dur = tm.reduce ? 1 : Math.min(DUR + (Math.abs(i - s.idx) - 1) * 250, 2000);
      s.anim = true;
      setTarget(i);
    },
    [count],
  );

  const step = useCallback(
    (d: number) => {
      if (state.current.anim || performance.now() < timing.current.until) return;
      go(state.current.idx + d);
    },
    [go],
  );

  useEffect(() => {
    timing.current.reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let lastWheel = 0;
    let lastMag = 0;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const d = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      const mag = Math.abs(d);
      const now = performance.now();
      // ignora a inércia do trackpad: só dispara em gesto novo ou mais forte
      const fresh = now - lastWheel > 120 || mag > lastMag + 10;
      lastWheel = now;
      lastMag = mag;
      if (mag < 8 || !fresh) return;
      step(d > 0 ? 1 : -1);
    };

    let sx = 0;
    let sy = 0;
    const onTouchStart = (e: TouchEvent) => {
      sx = e.touches[0].clientX;
      sy = e.touches[0].clientY;
    };
    const onTouchEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - sx;
      const dy = e.changedTouches[0].clientY - sy;
      const d = Math.abs(dx) > Math.abs(dy) ? dx : dy;
      if (Math.abs(d) > 40) step(d < 0 ? 1 : -1);
    };

    const onKey = (e: KeyboardEvent) => {
      const k = e.key;
      if (k === 'ArrowRight' || k === 'ArrowDown' || k === 'PageDown' || k === ' ') {
        e.preventDefault();
        step(1);
      } else if (k === 'ArrowLeft' || k === 'ArrowUp' || k === 'PageUp') {
        e.preventDefault();
        step(-1);
      } else if (k === 'Home') go(0);
      else if (k === 'End') go(count - 1);
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('keydown', onKey);

    let raf = 0;
    let lastNear = -1;
    const tick = (now: number) => {
      const s = state.current;
      const tm = timing.current;
      if (s.anim) {
        s.u = Math.min(1, (now - tm.t0) / tm.dur);
        s.f = s.from + (s.to - s.from) * ease(s.u);
        if (s.u >= 1) {
          s.anim = false;
          s.idx = s.to;
          s.f = s.to;
          tm.until = now + COOLDOWN;
        }
      } else {
        s.f = s.idx;
      }
      if (track.current) track.current.style.transform = `translate3d(${(-s.f / count) * 100}%,0,0)`;
      if (bar.current) bar.current.style.width = `${(s.f / (count - 1)) * 100}%`;
      const n = Math.round(s.f);
      if (n !== lastNear) {
        lastNear = n;
        setNear(n);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', onKey);
    };
  }, [count, go, step]);

  return { state, track, bar, go, target, near };
}
