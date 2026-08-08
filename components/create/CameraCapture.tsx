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
          className="btn-primary"
          disabled={disabled}
          onClick={() => cameraInput.current?.click()}
        >
          Take a photo
        </button>
        <button
          type="button"
          className="btn-secondary"
          disabled={disabled}
          onClick={() => fileInput.current?.click()}
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

      <p className="rounded-xl border-2 border-token/70 bg-token/10 p-3 font-mono text-xs text-paper/80">
        Heads up: published games show your photo publicly. Keep faces, screens and
        personal documents out of frame.
      </p>
    </div>
  );
}
