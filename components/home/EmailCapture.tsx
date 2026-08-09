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
      className="flex w-64 max-w-full items-center gap-1.5 rounded-full border border-black/[0.06] bg-white/70 p-1.5 shadow-lg shadow-black/10 backdrop-blur-xl backdrop-saturate-150 transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] focus-within:w-[26rem]"
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email"
        aria-label="Your email"
        className="min-w-0 flex-1 bg-transparent px-4 py-2.5 font-body text-sm text-appleInk placeholder-appleInk/40 outline-none"
      />
      <button
        type="submit"
        className="shrink-0 touch-manipulation whitespace-nowrap rounded-full bg-appleInk px-6 py-2.5 font-body text-sm font-medium text-white shadow-lg shadow-black/20 transition hover:bg-black active:scale-[0.98]"
      >
        Get started
      </button>
    </form>
  );
}
