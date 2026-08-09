"use client";

export type GenerationStep =
  | "upload"
  | "analyze"
  | "design"
  | "map"
  | "build"
  | "validate"
  | "done";

const STEPS: { id: GenerationStep; label: string }[] = [
  { id: "upload", label: "Uploading your photo" },
  { id: "analyze", label: "Finding objects" },
  { id: "design", label: "Designing the art kit (Magic Patterns)" },
  { id: "map", label: "Turning objects into mechanics" },
  { id: "build", label: "Building the level" },
  { id: "validate", label: "Checking it can be finished" },
];

export function GenerationProgress({
  current,
}: {
  current: GenerationStep;
}) {
  const currentIndex = STEPS.findIndex((step) => step.id === current);

  return (
    <ol className="space-y-3" aria-live="polite">
      {STEPS.map((step, index) => {
        const complete = current === "done" || index < currentIndex;
        const active = index === currentIndex && current !== "done";
        return (
          <li key={step.id} className="flex items-center gap-3">
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-inter text-[11px] font-medium ${
                complete
                  ? "bg-appleInk text-white"
                  : active
                    ? "animate-pulse bg-appleBlue text-white"
                    : "bg-appleBg text-appleGray"
              }`}
              aria-hidden
            >
              {complete ? "✓" : index + 1}
            </span>
            <span
              className={`font-inter text-sm ${
                complete || active ? "text-appleInk" : "text-appleGray"
              }`}
              style={{ letterSpacing: "-0.01em" }}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
