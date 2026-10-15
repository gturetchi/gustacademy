import { createClient } from "@supabase/supabase-js";
import type { Lang } from "./i18n";

// translatable columns exist as <name>_ro / <name>_en
export const textFields = ["title", "text", "description", "start"] as const;
export const numFields = ["lessons", "weeks", "hours", "position"] as const;

export type Row = {
  slug: string;
  teacher: string;
  price: string;
  published: boolean;
  cover: string | null;
  gallery: string[];
} & Record<(typeof numFields)[number], number> &
  Record<`${(typeof textFields)[number]}_${Lang}`, string>;

// anon client: the public site only reads published rows (enforced by RLS)
export async function getCourses(lang: Lang) {
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data, error } = await db.from("courses").select("*").eq("published", true).order("position");
  if (error) throw error;
  return (data as Row[]).map((r) => ({
    slug: r.slug,
    teacher: r.teacher,
    price: r.price,
    lessons: r.lessons,
    weeks: r.weeks,
    hours: r.hours,
    cover: r.cover || "/teachers/template-photo.jpg",
    gallery: r.gallery,
    title: r[`title_${lang}`] || r.title_ro,
    text: r[`text_${lang}`] || r.text_ro,
    description: r[`description_${lang}`] || r.description_ro,
    start: r[`start_${lang}`] || r.start_ro,
  }));
}
export type Course = Awaited<ReturnType<typeof getCourses>>[number];
