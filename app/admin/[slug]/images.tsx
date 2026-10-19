"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useState, useTransition } from "react";
import { attachImages, removeImage } from "../actions";

function Upload({ slug, kind, multiple }: { slug: string; kind: "cover" | "gallery"; multiple?: boolean }) {
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const send = (f: FormData) =>
    start(async () => {
      const files = f.getAll("file").filter((x): x is File => x instanceof File && x.size > 0);
      if (!files.length) return setErr("Choose an image.");
      const db = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
      const urls: string[] = [];
      for (const file of files) {
        if (!file.type.startsWith("image/")) return setErr(`${file.name}: not an image.`);
        if (file.size > 8 * 1024 * 1024) return setErr(`${file.name}: larger than 8 MB.`);
        const path = `${slug}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
        const { error } = await db.storage.from("courses").upload(path, file, { contentType: file.type });
        if (error) return setErr(error.message);
        urls.push(db.storage.from("courses").getPublicUrl(path).data.publicUrl);
      }
      setErr((await attachImages(slug, kind, urls)) ?? null);
    });
  return (
    <form action={send} className="mt-3 flex flex-wrap items-center gap-3">
      <input name="file" type="file" accept="image/*" multiple={multiple} required className="text-xs" />
      <button disabled={pending} className="border border-white px-4 py-1 text-xs uppercase tracking-widest hover:bg-white hover:text-[#980001] disabled:opacity-50">
        {pending ? "Uploading…" : "Upload"}
      </button>
      {err && <p className="w-full text-xs">{err}</p>}
    </form>
  );
}

function Thumb({ slug, url }: { slug: string; url: string }) {
  return (
    <form action={removeImage} className="relative">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="url" value={url} />
      <img src={url} alt="" className="aspect-[4/3] w-40 object-cover" />
      <button className="absolute right-1 top-1 bg-black/70 px-2 py-0.5 text-[10px] uppercase">Remove</button>
    </form>
  );
}

export default function Images({ slug, cover, gallery }: { slug: string; cover: string | null; gallery: string[] }) {
  return (
    <section className="mt-10 flex flex-col gap-8 border-t border-white/30 pt-6">
      <div>
        <h2 className="text-xs uppercase tracking-wider">Carousel image</h2>
        <div className="mt-3">{cover ? <Thumb slug={slug} url={cover} /> : <p className="text-xs opacity-60">None (template photo shown)</p>}</div>
        <Upload slug={slug} kind="cover" />
      </div>
      <div>
        <h2 className="text-xs uppercase tracking-wider">Detail page images</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          {gallery.map((u) => <Thumb key={u} slug={slug} url={u} />)}
          {!gallery.length && <p className="text-xs opacity-60">None (carousel image shown)</p>}
        </div>
        <Upload slug={slug} kind="gallery" multiple />
      </div>
    </section>
  );
}
