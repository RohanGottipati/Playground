"use client";

type Phase = "capture" | "working" | "failed" | "ready";

const STEPS: { id: "capture" | "build" | "publish"; label: string }[] = [
  { id: "capture", label: "Capture" },
  { id: "build", label: "Scan & build" },
  { id: "publish", label: "Publish" },
];

function phaseToStepId(phase: Phase): "capture" | "build" | "publish" {
  if (phase === "ready") return "publish";
  if (phase === "capture") return "capture";
  return "build";
}

/** Mirrors the section-title rhythm used on Playground/Stats so the create
 * flow reads as one more step-by-step section of the same site, not a
 * separate wizard. */
export function CreateSteps({ phase }: { phase: Phase }) {
  const activeIndex = STEPS.findIndex((step) => step.id === phaseToStepId(phase));

  return (
    <ol className="flex items-center" aria-label="Game creation progress">
      {STEPS.map((step, index) => {
        const complete = index < activeIndex;
        const active = index === activeIndex;
        return (
          <li key={step.id} className="flex flex-1 items-center last:flex-none">
            <div className="flex items-center gap-2">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-inter text-xs font-medium transition-colors ${
                  complete
                    ? "bg-appleInk text-white"
                    : active
                      ? "bg-appleBlue text-white"
                      : "bg-appleBg text-appleGray"
                }`}
                aria-hidden
              >
                {complete ? "✓" : index + 1}
              </span>
              <span
                className={`font-inter text-sm font-medium ${
                  complete || active ? "text-appleInk" : "text-appleGray"
                }`}
                style={{ letterSpacing: "-0.01em" }}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 ? (
              <span
                className={`mx-3 h-px flex-1 transition-colors ${
                  complete ? "bg-appleInk" : "bg-appleGray/20"
                }`}
                aria-hidden
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
