"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { playFlip, playHover } from "./audio";
import { track } from "./track";
import { dict, type Lang } from "../../lib/i18n";
import type { Course } from "../../lib/courses";

// Ported from huyml.co's stack shader: pages along Z, wrapped, neighbours pushed off the focus.
const U = 110; // px per scene unit
const SP = 0.6; // page spacing: gap between unfocused cards
const PUSH = 3.1; // desktop; mobile uses PUSH_M
const PUSH_M = 2.5; // phones: neighbours sit in the screen corners (top-right / bottom-left), half cropped
const KY_M = 1.3; // phones: steeper diagonal, the screen is tall and narrow
// extra room around the focused card: item-item-item (gap) main (gap) item-item-item
const KX = 0.7; // diagonal: bottom-left -> top-right, units per z unit
const KY = 1;
const ROW = 150; // right roller row height (px)
const SIDE = 0.35; // opacity of every non-selected roller row; only 2 above + 2 below are shown
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const wrapDelta = (d: number, N: number) => ((((d + N / 2) % N) + N) % N) - N / 2;

const GLYPHS = "█▓▒░#@%&$/\\<>[]{}=+*~?!01";
const MASK = "******";

// constantly re-rolled artifact text; starts as blocks so server and client markup match
function Glitch({ len }: { len: number }) {
  const [s, setS] = useState("█".repeat(len));
  useEffect(() => {
    const id = setInterval(() => setS(Array.from({ length: len }, () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)]).join("")), 90);
    return () => clearInterval(id);
  }, [len]);
  return <>{s}</>;
}

export default function Carousel({ items, lang }: { items: Course[]; lang: Lang }) {
  const t = dict[lang];
  const N = items.length;
  const MAXZ = (N * SP) / 2; // must be N*SP/2 so the loop wraps seamlessly
  const [active, setActive] = useState(0);
  const [mobile, setMobile] = useState(false); // set after mount so the server markup matches
  useEffect(() => setMobile(matchMedia("(max-width: 767px)").matches), []);
  const W = (mobile ? 2.3 : 3.744) * U;
  const H = (mobile ? 1.725 : 2.808) * U;
  const push = mobile ? PUSH_M : PUSH;
  const ky = mobile ? KY_M : KY;
  const root = useRef<HTMLElement>(null);
  const cards = useRef<(HTMLLIElement | null)[]>([]);
  const rows = useRef<(HTMLLIElement | null)[]>([]);
  const target = useRef(0);
  const cur = useRef(0);
  const idle = useRef<ReturnType<typeof setTimeout>>(undefined);
  const drag = useRef<number | null>(null);
  const moved = useRef(0); // px dragged since pointerdown, so a drag does not count as a click

  const nudge = (d: number, snap = true) => {
    target.current += d;
    clearTimeout(idle.current);
    if (snap) idle.current = setTimeout(() => (target.current = Math.round(target.current)), 120);
  };

  useEffect(() => {
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let last = performance.now();
    let shown = -1;
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      cur.current += (target.current - cur.current) * (still ? 1 : 1 - Math.exp(-dt * 6));
      const p = cur.current;
      // text blurs while the stack is still travelling toward its target
      const b = Math.min(8, Math.abs(target.current - p) * 10);
      root.current?.style.setProperty("--blur", `${b < 0.3 ? 0 : b.toFixed(1)}px`);
      const idx = ((Math.round(p) % N) + N) % N;
      if (idx !== shown) {
        if (shown !== -1) playFlip(); // not on first mount
        setActive((shown = idx));
      }
      cards.current.forEach((el, i) => {
        if (!el) return;
        const flat = ((((SP * (p - i) + MAXZ) % (2 * MAXZ)) + 2 * MAXZ) % (2 * MAXZ)) - MAXZ;
        const d = Math.abs(flat);
        const z = flat + Math.sign(flat || 1) * smooth(0.1, SP * 0.9, d) * push;
        const focus = 1 - smooth(0, SP * 0.8, d);
        el.style.transform = `translate3d(${z * KX * U}px,${-z * ky * U}px,0) rotateY(${-12 - 8 * Math.sign(flat) * (1 - focus)}deg) rotateX(3deg)`;
        // deck order via z-index (flat, no 3D depth). Upcoming cards (flat < 0): the further, the more in front, and the one travelling to the stage stays behind them
        // until it reaches the centre, so it never flips order while still overlapping another card. Previous cards: nearest on top.
        el.style.zIndex = String(Math.round(300 * (flat < 0 ? d - 2 * SP : -d)));
        el.style.setProperty("--zoom", String(1 + 0.12 * focus)); // photo zooms inside the card; card size stays fixed
        el.style.opacity = String((1 - smooth(MAXZ * 0.75, MAXZ, d)));
      });
      rows.current.forEach((el, i) => {
        if (!el) return;
        const d = wrapDelta(i - p, N);
        el.style.transform = `translateY(${d * ROW}px)`;
        const a = Math.abs(d);
        el.style.pointerEvents = a > 2.5 ? "none" : "auto"; // faded-out rows aren't interactive
        el.style.opacity = String((1 - smooth(0, 1, a) * (1 - SIDE)) * (1 - smooth(2, 3, a)));
      });
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") target.current = Math.round(target.current) + 1;
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") target.current = Math.round(target.current) - 1;
    };
    const onWheel = (e: WheelEvent) => nudge((e.deltaY + e.deltaX) * 0.0018);
    // window capture runs before Transition's document capture listener, so a drag never starts a navigation
    const onClickCapture = (e: MouseEvent) => {
      if (moved.current > 6) {
        e.preventDefault();
        e.stopPropagation();
      }
      moved.current = 0;
    };
    addEventListener("click", onClickCapture, true);
    addEventListener("keydown", onKey);
    addEventListener("wheel", onWheel, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("click", onClickCapture, true);
      removeEventListener("keydown", onKey);
      removeEventListener("wheel", onWheel);
    };
  }, [N, MAXZ, push, ky]);

  // first-load fade-in only: after a page transition the curtain already hides the load, so show the page as is
  const intro = typeof document === "undefined" || !document.documentElement.dataset.nav;
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const id = setTimeout(() => track("carousel_browse", { course: items[active]?.slug, index: active }), 600); // only cards the visitor rests on
    return () => clearTimeout(id);
  }, [active, items]);

  const it = items[active];
  if (!it) return null;
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <main
      ref={root}
      className={`${intro ? "carousel-in " : ""}relative h-screen touch-none select-none overflow-hidden bg-[#980001] text-white`}
      onPointerDown={(e) => {
        drag.current = e.clientX;
        moved.current = 0;
      }}
      onPointerMove={(e) => {
        if (drag.current === null) return;
        moved.current += Math.abs(drag.current - e.clientX);
        nudge((drag.current - e.clientX) * (e.pointerType === "touch" ? -0.016 : 0.006)); // touch: ~60px per card
        drag.current = e.clientX;
      }}
      onPointerUp={() => {
        drag.current = null;
        nudge(0); // snap the nearest card to centre on release
      }}
      onPointerLeave={() => (drag.current = null)}
    >
      {/* stack: camera ≈ (4.3, 2.1, 5.1) looking at the origin */}
      <div className="absolute inset-0">
        <ul
          className="absolute left-1/2 top-1/2 m-0 list-none p-0"
          style={{ width: 0, height: 0, perspective: 1400, perspectiveOrigin: "50% 50%" }}
        >
          {items.map((c, i) => (
            <li
              key={c.title}
              ref={(el) => {
                cards.current[i] = el;
              }}
              data-click
              onPointerEnter={(e) => e.pointerType === "mouse" && playHover()}
              className="group absolute flex items-end overflow-hidden p-4 font-display text-4xl text-white"
              style={{ width: W, height: H, left: -W / 2, top: -H / 2 }}
            >
              {c.blurred ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white p-4 text-center font-mono text-xs uppercase tracking-widest text-[#980001] md:text-sm">
                  {t.soon}
                </div>
              ) : (
                (() => {
                const img = (
                  <img src={c.cover} alt="" draggable={false} className={`absolute inset-0 h-full w-full object-cover transition-[scale] duration-300 group-hover:scale-110`} style={{ transform: "scale(var(--zoom, 1))" }} />
                );
                return (
                  <Link href={`/${lang}/courses/${c.slug}`} draggable={false} aria-label={c.title} className="absolute inset-0">{img}</Link>
                );
              })()
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* left meta */}
      <dl key={active} className="detail absolute z-10 [filter:blur(var(--blur,0px))] left-6 top-[43%] hidden grid-cols-[6rem_1fr] gap-x-4 gap-y-6 font-mono text-[10px] uppercase tracking-wider md:grid">
        <dt className="opacity-60">{t.startDate}</dt><dd>{it.blurred ? MASK : it.start}</dd>
        <dt className="opacity-60">{t.lessons}</dt><dd>{it.blurred ? MASK : `${it.lessons} / ${+(it.hours / it.lessons).toFixed(1)}h`}</dd>
        <dt className="opacity-60">{t.weeks}</dt><dd>{it.blurred ? MASK : it.weeks}</dd>
      </dl>

      {/* counter */}
      <div
        className="absolute z-10 [filter:blur(var(--blur,0px))] left-2 top-28 md:left-36 md:top-[var(--t)] md:-mt-4 flex items-end gap-3 p-4 text-white"
        style={{ "--t": `calc(50% + ${2 * ROW - 48}px)` } as React.CSSProperties} // same level as the last visible row of the right list (-mt-12 offset)
        aria-live="polite"
      >
        <span className="hidden font-mono text-[10px] uppercase tracking-wider opacity-60 md:inline">{t.selected}</span>
        <span className="font-display text-[64px] leading-none tabular-nums md:text-[96px]">{pad(active + 1)}</span>
        <span className="pb-3 font-mono text-[10px] tabular-nums">/{pad(N)}</span>
      </div>

      {/* right roller: rows slide with the carousel, current one centred */}
      <ul className="absolute z-10 [filter:blur(var(--blur,0px))] right-6 top-1/2 hidden w-96 list-none p-0 md:block">
        {items.map((c, i) => (
          <li
            key={c.title}
            ref={(el) => {
              rows.current[i] = el;
            }}
            data-click
            className="absolute left-0 top-0 -mt-12 w-full"
          >
            {(() => {
              const body = (
                <>
                  <span className="block font-mono text-xs uppercase tracking-wider">{c.blurred ? MASK : c.teacher}</span>
                  <span className="mt-1 block text-3xl uppercase tracking-wide">{c.blurred ? <Glitch len={Math.max(c.title.length, 6)} /> : c.title}</span>
                  <span className="mt-2 block font-mono text-xs leading-5">{c.blurred ? MASK : c.text}</span>
                </>
              );
              return c.blurred ? (
                <div className="block text-left">{body}</div>
              ) : (
                <Link href={`/${lang}/courses/${c.slug}`} draggable={false} className="block text-left">{body}</Link>
              );
            })()}
          </li>
        ))}
      </ul>

      {/* phones: the roller is hidden, so the selected course's details sit at the bottom */}
      <div key={`m${active}`} className="detail absolute inset-x-6 z-10 text-center [filter:blur(var(--blur,0px))] md:hidden" style={{ top: `calc(50% + ${H / 2 + 90}px)` }}>
        <span className="block font-mono text-xs uppercase tracking-wider">{it.blurred ? MASK : it.teacher}</span>
        <span className="mt-1 block text-2xl uppercase tracking-wide">{it.blurred ? <Glitch len={Math.max(it.title.length, 6)} /> : it.title}</span>
        <span className="mt-2 block font-mono text-xs leading-5">{it.blurred ? MASK : it.text}</span>
      </div>

      <p className="absolute bottom-3 left-6 font-mono text-[10px] uppercase tracking-wider opacity-60">{t.scroll}</p>
    </main>
  );
}
