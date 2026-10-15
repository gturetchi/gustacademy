"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { lastCourse, track } from "../track";
import { submit } from "./actions";
import { dict, type Lang } from "../../../lib/i18n";

const field =
  "w-full border-b border-white/60 bg-transparent py-2 font-mono text-sm outline-none placeholder:text-white/50 focus:border-white";

export default function Form({ lang }: { lang: Lang }) {
  const t = dict[lang].form;
  const [state, action, pending] = useActionState(submit, null);
  const started = useRef(false);
  useEffect(() => {
    if (state?.ok) track("generate_lead", { lang, course: lastCourse() });
    else if (state?.error) track("form_error", { lang, error: state.error });
  }, [state, lang]);
  if (state?.ok) return <p className="font-mono text-sm uppercase tracking-wider">{t.thanks}</p>;
  return (
    <form
      action={action}
      onFocus={() => {
        if (!started.current) track("form_start", { lang, course: lastCourse() });
        started.current = true;
      }}
      className="flex w-full max-w-md flex-col gap-4">
      <input type="hidden" name="lang" value={lang} />
      <input name="firstName" required placeholder={t.first} autoComplete="given-name" className={field} />
      <input name="lastName" required placeholder={t.last} autoComplete="family-name" className={field} />
      <input name="email" type="email" required placeholder={t.email} autoComplete="email" className={field} />
      <input name="phone" type="tel" placeholder={t.phone} autoComplete="tel" className={field} />
      <label className="flex items-start gap-3 font-mono text-xs leading-5">
        <input name="consent" type="checkbox" required className="mt-1 size-4 shrink-0 appearance-none border border-white bg-center bg-no-repeat checked:bg-white checked:bg-[url('data:image/svg+xml;utf8,<svg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2016%2016%22><path%20d=%22M3%208.5l3.5%203.5L13%204.5%22%20fill=%22none%22%20stroke=%22%23980001%22%20stroke-width=%222.5%22/></svg>')]" />
        <span>{t.consent}{" "}
          <Link href={`/${lang}/terms`} target="_blank" className="underline">{t.terms}</Link>.</span>
      </label>
      {state?.error && <p className="font-mono text-xs">{state.error}</p>}
      <button
        disabled={pending}
        className="self-center border border-white px-6 py-2 font-mono text-xs uppercase tracking-widest transition-colors hover:bg-white hover:text-[#980001] disabled:opacity-50"
      >
        {pending ? t.sending : t.send}
      </button>
    </form>
  );
}
