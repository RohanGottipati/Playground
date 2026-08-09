import { afterEach, describe, expect, it, vi } from "vitest";
import {
  addUserObjectsScanned,
  getUserObjectsScannedCount,
} from "@/lib/analytics/objectsScanned";

describe("browser-local scanned object count", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("sanitizes stored values and increments successful scans", () => {
    const values = new Map<string, string>();
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
      },
    });

    expect(getUserObjectsScannedCount()).toBe(0);
    expect(addUserObjectsScanned(4)).toBe(4);
    expect(addUserObjectsScanned(3)).toBe(7);
    expect(addUserObjectsScanned(0)).toBe(7);

    values.set("user_objects_scanned_count", "not-a-number");
    expect(getUserObjectsScannedCount()).toBe(0);
  });
});
