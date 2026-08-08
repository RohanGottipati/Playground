import type { Metadata } from "next";
import Link from "next/link";
import { Space_Grotesk, Rubik } from "next/font/google";
import "./globals.css";
import { BackgroundVideo } from "@/components/ui/BackgroundVideo";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
});

const body = Rubik({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Playground — Arrange. Snap. Play. Publish.",
  description:
    "Arrange physical objects, take one photo, and play the platformer your desk becomes.",
  openGraph: {
    title: "Playground",
    description:
      "Turn a photo of real objects into a playable platformer, then publish it to a shared arcade.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${display.variable} ${body.variable} min-h-dvh font-body antialiased`}
      >
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <BackgroundVideo
            src="/playground-bg.mp4"
            poster="/playground-bg-poster.jpg"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-ink/65" />
        </div>

        <header className="border-b-[3px] border-ink bg-cabinet/80">
          <nav
            aria-label="Main"
            className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3"
          >
            <Link href="/" className="marquee-title text-xl text-marquee">
              Playground
            </Link>
            <div className="flex items-center gap-2">
              <Link href="/arcade" className="btn-ghost px-3 py-2 text-xs">
                Arcade
              </Link>
              <Link href="/stats" className="btn-ghost px-3 py-2 text-xs">
                Stats
              </Link>
              <Link href="/create" className="btn-primary px-3 py-2 text-xs">
                Make a game
              </Link>
            </div>
          </nav>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>

        <footer className="border-t-[3px] border-ink bg-cabinet/80 px-4 py-6">
          <p className="mx-auto max-w-6xl font-mono text-[11px] uppercase text-paper/50">
            Playground · one photo becomes one level · photos on published games are
            public
          </p>
        </footer>
      </body>
    </html>
  );
}
