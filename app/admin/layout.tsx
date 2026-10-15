import "../globals.css";
import { Courier_Prime } from "next/font/google";

const courier = Courier_Prime({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-courier" });

export const metadata = { title: "Gust Academy — Admin", robots: "noindex" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={courier.variable}>
      <body className="min-h-screen px-6 py-10 font-mono text-sm text-white">
        <div className="mx-auto max-w-3xl">{children}</div>
      </body>
    </html>
  );
}
