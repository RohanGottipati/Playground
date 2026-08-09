"use client";

import { useRef } from "react";
import { currentDeviceCapturesDirectly } from "@/lib/utils/deviceCapture";

type Props = {
  onSelect: (file: File) => void;
  onRemoteCapture?: () => void;
  remoteLoading?: boolean;
  showTakeButton?: boolean;
  disabled?: boolean;
};

/**
 * Uses the native camera on mobile and delegates desktop capture to the QR
 * handoff, while retaining a normal file picker on every device.
 */
export function CameraCapture({
  onSelect,
  onRemoteCapture,
  remoteLoading = false,
  showTakeButton = true,
  disabled,
}: Props) {
  const cameraInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) onSelect(file);
  }

  function handleTakePhoto() {
    if (!onRemoteCapture || currentDeviceCapturesDirectly()) {
      cameraInput.current?.click();
      return;
    }
    onRemoteCapture();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {showTakeButton ? (
          <button
            type="button"
            className="btn-primary"
            disabled={disabled || remoteLoading}
            onClick={handleTakePhoto}
          >
            {remoteLoading ? "Creating QR…" : "Take a photo"}
          </button>
        ) : null}
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
