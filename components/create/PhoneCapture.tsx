"use client";

import { useRef, useState } from "react";
import { compressImage } from "@/lib/utils/imageCompression";
import type { PhoneCaptureAvailability } from "@/lib/capture/sessions";

type ApiErrorBody = {
  error?: { code?: string; message?: string };
};

type PhoneState = PhoneCaptureAvailability | "sending" | "sent" | "failed";

export function PhoneCapture({
  token,
  initialState,
}: {
  token: string;
  initialState: PhoneCaptureAvailability;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<PhoneState>(initialState);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setState("sending");
    setError(null);
    try {
      const compressed = await compressImage(file);
      const form = new FormData();
      form.append("file", compressed);
      const response = await fetch(`/api/capture-sessions/${token}/upload`, {
        method: "POST",
        body: form,
      });
      const body = (await response.json()) as ApiErrorBody;
      if (!response.ok) {
        if (body.error?.code === "CAPTURE_EXPIRED") {
          setState("expired");
          return;
        }
        if (body.error?.code === "CAPTURE_USED") {
          setState("used");
          return;
        }
        if (body.error?.code === "CAPTURE_NOT_FOUND") {
          setState("invalid");
          return;
        }
        throw new Error(body.error?.message ?? "The photo could not be sent.");
      }
      setState("sent");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "The photo could not be sent. Check your connection and try again.",
      );
      setState("failed");
    }
  }

  const canCapture = state === "pending" || state === "failed";

  return (
    <section className="flex min-h-dvh items-center justify-center bg-ink px-5 text-center">
      <input
        ref={input}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        aria-label="Take a photo"
        onChange={(event) => void handleChange(event)}
      />

      {canCapture ? (
        <div className="w-full max-w-sm space-y-4">
          <button
            type="button"
            className="btn-primary min-h-24 w-full text-xl"
            onClick={() => input.current?.click()}
          >
            Take a photo
          </button>
          {error ? (
            <p className="font-mono text-xs text-marquee" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      ) : null}

      {state === "sending" ? (
        <p className="font-display text-xl uppercase text-paper" role="status">
          Sending photo…
        </p>
      ) : null}

      {state === "sent" || state === "used" ? (
        <div className="space-y-3">
          <p className="font-display text-2xl uppercase text-token" role="status">
            Photo sent
          </p>
          <p className="font-body text-sm text-paper/75">Return to your laptop.</p>
        </div>
      ) : null}

      {state === "expired" || state === "invalid" ? (
        <div className="max-w-sm space-y-3">
          <p className="font-display text-xl uppercase text-marquee" role="alert">
            {state === "expired" ? "This QR code expired" : "This link is not valid"}
          </p>
          <p className="font-body text-sm text-paper/75">
            Create a new QR code on your laptop.
          </p>
        </div>
      ) : null}
    </section>
  );
}
