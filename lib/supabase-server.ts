import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// session-aware client for the admin panel
export async function serverClient() {
  const jar = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => jar.set(name, value, options));
        } catch {} // called from a Server Component: proxy refreshes the session instead
      },
    },
  });
}

// every admin page and action goes through this; RLS is the second lock
export async function requireAdmin() {
  const db = await serverClient();
  const { data } = await db.auth.getUser();
  if (!data.user) redirect("/admin/login");
  return db;
}
