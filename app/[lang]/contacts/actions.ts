"use server";

import { dict, type Lang } from "../../../lib/i18n";

export type State = { ok: boolean; error?: string } | null;

export async function submit(_: State, f: FormData): Promise<State> {
  const e = dict[f.get("lang") === "en" ? "en" : "ro"].form;
  const url = process.env.SHEETS_WEBHOOK_URL;
  if (!url) return { ok: false, error: e.notConfigured };
  const s = (k: string) => String(f.get(k) ?? "").trim().slice(0, 2000);
  const data = { firstName: s("firstName"), lastName: s("lastName"), email: s("email"), phone: s("phone") };
  if (!data.firstName || !data.lastName || !data.email) return { ok: false, error: e.required };
  if (f.get("consent") !== "on") return { ok: false, error: e.needConsent };
  try {
    // Apps Script web apps answer via a 302 redirect; fetch follows it
    const r = await fetch(url, { method: "POST", body: JSON.stringify(data) });
    if (!r.ok) throw new Error(String(r.status));
    return { ok: true };
  } catch {
    return { ok: false, error: e.failed };
  }
}
