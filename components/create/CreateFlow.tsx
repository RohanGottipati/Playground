"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { GamePlayer } from "@/components/game/GamePlayer";
import { DifficultyBadge, ModeBadge } from "@/components/ui/Badge";
import { addUserObjectsScanned } from "@/lib/analytics/objectsScanned";
import { compressImage } from "@/lib/utils/imageCompression";
import type { SceneAnalysis } from "@/lib/backboard/schemas";
import type { GameSpec } from "@/game/types";
import { CameraCapture } from "./CameraCapture";
import { GenerationProgress, type GenerationStep } from "./GenerationProgress";
import { PublishPanel } from "./PublishPanel";
import {
  RemoteCapturePanel,
  type RemoteCaptureState,
} from "./RemoteCapturePanel";
import { ScanAnimation } from "./ScanAnimation";

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

type Preview = { url: string; localObjectUrl: boolean };

type RemoteCaptureSession = {
  captureUrl: string;
  statusToken: string;
  expiresAt: string;
  state: RemoteCaptureState;
  error?: string | null;
};

type CaptureSessionResponse = ApiErrorBody & {
  capturePath?: string;
  statusToken?: string;
  expiresAt?: string;
};

type CaptureStatusResponse = ApiErrorBody & {
  status?: "pending" | "expired" | "cancelled" | "ready";
  upload?: UploadResult;
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
  const [preview, setPreview] = useState<Preview | null>(null);
  const [uploaded, setUploaded] = useState<UploadResult | null>(null);
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [error, setError] = useState<FlowError | null>(null);
  const [remoteSession, setRemoteSession] =
    useState<RemoteCaptureSession | null>(null);
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const remoteTokenRef = useRef<string | null>(null);
  const handledRemoteRef = useRef<string | null>(null);
  const previewUrl = preview?.url ?? null;

  const replacePreview = useCallback((next: Preview | null) => {
    setPreview((current) => {
      if (current?.localObjectUrl) URL.revokeObjectURL(current.url);
      return next;
    });
  }, []);

  const disposeRemoteSession = useCallback((statusToken: string) => {
    void fetch("/api/capture-sessions/status", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${statusToken}` },
      keepalive: true,
    }).catch(() => undefined);
  }, []);

  const cancelRemoteCapture = useCallback(() => {
    const statusToken = remoteTokenRef.current;
    remoteTokenRef.current = null;
    handledRemoteRef.current = null;
    setRemoteSession(null);
    setCaptureError(null);
    if (statusToken) disposeRemoteSession(statusToken);
  }, [disposeRemoteSession]);

  useEffect(
    () => () => {
      const statusToken = remoteTokenRef.current;
      if (statusToken) disposeRemoteSession(statusToken);
    },
    [disposeRemoteSession],
  );

  const reset = useCallback(() => {
    cancelRemoteCapture();
    setPhase("capture");
    setStep("upload");
    setUploaded(null);
    setResult(null);
    setError(null);
    replacePreview(null);
  }, [cancelRemoteCapture, replacePreview]);

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
      addUserObjectsScanned(generated.gameSpec.source.detectedObjectCount);
      setStep("validate");
      setStep("done");
      setPhase("ready");
    },
    [parentGameId],
  );

  const handleSelect = useCallback(
    async (file: File) => {
      cancelRemoteCapture();
      setError(null);
      setResult(null);
      setUploaded(null);
      setPhase("working");
      setStep("upload");
      const localUrl = URL.createObjectURL(file);
      replacePreview({ url: localUrl, localObjectUrl: true });

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
    [cancelRemoteCapture, generateUploaded, replacePreview],
  );

  const processRemoteUpload = useCallback(
    async (upload: UploadResult) => {
      setError(null);
      setResult(null);
      setUploaded(upload);
      setPhase("working");
      setStep("upload");
      replacePreview({ url: upload.imageUrl, localObjectUrl: false });
      try {
        await generateUploaded(upload);
      } catch (cause) {
        console.error("remote create flow failed", cause);
        setError(flowError(cause));
        setPhase("failed");
      }
    },
    [generateUploaded, replacePreview],
  );

  const startRemoteCapture = useCallback(async () => {
    const previousToken = remoteTokenRef.current;
    if (previousToken) disposeRemoteSession(previousToken);
    remoteTokenRef.current = null;
    handledRemoteRef.current = null;
    setRemoteSession(null);
    setCaptureError(null);
    setRemoteLoading(true);
    try {
      const response = await fetch("/api/capture-sessions", { method: "POST" });
      const body = (await response.json()) as CaptureSessionResponse;
      if (
        !response.ok ||
        !body.capturePath ||
        !body.statusToken ||
        !body.expiresAt
      ) {
        throw requestError(
          body,
          "We could not create a phone capture link.",
          response.status >= 500 || response.status === 429,
        );
      }
      const session: RemoteCaptureSession = {
        captureUrl: new URL(body.capturePath, window.location.origin).toString(),
        statusToken: body.statusToken,
        expiresAt: body.expiresAt,
        state: "waiting",
      };
      remoteTokenRef.current = session.statusToken;
      setRemoteSession(session);
    } catch (cause) {
      setCaptureError(flowError(cause).message);
    } finally {
      setRemoteLoading(false);
    }
  }, [disposeRemoteSession]);

  useEffect(() => {
    if (!remoteSession || remoteSession.state !== "waiting") return;
    const { statusToken, expiresAt } = remoteSession;
    let stopped = false;
    let timer: number | undefined;
    let controller: AbortController | undefined;
    let failures = 0;

    const schedule = (delay: number) => {
      if (!stopped) timer = window.setTimeout(() => void poll(), delay);
    };

    const poll = async () => {
      if (stopped) return;
      if (Date.now() >= new Date(expiresAt).getTime()) {
        setRemoteSession((current) =>
          current?.statusToken === statusToken
            ? { ...current, state: "expired" }
            : current,
        );
        return;
      }

      controller = new AbortController();
      try {
        const response = await fetch("/api/capture-sessions/status", {
          headers: { Authorization: `Bearer ${statusToken}` },
          cache: "no-store",
          signal: controller.signal,
        });
        const body = (await response.json()) as CaptureStatusResponse;
        if (!response.ok) {
          throw requestError(
            body,
            "We lost the phone connection.",
            response.status >= 500 || response.status === 429,
          );
        }

        failures = 0;
        if (body.status === "ready" && body.upload) {
          if (handledRemoteRef.current === statusToken) return;
          handledRemoteRef.current = statusToken;
          remoteTokenRef.current = null;
          setRemoteSession(null);
          disposeRemoteSession(statusToken);
          void processRemoteUpload(body.upload);
          return;
        }
        if (body.status === "expired" || body.status === "cancelled") {
          setRemoteSession((current) =>
            current?.statusToken === statusToken
              ? {
                  ...current,
                  state: body.status === "expired" ? "expired" : "error",
                  error:
                    body.status === "cancelled"
                      ? "This phone capture was cancelled."
                      : undefined,
                }
              : current,
          );
          return;
        }
        schedule(1500);
      } catch (cause) {
        if (controller.signal.aborted) return;
        failures += 1;
        if (failures >= 3) {
          setRemoteSession((current) =>
            current?.statusToken === statusToken
              ? { ...current, state: "error", error: flowError(cause).message }
              : current,
          );
          return;
        }
        schedule(3000);
      }
    };

    void poll();
    return () => {
      stopped = true;
      if (timer) window.clearTimeout(timer);
      controller?.abort();
    };
  }, [disposeRemoteSession, processRemoteUpload, remoteSession]);

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
        <div className="panel space-y-4">
          <h1 className="marquee-title text-2xl text-token">
            Photograph an object
          </h1>
          <p className="font-body text-sm text-paper/80">
            Photograph one object or arrange several on a desk or floor. Keep
            each object fully visible with clear space around it so its shape
            and position can become part of the level.
          </p>
          {remoteSession ? (
            <RemoteCapturePanel
              captureUrl={remoteSession.captureUrl}
              expiresAt={remoteSession.expiresAt}
              state={remoteSession.state}
              error={remoteSession.error}
              onCancel={cancelRemoteCapture}
              onRegenerate={() => void startRemoteCapture()}
            />
          ) : null}
          {captureError ? (
            <p className="font-mono text-xs text-marquee" role="alert">
              {captureError}
            </p>
          ) : null}
          <CameraCapture
            onSelect={handleSelect}
            onRemoteCapture={() => void startRemoteCapture()}
            remoteLoading={remoteLoading}
            showTakeButton={!remoteSession}
          />
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

      {phase === "failed" && previewUrl && error ? (
        <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
          <ScanAnimation imageUrl={previewUrl} scanning={false} />
          <div className="panel space-y-4">
            <h2 className="marquee-title text-lg text-marquee">
              We could not analyze this photo
            </h2>
            <p className="font-mono text-xs text-paper/80" role="alert">
              {error.message}
            </p>
            <div className="flex flex-wrap gap-3">
              {error.retryable && uploaded ? (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => void retryAnalysis()}
                >
                  Retry analysis
                </button>
              ) : null}
              <button type="button" className="btn-secondary" onClick={reset}>
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
              <ModeBadge mode={result.gameSpec.mode ?? "classic"} />
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
                <div className="panel">
                  <h2 className="marquee-title mb-2 text-lg text-token">
                    {result.gameSpec.rules.headline}
                  </h2>
                  <p className="font-body text-sm text-paper/80">
                    {result.gameSpec.rules.objective}
                  </p>
                </div>
              ) : null}
              <div className="panel">
                <h2 className="marquee-title mb-3 text-lg text-token">
                  What we found
                </h2>
                <div className="flex flex-wrap gap-2">
                  {result.gameSpec.entities
                    .filter((entity) => entity.sourceLabel)
                    .map((entity) => (
                      <span
                        key={entity.id}
                        className="rounded-full border-2 border-ink bg-cabinet px-3 py-1 font-mono text-[11px] text-paper/80"
                      >
                        {entity.mechanic.replace(/_/g, " ")}
                      </span>
                    ))}
                </div>
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
              {result.gameSpec.magicPatterns?.editorUrl ? (
                <div className="panel space-y-2">
                  <h2 className="marquee-title text-lg text-token">
                    Design kit
                  </h2>
                  <p className="font-mono text-xs text-paper/70">
                    Magic Patterns generated a matching art direction for this
                    level and tinted its palette.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href={result.gameSpec.magicPatterns.editorUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-secondary px-3 py-2 text-xs"
                    >
                      Open design in Magic Patterns editor ↗
                    </a>
                    {result.gameSpec.magicPatterns.previewUrl ? (
                      <a
                        href={result.gameSpec.magicPatterns.previewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-ghost px-3 py-2 text-xs"
                      >
                        Preview ↗
                      </a>
                    ) : null}
                  </div>
                </div>
              ) : null}
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
