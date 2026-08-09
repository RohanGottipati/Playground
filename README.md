# Playground

Arrange physical objects, take one photo, and play the 2D platformer your desk
becomes — then publish it to a shared public playground.

**Arrange. Snap. Play. Publish.**

No prompts, no tile editors, no level-design knowledge, no account.

## How it works

1. `/create` takes one photo containing one or more visible objects. Phones open
   their camera directly; desktops can show a one-time QR code that opens the
   camera-only `/capture/<token>` page on a phone. The phone upload appears on
   the desktop automatically, while a normal desktop file picker remains
   available.
2. `POST /api/uploads` validates, rotates and normalizes the photo to JPEG, then
   stores it (Supabase Storage, or an in-process store locally).
3. `POST /api/games/generate` sends the image to **Backboard GPT-4o** with a
   strict JSON-only prompt. The response is extracted, `zod`-validated, and
   transient failures are retried up to three times without changing models.
   Authentication, billing and model configuration failures stop with an
   actionable error; an unverified or pre-made scene is never substituted.
4. Detected objects are clamped, deduplicated and mapped to mechanics
   deterministically — the model never controls physics or playability.
5. Sparse photos receive dynamic helper platforms synthesized to complete a
   playable route. The level is generated originally, its reachability graph is
   BFS-checked from the spawn, and level geometry is optimized in an intelligent
   order (widen → move → make moving → bounce pad → add helper platforms).
   Every path optimization is recorded in `gameSpec.validation.repairActions`.
6. A `GameSpec` that passes runtime safety checks is rendered by **Phaser 3** and
   played in the browser. Object catalog matches drive the illustrated sprite
   while the validated mechanic continues to control physics and collision
   behavior.
7. `POST /api/games/publish` assigns a unique slug and makes `/game/<slug>`
   public. Plays, deaths, collectibles and completions feed the leaderboard,
   `/playground` sorting and `/stats` (`/arcade` redirects for old links).

### Object → mechanic mapping

| Object shape / role | Mechanic |
| --- | --- |
| flat, long, rigid (books, pencils, rulers) | `static_platform` |
| cables, chargers, ropes | `moving_platform` |
| springy or soft round things (sponges, balls) | `bounce_pad` |
| sharp things (scissors, forks, keys) | `hazard` |
| small trinkets (erasers, coins, caps) | `collectible` |
| containers, rings, mugs (in pairs) | `portal` |
| hovering drones (shooter mode only) | `target` |
| the farthest reachable landmark | `goal` |

## Game modes & rules popup

Every run is seeded (`spec.seed`), so the same photo produces a different game
each time while published games replay identically. A weighted, seeded picker
(`game/generation/selectMode.ts`) chooses one of four modes based on the
photographed objects and what the database has learned from previous runs:

- **classic** — reach the exit door.
- **shooter** — destroy hovering drones with projectiles (ammo is dynamically
  synthesized from detected round/small objects or energy projectiles) before the
  goal unlocks. Projectiles fly straight and pass through platforms so every
  drone is always hittable.
- **skyfall** — detected objects rain from the sky; touching one is fatal. A
  safe zone around spawn is never bombarded.
- **rush** — grab every collectible before a generous timer expires; running
  out restarts the run, never bricks it.

Modes are applied *after* the level is validated and only ever add floating
entities, so the verified route to the goal cannot break. If scene geometry
requires simplified entity placement, the AI smoothly adapts the run to classic
mode — ensuring every level is finishable. Each spec carries mode-specific `rules`
(`game/generation/rules.ts`) rendered as a pre-game popup; the scene idles
(physics paused, no timer) until the player presses Play. Titles and object
labels are scrubbed of brand/product names (`lib/utils/genericName.ts`) both
in the analysis prompt and again at generation time.

## Magic Patterns design flow

```
[Prompt] → [AI Agent] → (MCP/API call) → [Magic Patterns] → [Editor URL & Spec] → [Adapts Code]
```

When `MAGIC_PATTERNS_API_KEY` is set, the generate route makes a server-side
REST call (the MCP-server-call equivalent for a web runtime) to
`POST https://api.magicpatterns.com/api/v2/pattern` with a design prompt built
from the spec plus the source photo (`lib/magicpatterns/client.ts`). The
returned source files are mined for a palette
(`lib/magicpatterns/adapt.ts`) that tints the Phaser theme
(`paletteForSpec` in `game/theme.ts`), and the editor/preview URLs are stored
on `spec.magicPatterns` and surfaced in the create flow. The call is
best-effort with a timeout (`MAGIC_PATTERNS_TIMEOUT_MS`, default 25s) and can
never fail generation.

## Learning loop

Every generation writes a row to `generation_insights` (mode, seed, title,
labels, mechanics, Magic Patterns id — service-role only, migration
`0006_generation_learning.sql`). The next generation reads
`getGenerationHints()` — the last 12 modes/titles plus per-mode completion
rates joined from sessions — to avoid repeating recent modes and titles and to
demote modes with under 10% completion over 8+ plays. Hint reads and insight
writes are non-fatal everywhere: a database without migration 0006 simply
yields empty hints.

## Running locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Playground degrades cleanly when persistence is not configured:

- **No Supabase credentials** → games, sessions, events and images live in the
  server process (`lib/db/memory.ts`). The full create → play → publish → playground
  → stats loop works, but data resets on restart.
- **No Backboard credentials or chat entitlement** → photo analysis stops with
  a clear error, ensuring every level experience is uniquely generated by AI
  rather than displaying pre-made content.

### Environment variables

See `.env.example`. `BACKBOARD_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are
server-only and are never exposed to the browser.

### Supabase setup

```bash
supabase db push          # or run supabase/migrations/*.sql in order
psql "$DATABASE_URL" -f supabase/seed.sql   # optional demo game
```

`0001_init.sql` creates `games`, `game_objects`, `game_sessions`, `game_events`,
`game_likes`, `mechanic_discoveries`, the `game_summaries` /
`object_label_counts` / `global_play_totals` views, the
`register_mechanic_discovery` function, and RLS policies that make published
data readable by anonymous clients while all writes go through the service role.
`0002_storage.sql` creates the public `source-images` and `game-thumbnails`
buckets. `0004_component_catalog.sql` creates the RLS-protected component
registry. `0005_renderable_object_components.sql` lets exact object artwork be
selected independently alongside its assigned mechanic.
`0006_generation_learning.sql` adds the service-role-only
`generation_insights` table and replaces the `game_summaries` view to expose
each game's `mode`. `0007_phone_capture_sessions.sql` adds the private,
short-lived pairing records used by QR phone capture; raw bearer tokens are
never stored and the table has no anonymous access.
`0008_telemetry_dashboard.sql` adds service-role-only telemetry aggregates and
partial indexes for exact per-game fatalities, active sessions, and recent
spatial events. `0009_global_telemetry_origins.sql` adds the service-role-only
site-wide aggregate (active sessions and distinct cities in the last five
minutes) behind `GET /api/stats/live-origins`. After applying them,
sync the canonical 349-row catalog and optionally backfill older game specs:

```bash
npm run components:check
npm run components:sync
npm run components:backfill
```

The bundled files under `game/components/` are the single source of truth the
generator skins templates from; there is no public catalog endpoint.

## Scripts

```bash
npm run dev        # dev server
npm run build      # production build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
npm test           # vitest (generation, parsing, repository, events)
npm run components:check     # validate all 349 registry entries locally
npm run components:sync      # idempotently upsert the registry to Supabase
npm run components:backfill  # add component IDs to legacy game specs
```

## Controls

- Desktop: `A`/`←` and `D`/`→` to move, `W`/`↑`/`Space` to jump, `X`/`F` to
  shoot (shooter mode), `R` to restart.
- Mobile: on-screen left / right / jump / restart buttons, plus a shoot button
  in shooter mode.

## Layout

```
app/                    routes and API handlers
components/             UI: create flow, playground, game shell, stats dashboards
game/                   engine-agnostic domain + Phaser scenes/entities
  generation/           normalize → assign mechanics → repair → validate → spec
lib/backboard/          prompts, GPT-4o HTTP client and JSON parsing
lib/db/                 repository interface, memory and Supabase implementations
lib/analytics/          event schemas and client-side tracking
supabase/               migrations and seed
tests/                  vitest suites and fixed scene fixtures
```

## Design constraints

- The AI returns **JSON only**; it never emits code, physics values or level
  geometry decisions.
- Every Backboard attempt is pinned to `openai/gpt-4o`.
- Everything after the AI boundary is deterministic: the same scene analysis
  always produces the same `GameSpec`.
- A level is only playable after `collectSafetyIssues()` reports no problems.
- Photos on published games are public; the create flow warns about this before
  the first upload.

## Known gaps / next steps

- Thumbnail generation (`thumbnailPath`, `game-thumbnails` bucket) is wired
  through the schema but not yet produced.
- Rate limiting is per-process in-memory; move to Supabase or Redis before
  running multiple instances.
- Remix currently links a new photo to its parent game; it does not reuse the
  parent's objects.
