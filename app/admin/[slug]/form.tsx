"use client";

import { useActionState } from "react";
import { save } from "../actions";

type F = { name: string; label: string; value: string; area?: boolean; num?: boolean };
const box = "w-full border border-white/40 bg-transparent p-2 outline-none focus:border-white";

export default function Form({ slug, lock, published, blurred, fields }: { slug: string; lock: boolean; published: boolean; blurred: boolean; fields: F[] }) {
  const [err, action, pending] = useActionState(save, null);
  return (
    <form action={action} className="mt-6 flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-xs uppercase tracking-wider">
        slug (used in the URL)
        <input name="slug" defaultValue={slug} readOnly={lock} required className={`${box} ${lock ? "opacity-60" : ""}`} />
      </label>
      {fields.map((f) => (
        <label key={f.name} className="flex flex-col gap-1 text-xs uppercase tracking-wider">
          {f.label}
          {f.area ? (
            <textarea name={f.name} defaultValue={f.value} rows={4} className={box} />
          ) : (
            <input name={f.name} defaultValue={f.value} type={f.num ? "number" : "text"} className={box} />
          )}
        </label>
      ))}
      <label className="flex items-center gap-2 text-xs uppercase tracking-wider">
        <input name="published" type="checkbox" defaultChecked={published} /> published
      </label>
      <label className="flex items-center gap-2 text-xs uppercase tracking-wider">
        <input name="blurred" type="checkbox" defaultChecked={blurred} /> blur (hide details, no detail page)
      </label>
      {err && <p className="text-xs">{err}</p>}
      <button disabled={pending} className="self-start border border-white px-6 py-2 uppercase tracking-widest hover:bg-white hover:text-[#980001] disabled:opacity-50">
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
