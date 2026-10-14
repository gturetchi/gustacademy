import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Courier_Prime } from "next/font/google";
import "./globals.css";
import Loader from "./loader";
import Navbar from "./navbar";
import Transition from "./transition";

const julius = localFont({ src: "./fonts/JuliusSansOne-Regular.ttf", variable: "--font-julius" });
const breathing = localFont({ src: "./fonts/Breathing.ttf", variable: "--font-breathing" });
const courier = Courier_Prime({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-courier" });

export const metadata: Metadata = {
  title: "Gust Academy",
  description: "Școala cu Gust - Cursuri de arhitectură, design, artă și gust!",
};

// browser chrome (Safari tab bar / toolbar) takes this colour
export const viewport: Viewport = { themeColor: "#980001" };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${julius.variable} ${breathing.variable} ${courier.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Loader />
        <Navbar />
        <Transition />
        {children}
      </body>
    </html>
  );
}
