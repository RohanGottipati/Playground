import { AppError } from "@/lib/errors/AppError";
import type { SceneAnalysis } from "@/lib/backboard/schemas";
import type { GameSpec, MechanicType } from "@/game/types";
import type {
  ComponentCatalogEntry,
  ComponentRuntimeScope,
} from "@/game/components/types";
import { EMPTY_HINTS, type GenerationHints } from "@/game/generation/hints";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { normalizeObjectLabel } from "@/lib/utils/sanitize";
import { logDiagnostic } from "@/lib/utils/logger";
import { sortSummaries } from "./memory";
import { ACTIVE_SESSION_EVENT_TYPES, TICKER_EVENT_TYPES } from "./types";
import type {
  ArcadeSort,
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
  SaveDraftInput,
  SessionUpdate,
  SpatialEventRecord,
  StatsSnapshot,
  TelemetrySnapshot,
  TickerEventType,
} from "./types";

type GameRow = {
  id: string;
  slug: string | null;
  title: string;
  creator_name: string;
  status: "draft" | "published" | "failed";
  source_image_path: string;
  source_image_url: string;
  thumbnail_path: string | null;
  scene_analysis: SceneAnalysis;
  game_spec: GameSpec;
  theme: string;
  difficulty: number;
  detected_object_count: number;
  generation_latency_ms: number | null;
  generation_attempt_count: number;
  generation_status: string;
  llm_provider: string | null;
  model_name: string | null;
  backboard_assistant_id: string | null;
  backboard_thread_id: string | null;
  ai_schema_version: string | null;
  parent_game_id: string | null;
  published_at: string | null;
  created_at: string;
  is_demo: boolean;
};

type SummaryRow = {
  id: string;
  slug: string;
  title: string;
  creator_name: string;
  theme: string;
  /** Absent until migration 0006 replaces the view. */
  mode?: string | null;
  difficulty: number;
  source_image_url: string;
  detected_object_count: number;
  published_at: string | null;
  plays: number;
  completions: number;
  deaths: number;
  completion_rate: number;
  fastest_ms: number | null;
  likes: number;
  remixes: number;
  parent_game_id: string | null;
  is_demo: boolean;
};

function toGameRecord(row: GameRow): GameRecord {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    creatorName: row.creator_name,
    status: row.status,
    sourceImagePath: row.source_image_path,
    sourceImageUrl: row.source_image_url,
    thumbnailPath: row.thumbnail_path,
    sceneAnalysis: row.scene_analysis,
    gameSpec: row.game_spec,
    theme: row.theme,
    difficulty: row.difficulty,
    detectedObjectCount: row.detected_object_count,
    generationLatencyMs: row.generation_latency_ms,
    generationAttemptCount: row.generation_attempt_count,
    generationStatus: row.generation_status,
    llmProvider: row.llm_provider,
    modelName: row.model_name,
    backboardAssistantId: row.backboard_assistant_id,
    backboardThreadId: row.backboard_thread_id,
    aiSchemaVersion: row.ai_schema_version,
    parentGameId: row.parent_game_id,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    isDemo: row.is_demo,
  };
}

function toSummary(row: SummaryRow): GameSummary {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    creatorName: row.creator_name,
    theme: row.theme,
    mode: typeof row.mode === "string" && row.mode ? row.mode : "classic",
    difficulty: row.difficulty,
    sourceImageUrl: row.source_image_url,
    detectedObjectCount: row.detected_object_count,
    publishedAt: row.published_at,
    plays: Number(row.plays ?? 0),
    completions: Number(row.completions ?? 0),
    deaths: Number(row.deaths ?? 0),
    completionRate: Number(row.completion_rate ?? 0),
    fastestMs: row.fastest_ms == null ? null : Number(row.fastest_ms),
    likes: Number(row.likes ?? 0),
    remixes: Number(row.remixes ?? 0),
    parentGameId: row.parent_game_id,
    isDemo: row.is_demo,
  };
}

function fail(operation: string, error: { message: string } | null): never {
  throw new AppError("DATABASE_ERROR", `${operation}: ${error?.message ?? "unknown"}`);
}

export type ComponentCatalogRow = {
  id: string;
  name: string;
  category: string;
  description: string;
  tags: string[];
  aliases: string[];
  runtime_scope: ComponentRuntimeScope;
  mechanic: MechanicType | null;
  renderer_key: string | null;
  enabled: boolean;
  metadata: Record<string, string | number | boolean>;
};

export function toComponentCatalogEntry(
  row: ComponentCatalogRow,
): ComponentCatalogEntry {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    description: row.description,
    tags: row.tags,
    aliases: row.aliases,
    runtimeScope: row.runtime_scope,
    mechanic: row.mechanic,
    rendererKey: row.renderer_key,
    enabled: row.enabled,
    metadata: row.metadata,
  };
}

export class SupabaseRepository implements Repository {
  readonly kind = "supabase" as const;

  private get client() {
    return supabaseAdmin();
  }

  async saveDraftGame(input: SaveDraftInput): Promise<GameRecord> {
    const { data, error } = await this.client
      .from("games")
      .upsert(
        {
          id: input.id,
          title: input.title,
          status: "draft",
          source_image_path: input.sourceImagePath,
          source_image_url: input.sourceImageUrl,
          scene_analysis: input.sceneAnalysis,
          game_spec: input.gameSpec,
          theme: input.gameSpec.theme,
          difficulty: input.gameSpec.difficulty,
          detected_object_count: input.gameSpec.source.detectedObjectCount,
          generation_latency_ms: input.generationLatencyMs,
          generation_attempt_count: input.generationAttemptCount,
          generation_status: input.generationStatus,
          llm_provider: input.llmProvider ?? null,
          model_name: input.modelName ?? null,
          backboard_assistant_id: input.backboardAssistantId ?? null,
          backboard_thread_id: input.backboardThreadId ?? null,
          ai_schema_version: input.aiSchemaVersion ?? null,
          parent_game_id: input.parentGameId ?? null,
        },
        { onConflict: "id" },
      )
      .select("*")
      .single();

    if (error || !data) fail("saveDraftGame", error);
    return toGameRecord(data as GameRow);
  }

  async getGameById(id: string): Promise<GameRecord | undefined> {
    const { data, error } = await this.client
      .from("games")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) fail("getGameById", error);
    return data ? toGameRecord(data as GameRow) : undefined;
  }

  async getGameBySlug(slug: string): Promise<GameRecord | undefined> {
    const { data, error } = await this.client
      .from("games")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) fail("getGameBySlug", error);
    return data ? toGameRecord(data as GameRow) : undefined;
  }

  async isSlugTaken(slug: string): Promise<boolean> {
    const { count, error } = await this.client
      .from("games")
      .select("id", { count: "exact", head: true })
      .eq("slug", slug);
    if (error) fail("isSlugTaken", error);
    return (count ?? 0) > 0;
  }

  async publishGame(input: PublishInput): Promise<GameRecord> {
    const existing = await this.getGameById(input.id);
    if (!existing) throw new AppError("NOT_FOUND", `game ${input.id} not found`);

    const { data, error } = await this.client
      .from("games")
      .update({
        title: input.title,
        creator_name: input.creatorName,
        slug: input.slug,
        status: "published",
        published_at: new Date().toISOString(),
        game_spec: { ...existing.gameSpec, title: input.title, slug: input.slug },
      })
      .eq("id", input.id)
      .select("*")
      .single();

    if (error || !data) fail("publishGame", error);
    return toGameRecord(data as GameRow);
  }

  async unpublishGame(id: string): Promise<void> {
    const { error } = await this.client
      .from("games")
      .update({ status: "draft", published_at: null })
      .eq("id", id);
    if (error) fail("unpublishGame", error);
  }

  /**
   * Fills in each game's mode when the deployed `game_summaries` view predates
   * migration 0006 and has no `mode` column. Without this every card would
   * claim to be a platformer.
   */
  private async backfillModes(
    rows: SummaryRow[],
    summaries: GameSummary[],
  ): Promise<GameSummary[]> {
    const missing = rows.some((row) => row.mode === undefined);
    if (!missing || summaries.length === 0) return summaries;

    const { data, error } = await this.client
      .from("games")
      .select("id, game_spec")
      .in(
        "id",
        summaries.map((summary) => summary.id),
      );
    if (error || !data) return summaries;

    const modeById = new Map(
      (data as { id: string; game_spec: GameSpec | null }[]).map((row) => [
        row.id,
        row.game_spec?.mode ?? "classic",
      ]),
    );
    return summaries.map((summary) => ({
      ...summary,
      mode: modeById.get(summary.id) ?? summary.mode,
    }));
  }

  async listGames(options: {
    sort: ArcadeSort;
    limit: number;
    offset: number;
  }): Promise<GameSummary[]> {
    if (options.sort === "newest" || options.sort === "campaign") {
      const query = this.client.from("game_summaries").select("*");
      const ordered =
        options.sort === "campaign"
          ? query
              .order("difficulty", { ascending: true })
              .order("published_at", { ascending: true, nullsFirst: false })
              .order("slug", { ascending: true })
          : query.order("published_at", { ascending: false, nullsFirst: false });

      const { data, error } = await ordered.range(
        options.offset,
        options.offset + options.limit - 1,
      );
      if (error) fail("listGames", error);
      const rows = data as SummaryRow[];
      return this.backfillModes(rows, rows.map(toSummary));
    }

    const { data, error } = await this.client
      .from("game_summaries")
      .select("*")
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(200);
    if (error) fail("listGames", error);
    const rows = data as SummaryRow[];
    const summaries = sortSummaries(rows.map(toSummary), options.sort).slice(
      options.offset,
      options.offset + options.limit,
    );
    return this.backfillModes(rows, summaries);
  }

  async getGameSummary(gameId: string): Promise<GameSummary | undefined> {
    const { data, error } = await this.client
      .from("game_summaries")
      .select("*")
      .eq("id", gameId)
      .maybeSingle();
    if (error) fail("getGameSummary", error);
    return data ? toSummary(data as SummaryRow) : undefined;
  }

  async createSession(input: {
    gameId: string;
    anonymousSessionId: string;
    userAgent?: string | null;
  }): Promise<GameSessionRecord> {
    const { data, error } = await this.client
      .from("game_sessions")
      .insert({
        game_id: input.gameId,
        anonymous_session_id: input.anonymousSessionId,
        user_agent: input.userAgent ?? null,
      })
      .select("*")
      .single();
    if (error || !data) fail("createSession", error);

    const row = data as Record<string, unknown>;
    return {
      id: String(row.id),
      gameId: String(row.game_id),
      anonymousSessionId: String(row.anonymous_session_id),
      startedAt: String(row.started_at),
      completedAt: (row.completed_at as string) ?? null,
      durationMs: (row.duration_ms as number) ?? null,
      deathCount: Number(row.death_count ?? 0),
      collectiblesCollected: Number(row.collectibles_collected ?? 0),
      completed: Boolean(row.completed),
      userAgent: (row.user_agent as string) ?? null,
    };
  }

  async updateSession(sessionId: string, update: SessionUpdate): Promise<void> {
    const payload: Record<string, unknown> = {};
    if (update.deathCount != null) payload.death_count = update.deathCount;
    if (update.collectiblesCollected != null) {
      payload.collectibles_collected = update.collectiblesCollected;
    }
    if (update.durationMs != null) payload.duration_ms = update.durationMs;
    if (update.completed != null) {
      payload.completed = update.completed;
      payload.completed_at = update.completed ? new Date().toISOString() : null;
    }
    if (Object.keys(payload).length === 0) return;

    const { error } = await this.client
      .from("game_sessions")
      .update(payload)
      .eq("id", sessionId);
    if (error) fail("updateSession", error);
  }

  async recordEvent(input: RecordEventInput): Promise<void> {
    const { error } = await this.client.from("game_events").insert({
      game_id: input.gameId,
      session_id: input.sessionId ?? null,
      event_type: input.eventType,
      event_payload: input.payload ?? {},
    });
    if (error) fail("recordEvent", error);
  }

  async getLeaderboard(gameId: string): Promise<Leaderboard> {
    const summary = await this.getGameSummary(gameId);
    const { data, error } = await this.client
      .from("game_sessions")
      .select("anonymous_session_id, duration_ms, death_count, completed_at")
      .eq("game_id", gameId)
      .eq("completed", true)
      .not("duration_ms", "is", null)
      .order("duration_ms", { ascending: true })
      .limit(10);
    if (error) fail("getLeaderboard", error);

    const rows = (data ?? []) as {
      anonymous_session_id: string;
      duration_ms: number;
      death_count: number;
      completed_at: string;
    }[];

    return {
      gameId,
      plays: summary?.plays ?? 0,
      completions: summary?.completions ?? 0,
      deaths: summary?.deaths ?? 0,
      completionRate: summary?.completionRate ?? 0,
      fastestMs: rows[0]?.duration_ms ?? summary?.fastestMs ?? null,
      entries: rows.map((row, index) => ({
        rank: index + 1,
        creatorLabel: `Player ${row.anonymous_session_id.slice(0, 4)}`,
        durationMs: row.duration_ms,
        deaths: row.death_count,
        completedAt: row.completed_at,
      })),
    };
  }

  async getStats(): Promise<StatsSnapshot> {
    const client = this.client;
    const [summaries, objects, discoveries, events, sessions] = await Promise.all([
      client.from("game_summaries").select("*").limit(500),
      client.from("object_label_counts").select("*").limit(10),
      client.from("mechanic_discoveries").select("*").order("discovered_at", {
        ascending: false,
      }),
      client
        .from("game_events")
        .select("event_type, event_payload, created_at")
        .order("created_at", { ascending: false })
        .limit(20),
      client.from("global_play_totals").select("*").maybeSingle(),
    ]);

    if (summaries.error) fail("getStats.summaries", summaries.error);

    const summaryRows = (summaries.data as SummaryRow[]).map(toSummary);
    const mechanicCounts = new Map<string, number>();
    const byDate = new Map<string, number>();

    for (const summary of summaryRows) {
      const date = (summary.publishedAt ?? "").slice(0, 10);
      if (date) byDate.set(date, (byDate.get(date) ?? 0) + 1);
    }

    const { data: specRows } = await client
      .from("games")
      .select("game_spec")
      .eq("status", "published")
      .limit(500);
    for (const row of (specRows ?? []) as { game_spec: GameSpec }[]) {
      for (const entity of row.game_spec.entities ?? []) {
        mechanicCounts.set(
          entity.mechanic,
          (mechanicCounts.get(entity.mechanic) ?? 0) + 1,
        );
      }
    }

    const totals = (sessions.data ?? {
      plays: 0,
      completions: 0,
      deaths: 0,
    }) as { plays: number; completions: number; deaths: number };

    return {
      publishedGames: summaryRows.length,
      objectsScanned: summaryRows.reduce(
        (sum, summary) => sum + summary.detectedObjectCount,
        0,
      ),
      gamesPlayed: Number(totals.plays ?? 0),
      completedRuns: Number(totals.completions ?? 0),
      totalDeaths: Number(totals.deaths ?? 0),
      averageCompletionRate:
        Number(totals.plays ?? 0) === 0
          ? 0
          : Number(totals.completions ?? 0) / Number(totals.plays ?? 0),
      mechanicsDiscovered: (discoveries.data ?? []).length,
      remixesCreated: summaryRows.filter((summary) => summary.parentGameId).length,
      topObjects: ((objects.data ?? []) as { label: string; count: number }[]).map(
        (row) => ({ label: row.label, count: Number(row.count) }),
      ),
      mechanicUsage: [...mechanicCounts.entries()]
        .map(([mechanic, count]) => ({ mechanic, count }))
        .sort((a, b) => b.count - a.count),
      gamesOverTime: [...byDate.entries()]
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      difficultyVsCompletion: summaryRows.map((summary) => ({
        slug: summary.slug,
        title: summary.title,
        difficulty: summary.difficulty,
        completionRate: summary.completionRate,
        plays: summary.plays,
      })),
      recentActivity: (
        (events.data ?? []) as {
          event_type: string;
          event_payload: Record<string, unknown>;
          created_at: string;
        }[]
      ).map((row) => ({
        type: row.event_type,
        label: String(row.event_payload?.label ?? ""),
        createdAt: row.created_at,
      })),
      discoveries: ((discoveries.data ?? []) as Record<string, unknown>[]).map(
        (row) => ({
          id: String(row.id),
          objectLabel: String(row.object_label),
          normalizedObjectLabel: String(row.normalized_object_label),
          mechanic: String(row.mechanic),
          firstGameId: (row.first_game_id as string) ?? null,
          discoveryCount: Number(row.discovery_count ?? 1),
          discoveredAt: String(row.discovered_at),
        }),
      ),
    };
  }

  async getTelemetrySnapshot(gameId?: string): Promise<TelemetrySnapshot> {
    const client = this.client;
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60_000).toISOString();

    let deathQuery = client
      .from("game_events")
      .select("game_id")
      .eq("event_type", "death")
      .limit(2000);
    let recentQuery = client
      .from("game_events")
      .select("game_id, event_type, event_payload, created_at, games(title)")
      .in("event_type", TICKER_EVENT_TYPES)
      .order("created_at", { ascending: false })
      .limit(300);
    // Active sessions: distinct session_ids seen on a start/progress/complete
    // event in the last 5 minutes. Deliberately excludes every other event
    // type (deaths, likes, opens, ...) — those must never move this count.
    let activeQuery = client
      .from("game_events")
      .select("game_id, session_id")
      .in("event_type", ACTIVE_SESSION_EVENT_TYPES)
      .not("session_id", "is", null)
      .gte("created_at", fiveMinutesAgo)
      .limit(5000);

    if (gameId) {
      deathQuery = deathQuery.eq("game_id", gameId);
      recentQuery = recentQuery.eq("game_id", gameId);
      activeQuery = activeQuery.eq("game_id", gameId);
    }

    const [deathRows, recentRows, activeRows] = await Promise.all([
      deathQuery,
      recentQuery,
      activeQuery,
    ]);

    if (deathRows.error) fail("getTelemetrySnapshot.deaths", deathRows.error);
    if (recentRows.error) fail("getTelemetrySnapshot.recent", recentRows.error);
    if (activeRows.error) fail("getTelemetrySnapshot.active", activeRows.error);

    const deathTotalsByGame: Record<string, number> = {};
    for (const row of (deathRows.data ?? []) as { game_id: string }[]) {
      deathTotalsByGame[row.game_id] = (deathTotalsByGame[row.game_id] ?? 0) + 1;
    }

    const activeSessionSets = new Map<string, Set<string>>();
    for (const row of (activeRows.data ?? []) as {
      game_id: string;
      session_id: string | null;
    }[]) {
      if (!row.session_id) continue;
      const set = activeSessionSets.get(row.game_id) ?? new Set<string>();
      set.add(row.session_id);
      activeSessionSets.set(row.game_id, set);
    }
    const activeSessionsByGame: Record<string, number> = {};
    for (const [gid, sessions] of activeSessionSets) {
      activeSessionsByGame[gid] = sessions.size;
    }

    type RecentRow = {
      game_id: string;
      event_type: TickerEventType;
      event_payload: Record<string, unknown>;
      created_at: string;
      games: { title: string } | { title: string }[] | null;
    };

    const recentSpatialEvents: SpatialEventRecord[] = (
      (recentRows.data ?? []) as RecentRow[]
    ).map((row) => {
      const gameTitleSource = Array.isArray(row.games) ? row.games[0] : row.games;
      const payload = row.event_payload ?? {};
      const x = typeof payload.x === "number" ? payload.x : null;
      const y = typeof payload.y === "number" ? payload.y : null;
      const durationSeconds =
        typeof payload.durationSeconds === "number" ? payload.durationSeconds : null;
      return {
        gameId: row.game_id,
        gameTitle: gameTitleSource?.title ?? "Untitled",
        eventType: row.event_type,
        city: typeof payload.city === "string" ? payload.city : "Toronto",
        x,
        y,
        durationSeconds,
        createdAt: row.created_at,
      };
    });

    return {
      deathTotalsByGame,
      activeSessionsByGame,
      recentSpatialEvents,
    };
  }

  async toggleLike(gameId: string, anonymousSessionId: string): Promise<number> {
    const client = this.client;
    const { data: existing, error: selectError } = await client
      .from("game_likes")
      .select("game_id")
      .eq("game_id", gameId)
      .eq("anonymous_session_id", anonymousSessionId)
      .maybeSingle();
    if (selectError) fail("toggleLike.select", selectError);

    if (existing) {
      const { error } = await client
        .from("game_likes")
        .delete()
        .eq("game_id", gameId)
        .eq("anonymous_session_id", anonymousSessionId);
      if (error) fail("toggleLike.delete", error);
    } else {
      const { error } = await client
        .from("game_likes")
        .insert({ game_id: gameId, anonymous_session_id: anonymousSessionId });
      if (error) fail("toggleLike.insert", error);
    }

    const { count, error: countError } = await client
      .from("game_likes")
      .select("game_id", { count: "exact", head: true })
      .eq("game_id", gameId);
    if (countError) fail("toggleLike.count", countError);
    return count ?? 0;
  }

  async registerMechanicDiscoveries(
    gameId: string,
    pairs: { label: string; mechanic: string }[],
  ): Promise<MechanicDiscoveryRecord[]> {
    const created: MechanicDiscoveryRecord[] = [];

    for (const pair of pairs) {
      const normalized = normalizeObjectLabel(pair.label);
      if (!normalized) continue;

      const { data, error } = await this.client.rpc("register_mechanic_discovery", {
        p_object_label: pair.label,
        p_normalized_label: normalized,
        p_mechanic: pair.mechanic,
        p_game_id: gameId,
      });
      if (error) fail("registerMechanicDiscoveries", error);

      const row = (Array.isArray(data) ? data[0] : data) as
        | Record<string, unknown>
        | null;
      if (row && Boolean(row.is_new)) {
        created.push({
          id: String(row.id),
          objectLabel: String(row.object_label),
          normalizedObjectLabel: String(row.normalized_object_label),
          mechanic: String(row.mechanic),
          firstGameId: (row.first_game_id as string) ?? null,
          discoveryCount: Number(row.discovery_count ?? 1),
          discoveredAt: String(row.discovered_at),
        });
      }
    }

    return created;
  }

  async saveGameObjects(
    gameId: string,
    objects: Omit<GameObjectRecord, "id" | "gameId">[],
  ): Promise<void> {
    const client = this.client;
    const { error: deleteError } = await client
      .from("game_objects")
      .delete()
      .eq("game_id", gameId);
    if (deleteError) fail("saveGameObjects.delete", deleteError);
    if (objects.length === 0) return;

    const { error } = await client.from("game_objects").insert(
      objects.map((object) => ({
        game_id: gameId,
        source_object_id: object.sourceObjectId,
        label: object.label,
        normalized_bounds: object.normalizedBounds,
        properties: object.properties,
        suggested_role: object.suggestedRole,
        final_mechanic: object.finalMechanic as MechanicType | null,
        confidence: object.confidence,
      })),
    );
    if (error) fail("saveGameObjects.insert", error);
  }

  /**
   * Learning-loop read. Tolerates a database that predates migration 0006:
   * any failure degrades to EMPTY_HINTS so generation never blocks on hints.
   */
  async getEnabledComponentCatalog(): Promise<ComponentCatalogEntry[] | null> {
    const { data, error } = await this.client
      .from("component_catalog")
      .select(
        "id,name,category,description,tags,aliases,runtime_scope,mechanic,renderer_key,enabled,metadata",
      )
      .eq("enabled", true)
      .order("category")
      .order("name")
      .limit(500);
    if (error) {
      // Never fail a generation over catalog trouble; bundled data covers it.
      logDiagnostic("componentCatalog.fetchFailed", { message: error.message });
      return null;
    }
    const rows = (data ?? []) as ComponentCatalogRow[];
    if (rows.length === 0) return null;
    return rows.map(toComponentCatalogEntry);
  }

  async getGenerationHints(): Promise<GenerationHints> {
    try {
      const client = this.client;
      const [insights, games, sessions] = await Promise.all([
        client
          .from("generation_insights")
          .select("mode, title")
          .order("created_at", { ascending: false })
          .limit(12),
        client
          .from("games")
          .select("id, mode:game_spec->>mode, template:game_spec->>templateId")
          .order("created_at", { ascending: false })
          .limit(300),
        client
          .from("game_sessions")
          .select("game_id, completed")
          .order("started_at", { ascending: false })
          .limit(1000),
      ]);

      const recent = insights.error
        ? []
        : ((insights.data ?? []) as { mode: string; title: string }[]);

      const modeByGame = new Map<string, string>();
      // Newest first, so this doubles as the template-repeat history.
      const recentTemplates: string[] = [];
      if (!games.error) {
        for (const row of (games.data ?? []) as {
          id: string;
          mode: string | null;
          template: string | null;
        }[]) {
          modeByGame.set(row.id, row.mode ?? "classic");
          if (row.template) recentTemplates.push(row.template);
        }
      }

      const stats = new Map<string, { plays: number; completions: number }>();
      if (!sessions.error) {
        for (const row of (sessions.data ?? []) as {
          game_id: string;
          completed: boolean;
        }[]) {
          const mode = modeByGame.get(row.game_id);
          if (!mode) continue;
          const entry = stats.get(mode) ?? { plays: 0, completions: 0 };
          entry.plays += 1;
          if (row.completed) entry.completions += 1;
          stats.set(mode, entry);
        }
      }

      return {
        recentModes: recent.map((row) => row.mode),
        recentTemplates,
        recentTitles: recent.map((row) => row.title),
        modeStats: [...stats.entries()].map(([mode, entry]) => ({
          mode,
          plays: entry.plays,
          completions: entry.completions,
          completionRate:
            entry.plays === 0 ? 0 : entry.completions / entry.plays,
        })),
      };
    } catch (error) {
      logDiagnostic("generation.hints_failed", {
        message: error instanceof Error ? error.message : "unknown",
      });
      return EMPTY_HINTS;
    }
  }

  /** Learning-loop write. Non-fatal by contract: failures are only logged. */
  async saveGenerationInsight(input: GenerationInsightInput): Promise<void> {
    const { error } = await this.client.from("generation_insights").insert({
      game_id: input.gameId,
      mode: input.mode,
      seed: input.seed,
      theme: input.theme,
      difficulty: input.difficulty,
      title: input.title,
      object_labels: input.objectLabels,
      mechanics: input.mechanics,
      magic_patterns_id: input.magicPatternsId ?? null,
      magic_patterns_editor_url: input.magicPatternsEditorUrl ?? null,
      prompt_version: input.promptVersion,
    });
    if (error) {
      logDiagnostic("generation.insight_failed", { message: error.message });
    }
  }
}
