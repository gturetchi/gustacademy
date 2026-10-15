import Link from "next/link";
import type { Row } from "../../lib/courses";
import { requireAdmin } from "../../lib/supabase-server";
import { signOut } from "./actions";

export default async function Page() {
  const db = await requireAdmin();
  const { data } = await db.from("courses").select("*").order("position");
  const rows = (data ?? []) as Row[];
  return (
    <>
      <header className="mb-8 flex items-center justify-between uppercase tracking-widest">
        <h1 className="text-lg">Courses</h1>
        <div className="flex gap-6">
          <Link href="/admin/new" className="underline">+ New</Link>
          <form action={signOut}><button className="underline">Sign out</button></form>
        </div>
      </header>
      <ul className="divide-y divide-white/30 border-y border-white/30">
        {rows.map((r) => (
          <li key={r.slug}>
            <Link href={`/admin/${r.slug}`} className="flex justify-between gap-4 py-3 hover:bg-white/10">
              <span>{r.position}. {r.title_en || r.title_ro || r.slug}</span>
              <span className="opacity-60">{r.published ? "published" : "draft"}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
