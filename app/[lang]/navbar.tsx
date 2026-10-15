"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { setAudio } from "./audio";
import { dict, type Lang } from "../../lib/i18n";

const langs = [
  ["RO", "ROMANIAN"],
  ["EN", "ENGLISH"],
] as const;
const hrefs = ["/", "/contacts", "/about"];
const ROW = 24; // menu row pitch in px (20px line + 4px gap), drives the arrow position

export default function Navbar() {
  const [audio, setAudioOn] = useState(true);
  const full = usePathname();
  const lang = full.split("/")[1] as Lang;
  const pathname = full.slice(lang.length + 1) || "/"; // path without the /ro or /en prefix
  const t = dict[lang];
  const [picked, setPicked] = useState<number | null>(null); // arrow moves on click, before the page transition runs
  useEffect(() => setPicked(null), [pathname]);
  const home = pathname === "/" || pathname.startsWith("/courses/"); // logo sits under the menu on these pages
  const current = picked ?? Math.max(0, hrefs.indexOf(pathname));

  return (
    <nav className="pointer-events-none fixed inset-x-0 top-0 z-40 flex items-start justify-between px-6 py-5 text-sm font-medium tracking-widest text-white">
      <div className={`pointer-events-auto flex items-start ${home ? "flex-col gap-4" : "gap-16"}`}>
        <Link
          href={`/${lang}`}
          aria-label="Gust Academy"
          className={`flex ${home ? "order-2" : ""} ${["/about", "/contacts"].includes(pathname) ? "hidden" : ""}`}
          onClick={() => setPicked(0)}
        >
          <img
            src="/logo/gust_academy_logo_white_cropped.svg"
            alt="Gust Academy"
            className={`w-auto ${home ? "h-[7.5rem]" : "h-20"}`}
          />
        </Link>
        <ul className="menu relative flex flex-col gap-1">
          <li
            aria-hidden
            className="absolute left-0 top-0 transition-transform duration-500 ease-in-out"
            style={{ transform: `translateY(${current * ROW}px)` }}
          >
            →
          </li>
          {t.nav.map((label, i) => (
            <li key={hrefs[i]}>
              <Link
                href={`/${lang}${hrefs[i] === "/" ? "" : hrefs[i]}`}
                onClick={() => setPicked(i)}
                className={`block transition-transform duration-500 ease-in-out ${i === current ? "translate-x-5" : ""}`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      {!["/contacts", "/about", "/terms"].includes(pathname) && (
        <>
          {/* halfway between the menu's right edge (~230px) and the centred audio button */}
          <a
            href="tel:+37360000154"
            className={`pointer-events-auto absolute top-5 ${home ? "left-[calc(25%+65px)]" : "left-[calc(25%+115px)]"} -translate-x-1/2 font-mono font-bold text-[10px] uppercase leading-5 tracking-wider`}
          >
            +373 60 000 154
          </a>
          <button
            type="button"
            onClick={() => {
              setAudio(!audio);
              setAudioOn(!audio);
            }}
            aria-pressed={audio}
            className="pointer-events-auto absolute left-1/2 top-5 -translate-x-1/2 font-mono text-[10px] uppercase leading-5 tracking-wider"
          >
            {t.audio}: {audio ? t.on : t.off}
          </button>
        </>
      )}
      <ul className="menu pointer-events-auto relative flex flex-col gap-1">
        <li
          aria-hidden
          className="absolute left-0 top-0 transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateY(${langs.findIndex(([c]) => c.toLowerCase() === lang) * ROW}px)`,
          }}
        >
          →
        </li>
        {langs.map(([code, name]) => (
          <li key={code}>
            <Link
              href={`/${code.toLowerCase()}${pathname === "/" ? "" : pathname}`}
              aria-current={lang === code.toLowerCase()}
              className={`block transition-transform duration-500 ease-in-out ${lang === code.toLowerCase() ? "translate-x-5" : ""}`}
            >
              {name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
