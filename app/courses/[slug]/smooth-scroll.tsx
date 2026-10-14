"use client";

import { useEffect } from "react";

// Wheel input drives a target; the page eases toward it, so scrolling glides and decelerates into the ends.
// ponytail: wheel only (touch keeps native momentum); swap for Lenis if more input types need smoothing.
export default function SmoothScroll() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const max = () => document.documentElement.scrollHeight - innerHeight;
    let target = scrollY;
    let cur = scrollY;
    let raf = 0;
    let last = 0;

    const frame = (now: number) => {
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000)); // rAF timestamps can precede performance.now()
      last = now;
      if (Math.abs(scrollY - cur) > 2) cur = target = scrollY; // scrolled by keyboard / scrollbar: follow, don't fight
      cur += (target - cur) * (1 - Math.exp(-dt * 5));
      if (Math.abs(target - cur) < 0.3) cur = target;
      scrollTo(0, cur);
      raf = cur === target ? 0 : requestAnimationFrame(frame);
    };
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) return; // pinch / browser zoom
      e.preventDefault();
      if (!raf) {
        target = cur = scrollY;
        last = 0;
      }
      target = Math.max(0, Math.min(max(), target + e.deltaY));
      raf ||= requestAnimationFrame(frame);
    };
    addEventListener("wheel", onWheel, { passive: false });
    return () => {
      removeEventListener("wheel", onWheel);
      cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
