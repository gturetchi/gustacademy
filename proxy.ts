import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { langs } from "./lib/i18n";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // admin: just keep the Supabase session cookie fresh; pages check auth themselves
  if (pathname.startsWith("/admin")) {
    let res = NextResponse.next({ request: req });
    const db = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (list) => {
          list.forEach(({ name, value }) => req.cookies.set(name, value));
          res = NextResponse.next({ request: req });
          list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
        },
      },
    });
    await db.auth.getUser();
    return res;
  }

  if (langs.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))) return;
  req.nextUrl.pathname = `/ro${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(req.nextUrl);
}

// skip _next and files with an extension (public assets, favicon)
export const config = { matcher: ["/((?!_next|.*\\..*).*)"] };
