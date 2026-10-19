"use client";

import { useEffect, useRef } from "react";

const FADE = 240; // px of scroll over which the title blurs out

// `red` is a copy meant to sit inside a clipped photo wrapper, so the title turns red only where it overlaps the photo.
// Big display title pinned bottom-right; it blurs and fades away as soon as the page starts scrolling.
export default function BigTitle({ children, red }: { children: string; red?: boolean }) {
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
      aria-hidden={red || undefined}
      // 0.6em padding keeps the tall swashes inside the box, otherwise the blur filter clips them; the offsets cancel it
      className={`pointer-events-none fixed bottom-[calc(14vh-0.6em)] right-[calc(1.5rem-0.6em)] z-10 w-[75vw] p-[0.6em] text-right font-display lowercase text-[2.75rem] md:w-auto md:max-w-[70vw] md:text-[clamp(2rem,6vw,6rem)] leading-[0.95] ${red ? "text-[#980001]" : "text-white"}`}
    >
      {children}
    </h1>
  );
}
