"use client";

import { useState } from "react";
import Link from "next/link";
import type { MechanicDiscoveryRecord } from "@/lib/db/types";

type Props = {
  gameId: string;
  defaultTitle: string;
};

type PublishResponse = {
  slug: string;
  title: string;
  url: string;
  discoveries: MechanicDiscoveryRecord[];
};

export function PublishPanel({ gameId, defaultTitle }: Props) {
  const [title, setTitle] = useState(defaultTitle);
  const [creatorName, setCreatorName] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState<PublishResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function publish() {
    setPublishing(true);
    setError(null);
    try {
      const response = await fetch("/api/games/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, title, creatorName: creatorName || undefined }),
      });
      const body = (await response.json()) as PublishResponse & {
        error?: { message?: string };
      };
      if (!response.ok) {
        setError(body.error?.message ?? "Publishing failed. Please try again.");
        return;
      }
      setPublished(body);
    } catch (cause) {
      console.error("publish failed", cause);
      setError("Publishing failed. Please check your connection and try again.");
    } finally {
      setPublishing(false);
    }
  }

  async function copyLink() {
    if (!published) return;
    const url = `${window.location.origin}/game/${published.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch (cause) {
      console.warn("copy failed", cause);
    }
  }

  if (published) {
    return (
      <div className="space-y-4 rounded-3xl bg-appleBg p-6">
        <h2
          className="font-inter font-medium text-appleInk"
          style={{ fontSize: 20, letterSpacing: "-0.03em" }}
        >
          Published
        </h2>
        <p className="font-inter text-sm text-appleGray" style={{ letterSpacing: "-0.01em" }}>
          Your game is live in the Playground at{" "}
          <span className="font-medium text-appleInk">/game/{published.slug}</span>
        </p>
        {published.discoveries.length > 0 ? (
          <ul className="space-y-1 font-inter text-xs text-appleBlue" style={{ letterSpacing: "-0.01em" }}>
            {published.discoveries.map((discovery) => (
              <li key={discovery.id}>
                New mechanic discovered: {discovery.objectLabel} →{" "}
                {discovery.mechanic.replace(/_/g, " ")}
              </li>
            ))}
          </ul>
        ) : null}
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/game/${published.slug}`}
            className="rounded-full bg-appleInk px-5 py-2.5 font-inter text-sm font-medium text-white transition hover:bg-black"
            style={{ letterSpacing: "-0.02em" }}
          >
            Open game page
          </Link>
          <button
            type="button"
            onClick={copyLink}
            className="rounded-full border border-appleGray/30 px-5 py-2.5 font-inter text-sm font-medium text-appleInk transition hover:border-appleGray/60"
            style={{ letterSpacing: "-0.02em" }}
          >
            {copied ? "Link copied" : "Copy link"}
          </button>
          <Link
            href="/playground"
            className="rounded-full px-5 py-2.5 font-inter text-sm font-medium text-appleBlue transition hover:underline"
            style={{ letterSpacing: "-0.02em" }}
          >
            Go to Playground
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-3xl bg-appleBg p-6">
      <h2
        className="font-inter font-medium text-appleInk"
        style={{ fontSize: 20, letterSpacing: "-0.03em" }}
      >
        Publish to the Playground
      </h2>
      <label
        className="block font-inter text-xs font-medium uppercase tracking-wide text-appleGray"
        style={{ letterSpacing: "0.02em" }}
      >
        Game title
        <input
          value={title}
          maxLength={80}
          onChange={(event) => setTitle(event.target.value)}
          className="mt-1.5 w-full rounded-xl border border-appleGray/25 bg-white px-3 py-2.5 font-inter text-sm font-normal normal-case text-appleInk outline-none transition focus:border-appleBlue"
          style={{ letterSpacing: "-0.01em" }}
        />
      </label>
      <label
        className="block font-inter text-xs font-medium uppercase tracking-wide text-appleGray"
        style={{ letterSpacing: "0.02em" }}
      >
        Your name (optional)
        <input
          value={creatorName}
          maxLength={40}
          placeholder="Anonymous"
          onChange={(event) => setCreatorName(event.target.value)}
          className="mt-1.5 w-full rounded-xl border border-appleGray/25 bg-white px-3 py-2.5 font-inter text-sm font-normal normal-case text-appleInk outline-none transition focus:border-appleBlue placeholder:text-appleGray/60"
          style={{ letterSpacing: "-0.01em" }}
        />
      </label>
      {error ? (
        <p className="font-inter text-xs text-red-500" style={{ letterSpacing: "-0.01em" }} role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="button"
        disabled={publishing || title.trim().length === 0}
        onClick={publish}
        className="w-full rounded-full bg-appleInk py-2.5 font-inter text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
        style={{ letterSpacing: "-0.02em" }}
      >
        {publishing ? "Publishing…" : "Publish game"}
      </button>
      <p className="font-inter text-[11px] text-appleGray" style={{ letterSpacing: "-0.01em" }}>
        Publishing makes the level, its stats and the source photo public.
      </p>
    </div>
  );
}
