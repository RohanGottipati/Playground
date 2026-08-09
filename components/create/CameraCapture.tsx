"use client";

import { useRef } from "react";

type Props = {
  onSelect: (file: File) => void;
  disabled?: boolean;
};

/**
 * Uses the native camera on mobile (capture="environment") and doubles as a
 * file picker everywhere else, so no getUserMedia permission dance is needed.
 */
export function CameraCapture({ onSelect, disabled }: Props) {
  const cameraInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) onSelect(file);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={disabled}
          onClick={() => cameraInput.current?.click()}
          className="rounded-full bg-appleInk px-5 py-2.5 font-inter text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
          style={{ letterSpacing: "-0.02em" }}
        >
          Take a photo
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => fileInput.current?.click()}
          className="rounded-full border border-appleGray/30 px-5 py-2.5 font-inter text-sm font-medium text-appleInk transition hover:border-appleGray/60 disabled:cursor-not-allowed disabled:opacity-60"
          style={{ letterSpacing: "-0.02em" }}
        >
          Upload a photo
        </button>
      </div>

      <input
        ref={cameraInput}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        aria-label="Take a photo of your objects"
        onChange={handleChange}
      />
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        className="hidden"
        aria-label="Upload a photo of your objects"
        onChange={handleChange}
      />

      <p
        className="rounded-2xl bg-appleBg p-3 font-inter text-xs text-appleGray"
        style={{ letterSpacing: "-0.01em" }}
      >
        Heads up: published games show your photo publicly. Keep faces, screens and
        personal documents out of frame.
      </p>
    </div>
  );
}
