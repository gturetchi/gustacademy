import Link from "next/link";
import { numFields, textFields, type Row } from "../../../lib/courses";
import { langs } from "../../../lib/i18n";
import { requireAdmin } from "../../../lib/supabase-server";
import { remove } from "../actions";
import Form from "./form";
import Images from "./images";

const long = ["text", "description"];

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await requireAdmin();
  const isNew = slug === "new";
  const { data } = isNew ? { data: null } : await db.from("courses").select("*").eq("slug", slug).maybeSingle();
  const r = (data ?? {}) as Partial<Row>;
  const get = (k: string) => String((r as Record<string, unknown>)[k] ?? "");

  const fields = [
    ...textFields.flatMap((k) => langs.map((l) => ({ name: `${k}_${l}`, label: `${k} (${l.toUpperCase()})`, area: long.includes(k) }))),
    { name: "teacher", label: "teacher" },
    { name: "price", label: "price" },
    ...numFields.map((k) => ({ name: k, label: k, num: true })),
  ].map((f) => ({ ...f, value: get(f.name) }));

  return (
    <>
      <Link href="/admin" className="underline">← Courses</Link>
      <Form slug={isNew ? "" : slug} lock={!isNew} published={isNew || r.published !== false} fields={fields} />
      {isNew ? (
        <p className="mt-10 text-xs opacity-60">Save the course first, then add images.</p>
      ) : (
        <Images slug={slug} cover={r.cover ?? null} gallery={r.gallery ?? []} />
      )}
      {!isNew && (
        <form action={remove} className="mt-10">
          <input type="hidden" name="slug" value={slug} />
          <button className="underline opacity-70">Delete course</button>
        </form>
      )}
    </>
  );
}
