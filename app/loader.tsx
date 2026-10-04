"use client";

import { useEffect, useState } from "react";

export default function Loader() {
  const [n, setN] = useState(0);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setN((v) => Math.min(v + 1, 100)), 20);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (n < 100) return;
    const t = setTimeout(() => setGone(true), 500);
    return () => clearTimeout(t);
  }, [n]);

  if (gone) return null;

  return (
    <div
      id="loader"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#980001] text-white transition-opacity duration-500"
      style={{ opacity: n === 100 ? 0 : 1 }}
    >
      <img src="/logo/gust_academy_logo_white.svg" alt="Gust Academy" className="h-[70vh] w-auto" />
      <span className="absolute top-[calc(50%+18vh+1rem)] text-sm tabular-nums">{n}</span>
    </div>
  );
}
