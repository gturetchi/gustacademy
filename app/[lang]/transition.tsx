"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// off-screen resting positions: bottom, top, right, left; one is picked at random per transition
const SIDES = ["translate(0,100%)", "translate(0,-100%)", "translate(100%,0)", "translate(-100%,0)"];
const ARROW = 500; // ms to let the navbar arrow finish moving before the curtain starts
const COVER = 700; // ms the curtain takes to slide up; keep in sync with duration-700 below

// Internal link clicks: curtain slides up, route changes underneath, counter runs, curtain slides back down.
export default function Transition() {
  const router = useRouter();
  const pathname = usePathname();
  const [up, setUp] = useState(false);
  const [busy, setBusy] = useState(false);
  const [n, setN] = useState(0);
  const [side, setSide] = useState(0);
  const [snap, setSnap] = useState(false); // no transition while the curtain is repositioned to its new side
  const to = useRef("");
  const timer = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest?.("a");
      if (!a || a.target || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
      const url = new URL(a.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      e.preventDefault();
      if (busy) return;
      to.current = url.pathname;
      document.documentElement.dataset.nav = "1"; // skip the first-load intro delay on pages shown after a transition
      setN(0);
      setBusy(true);
      setSnap(true);
      setSide(Math.floor(Math.random() * SIDES.length));
      setTimeout(
        () =>
          requestAnimationFrame(() =>
            requestAnimationFrame(() => {
              setSnap(false);
              setUp(true);
              setTimeout(() => {
                router.push(url.pathname);
                timer.current = setInterval(() => setN((v) => Math.min(v + 1, 100)), 8);
              }, COVER);
            }),
          ),
        ARROW,
      );
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [busy, router]);

  // slide back down once the counter is done and the new page is actually rendered
  useEffect(() => {
    if (!up || n < 100 || pathname !== to.current) return;
    clearInterval(timer.current);
    setUp(false);
  }, [up, n, pathname]);

  return (
    <div
      id={busy ? "loader" : undefined}
      aria-hidden
      onTransitionEnd={() => !up && setBusy(false)}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#980001] text-white transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] ${
        busy ? "" : "pointer-events-none"
      }`}
      style={{ transform: up ? "translate(0,0)" : SIDES[side], transition: snap ? "none" : undefined }}
    >
      <img src="/logo/gust_academy_logo_white.svg" alt="" className="h-[70vh] w-auto" />
      <span className="absolute top-[calc(50%+18vh+1rem)] font-mono text-sm tabular-nums">{n}</span>
    </div>
  );
}
