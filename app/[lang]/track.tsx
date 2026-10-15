"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

declare global { interface Window { gtag?: (...a: unknown[]) => void } }

export const track = (name: string, params: Record<string, unknown> = {}) => window.gtag?.("event", name, params);

// Course slug of the page the visitor last saw, so a later lead can be attributed to it.
export const lastCourse = () => {
  try { return sessionStorage.getItem("course") ?? undefined; } catch { return undefined; }
};

// One delegated listener: tags clicks on tel:/mailto:/course links, no per-component edits.
export default function Track({ lang }: { lang: string }) {
  const pathname = usePathname();
  useEffect(() => { window.gtag?.("set", "user_properties", { lang }); }, [lang]);
  useEffect(() => {
    const slug = pathname.match(/\/courses\/([^/]+)/)?.[1];
    if (slug) try { sessionStorage.setItem("course", slug); } catch {}
  }, [pathname]);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest("a");
      const href = a?.getAttribute("href");
      if (!href || !window.gtag) return;
      const course = href.match(/\/courses\/([^/?#]+)/)?.[1];
      if (href.startsWith("tel:")) window.gtag("event", "call_click", { phone: href.slice(4) });
      else if (href.startsWith("mailto:")) window.gtag("event", "email_click", { email: href.slice(7) });
      else if (/^https?:\/\/(www\.)?(instagram|facebook)\.com/.test(href))
        window.gtag("event", "social_click", { network: href.includes("instagram") ? "instagram" : "facebook" });
      else if (course) window.gtag("event", "course_click", { course, from: location.pathname });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}
