import { getCourses } from "../../lib/courses";
import type { Lang } from "../../lib/i18n";
import Carousel from "./carousel";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const lang = (await params).lang as Lang;
  return <Carousel items={await getCourses(lang)} lang={lang} />;
}
