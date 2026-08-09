"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

export type RemoteCaptureState = "waiting" | "expired" | "error";

export function RemoteCapturePanel({
  captureUrl,
  expiresAt,
  state,
  error,
  onCancel,
  onRegenerate,
}: {
  captureUrl: string;
  expiresAt: string;
  state: RemoteCaptureState;
  error?: string | null;
  onCancel: () => void;
  onRegenerate: () => void;
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const secondsLeft = Math.max(
    0,
    Math.ceil((new Date(expiresAt).getTime() - now) / 1000),
  );
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="rounded-2xl border-2 border-token/70 bg-token/10 p-5">
      <div className="grid items-center gap-5 sm:grid-cols-[auto_1fr]">
        <div className="mx-auto rounded-xl bg-white p-3 shadow-stickerSm">
          <QRCodeSVG
            value={captureUrl}
            size={220}
            level="M"
            title="Scan to take a photo on your phone"
          />
        </div>
        <div className="space-y-3 text-center sm:text-left">
          <h2 className="marquee-title text-xl text-token">
            Scan with your phone
          </h2>
          {state === "waiting" ? (
            <>
              <p className="font-body text-sm text-paper/80">
                Open your camera, scan this code, and take one photo. It will
                appear here automatically.
              </p>
              <p className="font-mono text-xs uppercase text-paper/60" role="status">
                Waiting for your phone · {minutes}:{seconds}
              </p>
            </>
          ) : null}
          {state === "expired" ? (
            <p className="font-mono text-xs text-marquee" role="alert">
              This QR code expired. Create a new one to keep going.
            </p>
          ) : null}
          {state === "error" ? (
            <p className="font-mono text-xs text-marquee" role="alert">
              {error ?? "We lost the connection. Create a new QR code."}
            </p>
          ) : null}
          <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
            {state !== "waiting" ? (
              <button type="button" className="btn-secondary px-3 py-2 text-xs" onClick={onRegenerate}>
                Create new QR
              </button>
            ) : null}
            <button type="button" className="btn-ghost px-3 py-2 text-xs" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
