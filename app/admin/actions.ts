"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { numFields, textFields } from "../../lib/courses";
import { langs } from "../../lib/i18n";
import { requireAdmin, serverClient } from "../../lib/supabase-server";

export async function signIn(_: string | null, f: FormData) {
  const db = await serverClient();
  const { error } = await db.auth.signInWithPassword({ email: String(f.get("email")), password: String(f.get("password")) });
  if (error) return error.message;
  redirect("/admin");
}

export async function signOut() {
  await (await serverClient()).auth.signOut();
  redirect("/admin/login");
}

const s = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const publish = () => revalidatePath("/", "layout"); // public pages are static: rebuild them after every edit

export async function save(_: string | null, f: FormData) {
  const db = await requireAdmin();
  const slug = s(f, "slug");
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return "Slug: lowercase letters, digits and dashes only.";
  const row: Record<string, string | number | boolean> = {
    slug,
    teacher: s(f, "teacher"),
    price: s(f, "price"),
    published: f.get("published") === "on",
  };
  for (const k of numFields) row[k] = Number(s(f, k)) || 0;
  for (const k of textFields) for (const l of langs) row[`${k}_${l}`] = s(f, `${k}_${l}`);
  const { error } = await db.from("courses").upsert(row);
  if (error) return error.message;
  publish();
  redirect("/admin");
}

export async function remove(f: FormData) {
  const db = await requireAdmin();
  await db.from("courses").delete().eq("slug", s(f, "slug"));
  publish();
  redirect("/admin");
}

const BUCKET = "courses";
const MAX = 8 * 1024 * 1024;

export async function uploadImage(_: string | null, f: FormData) {
  const db = await requireAdmin();
  const slug = s(f, "slug");
  const kind = s(f, "kind");
  const files = f.getAll("file").filter((x): x is File => x instanceof File && x.size > 0);
  if (!files.length) return "Choose an image.";
  const urls: string[] = [];
  for (const file of files) {
    if (!file.type.startsWith("image/")) return `${file.name}: not an image.`;
    if (file.size > MAX) return `${file.name}: larger than 8 MB.`;
    const path = `${slug}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error } = await db.storage.from(BUCKET).upload(path, file, { contentType: file.type });
    if (error) return error.message;
    urls.push(db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl);
  }
  if (kind === "cover") {
    const { data: old } = await db.from("courses").select("cover").eq("slug", slug).single();
    const { error } = await db.from("courses").update({ cover: urls[0] }).eq("slug", slug);
    if (error) return error.message;
    if (old?.cover) await dropFile(db, old.cover);
  } else {
    const { data: row } = await db.from("courses").select("gallery").eq("slug", slug).single();
    const { error } = await db.from("courses").update({ gallery: [...(row?.gallery ?? []), ...urls] }).eq("slug", slug);
    if (error) return error.message;
  }
  publish();
  redirect(`/admin/${slug}`);
}

export async function removeImage(f: FormData) {
  const db = await requireAdmin();
  const slug = s(f, "slug");
  const url = s(f, "url");
  const { data: row } = await db.from("courses").select("cover, gallery").eq("slug", slug).single();
  if (!row) return;
  const patch = row.cover === url ? { cover: null } : { gallery: (row.gallery as string[]).filter((u) => u !== url) };
  await db.from("courses").update(patch).eq("slug", slug);
  await dropFile(db, url);
  publish();
  redirect(`/admin/${slug}`);
}

// storage object path = everything after /<bucket>/ in the public URL
async function dropFile(db: Awaited<ReturnType<typeof requireAdmin>>, url: string) {
  const i = url.indexOf(`/${BUCKET}/`);
  if (i >= 0) await db.storage.from(BUCKET).remove([decodeURIComponent(url.slice(i + BUCKET.length + 2))]);
}
