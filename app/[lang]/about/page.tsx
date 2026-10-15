import Image from "next/image";
import { dict, type Lang } from "../../../lib/i18n";

const List = ({
  items,
  align,
}: {
  items: [string, string][];
  align: string;
}) => (
  <ul
    className={`flex flex-col gap-4 font-mono text-xs uppercase leading-5 tracking-wider lg:w-52 ${align}`}
  >
    {items.map(([name, role]) => (
      <li key={name}>
        {name}
        <br />
        <span className="text-white/70">{role}</span>
      </li>
    ))}
  </ul>
);

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const t = dict[(await params).lang as Lang];
  const team = t.team;
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#980001] px-6 pb-10 pt-32 text-white">
      <div className="flex w-full flex-col items-center gap-8 lg:flex-row lg:justify-center">
        <div className="flex flex-col gap-6 text-center lg:text-right">
          <p className="font-mono text-xs uppercase leading-5 tracking-wider lg:w-52">
            {t.aboutIntro}
          </p>
          <List items={team.slice(0, 3)} align="text-center lg:text-right" />
        </div>
        <div className="relative mt-16 w-4/5 max-w-[42.67rem] lg:mt-0 lg:w-full">
          {/* logo behind the figures, rising above their heads */}
          <img
            src="/logo/gust_academy_logo_black_cropped.svg"
            alt=""
            aria-hidden
            className="absolute left-[56%] top-[-14%] h-[65%] w-auto -translate-x-1/2"
          />
          {/* floor shadow, sits under the seated figures (~80-90% down the image) */}
          <div
            aria-hidden
            className="absolute -inset-x-[2%] top-[80%] h-[10.5%] rounded-[50%] bg-black/90 blur-lg"
          />
          <Image
            src="/team.png"
            alt="Gust Academy team"
            width={2400}
            height={1600}
            priority
            className="relative h-auto w-full"
          />
        </div>
        <List items={team.slice(3)} align="text-center lg:text-left" />
      </div>
      <section className="flex max-w-[42.67rem] flex-col items-center gap-3 text-center">
        <p className="font-mono text-xs leading-5 text-white/80">
          {t.aboutOutro}
        </p>
      </section>
    </main>
  );
}
