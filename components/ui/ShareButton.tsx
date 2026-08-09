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
  const [copied, setCopied] = useState(false);

  async function share(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    const url = `${window.location.origin}/game/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (cause) {
      console.warn("copy failed", cause);
    }
  }

  return (
    <button type="button" className={className} onClick={share}>
      {copied ? copiedLabel : label}
    </button>
  );
}
