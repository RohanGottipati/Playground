"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function EmailCapture() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/create${email ? `?email=${encodeURIComponent(email)}` : ""}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-64 max-w-full items-center gap-1.5 rounded-full border border-white/40 bg-white/20 p-1.5 shadow-lg shadow-black/20 backdrop-blur-md transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] focus-within:w-[26rem]"
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email"
        aria-label="Your email"
        className="min-w-0 flex-1 bg-transparent px-4 py-2.5 font-body text-sm text-white placeholder-white/70 outline-none"
      />
      <button
        type="submit"
        className="shrink-0 touch-manipulation whitespace-nowrap rounded-full bg-white px-6 py-2.5 font-body text-sm font-medium text-ink shadow-lg shadow-black/20 transition hover:bg-white/90 active:scale-[0.98]"
      >
        Get started
      </button>
    </form>
  );
}
