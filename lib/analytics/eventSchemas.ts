import { z } from "zod";

export const GameEventTypeSchema = z.enum([
  "image_uploaded",
  "generation_started",
  "generation_completed",
  "generation_failed",
  "game_published",
  "game_started",
  "player_died",
  "collectible_collected",
  "checkpoint_reached",
  "game_completed",
  "game_restarted",
  "game_remixed",
  "mechanic_discovered",
]);

const PayloadValueSchema = z.union([z.string().max(200), z.number(), z.boolean()]);

export const EventRequestSchema = z.object({
  gameId: z.string().uuid(),
  sessionId: z.string().uuid().optional(),
  anonymousSessionId: z.string().min(6).max(64).optional(),
  eventType: GameEventTypeSchema,
  payload: z.record(z.string().max(40), PayloadValueSchema).optional(),
  /** Client-reported run state, sanity-checked server-side. */
  run: z
    .object({
      elapsedMs: z.number().int().min(0).max(3_600_000).optional(),
      deaths: z.number().int().min(0).max(999).optional(),
      collectibles: z.number().int().min(0).max(99).optional(),
    })
    .optional(),
});

export type EventRequest = z.infer<typeof EventRequestSchema>;

export const MAX_EVENT_PAYLOAD_BYTES = 2048;

export const PublishRequestSchema = z.object({
  gameId: z.string().uuid(),
  title: z.string().min(1).max(80),
  creatorName: z.string().max(40).optional(),
});

export const GenerateRequestSchema = z.object({
  gameId: z.string().uuid(),
  imagePath: z.string().min(1).max(300),
  imageUrl: z.string().min(1).max(500),
  parentGameId: z.string().uuid().optional(),
});

export const SessionRequestSchema = z.object({
  gameId: z.string().uuid(),
  anonymousSessionId: z.string().min(6).max(64),
});

export const LikeRequestSchema = z.object({
  gameId: z.string().uuid(),
  anonymousSessionId: z.string().min(6).max(64),
});
