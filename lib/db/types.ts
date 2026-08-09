import type { GameSpec, GameEventType, MechanicType } from "@/game/types";
import type { ComponentCatalogEntry } from "@/game/components/types";
import type { GenerationHints } from "@/game/generation/hints";
import type { SceneAnalysis } from "@/lib/backboard/schemas";

export type GameStatus = "draft" | "published" | "failed";

export type GameRecord = {
  id: string;
  slug: string | null;
  title: string;
  creatorName: string;
  status: GameStatus;
  sourceImagePath: string;
  sourceImageUrl: string;
  thumbnailPath: string | null;
  sceneAnalysis: SceneAnalysis;
  gameSpec: GameSpec;
  theme: string;
  difficulty: number;
  detectedObjectCount: number;
  generationLatencyMs: number | null;
  generationAttemptCount: number;
  generationStatus: string;
  llmProvider: string | null;
  modelName: string | null;
  backboardAssistantId: string | null;
  backboardThreadId: string | null;
  aiSchemaVersion: string | null;
  parentGameId: string | null;
  publishedAt: string | null;
  createdAt: string;
  isDemo: boolean;
};

export type GameObjectRecord = {
  id: string;
  gameId: string;
  sourceObjectId: string;
  label: string;
  normalizedBounds: { x: number; y: number; width: number; height: number };
  properties: string[];
  suggestedRole: string | null;
  finalMechanic: MechanicType | null;
  confidence: number | null;
};

export type GameSessionRecord = {
  id: string;
  gameId: string;
  anonymousSessionId: string;
  startedAt: string;
  completedAt: string | null;
  durationMs: number | null;
  deathCount: number;
  collectiblesCollected: number;
  completed: boolean;
  userAgent: string | null;
};

export type GameEventRecord = {
  id: number;
  gameId: string;
  sessionId: string | null;
  eventType: GameEventType;
  eventPayload: Record<string, unknown>;
  createdAt: string;
};

export type MechanicDiscoveryRecord = {
  id: string;
  objectLabel: string;
  normalizedObjectLabel: string;
  mechanic: string;
  firstGameId: string | null;
  discoveryCount: number;
  discoveredAt: string;
};

export type GameSummary = {
  id: string;
  slug: string;
  title: string;
  creatorName: string;
  theme: string;
  mode: string;
  difficulty: number;
  sourceImageUrl: string;
  detectedObjectCount: number;
  publishedAt: string | null;
  plays: number;
  completions: number;
  deaths: number;
  completionRate: number;
  fastestMs: number | null;
  likes: number;
  remixes: number;
  parentGameId: string | null;
  isDemo: boolean;
};

export type ArcadeSort =
  /** Campaign order: gentlest first, so the arcade ramps up as it scrolls. */
  | "campaign"
  | "newest"
  | "trending"
  | "hardest"
  | "fastest"
  | "most_remixed";

export type LeaderboardEntry = {
  rank: number;
  creatorLabel: string;
  durationMs: number;
  deaths: number;
  completedAt: string;
};

export type Leaderboard = {
  gameId: string;
  plays: number;
  completions: number;
  deaths: number;
  completionRate: number;
  fastestMs: number | null;
  entries: LeaderboardEntry[];
};

export type StatsSnapshot = {
  publishedGames: number;
  objectsScanned: number;
  gamesPlayed: number;
  completedRuns: number;
  totalDeaths: number;
  averageCompletionRate: number;
  mechanicsDiscovered: number;
  remixesCreated: number;
  topObjects: { label: string; count: number }[];
  mechanicUsage: { mechanic: string; count: number }[];
  gamesOverTime: { date: string; count: number }[];
  difficultyVsCompletion: {
    slug: string;
    title: string;
    difficulty: number;
    completionRate: number;
    plays: number;
  }[];
  recentActivity: {
    type: string;
    label: string;
    createdAt: string;
  }[];
  discoveries: MechanicDiscoveryRecord[];
};

export type SaveDraftInput = {
  id: string;
  title: string;
  sourceImagePath: string;
  sourceImageUrl: string;
  sceneAnalysis: SceneAnalysis;
  gameSpec: GameSpec;
  generationLatencyMs: number;
  generationAttemptCount: number;
  generationStatus: string;
  llmProvider?: string;
  modelName?: string;
  backboardAssistantId?: string;
  backboardThreadId?: string;
  aiSchemaVersion?: string;
  parentGameId?: string | null;
};

export type PublishInput = {
  id: string;
  title: string;
  creatorName: string;
  slug: string;
};

export type RecordEventInput = {
  gameId: string;
  sessionId?: string | null;
  eventType: GameEventType;
  payload?: Record<string, unknown>;
};

/**
 * The only two gameplay actions the live ticker narrates: round completions
 * and fatalities. Everything else is still recorded, just never rendered
 * in the feed.
 */
export type TickerEventType = "death" | "clear";

export const TICKER_EVENT_TYPES: TickerEventType[] = ["death", "clear"];

/**
 * The only events that move the "active sessions" count: starting a run
 * (a new session_id appears — the count goes up) and progress/completion on
 * an already-started run (keeps that session's 5-minute window rolling).
 * Nothing else — not deaths, not likes, not any other event type — affects
 * this number. A session drops out of the count once none of these have
 * fired for it in 5 minutes.
 */
export const ACTIVE_SESSION_EVENT_TYPES: GameEventType[] = [
  "game_started",
  "checkpoint_reached",
  "collectible_collected",
  "game_completed",
];

export type SpatialEventRecord = {
  gameId: string;
  gameTitle: string;
  eventType: TickerEventType;
  city: string;
  x: number | null;
  y: number | null;
  durationSeconds: number | null;
  createdAt: string;
};

export type TelemetrySnapshot = {
  deathTotalsByGame: Record<string, number>;
  /** Events seen per game in the last 5 minutes — a rolling proxy for "currently playing". */
  activeSessionsByGame: Record<string, number>;
  recentSpatialEvents: SpatialEventRecord[];
};

/** One fastest-completion row for the per-game Best Runtimes Leaderboard. */
export type RuntimeLeaderboardEntry = {
  city: string;
  durationSeconds: number;
};

export type SessionUpdate = {
  deathCount?: number;
  collectiblesCollected?: number;
  completed?: boolean;
  durationMs?: number;
};

/** One row of the learning loop: what generation produced for a game. */
export type GenerationInsightInput = {
  gameId: string;
  mode: string;
  seed: number;
  theme: string;
  difficulty: number;
  title: string;
  objectLabels: string[];
  mechanics: string[];
  magicPatternsId?: string | null;
  magicPatternsEditorUrl?: string | null;
  promptVersion: string;
};

export interface Repository {
  readonly kind: "supabase" | "memory";
  saveDraftGame(input: SaveDraftInput): Promise<GameRecord>;
  getGameById(id: string): Promise<GameRecord | undefined>;
  getGameBySlug(slug: string): Promise<GameRecord | undefined>;
  isSlugTaken(slug: string): Promise<boolean>;
  publishGame(input: PublishInput): Promise<GameRecord>;
  unpublishGame(id: string): Promise<void>;
  listGames(options: {
    sort: ArcadeSort;
    limit: number;
    offset: number;
  }): Promise<GameSummary[]>;
  getGameSummary(gameId: string): Promise<GameSummary | undefined>;
  createSession(input: {
    gameId: string;
    anonymousSessionId: string;
    userAgent?: string | null;
  }): Promise<GameSessionRecord>;
  updateSession(sessionId: string, update: SessionUpdate): Promise<void>;
  recordEvent(input: RecordEventInput): Promise<void>;
  getLeaderboard(gameId: string): Promise<Leaderboard>;
  getStats(): Promise<StatsSnapshot>;
  /**
   * Spatial/geo telemetry dashboard: death heatmaps, per-game fatalities,
   * recent activity feed. Pass `gameId` to scope everything (recent events,
   * fatalities, active sessions) to a single game.
   */
  getTelemetrySnapshot(gameId?: string): Promise<TelemetrySnapshot>;
  /**
   * Fastest `clear` completions recorded for a single game, sorted by
   * lowest durationSeconds. Powers the Best Runtimes Leaderboard.
   */
  getFastestRuntimes(gameId: string, limit: number): Promise<RuntimeLeaderboardEntry[]>;
  toggleLike(gameId: string, anonymousSessionId: string): Promise<number>;
  registerMechanicDiscoveries(
    gameId: string,
    pairs: { label: string; mechanic: string }[],
  ): Promise<MechanicDiscoveryRecord[]>;
  saveGameObjects(
    gameId: string,
    objects: Omit<GameObjectRecord, "id" | "gameId">[],
  ): Promise<void>;
  /** Learning loop: aggregate past generations + play outcomes into hints. */
  getGenerationHints(): Promise<GenerationHints>;
  /** Learning loop: persist what this generation produced. */
  saveGenerationInsight(input: GenerationInsightInput): Promise<void>;
  /**
   * Enabled rows from the component_catalog table, so generation reflects
   * live enable/disable and alias edits. Null when the backing store has no
   * catalog (memory mode) or the query fails — callers fall back to the
   * bundled catalog.
   */
  getEnabledComponentCatalog(): Promise<ComponentCatalogEntry[] | null>;
}
