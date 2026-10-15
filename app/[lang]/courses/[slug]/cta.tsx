"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { track } from "../../track";
import { dict, type Lang } from "../../../../lib/i18n";

// Closing block under the photos. While it rises into view it sets --end (0 -> 1) on <html>,
// which the page's fixed side info reads to blur and fade out.
export default function Cta({ children, next, lang }: { children: string; next: { slug: string; title: string }; lang: Lang }) {
  const t = dict[lang];
  const box = useRef<HTMLElement>(null);

  useEffect(() => {
    const update = () => {
      if (!box.current) return;
      const top = box.current.getBoundingClientRect().top;
      const p = Math.min(1, Math.max(0, (innerHeight * 0.85 - top) / (innerHeight * 0.5)));
      document.documentElement.style.setProperty("--end", String(p));
    };
    update();
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    return () => {
      removeEventListener("scroll", update);
      removeEventListener("resize", update);
      document.documentElement.style.removeProperty("--end");
    };
  }, []);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      track("course_cta_view", { course: location.pathname.split("/").pop(), lang });
      io.disconnect();
    });
    io.observe(el);
    return () => io.disconnect();
  }, [lang]);

  return (
    <section ref={box} className="flex min-h-[70vh] w-full max-w-6xl flex-col items-center justify-center gap-32 py-16 text-center">
      <h2 className="font-display text-[clamp(1.75rem,4.7vw,4.7rem)] leading-none">{children}</h2>
      <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
        <Link
          href={`/${lang}/contacts`}
          className="border border-white px-8 py-3 font-mono text-xs uppercase tracking-widest transition-colors hover:bg-white hover:text-[#980001]"
        >
          {t.contactUs}
        </Link>
        <Link href={`/${lang}/courses/${next.slug}`} className="group flex flex-col items-start font-mono text-xs uppercase tracking-widest">
          <span className="opacity-60">{t.next}</span>
          <span className="mt-1 transition-transform duration-300 group-hover:translate-x-1">{next.title} →</span>
        </Link>
      </div>
    </section>
  );
}
