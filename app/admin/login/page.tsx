"use client";

import { useActionState } from "react";
import { signIn } from "../actions";

const field = "w-full border-b border-white/60 bg-transparent py-2 outline-none focus:border-white";

export default function Page() {
  const [err, action, pending] = useActionState(signIn, null);
  return (
    <form action={action} className="mx-auto flex max-w-sm flex-col gap-4 pt-24">
      <h1 className="text-lg uppercase tracking-widest">Admin</h1>
      <input name="email" type="email" required placeholder="EMAIL" autoComplete="email" className={field} />
      <input name="password" type="password" required placeholder="PASSWORD" autoComplete="current-password" className={field} />
      {err && <p className="text-xs">{err}</p>}
      <button disabled={pending} className="self-start border border-white px-6 py-2 uppercase tracking-widest hover:bg-white hover:text-[#980001] disabled:opacity-50">
        {pending ? "…" : "Sign in"}
      </button>
    </form>
  );
}
