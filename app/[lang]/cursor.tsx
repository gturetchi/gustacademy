"use client";

import { useEffect, useRef } from "react";

export default function Cursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      el.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
      el.style.opacity = "1";
    };
    const leave = () => ref.current && (ref.current.style.opacity = "0");
    window.addEventListener("mousemove", move);
    document.documentElement.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("mousemove", move);
      document.documentElement.removeEventListener("mouseleave", leave);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="scroll-cursor pointer-events-none fixed left-0 top-0 z-[60] hidden bg-white text-xm font-semibold tracking-widest text-[#980001] opacity-0 transition-opacity [@media(pointer:fine)]:block"
    >
      SCROLL
    </div>
  );
}
