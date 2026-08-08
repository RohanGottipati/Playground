"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("page error", error);
  }, [error]);

  return (
    <div className="panel space-y-4 text-center">
      <h1 className="marquee-title text-2xl text-marquee">Something broke</h1>
      <p className="font-body text-sm text-paper/80">
        That is on us, not on your photo. Try again in a moment.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" className="btn-primary" onClick={reset}>
          Try again
        </button>
        <Link href="/" className="btn-secondary">
          Go home
        </Link>
      </div>
    </div>
  );
}
