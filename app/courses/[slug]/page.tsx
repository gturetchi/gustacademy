import { notFound } from "next/navigation";
import { items, lorem } from "../../courses";
import BigTitle from "./big-title";
import Cta from "./cta";
import SmoothScroll from "./smooth-scroll";

export const generateStaticParams = () => items.map(({ slug }) => ({ slug }));

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = items.find((i) => i.slug === slug);
  if (!c) notFound();
  return (
    <main className="flex min-h-screen flex-col items-center gap-8 bg-[#980001] px-6 pb-16 pt-40 text-white md:py-[22.5vh]">
      <SmoothScroll />
      <BigTitle>{c.title}</BigTitle>
      {/* md+: first photo is centred on the viewport, on the same line as the meta block at the left */}
      <div className="flex w-full max-w-2xl flex-col gap-24">
        {[0, 1, 2].map((n) => (
          <img key={n} src="/teachers/template-photo.jpg" alt={n ? "" : c.title} className="aspect-[4/3] w-full object-cover md:aspect-auto md:h-[55vh]" />
        ))}
      </div>
      <Cta next={items[(items.indexOf(c) + 1) % items.length]}>Come taste it with us</Cta>
      <dl style={{ filter: "blur(calc(var(--end, 0) * 16px))", opacity: "calc(1 - var(--end, 0))" }} className="detail order-first z-10 grid w-full max-w-2xl grid-cols-[6rem_1fr] gap-x-4 gap-y-3 font-mono text-[10px] uppercase leading-4 tracking-wider xl:fixed xl:left-6 xl:top-[max(15rem,calc(50vh-11rem))] xl:order-none xl:w-[min(24rem,calc(50vw-23rem))]">
        <dt className="opacity-60">Title</dt>
        <dd>{c.title}</dd>
        <dt className="opacity-60">Description</dt>
        <dd className="text-[8px] leading-3">{lorem}</dd>
        <dt className="opacity-60">Teacher</dt>
        <dd>{c.teacher}</dd>
        <dt className="opacity-60">Price</dt>
        <dd>{c.price}</dd>
        <dt className="opacity-60">Starting date</dt>
        <dd>{c.start}</dd>
        <dt className="opacity-60">Lessons</dt>
        <dd>
          {c.lessons} / {+(c.hours / c.lessons).toFixed(1)}h {/* lessons / hours per lesson */}
        </dd>
        <dt className="opacity-60">Weeks</dt>
        <dd>{c.weeks}</dd>
      </dl>
    </main>
  );
}
