"use client";

import { useRouter } from "next/navigation";
import { GamePlayer } from "./GamePlayer";
import type { GameSpec } from "@/game/types";

export function GamePageClient({
  gameId,
  slug,
  spec,
  sourceImageUrl,
  detectedObjectCount,
}: {
  gameId: string;
  slug: string;
  spec: GameSpec;
  sourceImageUrl: string;
  detectedObjectCount: number;
}) {
  const router = useRouter();
  const shareUrl =
    typeof window === "undefined" ? undefined : `${window.location.origin}/game/${slug}`;

  return (
    <GamePlayer
      gameId={gameId}
      spec={spec}
      sourceImageUrl={sourceImageUrl}
      shareUrl={shareUrl}
      objectsScannedCount={detectedObjectCount}
      onRemix={() => router.push(`/create?remixOf=${gameId}`)}
    />
  );
}
