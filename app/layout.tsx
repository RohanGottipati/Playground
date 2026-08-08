import type { Metadata } from "next";
import { Space_Grotesk, Rubik, Fraunces } from "next/font/google";
import "./globals.css";
import { BackgroundVideo } from "@/components/ui/BackgroundVideo";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { NavPill } from "@/components/layout/NavPill";

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

const serif = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-serif",
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
        className={`${display.variable} ${body.variable} ${serif.variable} min-h-dvh font-body antialiased`}
      >
        <CustomCursor />

        <div className="fixed inset-0 -z-10 overflow-hidden">
          <BackgroundVideo
            src="/playground-bg.mp4"
            poster="/playground-bg-poster.jpg"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-ink/40" />
        </div>

        <div className="fixed inset-x-0 top-4 z-20 flex justify-center px-4">
          <NavPill />
        </div>

        <main className="mx-auto w-full max-w-6xl px-4 pb-8 pt-24">{children}</main>
      </body>
    </html>
  );
}
