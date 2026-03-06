import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";

/* ── Poppins — Heading Font ─────────────────────────────────── */
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

/* ── Inter — Body Font ──────────────────────────────────────── */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

/* ── App Metadata ───────────────────────────────────────────── */
export const metadata: Metadata = {
  title: {
    default: "Kalyana Mandapam — Premium Wedding Hall",
    template: "%s | Kalyana Mandapam",
  },
  description:
    "Book your dream wedding at Kalyana Mandapam — a premium wedding hall with elegant facilities, professional staff, and unforgettable moments.",
  keywords: ["wedding hall", "kalyana mandapam", "event venue", "marriage hall booking"],
  authors: [{ name: "Kalyana Mandapam" }],
  openGraph: {
    title: "Kalyana Mandapam — Premium Wedding Hall",
    description: "Book your dream wedding venue with us.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
