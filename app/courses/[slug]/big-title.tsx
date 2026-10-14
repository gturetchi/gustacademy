"use client";

import { useEffect, useRef } from "react";

const FADE = 240; // px of scroll over which the title blurs out

// Big display title pinned bottom-right; it blurs and fades away as soon as the page starts scrolling.
export default function BigTitle({ children }: { children: string }) {
  const el = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const update = () => {
      const p = Math.min(1, scrollY / FADE);
      if (!el.current) return;
      el.current.style.opacity = String(1 - p);
      el.current.style.filter = p ? `blur(${p * 20}px)` : "none"; // no filter at rest, so nothing can clip the swashes
    };
    update();
    addEventListener("scroll", update, { passive: true });
    return () => removeEventListener("scroll", update);
  }, []);

  return (
    <h1
      ref={el}
      // 0.6em padding keeps the tall swashes inside the box, otherwise the blur filter clips them; the offsets cancel it
      className="pointer-events-none fixed bottom-[calc(14vh-0.6em)] right-[calc(1.5rem-0.6em)] z-10 max-w-[70vw] p-[0.6em] text-right font-display text-[clamp(2rem,6vw,6rem)] leading-[0.95] text-white"
    >
      {children}
    </h1>
  );
}
