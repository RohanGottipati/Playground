import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import { PhoneCapture } from "@/components/create/PhoneCapture";
import { phoneCaptureAvailability } from "@/lib/capture/sessions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Take a photo — Playground",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function PhoneCapturePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  noStore();
  const { token } = await params;
  const initialState = await phoneCaptureAvailability(token);
  return <PhoneCapture token={token} initialState={initialState} />;
}
