"use client";

import { useEffect, useRef, useState } from "react";

type Block = { x: number; y: number; w: number; h: number; src?: string };

// xl+ only: scaled-down copy of the page (photos + closing block) on the right, with a frame for the visible part.
// Click or drag to scroll. Blocks are measured from the DOM, so it follows any layout change.
// ponytail: blocks are rectangles, not a live clone of the page; fine while the page is just photos + CTA.
export default function Minimap() {
  const [map, setMap] = useState<{ k: number; w: number; h: number; blocks: Block[] }>();
  const frame = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const measure = () => {
      const els = [...document.querySelectorAll<HTMLElement>("main img, main section")];
      const rects = els.map((el) => ({ r: el.getBoundingClientRect(), el }));
      if (!rects.length) return;
      const left = Math.min(...rects.map(({ r }) => r.left));
      const width = Math.max(...rects.map(({ r }) => r.right)) - left;
      const docH = document.documentElement.scrollHeight;
      const k = Math.min(0.06, (innerHeight * 0.3) / docH);
      setMap({
        k,
        w: width * k,
        h: docH * k,
        blocks: rects.map(({ r, el }) => ({
          x: (r.left - left) * k,
          y: (r.top + scrollY) * k,
          w: r.width * k,
          h: r.height * k,
          src: el instanceof HTMLImageElement ? el.currentSrc || el.src : undefined,
        })),
      });
    };
    measure();
    const ro = new ResizeObserver(measure); // fires when images load and change the page height
    ro.observe(document.body);
    addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => {
    if (!map) return;
    const update = () => {
      const f = frame.current;
      if (!f) return;
      f.style.top = `${scrollY * map.k}px`;
      f.style.height = `${innerHeight * map.k}px`;
    };
    update();
    addEventListener("scroll", update, { passive: true });
    return () => removeEventListener("scroll", update);
  }, [map]);

  if (!map) return null;

  const seek = (e: React.PointerEvent) => {
    const y = e.clientY - box.current!.getBoundingClientRect().top;
    scrollTo(0, y / map.k - innerHeight / 2);
  };

  return (
    <div
      ref={box}
      aria-hidden
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        seek(e);
      }}
      onPointerMove={(e) => e.buttons && seek(e)}
      style={{ width: map.w, height: map.h }}
      className="fixed right-6 top-[max(15rem,calc(50vh-11rem))] z-20 hidden cursor-pointer touch-none xl:block"
    >
      {map.blocks.map((b, i) => (
        <div
          key={i}
          style={{ left: b.x, top: b.y, width: b.w, height: b.h, backgroundImage: b.src && `url("${b.src}")` }}
          className={`absolute bg-cover bg-center ${b.src ? "opacity-70" : "border border-white/30"}`}
        />
      ))}
      <div ref={frame} className="absolute inset-x-[-3px] border border-white bg-white/10" />
    </div>
  );
}
