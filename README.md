# Playground

Arrange physical objects, take one photo, and play the 2D platformer your desk
becomes — then publish it to a shared public playground.

**Arrange. Snap. Play. Publish.**

No prompts, no tile editors, no level-design knowledge, no account.

## Features

- **Photo → game**: one photo of everyday objects is analyzed by GPT-4o (via
  the Backboard AI gateway) and turned into a playable Phaser 3 platformer
  dressed in sprites of the objects it found.
- **Phone capture from desktop**: `/create` on a desktop can show a one-time QR
  code that opens a camera-only `/capture/<token>` page on a phone; the photo
  appears on the desktop automatically. A normal file picker is always
  available, and phones open their camera directly.
- **24 hand-built level templates across five modes** — classic, shooter,
  skyfall, rush and gauntlet — each with a pre-game rules popup.
- **Publish & share**: published games get a public `/game/<slug>` page with a
  leaderboard and a share button; `/playground` lists published games and
  lets players like them (`/arcade` permanently redirects there for old links).
- **Stats & telemetry**: `/stats` shows site-wide metrics, a per-game telemetry
  dashboard (death heatmap, fatalities, active sessions, live event ticker,
  runtime leaderboard, object topology), live player origins, and a weekly
  recap.
- **Runs without a database**: without Supabase credentials everything is
  stored in the server process.

## How it works

1. `/create` takes one photo containing one or more visible objects.
2. `POST /api/uploads` validates, rotates and normalizes the photo to JPEG, then
   stores it (Supabase Storage, or an in-process store locally).
3. `POST /api/games/generate` sends the image to **Backboard GPT-4o** with a
   strict JSON-only prompt (`lib/backboard/`). The response is extracted,
   `zod`-validated, and failed attempts are retried up to three times without
   changing models. Authentication, billing and model configuration failures
   stop with an actionable error; a pre-made scene is never substituted.
4. Detected objects are clamped, deduplicated and classified deterministically
   (`game/generation/normalizeObjects.ts`, `assignMechanics.ts`). Titles and
   object labels are scrubbed of brand/product names
   (`lib/utils/genericName.ts`).
5. The photo is mapped onto one of the hand-built templates in
   `game/templates/`. The analysis only decides which bundled sprite components
   dress each template's fixed slots (`game/templates/skin.ts`); layouts and
   objectives are hand-built. The template is a seeded, difficulty-weighted
   pick that never repeats any of the last three templates and demotes the
   modes of the last two runs — unless the photo matches an object-signature
   recipe (e.g. earbud case + phone + bottle → *Case Barrage*,
   `game/templates/detectTrio.ts`), which is selected outright.
6. The resulting `GameSpec` must pass runtime safety checks
   (`game/generation/runtimeSafety.ts`) and is then rendered by **Phaser 3** in
   the browser. The scene stays paused behind the rules popup until the player
   presses Play.
7. `POST /api/games/publish` assigns a unique slug and makes `/game/<slug>`
   public. Plays, deaths, collectibles and completions feed the leaderboard,
   `/playground` sorting and `/stats`.

Every run is seeded (`spec.seed`), so a new photo produces a fresh game while
published games replay identically.

### Object roles

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

Each detected object's mechanic is stored in `game_objects`.

### Game modes

- **classic** — reach the exit door.
- **shooter** — destroy hovering drones with projectiles before the goal
  unlocks.
- **skyfall** — objects rain from the sky; touching one is fatal. A safe zone
  around spawn is never bombarded.
- **rush** — grab every collectible before the timer expires.
- **gauntlet** — a machine built from the photo's star object hurls objects
  at you; cross the course and touch the finish flag.

### Sprite art

`magic-patterns/` contains the React SVG sprite components (everyday objects
plus core game pieces) and the registry that maps component ids to them.
Because react-dom/server can't be bundled by the App Router, sprites are
pre-rendered to static files in `public/sprites/` (`npm run sprites:generate`)
and template cover art to `public/template-previews/`
(`npm run previews:generate`). `game/components/` holds the component catalog
used to resolve detected labels to sprites.

### Generation history

Every generation writes a row to `generation_insights` (mode, seed, title,
labels, mechanics — service-role only, migration
`0006_generation_learning.sql`). The next generation reads
`getGenerationHints()`, whose recent-template history drives the no-repeat
template pick. Hint reads and insight writes are non-fatal: a database without
migration 0006 simply yields empty hints.

## Tech stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS 3, Framer Motion
- Phaser 3 game engine
- Supabase (Postgres, Storage, Realtime) via `@supabase/supabase-js`
- Backboard AI gateway pinned to `openai/gpt-4o`
- zod for schema validation, sharp for image normalization, qrcode.react for
  phone pairing
- Vitest for tests, Playwright for the deployment smoke test

## Project structure

```
app/                    routes (/, /create, /capture/[token], /game/[slug],
                        /playground, /stats, /arcade) and API handlers (app/api)
components/             UI: create flow, playground, game shell, stats dashboards
game/                   Phaser scenes/entities, art, theme and domain types
  templates/            hand-built level templates, skinning, campaign seed
  generation/           object normalization, mechanics, rules, safety checks
  components/           component catalog used to resolve labels to sprites
magic-patterns/         React SVG sprite components and registry
lib/backboard/          prompts, GPT-4o HTTP client and JSON parsing
lib/db/                 repository interface, memory and Supabase implementations
lib/analytics/          event schemas and client-side tracking
lib/capture/            QR phone-capture sessions
public/                 pre-rendered sprites, template previews, videos, images
scripts/                asset generation, catalog sync, seeding, smoke test
supabase/               migrations and seed
tests/                  vitest suites and AI scene fixtures
```

`index.html` is a standalone static landing mockup, and
`implementation(1).md` is the original implementation plan (written under the
earlier working name "Snapcade"); neither is used by the app.

## Prerequisites

- Node.js 20+ and npm (CI uses Node 20)
- A Backboard API key with access to `openai/gpt-4o` for photo analysis
- Optional: a Supabase project (and the Supabase CLI or `psql`) for persistence

## Running locally

```bash
npm install
cp .env.example .env.local   # then fill in the values you have
npm run dev                  # http://localhost:3000
```

Playground degrades cleanly when services are not configured:

- **No Supabase credentials** → games, sessions, events and images live in the
  server process (`lib/db/memory.ts`). The full create → play → publish →
  playground → stats loop works, but data resets on restart.
- **No Backboard credentials or chat entitlement** → photo analysis stops with
  a clear error instead of showing pre-made content.

### Environment variables

See `.env.example`.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (optional locally) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key for read-only browser/server queries |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only key used for all writes |
| `BACKBOARD_API_KEY` | Server-only Backboard key; required for photo analysis |
| `BACKBOARD_ASSISTANT_ID` | Optional Backboard assistant to attach requests to |
| `BACKBOARD_PRIMARY_PROVIDER` / `BACKBOARD_PRIMARY_MODEL` | Must be `openai` / `gpt-4o`; any other value is rejected |
| `BACKBOARD_TIMEOUT_MS` | Optional per-attempt timeout (default 25000) |
| `NEXT_PUBLIC_APP_URL` | Public base URL, used for share links and resolving relative image URLs |
| `GAME_EVENT_SECRET` | Shared secret required to unpublish a game (`DELETE /api/games/[id]`) |
| `PLAYGROUND_FORCE_TEMPLATE` | Dev-only: force every generation onto one template id (ignored in production) |
| `PLAYGROUND_BASE_URL` | Target for `npm run test:deployment` when `--base-url` is not passed |

### Supabase setup

```bash
supabase db push          # or run supabase/migrations/*.sql in order
psql "$DATABASE_URL" -f supabase/seed.sql   # optional demo games
```

`0001_init.sql` creates `games`, `game_objects`, `game_sessions`, `game_events`,
`game_likes`, `mechanic_discoveries`, the `game_summaries` /
`object_label_counts` / `global_play_totals` views, the
`register_mechanic_discovery` function, and RLS policies that make published
data readable by anonymous clients while all writes go through the service role.
`0002_storage.sql` creates the public `source-images` and `game-thumbnails`
buckets. `0003_realtime.sql` enables realtime updates.
`0004_component_catalog.sql` creates the RLS-protected visual component catalog.
`0005_renderable_object_components.sql` lets sprite components be assigned
alongside mechanics. `0006_generation_learning.sql` adds the service-role-only
`generation_insights` table and exposes each game's `mode` in `game_summaries`.
`0007_phone_capture_sessions.sql` adds the private, short-lived pairing records
used by QR phone capture; raw bearer tokens are never stored and the table has
no anonymous access. `0008_telemetry_dashboard.sql` adds service-role-only
telemetry aggregates and partial indexes for per-game fatalities, active
sessions, and recent spatial events. `0009_global_telemetry_origins.sql` adds
the site-wide aggregate (active sessions and distinct cities in the last five
minutes) behind `GET /api/stats/live-origins`.

After applying the migrations, sync the component catalog, update existing game
specs, and seed the campaign games:

```bash
npm run components:check     # validate the registry locally (no writes)
npm run components:sync      # idempotently upsert the registry to Supabase
npm run components:backfill  # add component IDs to legacy game specs
npm run templates:seed       # dry run; re-run with -- --apply --confirm-project-ref <ref>
```

These scripts read `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
from the environment or a local `.env` file.

## Scripts

```bash
npm run dev                # Next.js dev server
npm run build              # runs the test suite (prebuild), then next build
npm start                  # serve the production build
npm run lint               # next lint (eslint)
npm run typecheck          # tsc --noEmit
npm test                   # vitest run
npm run test:watch         # vitest in watch mode
npm run components:check   # validate the component registry (dry run)
npm run components:sync    # upsert the component registry to Supabase
npm run components:backfill  # add component IDs to legacy game specs
npm run sprites:generate   # pre-render sprites to public/sprites
npm run previews:generate  # render template cover art to public/template-previews
npm run assets:generate    # both of the above
npm run assets:check       # verify generated assets are up to date
npm run templates:seed     # seed campaign games into Supabase (dry run by default)
npm run test:deployment -- --base-url <url>  # Playwright smoke test of a deployment
```

## Deployment

The generate route sets `maxDuration = 180` for Vercel serverless functions.
`.github/workflows/deployment-smoke.yml` runs on successful GitHub
`deployment_status` events for the Production environment: it installs
Chromium and runs `npm run test:deployment`, uploading
`test-results/deployment-smoke.json` as an artifact. Per-deployment Vercel URLs
are behind Deployment Protection, so the workflow tests the exact deployment
only when the `VERCEL_AUTOMATION_BYPASS_SECRET` Actions secret (Vercel →
Settings → Deployment Protection → Protection Bypass for Automation) is set;
otherwise it tests the public production alias (`PRODUCTION_URL` Actions
variable, default `https://playground-gaming.vercel.app`). Locally, set
`VERCEL_AUTOMATION_BYPASS_SECRET` to smoke-test a protected preview URL.

## Controls

- Desktop: `A`/`←` and `D`/`→` to move, `W`/`↑`/`Space` to jump, `X`/`F` to
  shoot (shooter mode), `R` to restart.
- Mobile: on-screen left / right / jump / restart buttons, plus a shoot button
  in shooter mode.

## Design constraints

- The AI returns **JSON only**; it never emits code, physics values or level
  geometry.
- Every Backboard attempt is pinned to `openai/gpt-4o`.
- Everything after the AI boundary is deterministic: the same scene analysis
  and seed always produce the same `GameSpec`.
- Photos on published games are public; the create flow warns about this before
  the first upload.

## Known gaps / next steps

- Thumbnail generation (`thumbnailPath`, `game-thumbnails` bucket) is wired
  through the schema but not yet produced.
- Rate limiting is per-process in-memory; move to Supabase or Redis before
  running multiple instances.
- Remix currently links a new photo to its parent game; it does not reuse the
  parent's objects.
