type CaptureDeviceSignals = {
  userAgent: string;
  maxTouchPoints: number;
  mobileHint?: boolean;
  coarsePointer: boolean;
  narrowViewport: boolean;
};

/** Phones use their own camera; desktop-class devices get the QR handoff. */
export function shouldCaptureDirectly(signals: CaptureDeviceSignals): boolean {
  if (signals.mobileHint === true) return true;
  if (/Android|iPhone|iPad|iPod|Mobile/i.test(signals.userAgent)) return true;
  return (
    signals.maxTouchPoints > 0 &&
    signals.coarsePointer &&
    signals.narrowViewport
  );
}

export function currentDeviceCapturesDirectly(): boolean {
  if (typeof window === "undefined") return false;
  const navigatorWithData = navigator as Navigator & {
    userAgentData?: { mobile?: boolean };
  };
  return shouldCaptureDirectly({
    userAgent: navigator.userAgent,
    maxTouchPoints: navigator.maxTouchPoints,
    mobileHint: navigatorWithData.userAgentData?.mobile,
    coarsePointer: window.matchMedia("(pointer: coarse)").matches,
    narrowViewport: window.matchMedia("(max-width: 767px)").matches,
  });
}
