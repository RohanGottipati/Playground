import type { Metadata } from "next";
import { Space_Grotesk, Rubik, Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { NavBar } from "@/components/layout/NavBar";
import { SiteBackground } from "@/components/layout/SiteBackground";

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

const inter = Inter({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Playground — Arrange. Snap. Play. Publish.",
  description:
    "Arrange physical objects, take one photo, and play the platformer your desk becomes.",
  openGraph: {
    title: "Playground",
    description:
      "Turn a photo of real objects into a playable platformer, then publish it to a shared playground.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${display.variable} ${body.variable} ${serif.variable} ${inter.variable} min-h-dvh font-body antialiased`}
      >
        <CustomCursor />

        <SiteBackground />

        <NavBar />

        <main className="mx-auto w-full max-w-6xl px-4 pb-8 pt-24">{children}</main>
      </body>
    </html>
  );
}
