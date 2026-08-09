import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import {
  buildCampaignSeedGames,
  campaignGameId,
  type ExistingCampaignIdentity,
} from "../game/templates/campaignSeed";
import { CAMPAIGN_TEMPLATE_IDS } from "../game/templates";

type ExistingRow = {
  id: string;
  slug: string | null;
  published_at: string | null;
};

async function loadLocalEnv() {
  try {
    const contents = await readFile(resolve(process.cwd(), ".env"), "utf8");
    for (const line of contents.split(/\r?\n/)) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (!match || process.env[match[1]]) continue;
      let value = match[2].trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      process.env[match[1]] = value;
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
}

function argumentValue(name: string): string | undefined {
  const exact = process.argv.find((argument) => argument.startsWith(`${name}=`));
  if (exact) return exact.slice(name.length + 1);
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

export function projectRefFromSupabaseUrl(value: string): string {
  const hostname = new URL(value).hostname;
  const suffix = ".supabase.co";
  if (!hostname.endsWith(suffix)) {
    throw new Error(
      "The seeder only accepts standard <project-ref>.supabase.co URLs so the target can be confirmed safely.",
    );
  }
  return hostname.slice(0, -suffix.length);
}

async function main() {
  await loadLocalEnv();

  const apply = process.argv.includes("--apply");
  const explicitDryRun = process.argv.includes("--dry-run");
  if (apply && explicitDryRun) {
    throw new Error("Choose either --dry-run or --apply, not both.");
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.",
    );
  }

  const projectRef = projectRefFromSupabaseUrl(url);
  if (apply && argumentValue("--confirm-project-ref") !== projectRef) {
    throw new Error(
      `Refusing to write. Re-run with --apply --confirm-project-ref ${projectRef}.`,
    );
  }

  const client = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const ids = CAMPAIGN_TEMPLATE_IDS.map(campaignGameId);
  const [{ data: existingData, error: existingError }, { data: slugData, error: slugError }] =
    await Promise.all([
      client.from("games").select("id,slug,published_at").in("id", ids),
      client.from("games").select("slug").not("slug", "is", null).limit(10_000),
    ]);
  if (existingError) {
    throw new Error(`Could not read campaign games: ${existingError.message}`);
  }
  if (slugError) throw new Error(`Could not read reserved slugs: ${slugError.message}`);

  const existingRows = (existingData ?? []) as ExistingRow[];
  const existing: ExistingCampaignIdentity[] = existingRows.map((row) => ({
    id: row.id,
    slug: row.slug,
    publishedAt: row.published_at,
  }));
  const games = buildCampaignSeedGames({
    existing,
    reservedSlugs: new Set(
      (slugData ?? [])
        .map((row) => row.slug)
        .filter((slug): slug is string => typeof slug === "string"),
    ),
  });
  const inserts = games.filter(
    (game) => !existingRows.some((row) => row.id === game.id),
  ).length;

  console.log(
    `${apply ? "Applying" : "Dry run:"} ${games.length} campaign games (${inserts} inserts, ${games.length - inserts} updates) in ${projectRef}.`,
  );
  for (const game of games) {
    console.log(`${game.template.padEnd(18)} ${game.slug}`);
  }
  if (!apply) {
    console.log(
      `No rows changed. Apply with --apply --confirm-project-ref ${projectRef}.`,
    );
    return;
  }

  const rows = games.map((game) => ({
    id: game.id,
    slug: game.slug,
    title: game.title,
    creator_name: game.creatorName,
    status: "published",
    source_image_path: game.sourceImagePath,
    source_image_url: game.sourceImageUrl,
    scene_analysis: game.sceneAnalysis,
    game_spec: game.gameSpec,
    theme: game.gameSpec.theme,
    difficulty: game.gameSpec.difficulty,
    detected_object_count: game.gameSpec.source.detectedObjectCount,
    generation_latency_ms: 0,
    generation_attempt_count: 1,
    generation_status: "template-preview",
    llm_provider: null,
    model_name: null,
    backboard_assistant_id: null,
    backboard_thread_id: null,
    ai_schema_version: "template-preview",
    parent_game_id: null,
    published_at: game.publishedAt,
    is_demo: true,
  }));
  const { error: upsertError } = await client
    .from("games")
    .upsert(rows, { onConflict: "id" });
  if (upsertError) throw new Error(`Campaign upsert failed: ${upsertError.message}`);

  const { data: verifiedData, error: verifiedError } = await client
    .from("games")
    .select("id,slug,status,source_image_url,is_demo,game_spec")
    .in("id", ids);
  if (verifiedError) {
    throw new Error(`Campaign verification failed: ${verifiedError.message}`);
  }
  const verifiedById = new Map(
    (verifiedData ?? []).map((row) => [row.id, row] as const),
  );
  for (const game of games) {
    const row = verifiedById.get(game.id);
    if (
      !row ||
      row.slug !== game.slug ||
      row.status !== "published" ||
      row.source_image_url !== game.sourceImageUrl ||
      row.is_demo !== true ||
      row.game_spec?.slug !== game.slug
    ) {
      throw new Error(`Campaign verification mismatch for ${game.template}.`);
    }
  }
  if (verifiedById.size !== games.length) {
    throw new Error(
      `Campaign verification expected ${games.length} rows, found ${verifiedById.size}.`,
    );
  }

  console.log(`Seeded and verified ${games.length} campaign games.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
