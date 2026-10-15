import Form from "./form";
import type { Lang } from "../../../lib/i18n";

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const lang = (await params).lang as Lang;
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-[#980001] px-6 py-10 text-white md:pt-32">
      <img src="/logo/gust_academy_logo_white_cropped.svg" alt="Gust Academy" className="hidden h-32 w-auto md:block" />
      <div className="flex flex-col items-center gap-1 font-mono text-sm tracking-wider">
        <a href="mailto:gustacademy@gmail.com">gustacademy@gmail.com</a>
        <a href="tel:+37360000154">+373 60 000 154</a>
      </div>
      <Form lang={lang} />
    </main>
  );
}
