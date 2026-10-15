// ponytail: placeholder legal copy, have it reviewed before launch
import { dict, type Lang } from "../../../lib/i18n";

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const t = dict[(await params).lang as Lang];
  return (
    <main className="min-h-screen bg-[#980001] px-6 pb-16 pt-32 text-white">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <h1 className="font-display text-5xl">{t.termsTitle}</h1>
        {t.terms.map(([title, body]) => (
          <section key={title}>
            <h2 className="font-mono text-sm uppercase tracking-widest">{title}</h2>
            <p className="mt-1 font-mono text-sm leading-6 text-white/80">{body}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
