# Playground

Arrange physical objects, take one photo, and play the 2D platformer your desk
becomes — then publish it to a shared public arcade.

**Arrange. Snap. Play. Publish.**

No prompts, no tile editors, no level-design knowledge, no account.

## How it works

1. `/create` takes one photo (camera on mobile, file picker on desktop) and
   compresses it in the browser.
2. `POST /api/uploads` validates and stores the photo (Supabase Storage, or an
   in-process store locally).
3. `POST /api/games/generate` sends the image to **Backboard** with a strict
   JSON-only prompt. The response is extracted, `zod`-validated, and retried up
   to three times (the third attempt uses the fallback model). If every attempt
   fails, a deterministic fallback scene is used and the user is told.
4. Detected objects are clamped, deduplicated and mapped to mechanics
   deterministically — the model never controls physics or playability.
5. The level is generated, its reachability graph is BFS-checked from the spawn,
   and unreachable routes are repaired in a least-invasive order (widen → move →
   make moving → bounce pad → add up to three helper platforms). Every repair is
   recorded in `gameSpec.validation.repairActions`.
6. A `GameSpec` that passes runtime safety checks is rendered by **Phaser 3** and
   played in the browser.
7. `POST /api/games/publish` assigns a unique slug and makes `/game/<slug>`
   public. Plays, deaths, collectibles and completions feed the leaderboard,
   `/arcade` sorting and `/stats`.

### Object → mechanic mapping

| Object shape / role | Mechanic |
| --- | --- |
| flat, long, rigid (books, pencils, rulers) | `static_platform` |
| cables, chargers, ropes | `moving_platform` |
| springy or soft round things (sponges, balls) | `bounce_pad` |
| sharp things (scissors, forks, keys) | `hazard` |
| small trinkets (erasers, coins, caps) | `collectible` |
| containers, rings, mugs (in pairs) | `portal` |
| the farthest reachable landmark | `goal` |

## Running locally

```bash
npm install
cp .env.example .env.local   # every value is optional for local play
npm run dev
```

Playground degrades cleanly:

- **No Supabase credentials** → games, sessions, events and images live in the
  server process (`lib/db/memory.ts`). The full create → play → publish → arcade
  → stats loop works, but data resets on restart.
- **No Backboard credentials** → `lib/backboard/fallbackAnalysis.ts` produces a
  deterministic five-object scene so the pipeline is still exercised end to end.

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
buckets.

## Scripts

```bash
npm run dev        # dev server
npm run build      # production build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
npm test           # vitest (generation, parsing, repository, events)
```

## Controls

- Desktop: `A`/`←` and `D`/`→` to move, `W`/`↑`/`Space` to jump, `R` to restart.
- Mobile: on-screen left / right / jump / restart buttons.

## Layout

```
app/                    routes and API handlers
components/             UI: create flow, arcade, game shell, stats charts
game/                   engine-agnostic domain + Phaser scenes/entities
  generation/           normalize → assign mechanics → repair → validate → spec
lib/backboard/          prompts, HTTP client, JSON parsing, fallback
lib/db/                 repository interface, memory and Supabase implementations
lib/analytics/          event schemas and client-side tracking
supabase/               migrations and seed
tests/                  vitest suites and fixed scene fixtures
```

## Design constraints

- The AI returns **JSON only**; it never emits code, physics values or level
  geometry decisions.
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
