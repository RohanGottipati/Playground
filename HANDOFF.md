# HANDOFF: Image-to-Game Overhaul (in progress)

This document is for the next AI agent. It describes the task, every decision
already made, exactly what has been implemented so far, and precisely what
remains. Read it fully before touching code. Delete this file when the task is
complete.

---

## 1. The user's requirements (verbatim intent)

1. **Games are sometimes impossible to complete** → must be fixed (root cause
   found: reachability validator was more permissive than actual jump physics).
2. **Components are "trash" / not properly sized** → square SVG object sprites
   were being stretched to arbitrary collider rectangles. Must preserve aspect.
3. **Games don't make sense / must be creative + unique every run** → add game
   modes (e.g. *shooting donuts*, *stuff dropping from the sky the player must
   dodge*), seeded per run so the same photo gives different games.
4. **Every generated game needs a popup explaining its specific rules.**
5. **Products must not be titled specifically** → no brand/product names in
   labels or titles ("coca-cola can" → "soda can"). Generic titles.
6. **Magic Patterns flow**: `[Prompt] → [AI Agent] → (MCP/API call) → [Magic
   Patterns] → [Editor URL & Spec] → [Adapts Code]`. The user added
   `MAGIC_PATTERNS_API_KEY` to `.env` (present, last line — the file is
   secret-redacted in tooling; the key name is confirmed via
   `cut -d= -f1 .env`).
7. **Entire UI needs to be better.**
8. **Learning loop**: every run saves insights to the DB; the next run reads
   them and improves (avoid repeated modes/titles, tune difficulty by real
   completion rates).

## 2. Codebase orientation (already explored)

- Next.js 15 App Router + Phaser 3 + Supabase (falls back to in-memory repo in
  `lib/db/memory.ts` when no Supabase creds). Zod v4. Vitest.
- Pipeline: `POST /api/uploads` → `POST /api/games/generate` →
  `lib/backboard/client.ts` (GPT-4o via Backboard, returns `SceneAnalysis`) →
  `game/generation/generateLevel.ts` (deterministic) → spec stored via
  `lib/db` → rendered by `game/scenes/GameScene.ts`.
- Catalog: `game/components/catalog-data.mjs` (349 rows). Object-sprite ids
  look like `food-donut`, `kit-mug`, `stat-pencil`, `veh-car` (prefixes:
  fur, kit, food, tech, stat, sport, veh, tool, cloth, out, toy, mus, house).
  Only object-sprite ids exist in `magic-patterns/registry.tsx` textures
  (`hasMagicPatternComponent`); core ids (`mechanic-*`, `terrain-*`,
  `collectible-*`) use drawn Phaser art.
- Magic Patterns API (verified via docs):
  `POST https://api.magicpatterns.com/api/v2/pattern`, header
  `x-mp-api-key`, multipart form: `prompt` (required), `mode` (`fast`|`best`),
  `modelSelector` (`auto`), `images` (file[], ≤5MB). Response JSON:
  `{ id, sourceFiles:[{id,name,code}], compiledFiles, editorUrl, previewUrl, chatMessages }`.

## 3. Design decisions (locked in — do not re-litigate)

- **Physics/validator alignment** (the completability fix):
  - `JUMP_VELOCITY -560` (apex ≈ 142px), `SAFE_MAX_UPWARD_DELTA 104`,
    `SAFE_MAX_HORIZONTAL_GAP 170`, `BOUNCE_VELOCITY -800` (apex ≈ 290px),
    bounce multiplier in `canJump` `2.2` (≈229px), `MAX_HAZARD_SIZE 140`,
    `MIN_GROUND_HAZARD_GAP 230` + new ground-hazard-corridor repair.
- **Game modes**: `"classic" | "shooter" | "skyfall" | "rush"` (type
  `GameMode`, const `GAME_MODES` in `game/types.ts`).
  - *shooter*: player shoots projectiles (ammo = detected round/small object
    or donut, componentId e.g. `food-donut`); 2–4 hovering `target` entities
    (new mechanic `"target"`, drawn `drone-target` art) placed 30px above wide
    (≥220px) reachable surfaces so a straight chest-height shot from the same
    surface always hits; goal locked until `shooter.requiredKills` destroyed.
    Projectiles fly straight, pass through platforms (guarantees hittability),
    range-limited.
  - *skyfall*: objects (sprites of the detected objects, componentIds) fall
    from the sky at seeded random x (never within `SKYFALL_SAFE_ZONE_X=170`
    of spawn); constant fall speed; despawn at ground; touch = death.
  - *rush*: extra collectibles placed on reachable nodes; goal locked until
    all collected; generous timer (`estimate*3 + 9s/pickup`, min 45s);
    timeout restarts run (never bricks it).
  - Mode selection: `selectGameMode(rng, objects, hints)` — seeded weights,
    object affinity, strongly demotes last 2 modes from DB hints, demotes
    modes with <10% completion over ≥8 plays.
  - Degradation: if shooter/rush can't place entities, fall back to classic
    (`effectiveMode`), never ship a locked goal (enforced in
    `runtimeSafety.ts`).
- **Determinism vs uniqueness**: `generateLevel(analysis, options)` takes
  `options.seed`; default = `hashSeed(imageUrl, titleSuggestion)` so existing
  tests stay deterministic. The generate API route must pass
  `seed: randomSeed()` for per-run uniqueness. Seed is stored in
  `spec.seed`; published games replay identically.
- **Rules popup**: `spec.rules` (`GameRules` type) built by
  `game/generation/rules.ts#buildRules`; `fallbackRules(spec)` for legacy
  games. UI: modal overlay in `GamePlayer` gated by new
  `ControlState.started` flag — GameScene idles (physics paused, timer
  stopped) until `controls.started === true`.
- **Generic titles**: `lib/utils/genericName.ts#scrubBrandNames` applied in
  `normalizeObjects` (labels) + `game/generation/title.ts#generateTitle`
  (seeded pattern per mode, avoids `hints.recentTitles`).
- **Magic Patterns**: server-side REST call (the "MCP server call" equivalent
  for a web runtime — document this in README). Best-effort with timeout;
  NEVER fails generation. Store `spec.magicPatterns = { designId, editorUrl,
  previewUrl, palette }`; palette = hex colors extracted from returned
  `sourceFiles[].code`, adapted into Phaser palette accents.
- **Learning loop**: new repo methods `getGenerationHints()` /
  `saveGenerationInsight()`, `generation_insights` table (service-role only),
  `game_summaries` view gains `mode` column; `GameSummary.mode` added.
  `GenerationHints` type lives in `game/generation/hints.ts` (already
  created) with `paceForMode()` → `"gentle" | "standard" | "spicy"`.

## 4. DONE — files already created/changed (all edits complete & saved)

| File | Status | What changed |
|---|---|---|
| `game/types.ts` | DONE | `MechanicType` + `"target"`; `GAME_MODES`/`GameMode`; `GameRules`, `ProjectileSpec`, `SkyfallSpec`, `ShooterSpec`, `RushSpec`, `MagicPatternsInfo`; `ENTITY_VISUAL_KINDS` + `"drone-target"`, `"donut"`; `GameSpec` gains `mode?, seed?, rules?, projectile?, skyfall?, shooter?, rush?, magicPatterns?`, `player.canShoot?`; `GameEventType` + `"target_destroyed"`. |
| `game/constants.ts` | DONE | Physics fix (see §3) + `TARGET_SIZE 46`, `PROJECTILE_SPEED 640`, `PROJECTILE_COOLDOWN_MS 320`, `PROJECTILE_MAX_RANGE 620`, `PROJECTILE_SIZE 22`, `SKYFALL_*` constants, `RUSH_MIN_TIME_LIMIT_S 45`, `RUSH_TIME_PER_COLLECTIBLE_S 9`, `MIN_GROUND_HAZARD_GAP 230`. |
| `game/generation/validateReachability.ts` | DONE | Bounce multiplier 2.6 → 2.2 with comment. |
| `lib/utils/genericName.ts` | DONE (new) | `scrubBrandNames`, `containsBrandName`; big curated brand→generic regex table; safe model-suffix stripper (lookbehind, end-anchored). |
| `game/generation/rng.ts` | DONE (new) | mulberry32 `createRng` (`next/int/pick/shuffle`), `hashSeed`, `randomSeed`. |
| `game/generation/hints.ts` | DONE (new) | `ModeStat`, `GenerationHints`, `EMPTY_HINTS`, `Pace`, `paceForMode`. |
| `game/generation/selectMode.ts` | DONE (new) | Weighted seeded mode picker (see §3). |
| `game/generation/title.ts` | DONE (new) | Pattern-based generic title generator per mode. |
| `game/generation/rules.ts` | DONE (new) | `buildRules(input)` + `fallbackRules(spec)`; mode-specific copy referencing actual object labels. |
| `game/generation/modes.ts` | DONE (new) | `applyGameMode` + `effectiveMode`; target placement (wide reachable nodes only, x≥380, avoids goal/entities), rush pickups on reachable nodes, skyfall tuning per pace w/ jitter, ammo picker (`pickAmmo` → catalog probe via `selectComponentForEntity`, fallback `food-donut`). |
| `game/generation/generateLevel.ts` | DONE (rewritten) | Integrated seed/rng/hints/mode/rules/title; new `enforceGroundHazardCorridors`; `SPARSE_HELPER_PAIRS` re-tuned to new jump envelope (y −95/−190, width 190); mode applied AFTER goal & reachability (only adds floating entities → route stays valid); rush time computed after difficulty; `player.canShoot`; spec fields wired. Exports `GenerateLevelOptions` with `seed?`/`hints?`. |
| `game/generation/normalizeObjects.ts` | DONE | Labels scrubbed via `scrubBrandNames` BEFORE dedupe comparison. |
| `game/generation/runtimeSafety.ts` | DONE | Validates shooter/rush/skyfall/projectile invariants (locked-goal safety, dodgeable skyfall ranges, etc.). |
| `game/art/selectVisual.ts` | DONE | `case "target"` → `"drone-target"`; `resolveEntityVisual` returns `{kind:"drone-target"}` (no componentId) for targets. |
| `game/bus.ts` | DONE | `HudState` + `targetsLeft?, totalTargets?, timeLeftMs?, goalLocked?`; `RunResult` + `targetsDestroyed?`; `ControlState` + `shoot`, `started` (start gate). |
| `game/art/entityArt.ts` | DONE | New `drawDrone`, `drawDonut` + wired into `drawEntityArt`; **sizing fix**: `createMagicPatternArt` now returns `Image[]`, never stretches (tall colliders → bottom-aligned stack; wide platforms → row of aspect-correct sprites on a new `drawCollisionSlab`; others → single sprite ≤120px); `attachEntityArt` updated (slab under exact art for platform-like, `usesExactObjectArt = images.length>0`); `animateEntityArt` target hover tween; new exports `createProjectileVisual`, `createSkyfallVisual` (component art or drawn donut/crate fallback). |
| `game/entities/Target.ts` | DONE (new) | `createTarget` + `TargetRect` (static body, drone art, hover anim). |

## 5. REMAINING WORK (in recommended order)

### 5.1 `game/scenes/GameScene.ts` (biggest piece)
Extend the existing scene (keep all current behavior):
- **Start gate**: in `create()` after setup: `this.physics.pause()`. In
  `update()`: if `!this.controls.started` → return early (no timer accrual,
  no input). On first started frame: `this.physics.resume()`, emit
  `gameEvent {type:"game_started"}` (MOVE the existing emit from `create` so
  sessions only count real runs — keep `bus.emit("ready")` in create).
  On `scene.restart()` controls.started stays true → resumes immediately.
- **Mode state**: read `spec.mode ?? "classic"`, `spec.shooter/skyfall/rush/
  projectile`. Track `killCount`, `goalLocked` (true when shooter/rush with
  requirement), `timeLeftMs` (rush), `facing` (+1/−1 from last horizontal
  input, default +1).
- **Targets**: for entities `mechanic==="target"` use `createTarget` from
  `game/entities/Target.ts` into `targets: TargetRect[]`. Player overlap →
  `killPlayer()`. Destroyed targets: `destroyed=true`,
  `destroyEntityArt`, `.destroy()`, small flash (e.g. tween a circle),
  `killCount++`, emit `gameEvent {type:"target_destroyed", payload:{remaining}}`,
  update HUD; when `killCount >= spec.shooter.requiredKills` → unlock goal
  (`goalLocked=false`, pulse goal art via tween + brief floating text
  "GOAL UNLOCKED").
- **Shooting** (when `spec.player.canShoot && spec.projectile`): keys
  `X`/`F` (add to `registerKeys` + `addCapture`) or `controls.shoot`;
  cooldown `projectile.cooldownMs`; spawn at player center offset
  `facing*24`; a rectangle `PROJECTILE_SIZE` with arcade body,
  `allowGravity(false)`, `setVelocityX(facing * projectile.speed)`; attach
  `createProjectileVisual(scene, projectile.componentId, PROJECTILE_SIZE)`
  and sync its position in update (or use `postUpdate` via container follow —
  simplest: store pairs and sync in `update`). Destroy after traveling
  `maxRangePx` (record spawn x) or leaving world. Overlap projectile×target →
  destroy both. Projectiles do NOT collide with platforms (by design).
- **Skyfall** (when `spec.skyfall`): `this.time.addEvent({delay: intervalMs,
  loop:true})` gated on `started && !completed`; skip spawn if active count
  ≥ `maxConcurrent`; x = seeded rng (`createRng(spec.seed ?? 1)` created in
  scene) in `[SKYFALL_SAFE_ZONE_X+80, width-60]`; spawn at y=−40, body
  `allowGravity(false)`, `setVelocityY(fallSpeed)`; visual =
  `createSkyfallVisual(scene, componentIds[i % len], SKYFALL_OBJECT_SIZE,
  palette)` synced each frame; despawn + small poof when
  `y > GROUND_TOP - 10`; overlap player → `killPlayer()`. Pause spawner while
  not started.
- **Rush** (when `spec.rush`): `timeLeftMs = timeLimitSeconds*1000 −
  elapsedMs`; HUD it; at ≤0 → flash "OUT OF TIME" + `restartRun()`. Goal
  locked until `collected >= rush.requiredCollectibles` → unlock like shooter.
- **Goal locking**: in the goal overlap handler, if `goalLocked` → show a
  throttled floating hint ("Destroy N drones!" / "Collect M more!") and do
  NOT finish; else `finish()`.
- **HUD**: `emitHud()` include `targetsLeft` (shooter), `totalTargets`,
  `timeLeftMs` (rush), `goalLocked`.
- **finish()**: include `targetsDestroyed: killCount` in the result.
- Add a small `floatingText(x,y,text)` helper (tweened up + fade).

### 5.2 `game/scenes/BootScene.ts`
Preload additional textures: `spec.projectile?.componentId` and
`spec.skyfall?.componentIds ?? []` alongside the entity componentIds
(same `magicPatternSvgDataUri`/`load.svg` path).

### 5.3 `game/theme.ts`
Add `paletteForSpec(spec: GameSpec): ThemePalette` = `paletteForTheme(spec.theme)`
merged with `spec.magicPatterns?.palette` (numeric overrides). Use it in
`GameScene.create()` (replace `paletteForTheme(this.spec.theme)`) and
`ResultScene`.

### 5.4 Magic Patterns integration (`lib/magicpatterns/`)
- `client.ts`:
  ```ts
  export function isMagicPatternsConfigured(): boolean // MAGIC_PATTERNS_API_KEY
  export async function createMagicPatternsDesign(input: {
    prompt: string;
    image?: { bytes: Uint8Array; mimeType: string; fileName: string };
  }): Promise<{ designId?: string; editorUrl?: string; previewUrl?: string;
               sourceFiles: { name: string; code: string }[] }>
  ```
  POST multipart to `https://api.magicpatterns.com/api/v2/pattern` with
  header `x-mp-api-key`, fields `prompt`, `mode=fast`, `modelSelector=auto`,
  and `images` file when provided. AbortController timeout
  `MAGIC_PATTERNS_TIMEOUT_MS` env (default ~25000). Throw `AppError` on
  failure (caller catches; non-fatal). NEVER log the key.
- `adapt.ts`: `adaptDesignPalette(sourceFiles): MagicPatternsInfo["palette"]`
  — regex `#[0-9a-fA-F]{6}` from all `code`, dedupe, compute
  luminance/saturation, pick: darkest → `background`, 2nd darkest →
  `backgroundAccent`, most saturated bright → `collectible`/`goal` accents,
  a mid-light neutral → `platform`. Return `{}` when nothing sensible.
- `buildDesignPrompt(spec, objectLabels)`: short prompt like
  “Design a playful arcade poster/theme kit for a 2D platformer called
  ‘<title>’, mode <mode>, built from <labels>. Bold flat shapes, high
  contrast, arcade palette.”
- Wire into generate route (see 5.6): after `generateLevel`, call
  best-effort; attach `spec.magicPatterns = { designId, editorUrl,
  previewUrl, palette }`.
- `.env.example`: add `MAGIC_PATTERNS_API_KEY=` (+ optional
  `MAGIC_PATTERNS_TIMEOUT_MS=`). **Do NOT edit `.env`** (contains secrets,
  and the tool view redacts it).

### 5.5 Learning loop (DB)
- `lib/db/types.ts`: add to `GameSummary`: `mode: string`. New types:
  ```ts
  export type GenerationInsightInput = {
    gameId: string; mode: string; seed: number; theme: string;
    difficulty: number; title: string; objectLabels: string[];
    mechanics: string[]; magicPatternsId?: string | null;
    magicPatternsEditorUrl?: string | null; promptVersion: string;
  };
  ```
  Extend `Repository` with `getGenerationHints(): Promise<GenerationHints>`
  and `saveGenerationInsight(input: GenerationInsightInput): Promise<void>`
  (import `GenerationHints` from `@/game/generation/hints`).
- `lib/db/memory.ts`: add `insights: GenerationInsightInput & {createdAt}[]`
  to `MemoryState` (bump the global init). `getGenerationHints`: recentModes/
  recentTitles = last 12 insights (fallback: games map) newest first;
  modeStats = join sessions→games via `game.gameSpec.mode ?? "classic"`.
  `summaryFor`: add `mode: game.gameSpec.mode ?? "classic"`.
- `lib/db/supabase.ts`: `SummaryRow` + `mode?: string`; `toSummary` add
  `mode: String(row.mode ?? "classic")`. `saveGenerationInsight`: insert into
  `generation_insights`; swallow/log “relation does not exist” (migration not
  applied) as non-fatal. `getGenerationHints`:
  1) `generation_insights` select mode,title order created_at desc limit 12;
  2) modeStats: select `games.id, game_spec->>'mode'` (published+draft, limit
     300 recent) + `game_sessions` (game_id, completed, limit 1000 recent),
     aggregate in JS. All errors → return `EMPTY_HINTS` (log diagnostic).
- `supabase/migrations/0006_generation_learning.sql`:
  - `generation_insights` table (cols matching input + `created_at`),
    indexes on `created_at desc`, RLS enabled with NO anon policies
    (service-role writes/reads only).
  - `create or replace view public.game_summaries` — copy the FULL view SQL
    from `0001_init.sql` and add `coalesce(g.game_spec->>'mode','classic') as
    mode` to the select list (views can't be altered incrementally).
  - Keep grants (`grant select on public.game_summaries to anon,
    authenticated;` still applies to the replaced view — re-grant anyway).

### 5.6 `app/api/games/generate/route.ts`
- Before `generateLevel`: `const hints = await db.getGenerationHints().catch(() => EMPTY_HINTS)`.
- `generateLevel(analysis, { imageUrl, seed: randomSeed(), hints })`.
- After spec: best-effort Magic Patterns:
  ```ts
  let spec = generateLevel(...);
  if (isMagicPatternsConfigured()) {
    try {
      const design = await createMagicPatternsDesign({
        prompt: buildDesignPrompt(spec, normalized.map(o => o.label)),
        image: { bytes, mimeType, fileName: `${gameId}.jpg` },
      });
      spec = { ...spec, magicPatterns: { designId: design.designId,
        editorUrl: design.editorUrl, previewUrl: design.previewUrl,
        palette: adaptDesignPalette(design.sourceFiles) } };
    } catch (e) { logDiagnostic("magicpatterns.failed", {...}) }
  }
  ```
- After `saveDraftGame`/`saveGameObjects`:
  ```ts
  await db.saveGenerationInsight({ gameId, mode: spec.mode ?? "classic",
    seed: spec.seed ?? 0, theme: spec.theme, difficulty: spec.difficulty,
    title: spec.title, objectLabels: normalized.map(o=>o.label),
    mechanics: [...new Set(spec.entities.map(e=>e.mechanic))],
    magicPatternsId: spec.magicPatterns?.designId ?? null,
    magicPatternsEditorUrl: spec.magicPatterns?.editorUrl ?? null,
    promptVersion: PROMPT_VERSION }).catch(...non-fatal log)
  ```
- Response already returns `gameSpec` (now includes mode/rules/magicPatterns).

### 5.7 `lib/backboard/prompts.ts`
- Bump `PROMPT_VERSION` to `"4"`.
- Add rules to SYSTEM_PROMPT + USER_PROMPT: “Use generic object names (e.g.
  'soda can', 'phone', 'sneaker'); never brand names, product names, model
  numbers, or logo text” and “titleSuggestion must not contain brand or
  product names.”
- `lib/analytics/eventSchemas.ts`: add `"target_destroyed"` to
  `GameEventTypeSchema`.

### 5.8 UI work
- **`components/game/GameRulesModal.tsx` (new)**: overlay (absolute, inside
  the player wrapper or fixed) showing `rules.headline`, `objective`,
  `howToPlay[]` (numbered), `controls[]`, `tip`, mode badge + difficulty;
  big “Play” `btn-primary` → `onStart()`. Also an “How to play” ghost button
  in `GamePlayer` to reopen (set `controls.started=false` while open, true on
  close — that pauses physics via the scene gate).
- **`components/game/GamePlayer.tsx`**: `const rules = spec.rules ??
  fallbackRules(spec)` (import from `@/game/generation/rules`); state
  `showRules=true` initially; render modal over `PhaserCanvas` container;
  `onStart={() => { controls.started = true; setShowRules(false); }}`
  (guard controls null — keep modal until controls ready or set started via
  ref once bus ready). Pass `canShoot={spec.player.canShoot}` to
  `TouchControls`. Show mode badge next to HUD.
- **`components/game/TouchControls.tsx`**: add `shoot` hold-button (uses
  `holdHandlers(controls,"shoot")`) rendered only when `canShoot`.
- **`components/game/GameHUD.tsx`**: render `targetsLeft`/`totalTargets`
  (🎯), `timeLeftMs` countdown (⏳, red when <10s), lock icon while
  `goalLocked`.
- **`components/game/GameResults.tsx`**: show `targetsDestroyed` when
  present.
- **`components/ui/Badge.tsx`**: add `ModeBadge({mode})` — labels: classic
  “Platformer”, shooter “Shooter”, skyfall “Skyfall”, rush “Rush” with
  distinct tones.
- **`components/create/GenerationProgress.tsx`**: add step `design`
  (“Designing the art kit (Magic Patterns)”) between analyze and build; type
  `GenerationStep` gains `"design"`; CreateFlow sets it before fetch resolves
  (it's one request — just sequence the visual steps optimistically, e.g.
  analyze → design after ~8s timer, or set steps from response phases;
  simplest: keep optimistic timers).
- **`components/create/CreateFlow.tsx`** (ready panel): show `ModeBadge`,
  the rules card (headline/objective), object chips (rounded spans instead of
  plain `<ul>`), Magic Patterns panel when `gameSpec.magicPatterns?.editorUrl`
  (“Open design in Magic Patterns editor” external link + preview link), keep
  repair-actions details. Publish panel unchanged.
- **`app/page.tsx`**: refresh hero copy to mention unique modes (“Every photo
  becomes a different game: shooters, skyfalls, rushes…”), maybe a mode
  badges row. Keep visual language (panels/btn classes).
- **`app/game/[slug]/page.tsx`**: add `ModeBadge` next to `DifficultyBadge`
  (`game.gameSpec.mode ?? "classic"`).
- **`components/arcade/ArcadeCabinet.tsx`**: `ModeBadge` on the card
  (requires `GameSummary.mode` from 5.5).

### 5.9 Tests (`npm test` must pass)
- Existing `tests/generation.test.ts` will need updates:
  - Sparse-helper tests still expect counts (1/2) — placement values changed
    but counts are unchanged; verify.
  - `resolveEntityVisual` / componentId expectations unchanged.
  - Add: determinism (same seed → identical spec JSON; different seeds →
    different mode/title eventually), completability invariants (goal support
    reachable; shooter specs have ≥1 target; rush requiredCollectibles ≤
    collectibles), ground-hazard corridor (feed analysis with 4 adjacent
    ground hazards → expect ≤ N kept + rest converted).
  - `lib/utils/genericName`: "Coca-Cola can"→"soda can", "iPhone 15 Pro"→
    "phone", "LEGO brick"→"toy brick brick"?? (verify actual output; the
    replacement maps lego→"toy brick", so "lego brick" → "toy brick brick" —
    if so, dedupe repeated words in `scrubBrandNames` (add
    `output.replace(/\b(\w+)( \1\b)+/gi, "$1")`).
  - `title.ts`: titles contain no brands, vary across seeds, respect
    recentTitles avoidance.
  - `selectMode`: avoids `hints.recentModes[0]` (probability ~0 → assert over
    fixed seeds), deterministic per seed.
  - Zod event schema accepts `target_destroyed`.
- Check `tests/fixtures/scenes.ts` (fixtures: deskScene/clutteredScene) still
  produce safe specs (run tests!). `deskScene` labels: notebook, mug, pencil,
  scissors, eraser (test expects componentIds `stat-notebook, kit-mug,
  stat-pencil, stat-scissors, stat-eraser` — scrubbing must NOT alter these
  plain labels).

### 5.10 README + cleanup
- README: new “Game modes & rules popup”, “Magic Patterns design flow”
  (diagram from §1.6, explain REST call = MCP-equivalent server call),
  “Learning loop” (generation_insights + hints), updated object→mechanic
  table (add target/drone row), controls (X/F to shoot), migration 0006 note.
- Delete `HANDOFF.md` when done.

## 6. Validation commands

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # next lint
npm test            # vitest run
npm run dev         # manual: /create → upload photo → verify popup, mode, sizing
```

Note: full end-to-end needs `BACKBOARD_API_KEY` (present in `.env`).
`.env` also has Supabase creds; memory repo covers local testing without.

## 7. Gotchas / invariants to preserve

- `generateLevel` must stay deterministic for identical `(analysis, options)`
  including seed — a vitest asserts JSON equality of two runs.
- Never let Magic Patterns / hints / insight failures fail generation
  (wrap in try/catch, log via `logDiagnostic`).
- `assertSpecIsSafe` runs at the end of generation AND in BootScene
  (`collectSafetyIssues`) — any new spec field must pass both for legacy
  (fields absent) and new specs.
- Targets are static bodies; hover is art-only (hitbox fixed).
- Projectiles must NOT collide with platforms (hittability guarantee).
- `controls.started` persists across `scene.restart()` — rules popup only
  blocks the first run (and manual reopen).
- Do not print or commit secrets; `.env` is redacted in tool output — never
  rewrite it; `.env.example` is the editable template.
- Keep `schemaVersion: 1` — all new GameSpec fields are optional for
  backward compatibility with published games.
- `game_summaries` is a Postgres VIEW — replace wholesale in migration 0006;
  memory + supabase repos must both surface `mode` with `"classic"` default.
- Supabase clients may hit a DB without migration 0006 → every new query
  needs graceful fallback (`EMPTY_HINTS`, skip insight insert).
