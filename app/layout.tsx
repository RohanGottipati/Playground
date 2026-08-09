import type { Metadata } from "next";
import { Space_Grotesk, Rubik, Fraunces } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

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
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
