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
      <div className="panel space-y-4">
        <h2 className="marquee-title text-xl text-screen">Published</h2>
        <p className="font-mono text-sm text-paper/80">
          Your game is live in the arcade at{" "}
          <span className="text-token">/game/{published.slug}</span>
        </p>
        {published.discoveries.length > 0 ? (
          <ul className="font-mono text-xs text-screen">
            {published.discoveries.map((discovery) => (
              <li key={discovery.id}>
                New mechanic discovered: {discovery.objectLabel} → {discovery.mechanic}
              </li>
            ))}
          </ul>
        ) : null}
        <div className="flex flex-wrap gap-3">
          <Link href={`/game/${published.slug}`} className="btn-primary">
            Open game page
          </Link>
          <button type="button" className="btn-secondary" onClick={copyLink}>
            {copied ? "Link copied" : "Copy link"}
          </button>
          <Link href="/arcade" className="btn-ghost">
            Go to arcade
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="panel space-y-4">
      <h2 className="marquee-title text-xl text-token">Publish to the arcade</h2>
      <label className="block font-mono text-xs uppercase text-paper/70">
        Game title
        <input
          value={title}
          maxLength={80}
          onChange={(event) => setTitle(event.target.value)}
          className="mt-1 w-full rounded-lg border-[3px] border-ink bg-ink/50 px-3 py-2 font-body text-base text-paper"
        />
      </label>
      <label className="block font-mono text-xs uppercase text-paper/70">
        Your name (optional)
        <input
          value={creatorName}
          maxLength={40}
          placeholder="Anonymous"
          onChange={(event) => setCreatorName(event.target.value)}
          className="mt-1 w-full rounded-lg border-[3px] border-ink bg-ink/50 px-3 py-2 font-body text-base text-paper"
        />
      </label>
      {error ? (
        <p className="font-mono text-xs text-marquee" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="button"
        className="btn-primary w-full"
        disabled={publishing || title.trim().length === 0}
        onClick={publish}
      >
        {publishing ? "Publishing…" : "Publish game"}
      </button>
      <p className="font-mono text-[11px] text-paper/60">
        Publishing makes the level, its stats and the source photo public.
      </p>
    </div>
  );
}
