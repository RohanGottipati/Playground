"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { GamePlayer } from "@/components/game/GamePlayer";
import { compressImage } from "@/lib/utils/imageCompression";
import type { SceneAnalysis } from "@/lib/backboard/schemas";
import type { GameSpec } from "@/game/types";
import { CameraCapture } from "./CameraCapture";
import { GenerationProgress, type GenerationStep } from "./GenerationProgress";
import { PublishPanel } from "./PublishPanel";
import { ScanAnimation } from "./ScanAnimation";
import { modeMeta, tierFor } from "@/components/ui/difficulty";

type GenerateResponse = {
  gameId: string;
  sceneAnalysis: SceneAnalysis;
  gameSpec: GameSpec;
  generationMetadata: {
    latencyMs: number;
    attempts: number;
    status: string;
    warnings: string[];
    provider: string;
    model: string;
  };
};

type UploadResult = {
  gameId: string;
  imagePath: string;
  imageUrl: string;
};

type ApiErrorBody = {
  error?: {
    message?: string;
    retryable?: boolean;
  };
};

type FlowError = {
  message: string;
  retryable: boolean;
};

type Phase = "capture" | "working" | "failed" | "ready";

class FlowRequestError extends Error {
  readonly retryable: boolean;

  constructor(message: string, retryable: boolean) {
    super(message);
    this.name = "FlowRequestError";
    this.retryable = retryable;
  }
}

function requestError(
  body: ApiErrorBody,
  fallback: string,
  defaultRetryable: boolean,
): FlowRequestError {
  return new FlowRequestError(
    body.error?.message ?? fallback,
    body.error?.retryable ?? defaultRetryable,
  );
}

function flowError(cause: unknown): FlowError {
  if (cause instanceof FlowRequestError) {
    return { message: cause.message, retryable: cause.retryable };
  }
  return {
    message:
      cause instanceof Error
        ? cause.message
        : "Something went wrong. Please try another photo.",
    retryable: true,
  };
}

export function CreateFlow({ parentGameId }: { parentGameId?: string }) {
  const [phase, setPhase] = useState<Phase>("capture");
  const [step, setStep] = useState<GenerationStep>("upload");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState<UploadResult | null>(null);
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [error, setError] = useState<FlowError | null>(null);

  const reset = useCallback(() => {
    setPhase("capture");
    setStep("upload");
    setUploaded(null);
    setResult(null);
    setError(null);
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
  }, []);

  const generateUploaded = useCallback(
    async (upload: UploadResult) => {
      setError(null);
      setPhase("working");
      setStep("analyze");

      // One request powers analysis + design; sequence the visuals optimistically.
      const designTimer = setTimeout(() => setStep("design"), 8000);
      const mapTimer = setTimeout(() => setStep("map"), 16000);

      let response: Response;
      let generated: GenerateResponse & ApiErrorBody;
      try {
        response = await fetch("/api/games/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...upload, parentGameId }),
        });
        generated = (await response.json()) as GenerateResponse & ApiErrorBody;
      } finally {
        clearTimeout(designTimer);
        clearTimeout(mapTimer);
      }
      if (!response.ok) {
        throw requestError(
          generated,
          "We could not build a game from that photo.",
          response.status >= 500 || response.status === 429,
        );
      }

      setStep("build");
      setResult(generated);
      setStep("validate");
      setStep("done");
      setPhase("ready");
    },
    [parentGameId],
  );

  const handleSelect = useCallback(
    async (file: File) => {
      setError(null);
      setResult(null);
      setUploaded(null);
      setPhase("working");
      setStep("upload");
      const localUrl = URL.createObjectURL(file);
      setPreviewUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return localUrl;
      });

      try {
        const compressed = await compressImage(file);
        const form = new FormData();
        form.append("file", compressed);

        const response = await fetch("/api/uploads", {
          method: "POST",
          body: form,
        });
        const body = (await response.json()) as Partial<UploadResult> & ApiErrorBody;
        if (
          !response.ok ||
          !body.gameId ||
          !body.imagePath ||
          !body.imageUrl
        ) {
          throw requestError(
            body,
            "We could not accept that photo.",
            response.status >= 500 || response.status === 429,
          );
        }

        const upload: UploadResult = {
          gameId: body.gameId,
          imagePath: body.imagePath,
          imageUrl: body.imageUrl,
        };
        setUploaded(upload);
        await generateUploaded(upload);
      } catch (cause) {
        console.error("create flow failed", cause);
        setError(flowError(cause));
        setPhase("failed");
      }
    },
    [generateUploaded],
  );

  const retryAnalysis = useCallback(async () => {
    if (!uploaded) return;
    try {
      await generateUploaded(uploaded);
    } catch (cause) {
      console.error("analysis retry failed", cause);
      setError(flowError(cause));
      setPhase("failed");
    }
  }, [generateUploaded, uploaded]);

  return (
    <div className="space-y-6">
      {phase === "capture" ? (
        <div className="space-y-4 rounded-3xl bg-appleBg p-6">
          <h2
            className="font-inter font-medium text-appleInk"
            style={{ fontSize: 20, letterSpacing: "-0.03em" }}
          >
            Photograph an object
          </h2>
          <p className="font-inter text-sm text-appleGray" style={{ letterSpacing: "-0.01em" }}>
            Photograph one object or arrange several on a desk or floor. Keep
            each object fully visible with clear space around it so its shape
            and position can become part of the level.
          </p>
          <CameraCapture onSelect={handleSelect} />
        </div>
      ) : null}

      {phase === "working" && previewUrl ? (
        <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
          <ScanAnimation imageUrl={previewUrl} scanning />
          <div className="rounded-3xl bg-appleBg p-6">
            <h2
              className="mb-4 font-inter font-medium text-appleInk"
              style={{ fontSize: 18, letterSpacing: "-0.02em" }}
            >
              Building your game
            </h2>
            <GenerationProgress current={step} />
          </div>
        </div>
      ) : null}

      {phase === "failed" && previewUrl && error ? (
        <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
          <ScanAnimation imageUrl={previewUrl} scanning={false} />
          <div className="space-y-4 rounded-3xl bg-appleBg p-6">
            <h2
              className="font-inter font-medium text-appleInk"
              style={{ fontSize: 18, letterSpacing: "-0.02em" }}
            >
              We could not analyze this photo
            </h2>
            <p className="font-inter text-sm text-appleGray" style={{ letterSpacing: "-0.01em" }} role="alert">
              {error.message}
            </p>
            <div className="flex flex-wrap gap-3">
              {error.retryable && uploaded ? (
                <button
                  type="button"
                  onClick={() => void retryAnalysis()}
                  className="rounded-full bg-appleInk px-5 py-2.5 font-inter text-sm font-medium text-white transition hover:bg-black"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  Retry analysis
                </button>
              ) : null}
              <button
                type="button"
                onClick={reset}
                className="rounded-full border border-appleGray/30 px-5 py-2.5 font-inter text-sm font-medium text-appleInk transition hover:border-appleGray/60"
                style={{ letterSpacing: "-0.02em" }}
              >
                Choose another photo
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {phase === "ready" && result ? (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="rounded-full bg-appleBg px-3 py-1 font-inter text-xs font-medium text-appleInk"
                style={{ letterSpacing: "-0.01em" }}
              >
                {modeMeta(result.gameSpec.mode ?? "classic").label}
              </span>
              <span
                className="rounded-full bg-appleBg px-3 py-1 font-inter text-xs font-medium text-appleInk"
                style={{ letterSpacing: "-0.01em" }}
              >
                {tierFor(result.gameSpec.difficulty).label}
              </span>
              <span
                className="font-inter text-xs text-appleGray"
                style={{ letterSpacing: "-0.01em" }}
              >
                {result.gameSpec.source.detectedObjectCount} objects ·{" "}
                {result.gameSpec.theme} theme ·{" "}
                {Math.round(result.generationMetadata.latencyMs / 100) / 10}s
              </span>
            </div>
            <button
              type="button"
              onClick={reset}
              className="font-inter text-xs font-medium text-appleBlue hover:underline"
              style={{ letterSpacing: "-0.01em" }}
            >
              Start over with a new photo
            </button>
          </div>

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
              {result.gameSpec.rules ? (
                <div className="space-y-1 rounded-3xl bg-appleBg p-6">
                  <h2
                    className="font-inter font-medium text-appleInk"
                    style={{ fontSize: 16, letterSpacing: "-0.02em" }}
                  >
                    {result.gameSpec.rules.headline}
                  </h2>
                  <p className="font-inter text-sm text-appleGray" style={{ letterSpacing: "-0.01em" }}>
                    {result.gameSpec.rules.objective}
                  </p>
                </div>
              ) : null}
              <div className="rounded-3xl bg-appleBg p-6">
                <h2
                  className="mb-3 font-inter font-medium text-appleInk"
                  style={{ fontSize: 16, letterSpacing: "-0.02em" }}
                >
                  What we found
                </h2>
                <div className="flex flex-wrap gap-2">
                  {result.gameSpec.entities
                    .filter((entity) => entity.sourceLabel)
                    .map((entity) => (
                      <span
                        key={entity.id}
                        className="rounded-full bg-white px-3 py-1 font-inter text-xs text-appleGray"
                        style={{ letterSpacing: "-0.01em" }}
                      >
                        {entity.sourceLabel} →{" "}
                        {entity.mechanic.replace(/_/g, " ")}
                      </span>
                    ))}
                </div>
                {result.gameSpec.validation.repairActions.length > 0 ? (
                  <details
                    className="mt-3 font-inter text-xs text-appleGray"
                    style={{ letterSpacing: "-0.01em" }}
                  >
                    <summary className="cursor-pointer text-appleInk">
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
              {result.gameSpec.magicPatterns?.editorUrl ? (
                <div className="space-y-2 rounded-3xl bg-appleBg p-6">
                  <h2
                    className="font-inter font-medium text-appleInk"
                    style={{ fontSize: 16, letterSpacing: "-0.02em" }}
                  >
                    Design kit
                  </h2>
                  <p className="font-inter text-xs text-appleGray" style={{ letterSpacing: "-0.01em" }}>
                    Magic Patterns generated a matching art direction for this
                    level and tinted its palette.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href={result.gameSpec.magicPatterns.editorUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-appleGray/30 px-4 py-2 font-inter text-xs font-medium text-appleInk transition hover:border-appleGray/60"
                      style={{ letterSpacing: "-0.01em" }}
                    >
                      Open design in Magic Patterns editor ↗
                    </a>
                    {result.gameSpec.magicPatterns.previewUrl ? (
                      <a
                        href={result.gameSpec.magicPatterns.previewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full px-4 py-2 font-inter text-xs font-medium text-appleBlue transition hover:underline"
                        style={{ letterSpacing: "-0.01em" }}
                      >
                        Preview ↗
                      </a>
                    ) : null}
                  </div>
                </div>
              ) : null}
              <Link
                href="/playground"
                className="block w-full rounded-full border border-appleGray/30 py-2.5 text-center font-inter text-sm font-medium text-appleInk transition hover:border-appleGray/60"
                style={{ letterSpacing: "-0.02em" }}
              >
                Browse the Playground
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
