"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { GamePlayer } from "@/components/game/GamePlayer";
import { DifficultyBadge } from "@/components/ui/Badge";
import { compressImage } from "@/lib/utils/imageCompression";
import type { SceneAnalysis } from "@/lib/backboard/schemas";
import type { GameSpec } from "@/game/types";
import { CameraCapture } from "./CameraCapture";
import { GenerationProgress, type GenerationStep } from "./GenerationProgress";
import { PublishPanel } from "./PublishPanel";
import { ScanAnimation } from "./ScanAnimation";

type GenerateResponse = {
  gameId: string;
  sceneAnalysis: SceneAnalysis;
  gameSpec: GameSpec;
  generationMetadata: {
    latencyMs: number;
    attempts: number;
    fallbackUsed: boolean;
    status: string;
    warnings: string[];
    provider: string | null;
    model: string | null;
  };
};

type Phase = "capture" | "working" | "ready";

export function CreateFlow({ parentGameId }: { parentGameId?: string }) {
  const [phase, setPhase] = useState<Phase>("capture");
  const [step, setStep] = useState<GenerationStep>("upload");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setPhase("capture");
    setStep("upload");
    setResult(null);
    setError(null);
    setPreviewUrl(null);
  }, []);

  const handleSelect = useCallback(
    async (file: File) => {
    setError(null);
    setPhase("working");
    setStep("upload");
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    try {
      const compressed = await compressImage(file);
      const form = new FormData();
      form.append("file", compressed);

      const uploadResponse = await fetch("/api/uploads", {
        method: "POST",
        body: form,
      });
      const upload = (await uploadResponse.json()) as {
        gameId?: string;
        imagePath?: string;
        imageUrl?: string;
        error?: { message?: string };
      };
      if (!uploadResponse.ok || !upload.gameId) {
        throw new Error(upload.error?.message ?? "We could not accept that photo.");
      }

      setStep("analyze");
      const generateResponse = await fetch("/api/games/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: upload.gameId,
          imagePath: upload.imagePath,
          imageUrl: upload.imageUrl,
          parentGameId,
        }),
      });
      setStep("build");

      const generated = (await generateResponse.json()) as GenerateResponse & {
        error?: { message?: string };
      };
      if (!generateResponse.ok) {
        throw new Error(
          generated.error?.message ?? "We could not build a game from that photo.",
        );
      }

      setStep("validate");
      setResult(generated);
      setStep("done");
      setPhase("ready");
    } catch (cause) {
      console.error("create flow failed", cause);
      setError(
        cause instanceof Error
          ? cause.message
          : "Something went wrong. Please try another photo.",
      );
      setPhase("capture");
      }
    },
    [parentGameId],
  );

  return (
    <div className="space-y-6">
      {phase === "capture" ? (
        <div className="panel space-y-4">
          <h1 className="marquee-title text-2xl text-token">
            Photograph your objects
          </h1>
          <p className="font-body text-sm text-paper/80">
            Lay 3–8 objects on a desk or floor with clear space between them, then
            take one photo. Pens become platforms, mugs become bounce pads, scissors
            become hazards.
          </p>
          <CameraCapture onSelect={handleSelect} />
          {error ? (
            <p className="font-mono text-xs text-marquee" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      ) : null}

      {phase === "working" && previewUrl ? (
        <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
          <ScanAnimation imageUrl={previewUrl} scanning />
          <div className="panel">
            <h2 className="marquee-title mb-3 text-lg text-token">
              Building your game
            </h2>
            <GenerationProgress current={step} />
          </div>
        </div>
      ) : null}

      {phase === "ready" && result ? (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <DifficultyBadge difficulty={result.gameSpec.difficulty} />
              <span className="font-mono text-xs uppercase text-paper/60">
                {result.gameSpec.source.detectedObjectCount} objects ·{" "}
                {result.gameSpec.theme} theme ·{" "}
                {Math.round(result.generationMetadata.latencyMs / 100) / 10}s
              </span>
            </div>
            <button type="button" className="btn-ghost text-xs" onClick={reset}>
              Start over with a new photo
            </button>
          </div>

          {result.generationMetadata.fallbackUsed ? (
            <p className="rounded-xl border-2 border-marquee bg-marquee/10 p-3 font-mono text-xs text-paper">
              We could not read the photo clearly, so we built a simple playable
              level instead. Try again with brighter light and more space between
              objects.
            </p>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
            <GamePlayer
              gameId={result.gameId}
              spec={result.gameSpec}
              sourceImageUrl={previewUrl ?? undefined}
              recordEvents={false}
            />
            <div className="space-y-6">
              <PublishPanel
                gameId={result.gameId}
                defaultTitle={result.gameSpec.title}
              />
              <div className="panel">
                <h2 className="marquee-title mb-3 text-lg text-token">
                  What we found
                </h2>
                <ul className="space-y-1 font-mono text-xs text-paper/80">
                  {result.gameSpec.entities
                    .filter((entity) => entity.sourceLabel)
                    .map((entity) => (
                      <li key={entity.id}>
                        {entity.sourceLabel} → {entity.mechanic.replace(/_/g, " ")}
                      </li>
                    ))}
                </ul>
                {result.gameSpec.validation.repairActions.length > 0 ? (
                  <details className="mt-3 font-mono text-[11px] text-paper/60">
                    <summary className="cursor-pointer">
                      Playability fixes applied
                    </summary>
                    <ul className="mt-2 space-y-1">
                      {result.gameSpec.validation.repairActions.map((action) => (
                        <li key={action}>{action}</li>
                      ))}
                    </ul>
                  </details>
                ) : null}
              </div>
              <Link href="/arcade" className="btn-ghost w-full">
                Browse the arcade
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
