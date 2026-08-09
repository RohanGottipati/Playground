"use client";

import { useState } from "react";

type Props = {
  slug: string;
  className?: string;
  label?: string;
  copiedLabel?: string;
};

export function ShareButton({
  slug,
  className = "btn-secondary px-3 py-2 text-xs",
  label = "Share",
  copiedLabel = "Copied!",
}: Props) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  async function share(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    const url = `${window.location.origin}/game/${slug}`;
    try {
      if (navigator.share) {
        try {
          await navigator.share({ title: "Playground", url });
          return;
        } catch (cause) {
          if (cause instanceof DOMException && cause.name === "AbortError") return;
        }
      }
      await navigator.clipboard.writeText(url);
      setState("copied");
      window.setTimeout(() => setState("idle"), 2000);
    } catch (cause) {
      console.warn("share failed", cause);
      setState("failed");
      window.setTimeout(() => setState("idle"), 2000);
    }
  }

  return (
    <button
      type="button"
      className={className}
      onClick={share}
      aria-label={`Share game ${slug}`}
      aria-live="polite"
    >
      {state === "copied" ? copiedLabel : state === "failed" ? "Try again" : label}
    </button>
  );
}
