import { describe, expect, it } from "vitest";
import { shouldCaptureDirectly } from "@/lib/utils/deviceCapture";

describe("capture device choice", () => {
  it("keeps phones on their native camera", () => {
    expect(
      shouldCaptureDirectly({
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)",
        maxTouchPoints: 5,
        coarsePointer: true,
        narrowViewport: true,
      }),
    ).toBe(true);
  });

  it("sends desktop-class devices to the QR handoff", () => {
    expect(
      shouldCaptureDirectly({
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        maxTouchPoints: 0,
        mobileHint: false,
        coarsePointer: false,
        narrowViewport: false,
      }),
    ).toBe(false);
  });

  it("treats a narrow coarse touch device as mobile without UA hints", () => {
    expect(
      shouldCaptureDirectly({
        userAgent: "Unknown browser",
        maxTouchPoints: 2,
        coarsePointer: true,
        narrowViewport: true,
      }),
    ).toBe(true);
  });
});
