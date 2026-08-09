import type { SceneAnalysis } from "@/lib/backboard/schemas";
import { hashSeed } from "@/game/generation/rng";
import type { GameSpec } from "@/game/types";
import { slugifyTitle } from "@/lib/utils/slug";
import { CREATOR_BY_TEMPLATE } from "./creators";
import {
  buildTemplateSpec,
  CAMPAIGN_TEMPLATE_IDS,
  TEMPLATES,
  type CampaignTemplateId,
  type TemplateId,
} from "./index";

export type ExistingCampaignIdentity = {
  id: string;
  slug: string | null;
  publishedAt: string | null;
};

export type CampaignSeedGame = {
  template: CampaignTemplateId;
  id: string;
  slug: string;
  title: string;
  creatorName: string;
  sourceImagePath: string;
  sourceImageUrl: string;
  sceneAnalysis: SceneAnalysis;
  gameSpec: GameSpec;
  publishedAt: string;
};

/** Stable UUID-shaped id used by campaign rows in every environment. */
export function campaignGameId(template: TemplateId): string {
  const suffix = hashSeed("template-preview", template)
    .toString(16)
    .padStart(12, "0");
  return `00000000-0000-4000-8000-${suffix}`;
}

function availableSlug(
  title: string,
  template: TemplateId,
  reserved: Set<string>,
): string {
  const base = slugifyTitle(title);
  const candidates = [
    base,
    `${base}-${template}`,
    `${base}-${template}-${hashSeed("campaign-slug", template).toString(36)}`,
  ];
  const slug = candidates.find((candidate) => !reserved.has(candidate));
  if (!slug) throw new Error(`Could not allocate a stable slug for ${template}`);
  return slug;
}

/**
 * Builds all campaign rows without touching the database. Existing public
 * identity is preserved; new publication times are staggered in campaign
 * order so difficulty ties sort consistently.
 */
export function buildCampaignSeedGames(options: {
  existing?: readonly ExistingCampaignIdentity[];
  reservedSlugs?: ReadonlySet<string>;
  publishedAtStart?: Date;
} = {}): CampaignSeedGame[] {
  const existingById = new Map(
    (options.existing ?? []).map((game) => [game.id, game] as const),
  );
  const reserved = new Set(options.reservedSlugs ?? []);
  const publishedAtStart = options.publishedAtStart ?? new Date();

  return CAMPAIGN_TEMPLATE_IDS.map((template, index) => {
    const definition = TEMPLATES[template];
    const id = campaignGameId(template);
    const imageUrl = `/template-previews/${template}.svg`;
    const seed = hashSeed("template-preview-seed", template);
    const built = buildTemplateSpec(definition.previewAnalysis, seed, {
      imageUrl,
      forceTemplate: template,
    });
    const existing = existingById.get(id);
    const slug =
      existing?.slug ?? availableSlug(built.title, template, reserved);
    reserved.add(slug);
    const publishedAt =
      existing?.publishedAt ??
      new Date(publishedAtStart.getTime() + index * 1_000).toISOString();
    const gameSpec = { ...built, slug };

    return {
      template,
      id,
      slug,
      title: gameSpec.title,
      creatorName: CREATOR_BY_TEMPLATE[template],
      sourceImagePath: `previews/${id}.svg`,
      sourceImageUrl: imageUrl,
      sceneAnalysis: definition.previewAnalysis,
      gameSpec,
      publishedAt,
    };
  });
}
