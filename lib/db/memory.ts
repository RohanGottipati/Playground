import { randomUUID } from "crypto";
import { AppError } from "@/lib/errors/AppError";
import { normalizeObjectLabel } from "@/lib/utils/sanitize";
import { EMPTY_HINTS, type GenerationHints } from "@/game/generation/hints";
import {
  ACTIVE_SESSION_EVENT_TYPES,
  BEST_RUNTIME_LIMIT,
  MIN_PLAUSIBLE_COMPLETION_MS,
  TELEMETRY_EVENT_TYPES,
} from "./types";
import type { ComponentCatalogEntry } from "@/game/components/types";
import type {
  ArcadeSort,
  GameEventRecord,
  GameObjectRecord,
  GameRecord,
  GameSessionRecord,
  GameSummary,
  GenerationInsightInput,
  Leaderboard,
  MechanicDiscoveryRecord,
  PublishInput,
  RecordEventInput,
  Repository,
  RuntimeLeaderboardEntry,
  SaveDraftInput,
  SessionUpdate,
  SpatialEventRecord,
  StatsSnapshot,
  TelemetrySnapshot,
} from "./types";

type StoredInsight = GenerationInsightInput & { createdAt: string };

type MemoryState = {
  games: Map<string, GameRecord>;
  objects: GameObjectRecord[];
  sessions: Map<string, GameSessionRecord>;
  events: GameEventRecord[];
  likes: Set<string>;
  discoveries: Map<string, MechanicDiscoveryRecord>;
  insights: StoredInsight[];
  eventId: number;
};

const globalState = globalThis as unknown as {
  __playgroundMemoryState?: MemoryState;
};

function state(): MemoryState {
  if (!globalState.__playgroundMemoryState) {
    globalState.__playgroundMemoryState = {
      games: new Map(),
      objects: [],
      sessions: new Map(),
      events: [],
      likes: new Set(),
      discoveries: new Map(),
      insights: [],
      eventId: 1,
    };
  }
  return globalState.__playgroundMemoryState;
}

export function resetMemoryState(): void {
  globalState.__playgroundMemoryState = undefined;
}

/**
 * Development / demo repository used when Supabase credentials are absent.
 * Data lives in the server process only and is lost on restart.
 */
export class MemoryRepository implements Repository {
  readonly kind = "memory" as const;

  async saveDraftGame(input: SaveDraftInput): Promise<GameRecord> {
    const now = new Date().toISOString();
    const existing = state().games.get(input.id);
    const record: GameRecord = {
      id: input.id,
      slug: existing?.slug ?? null,
      title: input.title,
      creatorName: existing?.creatorName ?? "Anonymous",
      status: "draft",
      sourceImagePath: input.sourceImagePath,
      sourceImageUrl: input.sourceImageUrl,
      thumbnailPath: existing?.thumbnailPath ?? null,
      sceneAnalysis: input.sceneAnalysis,
      gameSpec: input.gameSpec,
      theme: input.gameSpec.theme,
      difficulty: input.gameSpec.difficulty,
      detectedObjectCount: input.gameSpec.source.detectedObjectCount,
      generationLatencyMs: input.generationLatencyMs,
      generationAttemptCount: input.generationAttemptCount,
      generationStatus: input.generationStatus,
      llmProvider: input.llmProvider ?? null,
      modelName: input.modelName ?? null,
      backboardAssistantId: input.backboardAssistantId ?? null,
      backboardThreadId: input.backboardThreadId ?? null,
      aiSchemaVersion: input.aiSchemaVersion ?? null,
      parentGameId: input.parentGameId ?? null,
      publishedAt: existing?.publishedAt ?? null,
      createdAt: existing?.createdAt ?? now,
      isDemo: false,
    };
    state().games.set(record.id, record);
    return record;
  }

  async getGameById(id: string): Promise<GameRecord | undefined> {
    return state().games.get(id);
  }

  async getGameBySlug(slug: string): Promise<GameRecord | undefined> {
    return [...state().games.values()].find((game) => game.slug === slug);
  }

  async isSlugTaken(slug: string): Promise<boolean> {
    return [...state().games.values()].some((game) => game.slug === slug);
  }

  async publishGame(input: PublishInput): Promise<GameRecord> {
    const game = state().games.get(input.id);
    if (!game) throw new AppError("NOT_FOUND", `game ${input.id} not found`);
    const published: GameRecord = {
      ...game,
      title: input.title,
      creatorName: input.creatorName,
      slug: input.slug,
      status: "published",
      publishedAt: new Date().toISOString(),
      gameSpec: { ...game.gameSpec, title: input.title, slug: input.slug },
    };
    state().games.set(published.id, published);
    return published;
  }

  async unpublishGame(id: string): Promise<void> {
    const game = state().games.get(id);
    if (!game) return;
    state().games.set(id, { ...game, status: "draft", publishedAt: null });
  }

  async listGames(options: {
    sort: ArcadeSort;
    limit: number;
    offset: number;
  }): Promise<GameSummary[]> {
    const summaries = [...state().games.values()]
      .filter((game) => game.status === "published")
      .map((game) => this.summaryFor(game));

    const sorted = sortSummaries(summaries, options.sort);
    return sorted.slice(options.offset, options.offset + options.limit);
  }

  async getGameSummary(gameId: string): Promise<GameSummary | undefined> {
    const game = state().games.get(gameId);
    if (!game) return undefined;
    return this.summaryFor(game);
  }

  private summaryFor(game: GameRecord): GameSummary {
    const sessions = [...state().sessions.values()].filter(
      (session) => session.gameId === game.id,
    );
    const completions = sessions.filter((session) => session.completed);
    const deaths = sessions.reduce((sum, session) => sum + session.deathCount, 0);
    const fastest = completions.reduce<number | null>((best, session) => {
      if (session.durationMs == null) return best;
      return best == null ? session.durationMs : Math.min(best, session.durationMs);
    }, null);
    const likes = [...state().likes].filter((key) =>
      key.startsWith(`${game.id}:`),
    ).length;
    const remixes = [...state().games.values()].filter(
      (candidate) =>
        candidate.parentGameId === game.id && candidate.status === "published",
    ).length;

    return {
      id: game.id,
      slug: game.slug ?? game.id,
      title: game.title,
      creatorName: game.creatorName,
      theme: game.theme,
      mode: game.gameSpec.mode ?? "classic",
      difficulty: game.difficulty,
      sourceImageUrl: game.sourceImageUrl,
      detectedObjectCount: game.detectedObjectCount,
      publishedAt: game.publishedAt,
      plays: sessions.length,
      completions: completions.length,
      deaths,
      completionRate:
        sessions.length === 0 ? 0 : completions.length / sessions.length,
      fastestMs: fastest,
      likes,
      remixes,
      parentGameId: game.parentGameId,
      isDemo: game.isDemo,
    };
  }

  async createSession(input: {
    gameId: string;
    anonymousSessionId: string;
    userAgent?: string | null;
  }): Promise<GameSessionRecord> {
    const session: GameSessionRecord = {
      id: randomUUID(),
      gameId: input.gameId,
      anonymousSessionId: input.anonymousSessionId,
      startedAt: new Date().toISOString(),
      completedAt: null,
      durationMs: null,
      deathCount: 0,
      collectiblesCollected: 0,
      completed: false,
      userAgent: input.userAgent ?? null,
    };
    state().sessions.set(session.id, session);
    return session;
  }

  async updateSession(sessionId: string, update: SessionUpdate): Promise<void> {
    const session = state().sessions.get(sessionId);
    if (!session) return;
    const next: GameSessionRecord = {
      ...session,
      deathCount: update.deathCount ?? session.deathCount,
      collectiblesCollected:
        update.collectiblesCollected ?? session.collectiblesCollected,
      completed: update.completed ?? session.completed,
      durationMs: update.durationMs ?? session.durationMs,
      completedAt: update.completed
        ? new Date().toISOString()
        : session.completedAt,
    };
    state().sessions.set(sessionId, next);
  }

  async recordEvent(input: RecordEventInput): Promise<void> {
    const store = state();
    store.events.push({
      id: store.eventId++,
      gameId: input.gameId,
      sessionId: input.sessionId ?? null,
      eventType: input.eventType,
      eventPayload: input.payload ?? {},
      createdAt: new Date().toISOString(),
    });
  }

  async getLeaderboard(gameId: string): Promise<Leaderboard> {
    const sessions = [...state().sessions.values()].filter(
      (session) => session.gameId === gameId,
    );
    const completions = sessions
      .filter((session) => session.completed && session.durationMs != null)
      .sort((a, b) => (a.durationMs ?? 0) - (b.durationMs ?? 0))
      .slice(0, 10);

    return {
      gameId,
      plays: sessions.length,
      completions: sessions.filter((session) => session.completed).length,
      deaths: sessions.reduce((sum, session) => sum + session.deathCount, 0),
      completionRate:
        sessions.length === 0
          ? 0
          : sessions.filter((session) => session.completed).length /
            sessions.length,
      fastestMs: completions[0]?.durationMs ?? null,
      entries: completions.map((session, index) => ({
        rank: index + 1,
        creatorLabel: `Player ${session.anonymousSessionId.slice(0, 4)}`,
        durationMs: session.durationMs ?? 0,
        deaths: session.deathCount,
        completedAt: session.completedAt ?? session.startedAt,
      })),
    };
  }

  async getStats(): Promise<StatsSnapshot> {
    const store = state();
    const published = [...store.games.values()].filter(
      (game) => game.status === "published",
    );
    const summaries = published.map((game) => this.summaryFor(game));
    const sessions = [...store.sessions.values()];
    const completions = sessions.filter((session) => session.completed);

    const objectCounts = new Map<string, number>();
    for (const object of store.objects) {
      const key = normalizeObjectLabel(object.label);
      objectCounts.set(key, (objectCounts.get(key) ?? 0) + 1);
    }

    const mechanicCounts = new Map<string, number>();
    for (const game of published) {
      for (const entity of game.gameSpec.entities) {
        mechanicCounts.set(
          entity.mechanic,
          (mechanicCounts.get(entity.mechanic) ?? 0) + 1,
        );
      }
    }

    const byDate = new Map<string, number>();
    for (const game of published) {
      const date = (game.publishedAt ?? game.createdAt).slice(0, 10);
      byDate.set(date, (byDate.get(date) ?? 0) + 1);
    }

    return {
      publishedGames: published.length,
      objectsScanned: published.reduce(
        (sum, game) => sum + game.detectedObjectCount,
        0,
      ),
      gamesPlayed: sessions.length,
      completedRuns: completions.length,
      totalDeaths: sessions.reduce((sum, session) => sum + session.deathCount, 0),
      averageCompletionRate:
        sessions.length === 0 ? 0 : completions.length / sessions.length,
      mechanicsDiscovered: store.discoveries.size,
      remixesCreated: published.filter((game) => game.parentGameId).length,
      topObjects: [...objectCounts.entries()]
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      mechanicUsage: [...mechanicCounts.entries()]
        .map(([mechanic, count]) => ({ mechanic, count }))
        .sort((a, b) => b.count - a.count),
      gamesOverTime: [...byDate.entries()]
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      difficultyVsCompletion: summaries.map((summary) => ({
        slug: summary.slug,
        title: summary.title,
        difficulty: summary.difficulty,
        completionRate: summary.completionRate,
        plays: summary.plays,
      })),
      recentActivity: store.events
        .slice(-20)
        .reverse()
        .map((event) => ({
          type: event.eventType,
          label: String(event.eventPayload.label ?? event.gameId.slice(0, 8)),
          createdAt: event.createdAt,
        })),
      discoveries: [...store.discoveries.values()].sort((a, b) =>
        b.discoveredAt.localeCompare(a.discoveredAt),
      ),
    };
  }

  async getTelemetrySnapshot(gameId: string): Promise<TelemetrySnapshot> {
    const store = state();
    const fiveMinutesAgo = Date.now() - 5 * 60_000;
    const scopedEvents = store.events.filter((event) => event.gameId === gameId);
    const fatalityCount = scopedEvents.filter(
      (event) => event.eventType === "player_died",
    ).length;

    const activeSessionIds = new Set<string>();
    for (const event of scopedEvents) {
      if (!event.sessionId) continue;
      if (!ACTIVE_SESSION_EVENT_TYPES.includes(event.eventType)) continue;
      if (new Date(event.createdAt).getTime() < fiveMinutesAgo) continue;
      activeSessionIds.add(event.sessionId);
    }

    const recentEvents: SpatialEventRecord[] = scopedEvents
      .filter((event) => TELEMETRY_EVENT_TYPES.includes(
        event.eventType as (typeof TELEMETRY_EVENT_TYPES)[number],
      ))
      .slice(-15)
      .reverse()
      .map((event) => {
        const payload = event.eventPayload;
        const x = typeof payload.x === "number" ? payload.x : null;
        const y = typeof payload.y === "number" ? payload.y : null;
        const durationMs =
          typeof payload.elapsedMs === "number" ? payload.elapsedMs : null;
        return {
          gameId: event.gameId,
          gameTitle: store.games.get(event.gameId)?.title ?? "Untitled",
          eventType: event.eventType as (typeof TELEMETRY_EVENT_TYPES)[number],
          city: typeof payload.city === "string" ? payload.city : null,
          x,
          y,
          durationMs,
          createdAt: event.createdAt,
        };
      });

    const deathPoints = scopedEvents
      .filter((event) => event.eventType === "player_died")
      .slice(-20)
      .reverse()
      .flatMap((event) => {
        const { x, y } = event.eventPayload;
        return typeof x === "number" && typeof y === "number" ? [{ x, y }] : [];
      });

    const bestRuntimes = scopedEvents
      .filter((event) => event.eventType === "game_completed")
      .flatMap((event): RuntimeLeaderboardEntry[] => {
        const payload = event.eventPayload;
        const durationMs =
          typeof payload.elapsedMs === "number" ? payload.elapsedMs : null;
        if (durationMs == null || durationMs < MIN_PLAUSIBLE_COMPLETION_MS) return [];
        return [
          {
            city: typeof payload.city === "string" ? payload.city : null,
            durationMs,
          },
        ];
      })
      .sort((a, b) => a.durationMs - b.durationMs)
      .slice(0, BEST_RUNTIME_LIMIT);

    return {
      gameId,
      fatalityCount,
      activeSessions: activeSessionIds.size,
      recentEvents,
      deathPoints,
      bestRuntimes,
    };
  }

  async toggleLike(gameId: string, anonymousSessionId: string): Promise<number> {
    const key = `${gameId}:${anonymousSessionId}`;
    const store = state();
    if (store.likes.has(key)) store.likes.delete(key);
    else store.likes.add(key);
    return [...store.likes].filter((entry) => entry.startsWith(`${gameId}:`))
      .length;
  }

  async registerMechanicDiscoveries(
    gameId: string,
    pairs: { label: string; mechanic: string }[],
  ): Promise<MechanicDiscoveryRecord[]> {
    const store = state();
    const created: MechanicDiscoveryRecord[] = [];

    for (const pair of pairs) {
      const normalized = normalizeObjectLabel(pair.label);
      if (!normalized) continue;
      const key = `${normalized}|${pair.mechanic}`;
      const existing = store.discoveries.get(key);
      if (existing) {
        store.discoveries.set(key, {
          ...existing,
          discoveryCount: existing.discoveryCount + 1,
        });
        continue;
      }
      const record: MechanicDiscoveryRecord = {
        id: randomUUID(),
        objectLabel: pair.label,
        normalizedObjectLabel: normalized,
        mechanic: pair.mechanic,
        firstGameId: gameId,
        discoveryCount: 1,
        discoveredAt: new Date().toISOString(),
      };
      store.discoveries.set(key, record);
      created.push(record);
    }

    return created;
  }

  async saveGameObjects(
    gameId: string,
    objects: Omit<GameObjectRecord, "id" | "gameId">[],
  ): Promise<void> {
    const store = state();
    store.objects = store.objects.filter((object) => object.gameId !== gameId);
    for (const object of objects) {
      store.objects.push({ ...object, id: randomUUID(), gameId });
    }
  }

  async getEnabledComponentCatalog(): Promise<ComponentCatalogEntry[] | null> {
    // Memory mode has no component table; callers use the bundled catalog.
    return null;
  }

  async getGenerationHints(): Promise<GenerationHints> {
    const store = state();
    const recent = [...store.insights].reverse().slice(0, 12);
    if (recent.length === 0 && store.games.size === 0) return EMPTY_HINTS;

    const modeByGame = new Map<string, string>();
    for (const game of store.games.values()) {
      modeByGame.set(game.id, game.gameSpec.mode ?? "classic");
    }

    // Newest first, so this doubles as the template-repeat history.
    const recentTemplates = [...store.games.values()]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((game) => game.gameSpec.templateId)
      .filter((template): template is string => Boolean(template));

    const stats = new Map<string, { plays: number; completions: number }>();
    for (const session of store.sessions.values()) {
      const mode = modeByGame.get(session.gameId);
      if (!mode) continue;
      const entry = stats.get(mode) ?? { plays: 0, completions: 0 };
      entry.plays += 1;
      if (session.completed) entry.completions += 1;
      stats.set(mode, entry);
    }

    return {
      recentModes: recent.map((insight) => insight.mode),
      recentTemplates,
      recentTitles: recent.map((insight) => insight.title),
      modeStats: [...stats.entries()].map(([mode, entry]) => ({
        mode,
        plays: entry.plays,
        completions: entry.completions,
        completionRate: entry.plays === 0 ? 0 : entry.completions / entry.plays,
      })),
    };
  }

  async saveGenerationInsight(input: GenerationInsightInput): Promise<void> {
    const store = state();
    store.insights.push({ ...input, createdAt: new Date().toISOString() });
    if (store.insights.length > 200) {
      store.insights = store.insights.slice(-200);
    }
  }
}

export function sortSummaries(
  summaries: GameSummary[],
  sort: ArcadeSort,
): GameSummary[] {
  const copy = [...summaries];
  switch (sort) {
    case "campaign":
      // Difficulty ascending, with stable tiebreaks so reseeding (which
      // rewrites published_at) never reshuffles the campaign.
      return copy.sort(
        (a, b) =>
          a.difficulty - b.difficulty ||
          (a.publishedAt ?? "").localeCompare(b.publishedAt ?? "") ||
          a.slug.localeCompare(b.slug),
      );
    case "trending":
      return copy.sort((a, b) => trendingScore(b) - trendingScore(a));
    case "hardest":
      return copy
        .filter((summary) => summary.plays >= 1)
        .sort((a, b) => hardnessScore(b) - hardnessScore(a));
    case "fastest":
      return copy
        .filter((summary) => summary.fastestMs != null)
        .sort((a, b) => (a.fastestMs ?? 0) - (b.fastestMs ?? 0));
    case "most_remixed":
      return copy.sort((a, b) => b.remixes - a.remixes);
    case "newest":
    default:
      return copy.sort((a, b) =>
        (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""),
      );
  }
}

export function trendingScore(summary: GameSummary): number {
  return (
    summary.plays * 1.0 +
    summary.completions * 1.5 +
    summary.likes * 2.0 +
    summary.remixes * 3.0
  );
}

export function hardnessScore(summary: GameSummary): number {
  const deathsPerSession = summary.plays === 0 ? 0 : summary.deaths / summary.plays;
  const normalizedDeaths = Math.min(1, deathsPerSession / 6);
  return (1 - summary.completionRate) * 0.65 + normalizedDeaths * 0.35;
}
