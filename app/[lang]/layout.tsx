import Track from "./track";
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Courier_Prime } from "next/font/google";
import Script from "next/script";
import "../globals.css";
import Loader from "./loader";
import Navbar from "./navbar";
import Transition from "./transition";
import { langs, type Lang } from "../../lib/i18n";

const julius = localFont({ src: "../fonts/JuliusSansOne-Regular.ttf", variable: "--font-julius" });
const breathing = localFont({ src: "../fonts/Breathing.ttf", variable: "--font-breathing" });
const courier = Courier_Prime({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-courier" });

export const metadata: Metadata = {
  title: "Gust Academy",
  description: "Școala cu Gust - Cursuri de arhitectură, design, artă și gust!",
};

// browser chrome (Safari tab bar / toolbar) takes this colour
export const viewport: Viewport = { themeColor: "#980001" };

export const generateStaticParams = () => langs.map((lang) => ({ lang }));
export const dynamicParams = false; // unknown /xx prefixes 404

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const lang = (await params).lang as Lang;
  return (
    <html
      lang={lang}
      className={`${julius.variable} ${breathing.variable} ${courier.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Loader />
        <Track lang={lang} />
        <Navbar />
        <Transition />
        {children}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-ZRSSNXWX5X" strategy="afterInteractive" />
        <Script id="ga" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-ZRSSNXWX5X');`}
        </Script>
        <Script id="fb-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','2050400622335058');fbq('track','PageView');`}
        </Script>
      </body>
    </html>
  );
}
