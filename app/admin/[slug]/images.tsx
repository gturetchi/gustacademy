"use client";

import { useActionState } from "react";
import { removeImage, uploadImage } from "../actions";

function Upload({ slug, kind, multiple }: { slug: string; kind: "cover" | "gallery"; multiple?: boolean }) {
  const [err, action, pending] = useActionState(uploadImage, null);
  return (
    <form action={action} className="mt-3 flex flex-wrap items-center gap-3">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="kind" value={kind} />
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
