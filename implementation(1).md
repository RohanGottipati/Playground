# Snapcade Implementation Plan

> **One-line product:** Arrange physical objects, take one photo, and turn the arrangement into a real, playable 2D platformer that can be published to a shared community arcade.

> **Primary hackathon goal:** Deliver a polished, public, reliable end-to-end experience where a stranger can create, play, publish, and share a game in under 60 seconds.

---

## 1. Product Definition

### 1.1 Core concept

Snapcade turns the physical world into a game editor.

A creator arranges objects on a table, floor, desk, or other flat surface and takes one photo. The application analyzes the objects, their positions, sizes, shapes, and likely physical properties. It then converts that scene into a structured level specification that a deterministic 2D game engine can render.

The creator immediately receives a playable platformer. After completing or previewing it, they can publish it to a public online arcade where other people can play, rate, share, and remix it.

### 1.2 Main user promise

**Arrange. Snap. Play. Publish.**

The user should never need to:

- write a prompt
- understand level design
- place digital tiles
- configure game rules
- write code
- create an account before trying the product

### 1.3 Shared growing artifact

The shared artifact is the **Snapcade Arcade**, a public collection of playable games created from real-world object arrangements.

The arcade improves as more people contribute because:

1. More playable games become available.
2. New physical object types expand the mechanic vocabulary.
3. Games can be remixed into branching families.
4. Community play data reveals what mechanics and layouts work best.
5. The live statistics and discovery map become more meaningful.
6. Future generation can use aggregate gameplay signals to make better levels.

### 1.4 Hackathon constraints mapping

| Requirement | Snapcade implementation |
|---|---|
| One moment of input | One camera photo or uploaded photo |
| Non-trivial transformation | Image analysis, object extraction, property inference, mechanic mapping, procedural level generation, reachability validation, and game rendering |
| A stranger sees it | Every published game receives a public URL and appears in the arcade |
| Gets better with more people | More games, mechanics, remixes, analytics, and gameplay-informed generation |

---

## 2. Scope and Priorities

## 2.1 Must-have MVP

The MVP is complete only when all of the following work on the deployed site:

1. A user can open the create page on mobile or desktop.
2. A user can take or upload one photo.
3. The image is uploaded successfully.
4. Backboard analyzes the image using a vision-capable model.
5. The response is converted into a validated `GameSpec`.
6. A deterministic level generator creates a playable level.
7. Phaser renders the level in the browser.
8. The player can move, jump, die, collect items, and reach the goal.
9. The creator can publish the game.
10. The published game receives a public URL.
11. The game appears in the public arcade.
12. Another user can open and play the game.
13. Plays, deaths, completions, and completion times are recorded.
14. A public statistics page displays real data.

## 2.2 High-value stretch features

Implement only after the MVP flow is stable:

- game likes
- fastest-time leaderboard
- remix flow
- live arcade updates
- newly discovered object announcements
- mechanic discovery graph
- object cutouts used as level art
- automatic game thumbnail generation
- daily challenge
- anonymous creator names
- optional sign-in
- multiple visual themes

## 2.3 Explicit non-goals

Do not build these during the hackathon unless every must-have feature is complete:

- 3D game generation
- multiple game genres
- arbitrary AI-generated JavaScript
- multiplayer gameplay
- voice chat
- advanced authentication
- custom model training
- RAG
- autonomous multi-agent workflows
- complex polygon physics
- real-time collaborative level editing
- procedural music generation
- native mobile applications

---

## 3. Recommended Technology Stack

| Layer | Tool | Purpose |
|---|---|---|
| Web application | Next.js App Router + TypeScript | Pages, API routes, server logic, deployment |
| UI | React + Tailwind CSS | Interfaces and responsive styling |
| Motion | Framer Motion | Scan, transformation, publishing, and arcade animations |
| Game engine | Phaser | Browser-based 2D platformer |
| Physics | Phaser Arcade Physics | Fast rectangular and circular collision handling |
| AI gateway | Backboard API | Model routing, image understanding, structured game analysis |
| Validation | Zod | Runtime validation of model responses and API payloads |
| Database | Supabase Postgres | Games, objects, mechanics, events, leaderboards |
| Storage | Supabase Storage | Original photos and thumbnails |
| Live updates | Supabase Realtime | New-game feed and live statistics |
| Visual identity | Reve | Cohesive backgrounds, sprites, cabinets, icons, and illustrations |
| Hosting | Vercel | Public deployment |
| Source control | GitHub | Collaboration and version history |

### 3.1 Version strategy

Pin major dependency versions in `package.json`. Do not upgrade libraries during the final build period unless a critical bug requires it.

Use one Phaser version consistently. If the starter project is built with Phaser 3, remain on Phaser 3. If beginning from scratch and the team has verified Phaser 4 compatibility with all examples and plugins, Phaser 4 is acceptable. Reliability is more important than using the newest version.

---

## 4. Product Flow

## 4.1 Creator flow

1. User opens `/create`.
2. User sees one clear message: **Arrange objects, then take one photo.**
3. User opens the camera or selects an image.
4. User confirms the photo.
5. UI enters the scanning state.
6. Image uploads to Supabase Storage.
7. Server calls Backboard with the image and a strict JSON instruction.
8. AI response is parsed and validated.
9. Server converts the analysis into an internal scene representation.
10. Level generator assigns deterministic mechanics.
11. Validator ensures the level has a reachable path.
12. Game preview loads.
13. Creator plays or previews the game.
14. Creator enters a display name and optionally edits the generated title.
15. Creator publishes.
16. Game appears in the arcade.
17. Creator receives a shareable URL.

## 4.2 Player flow

1. User opens `/game/[slug]`.
2. Original physical photo and game metadata are visible.
3. User clicks **Play**.
4. Game starts immediately.
5. Events are recorded during play.
6. On completion, the user sees:
   - completion time
   - deaths
   - collectibles found
   - personal result
   - fastest community time
   - share button
   - remix button if implemented

## 4.3 Arcade flow

1. User opens `/arcade`.
2. They can browse:
   - newest
   - trending
   - hardest
   - fastest completed
   - most remixed
3. Each card or arcade cabinet shows:
   - game title
   - original photo thumbnail
   - creator name
   - plays
   - completion rate
   - difficulty
4. Clicking a game opens its public page.

---

## 5. System Architecture

```text
Camera / File Upload
        |
        v
Next.js Create Page
        |
        v
POST /api/uploads
        |
        v
Supabase Storage
        |
        v
POST /api/games/generate
        |
        v
Backboard API + Vision Model
        |
        v
Raw AI Scene Analysis
        |
        v
Zod Validation and Normalization
        |
        v
Deterministic Level Generator
        |
        v
Reachability and Safety Validator
        |
        v
GameSpec JSON
        |
        v
Phaser Game Preview
        |
        v
POST /api/games/publish
        |
        v
Supabase Postgres
        |
        +--------------------+
        |                    |
        v                    v
Public Arcade          Public Game Page
        |
        v
Gameplay Event API
        |
        v
Analytics and Leaderboards
```

### 5.1 Architectural principle

**AI interprets meaning. Application code controls gameplay.**

Backboard and the selected vision model may decide:

- which objects exist
- approximate object bounds
- object labels
- likely physical properties
- suggested mechanic roles
- theme and title suggestions

Backboard must not control:

- exact player physics
- collision resolution
- score calculations
- jump distances
- level reachability
- leaderboard ordering
- analytics values
- database permissions

---

## 6. Repository Structure

```text
snapcade/
├── app/
│   ├── page.tsx
│   ├── create/
│   │   └── page.tsx
│   ├── arcade/
│   │   └── page.tsx
│   ├── game/
│   │   └── [slug]/
│   │       └── page.tsx
│   ├── stats/
│   │   └── page.tsx
│   ├── api/
│   │   ├── uploads/
│   │   │   └── route.ts
│   │   ├── games/
│   │   │   ├── generate/
│   │   │   │   └── route.ts
│   │   │   ├── publish/
│   │   │   │   └── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── events/
│   │   │   └── route.ts
│   │   └── leaderboard/
│   │       └── [gameId]/
│   │           └── route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── create/
│   │   ├── CameraCapture.tsx
│   │   ├── ImagePreview.tsx
│   │   ├── ScanAnimation.tsx
│   │   ├── GenerationProgress.tsx
│   │   └── PublishPanel.tsx
│   ├── arcade/
│   │   ├── ArcadeCabinet.tsx
│   │   ├── ArcadeGrid.tsx
│   │   └── ArcadeFilters.tsx
│   ├── game/
│   │   ├── PhaserCanvas.tsx
│   │   ├── GameHUD.tsx
│   │   ├── GameResults.tsx
│   │   └── OriginalPhotoPanel.tsx
│   ├── stats/
│   │   ├── MetricCard.tsx
│   │   ├── ObjectChart.tsx
│   │   └── MechanicChart.tsx
│   └── ui/
├── game/
│   ├── config.ts
│   ├── createGame.ts
│   ├── scenes/
│   │   ├── BootScene.ts
│   │   ├── GameScene.ts
│   │   └── ResultScene.ts
│   ├── entities/
│   │   ├── Player.ts
│   │   ├── Platform.ts
│   │   ├── Hazard.ts
│   │   ├── Collectible.ts
│   │   ├── Portal.ts
│   │   └── Goal.ts
│   ├── generation/
│   │   ├── generateLevel.ts
│   │   ├── normalizeObjects.ts
│   │   ├── assignMechanics.ts
│   │   ├── validateReachability.ts
│   │   └── repairLevel.ts
│   └── types.ts
├── lib/
│   ├── backboard/
│   │   ├── client.ts
│   │   ├── prompts.ts
│   │   ├── parseResponse.ts
│   │   └── schemas.ts
│   ├── supabase/
│   │   ├── browser.ts
│   │   ├── server.ts
│   │   └── admin.ts
│   ├── analytics/
│   │   ├── track.ts
│   │   └── eventSchemas.ts
│   ├── errors/
│   │   └── AppError.ts
│   └── utils/
├── public/
│   ├── sprites/
│   ├── backgrounds/
│   ├── cabinets/
│   ├── icons/
│   └── audio/
├── supabase/
│   ├── migrations/
│   └── seed.sql
├── tests/
│   ├── generation/
│   ├── api/
│   └── fixtures/
├── .env.example
├── package.json
├── README.md
└── implementation.md
```

---

## 7. Data Contracts

## 7.1 Normalized coordinates

All AI-provided object coordinates must use normalized values from `0` to `1`.

- `x = 0` is the left edge.
- `x = 1` is the right edge.
- `y = 0` is the top edge.
- `y = 1` is the bottom edge.

This makes level data independent of image resolution.

## 7.2 AI scene analysis schema

```ts
export const PhysicalPropertySchema = z.enum([
  "large",
  "small",
  "flat",
  "tall",
  "round",
  "long",
  "thin",
  "sharp",
  "soft",
  "rigid",
  "flexible",
  "hollow",
  "reflective",
  "electronic",
  "rollable",
  "springy",
  "container",
  "unknown"
]);

export const SuggestedRoleSchema = z.enum([
  "platform",
  "bridge",
  "vertical_platform",
  "moving_platform",
  "bounce_pad",
  "hazard",
  "collectible",
  "portal",
  "goal_landmark",
  "decoration"
]);

export const DetectedObjectSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1).max(80),
  confidence: z.number().min(0).max(1),
  bounds: z.object({
    x: z.number().min(0).max(1),
    y: z.number().min(0).max(1),
    width: z.number().gt(0).max(1),
    height: z.number().gt(0).max(1)
  }),
  properties: z.array(PhysicalPropertySchema).min(1).max(8),
  suggestedRole: SuggestedRoleSchema,
  reasoning: z.string().max(180)
});

export const SceneAnalysisSchema = z.object({
  sceneType: z.enum([
    "desk",
    "table",
    "floor",
    "counter",
    "drawing",
    "mixed",
    "unknown"
  ]),
  orientation: z.enum(["landscape", "portrait", "square"]),
  titleSuggestion: z.string().min(1).max(60),
  themeSuggestion: z.enum([
    "arcade",
    "space",
    "forest",
    "factory",
    "neon",
    "paper",
    "kitchen",
    "default"
  ]),
  objects: z.array(DetectedObjectSchema).min(2).max(15),
  warnings: z.array(z.string()).max(6)
});
```

## 7.3 Final game specification

```ts
export type MechanicType =
  | "static_platform"
  | "moving_platform"
  | "bounce_pad"
  | "hazard"
  | "collectible"
  | "portal"
  | "goal";

export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type GameEntitySpec = {
  id: string;
  sourceObjectId?: string;
  sourceLabel?: string;
  mechanic: MechanicType;
  bounds: Rect;
  movement?: {
    axis: "x" | "y";
    distance: number;
    speed: number;
  };
  metadata?: Record<string, string | number | boolean>;
};

export type GameSpec = {
  schemaVersion: 1;
  title: string;
  slug?: string;
  theme: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  world: {
    width: number;
    height: number;
    gravityY: number;
  };
  player: {
    spawnX: number;
    spawnY: number;
    moveSpeed: number;
    jumpVelocity: number;
    maxJumps: 1 | 2;
  };
  entities: GameEntitySpec[];
  validation: {
    reachable: boolean;
    repaired: boolean;
    repairActions: string[];
    estimatedOptimalTimeSeconds: number;
  };
  source: {
    imageUrl: string;
    detectedObjectCount: number;
  };
};
```

### 7.4 Never trust AI output directly

The raw response must pass these stages:

```text
Raw text
  -> JSON extraction
  -> JSON parse
  -> Zod validation
  -> coordinate clamping
  -> object deduplication
  -> minimum-size enforcement
  -> role normalization
  -> deterministic generation
  -> level validation
```

If any stage fails, use the retry or fallback flow described later.

---

## 8. Backboard AI Integration

## 8.1 Recommended Backboard design

Use Backboard as the single AI gateway.

Create one reusable assistant for Snapcade with strict instructions about:

- analyzing images
- returning only valid JSON
- using normalized coordinates
- selecting only supported properties and roles
- avoiding invented objects
- preserving uncertainty
- never generating executable code

For generation calls, a new thread may be created per photo. Save `assistant_id`, `thread_id`, model provider, and model name for debugging.

### 8.2 Assistant system prompt

```text
You are the visual scene analyst for Snapcade, a platform that turns a
single photograph of arranged physical objects into a 2D platformer.

Your task is to identify clearly visible physical objects, estimate their
normalized image bounds, infer a small set of physical properties, and
suggest a supported gameplay role.

Rules:
1. Return only JSON matching the provided schema.
2. Never return markdown or explanatory text outside the JSON.
3. Use coordinates normalized from 0 to 1.
4. Detect only clearly visible objects.
5. Do not invent hidden or ambiguous objects.
6. Use no more than 15 objects.
7. Prefer objects that materially affect the level.
8. Select properties only from the allowed enum.
9. Select roles only from the allowed enum.
10. The final application, not you, controls exact game physics and
    playability.
11. If uncertain, lower confidence and use "unknown" properties.
12. Do not generate JavaScript, game code, or database instructions.
```

## 8.3 Per-request user prompt

```text
Analyze the attached image as a physical layout for a 2D platformer.

Return:
- scene type
- image orientation
- a short game title suggestion
- a visual theme suggestion
- 2 to 15 useful objects
- normalized bounds for every object
- physical properties
- one supported gameplay role per object
- warnings if the image is unsuitable

Allowed physical properties:
large, small, flat, tall, round, long, thin, sharp, soft, rigid,
flexible, hollow, reflective, electronic, rollable, springy,
container, unknown

Allowed roles:
platform, bridge, vertical_platform, moving_platform, bounce_pad,
hazard, collectible, portal, goal_landmark, decoration

Do not decide player physics. Do not output code. Return valid JSON only.
```

## 8.4 Model selection

Select a vision-capable model available through Backboard.

Evaluation criteria:

1. Image understanding accuracy
2. Bounding-box consistency
3. JSON compliance
4. Latency
5. Cost
6. Reliability across cluttered scenes

Create a test set of at least 10 images:

- sparse desk
- cluttered desk
- kitchen objects
- tall and thin objects
- overlapping objects
- low-light photo
- portrait photo
- intentional level arrangement
- random objects
- unsuitable photo

Store model results in `/tests/fixtures/model-evaluation/`.

## 8.5 Retry strategy

```text
Attempt 1:
Primary vision model with strict JSON prompt

If invalid JSON or schema mismatch:
Attempt 2:
Same model with validation errors appended

If still invalid:
Attempt 3:
Fallback vision model

If still invalid:
Use deterministic safe fallback based on image dimensions
and return a user-visible message that analysis was simplified
```

Maximum AI attempts per image: **3**

Do not leave the user waiting indefinitely. Set a server-side timeout.

## 8.6 Response parser requirements

`parseResponse.ts` must:

- strip accidental code fences
- locate the first full JSON object
- reject trailing non-whitespace content when possible
- parse JSON safely
- return structured validation errors
- log only non-sensitive diagnostic fields
- never log API keys
- avoid storing raw uploaded image bytes in logs

## 8.7 Backboard metadata to save

Store the following on each generated game:

- `backboard_assistant_id`
- `backboard_thread_id`
- `llm_provider`
- `model_name`
- `generation_latency_ms`
- `generation_attempt_count`
- `ai_schema_version`
- `generation_status`

This helps during the demo if one model behaves inconsistently.

---

## 9. Deterministic Level Generation

## 9.1 Design principle

The AI supplies semantic suggestions. The generator converts them into a limited, reliable mechanic library.

Never allow a model to create arbitrary new mechanics during the MVP.

## 9.2 Supported mechanics

### Static platform

Used for:

- books
- laptops
- boxes
- large flat surfaces
- wide objects

Behavior:

- solid collision
- no movement
- supports player and other level objects

### Bridge

Used for:

- pencils
- pens
- rulers
- chopsticks
- cables when sufficiently horizontal

Behavior:

- thin static platform
- minimum collision thickness is enforced
- may visually preserve the object's long shape

### Vertical platform

Used for:

- bottles
- cups
- cans
- containers
- tall objects

Behavior:

- creates height variation
- may act as a tower or wall
- generator may add a top landing surface

### Moving platform

Used for:

- flexible objects
- electronics
- objects explicitly assigned by AI
- repair logic when a gap must be crossed

Behavior:

- moves horizontally or vertically
- movement distance and speed are clamped
- always returns to its starting position

### Bounce pad

Used for:

- spring-like objects
- soft objects
- round objects
- repair logic for unreachable vertical gaps

Behavior:

- applies a fixed upward velocity
- visual pulse indicates its role

### Hazard

Used for:

- scissors
- knives only as abstract sharp hazards
- visibly sharp objects
- hot or dangerous-looking objects
- repair-safe hazard placements

Behavior:

- resets player to the latest checkpoint or spawn
- cannot overlap player spawn
- cannot fully block the only valid path

### Collectible

Used for:

- small objects
- coins
- keys
- AirPods
- decorative objects

Behavior:

- uses overlap detection
- increases collectible count
- optional requirement to collect all before goal

### Portal

Used for:

- mugs
- cups
- rings
- circular or hollow objects

Behavior:

- links a maximum of two portals
- if only one portal exists, treat it as decoration or goal landmark
- portal exit must be safe

### Goal

Generated deterministically.

Behavior:

- placed on the final reachable platform
- ends the level
- cannot be placed inside another collider

## 9.3 Coordinate conversion

Convert normalized image coordinates into world coordinates:

```ts
worldX = normalizedX * WORLD_WIDTH;
worldY = normalizedY * WORLD_HEIGHT;
worldWidth = normalizedWidth * WORLD_WIDTH;
worldHeight = normalizedHeight * WORLD_HEIGHT;
```

Suggested world size:

```ts
WORLD_WIDTH = 1600;
WORLD_HEIGHT = 900;
```

The Phaser canvas scales responsively while the world coordinate system remains stable.

## 9.4 Minimum and maximum object dimensions

Clamp objects to avoid unplayable collisions:

```ts
MIN_PLATFORM_WIDTH = 90;
MAX_PLATFORM_WIDTH = 600;
MIN_PLATFORM_HEIGHT = 24;
MAX_PLATFORM_HEIGHT = 260;
```

A pencil may visually be 6 pixels high, but its collision body should be thick enough to stand on.

## 9.5 Ground generation

Always generate a base ground platform across the bottom portion of the level.

This guarantees:

- a safe spawn
- recovery from small AI geometry errors
- a coherent beginning
- a reachable starting point

The original photo objects remain the primary level structure, but the ground prevents immediate failure.

## 9.6 Spawn placement

Default player spawn:

- left side of the ground
- outside all hazards
- with at least one player-width of horizontal clearance
- beneath no low ceiling

If the photo arrangement is better suited to right-to-left play, the generator may reverse the level. Keep the MVP left-to-right unless reversal is clearly necessary.

## 9.7 Goal placement

Preferred goal:

1. Identify the highest reachable platform near the right side.
2. If none exists, choose the farthest reachable platform.
3. Place the goal with safe standing space.
4. Ensure no hazard overlaps the goal.
5. Ensure the player can remain stationary at the goal.

## 9.8 Difficulty calculation

Calculate difficulty deterministically using:

- number of jumps
- average jump distance
- vertical climb
- number of hazards
- moving platform count
- portal count
- required collectibles
- estimated path length

Example:

```ts
difficultyScore =
  jumpCount * 0.15 +
  normalizedGapDifficulty * 0.25 +
  hazardCount * 0.12 +
  movingPlatformCount * 0.15 +
  verticalComplexity * 0.18 +
  pathLengthFactor * 0.15;
```

Map the result to `1` through `5`.

---

## 10. Reachability Validation and Repair

## 10.1 Why validation is required

The model can correctly identify objects while still producing an impossible platform arrangement. Snapcade must guarantee that every published level is playable.

## 10.2 Platform graph

Represent each standable platform as a node.

Create a directed edge from platform A to platform B when the player can jump from A to B.

A simplified reachability test may use:

- horizontal gap
- vertical difference
- player jump velocity
- gravity
- platform width
- safe landing margin

## 10.3 Conservative jump limits

Do not use the theoretical maximum jump distance as the allowed design distance. Use a safety factor.

Example:

```ts
SAFE_MAX_HORIZONTAL_GAP = 220;
SAFE_MAX_UPWARD_DELTA = 150;
SAFE_MAX_DOWNWARD_DELTA = 320;
MIN_LANDING_WIDTH = 64;
```

Fine-tune these values using playtesting.

## 10.4 Reachability algorithm

1. Build nodes for standable platforms.
2. Add the ground as the start node.
3. Calculate possible directed jumps.
4. Run breadth-first search from the spawn platform.
5. Determine the farthest reachable platform.
6. Verify that the goal platform is reachable.
7. If not reachable, run repair logic.
8. Rebuild the graph and validate again.

## 10.5 Repair order

Use the least intrusive repair first:

1. Slightly widen a target platform.
2. Slightly move a platform.
3. Convert an object to a moving platform.
4. Convert a suitable object to a bounce pad.
5. Insert one subtle generated helper platform.
6. Move the goal to the farthest reachable platform.

Limit helper platforms so the final level still reflects the photo.

## 10.6 Repair metadata

Record every repair:

```json
{
  "repaired": true,
  "repairActions": [
    "Widened pencil platform by 34 pixels",
    "Added one helper platform between bottle and mug"
  ]
}
```

This is useful for debugging and for the technical presentation.

## 10.7 Runtime safety checks

Before loading the Phaser scene, verify:

- every entity has finite coordinates
- no entity has negative dimensions
- player spawn is within world bounds
- goal exists exactly once
- the game has at least one platform
- portal count is either zero or two
- movement values are within limits

---

## 11. Phaser Game Implementation

## 11.1 Phaser responsibilities

Phaser handles:

- rendering
- player movement
- gravity
- collision
- overlap events
- camera following
- game timer
- collectible tracking
- death and respawn
- moving platforms
- particles
- sound effects
- win state

## 11.2 Core controls

Desktop:

- `A` or left arrow: move left
- `D` or right arrow: move right
- `W`, up arrow, or space: jump
- `R`: restart

Mobile:

- left touch button
- right touch button
- jump touch button

The game must be playable on a judge's phone.

## 11.3 Player tuning

Start with fixed values:

```ts
moveSpeed = 260;
jumpVelocity = -500;
gravityY = 1100;
maxFallSpeed = 900;
```

Tune through playtesting rather than allowing AI to modify them.

## 11.4 Scene lifecycle

### BootScene

- load shared sprites
- load theme background
- display loading state
- validate `GameSpec`

### GameScene

- create world
- create player
- create all game entities
- register colliders and overlaps
- start timer
- track gameplay events
- detect completion

### ResultScene

- stop timer
- display completion metrics
- submit completion event
- show retry and share actions

## 11.5 React and Phaser integration

`PhaserCanvas.tsx` should:

1. Be a client component.
2. Dynamically import Phaser to avoid server-side rendering errors.
3. Create the game once on mount.
4. Destroy the Phaser instance on unmount.
5. Pass `GameSpec` through the Phaser registry or scene init data.
6. Use callbacks or a small event emitter to send state back to React.

Avoid storing frame-by-frame Phaser state in React.

## 11.6 Visual treatment of original objects

MVP option:

- use stylized standard game assets
- place a small label or icon representing the source object
- show the original photo beside the game

Stretch option:

- crop object regions from the original image
- place cutouts as textured sprites
- add outlines, glow, shadows, and game effects
- preserve the recognizable physical object inside the platformer

## 11.7 Game event callbacks

Emit:

- `game_started`
- `player_died`
- `collectible_collected`
- `checkpoint_reached`
- `game_completed`
- `game_restarted`

Batch or debounce events when appropriate.

---

## 12. Database Design

## 12.1 `games`

```sql
create table public.games (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  creator_name text not null default 'Anonymous',
  status text not null check (status in ('draft', 'published', 'failed')),
  source_image_path text not null,
  thumbnail_path text,
  scene_analysis jsonb not null,
  game_spec jsonb not null,
  theme text not null,
  difficulty smallint not null check (difficulty between 1 and 5),
  detected_object_count integer not null default 0,
  generation_latency_ms integer,
  generation_attempt_count integer not null default 1,
  llm_provider text,
  model_name text,
  backboard_assistant_id text,
  backboard_thread_id text,
  parent_game_id uuid references public.games(id),
  published_at timestamptz,
  created_at timestamptz not null default now()
);
```

## 12.2 `game_objects`

```sql
create table public.game_objects (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  source_object_id text not null,
  label text not null,
  normalized_bounds jsonb not null,
  properties text[] not null default '{}',
  suggested_role text,
  final_mechanic text,
  confidence numeric,
  created_at timestamptz not null default now()
);
```

## 12.3 `game_sessions`

```sql
create table public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  anonymous_session_id text not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  duration_ms integer,
  death_count integer not null default 0,
  collectibles_collected integer not null default 0,
  completed boolean not null default false,
  user_agent text
);
```

## 12.4 `game_events`

```sql
create table public.game_events (
  id bigint generated always as identity primary key,
  game_id uuid not null references public.games(id) on delete cascade,
  session_id uuid references public.game_sessions(id) on delete cascade,
  event_type text not null,
  event_payload jsonb not null default '{}',
  created_at timestamptz not null default now()
);
```

## 12.5 `game_likes`

Stretch feature:

```sql
create table public.game_likes (
  game_id uuid not null references public.games(id) on delete cascade,
  anonymous_session_id text not null,
  created_at timestamptz not null default now(),
  primary key (game_id, anonymous_session_id)
);
```

## 12.6 `mechanic_discoveries`

```sql
create table public.mechanic_discoveries (
  id uuid primary key default gen_random_uuid(),
  object_label text not null,
  normalized_object_label text not null,
  mechanic text not null,
  first_game_id uuid references public.games(id),
  discovery_count integer not null default 1,
  discovered_at timestamptz not null default now(),
  unique (normalized_object_label, mechanic)
);
```

## 12.7 Useful database views

Create views for:

- game play counts
- completion rates
- fastest completion
- death totals
- trending score
- common object labels
- mechanic usage totals
- remix counts

Do not calculate these values inside every client request.

---

## 13. Storage Design

## 13.1 Buckets

Create:

- `source-images`
- `game-thumbnails`

## 13.2 Path format

```text
source-images/{gameId}/original.webp
game-thumbnails/{gameId}/thumbnail.webp
```

## 13.3 Image processing

Before upload:

- resize maximum dimension to approximately 1600 pixels
- convert to WebP or JPEG
- compress to a reasonable quality
- reject unsupported formats
- reject excessively large files
- preserve orientation correctly

Suggested maximum upload size: **8 MB**

## 13.4 Privacy

The product is public, so the upload interface must clearly state:

> Your photo will be visible with the published game. Do not include faces, private information, screens, addresses, or anything you do not want public.

Provide a cancel and retake option before uploading.

---

## 14. API Routes

## 14.1 `POST /api/uploads`

Purpose:

- validate image file
- generate draft game ID
- upload image
- return storage path and signed or public URL

Request:

```text
multipart/form-data
file: image
```

Response:

```json
{
  "gameId": "uuid",
  "imagePath": "source-images/uuid/original.webp",
  "imageUrl": "..."
}
```

## 14.2 `POST /api/games/generate`

Request:

```json
{
  "gameId": "uuid",
  "imageUrl": "..."
}
```

Responsibilities:

1. validate request
2. call Backboard
3. parse response
4. validate scene analysis
5. normalize detected objects
6. generate level
7. validate and repair level
8. save draft game
9. return preview data

Response:

```json
{
  "gameId": "uuid",
  "sceneAnalysis": {},
  "gameSpec": {},
  "generationMetadata": {
    "latencyMs": 4210,
    "attempts": 1,
    "fallbackUsed": false
  }
}
```

## 14.3 `POST /api/games/publish`

Request:

```json
{
  "gameId": "uuid",
  "title": "Desk Escape",
  "creatorName": "Rohan"
}
```

Responsibilities:

- sanitize title and creator name
- generate unique slug
- mark game as published
- set `published_at`
- update mechanic discoveries
- broadcast new-game event

## 14.4 `POST /api/events`

Request:

```json
{
  "gameId": "uuid",
  "sessionId": "uuid",
  "eventType": "player_died",
  "payload": {
    "x": 720,
    "y": 830,
    "elapsedMs": 18230
  }
}
```

Requirements:

- validate event type
- rate limit
- limit payload size
- never trust client-submitted leaderboard values without sanity checks

## 14.5 `GET /api/leaderboard/[gameId]`

Return:

- top completion times
- completion rate
- total plays
- total deaths

---

## 15. Arcade and Community Features

## 15.1 Arcade presentation

The arcade must not look like a generic dashboard.

Preferred design:

- illustrated arcade room
- each game appears as a cabinet
- cabinet screen shows the original photo thumbnail
- hover or tap reveals game metadata
- new cabinets animate into the room
- filters look like arcade controls or marquee signs

A responsive card grid is acceptable on mobile, but maintain the arcade visual language.

## 15.2 Ranking algorithms

### Newest

```text
published_at descending
```

### Hardest

Use completion rate and deaths per session, with minimum play count:

```text
hardness =
  (1 - completion_rate) * 0.65 +
  normalized_deaths_per_session * 0.35
```

### Trending

Example:

```text
trending =
  plays_last_hour * 1.0 +
  completions_last_hour * 1.5 +
  likes_last_hour * 2.0 +
  remixes_last_day * 3.0
```

Require minimum activity to avoid random ordering.

## 15.3 Remix flow

Stretch feature implementation:

1. User clicks **Remix**.
2. App extracts the parent game's key property slots.
3. User is shown requirements such as:
   - one tall object
   - one long thin object
   - one round object
4. User arranges replacement objects and takes one photo.
5. Backboard analyzes the new image.
6. Generator maps new objects onto parent mechanic roles.
7. New game stores `parent_game_id`.
8. Game page displays a remix tree.

Do not require exact object matching. Match physical properties and roles.

## 15.4 Mechanic discovery

For the hackathon, mechanic discovery should use controlled mappings, not truly arbitrary new mechanics.

Example mapping:

| Object/property | Discovery |
|---|---|
| umbrella, parachute, fabric canopy | gliding |
| spring, sponge, soft round object | bouncing |
| magnet | magnetism |
| flashlight, lamp | lighting |
| fan | wind |
| rubber band | slingshot |
| cup, ring, roll | portal |
| cable, rope | moving rail |

When an object-mechanic pair appears for the first time:

1. Insert `mechanic_discoveries` record.
2. Show a discovery animation.
3. Credit the first game.
4. Include it on the public stats page.

The actual MVP game engine may still support only the core seven mechanics. Discovery can be a community data feature first, then a gameplay expansion later.

---

## 16. Analytics and TECHNATION Track

## 16.1 Required live metrics

Show:

- published games
- objects scanned
- games played
- completed runs
- total deaths
- average completion rate
- mechanics discovered
- remixes created

## 16.2 Useful visualizations

Implement at least three:

1. **Most scanned objects**
   - horizontal bar chart
2. **Mechanic usage**
   - bar or donut chart
3. **Games created over time**
   - line chart
4. **Difficulty versus completion rate**
   - scatter plot
5. **Live activity feed**
   - new game, completion, record, or discovery events

## 16.3 Real data only

Every chart must query actual Supabase data.

Do not:

- use fixed statistics in production views
- seed fake data for the final live demo without clearly labeling it
- show screenshots instead of interactive visualizations

Seeded demo games may exist, but production statistics should identify them or exclude them from public totals.

## 16.4 Event definitions

| Event | Trigger |
|---|---|
| `image_uploaded` | upload completes |
| `generation_started` | Backboard call begins |
| `generation_completed` | valid GameSpec produced |
| `generation_failed` | all retries fail |
| `game_published` | creator publishes |
| `game_started` | player gains control |
| `player_died` | player hits hazard or leaves bounds |
| `collectible_collected` | collectible overlap |
| `game_completed` | player reaches goal |
| `game_remixed` | remix published |
| `mechanic_discovered` | first object-mechanic pair |

## 16.5 Live updates

Use Supabase Realtime for:

- new published games
- total published count
- live event feed
- mechanic discoveries
- optional active player count

For the hackathon, simple Postgres Changes subscriptions are acceptable. For larger-scale production, use the recommended broadcast pattern.

---

## 17. User Interface Requirements

## 17.1 Landing page

Above the fold:

- project title
- one-line explanation
- **Create a Game** primary button
- **Enter the Arcade** secondary button
- short looping demonstration

Avoid long technical explanations before the user tries it.

## 17.2 Create page states

The page must have clear states:

```ts
type CreateState =
  | "instructions"
  | "camera"
  | "preview"
  | "uploading"
  | "analyzing"
  | "generating"
  | "validating"
  | "ready"
  | "publishing"
  | "published"
  | "error";
```

Each state should have:

- a visible status
- one primary next action
- a way to recover from errors
- no dead-end loading screens

## 17.3 Generation animation

Show the transformation pipeline visually:

1. scan line moves over the photo
2. detected object boxes appear
3. object labels appear
4. objects are assigned game icons
5. photo transitions into game preview
6. title appears

This helps judges understand the technical transformation without reading a slide.

## 17.4 Game page layout

Desktop:

- game canvas is primary
- original photo and metadata appear in a side panel

Mobile:

- game canvas fills available width
- original photo appears below or in a collapsible panel
- touch controls remain visible

## 17.5 Accessibility

At minimum:

- keyboard controls
- visible focus states
- sufficient contrast
- button labels
- no critical information conveyed by color alone
- reduced-motion support
- alternative text for uploaded images where possible

---

## 18. Visual Identity and Reve Assets

## 18.1 Art direction

Recommended style:

**Handmade retro arcade mixed with photographed everyday objects.**

Visual characteristics:

- illustrated cabinets
- imperfect hand-drawn outlines
- bold typography
- playful stickers and badges
- paper or screen-print textures
- restrained pixel-art accents
- physical-photo cutouts
- custom scan and transformation effects

Avoid:

- generic purple gradients
- default AI dashboards
- random mismatched generated assets
- excessive glassmorphism
- inconsistent illustration styles

## 18.2 Reve asset list

Generate a cohesive set:

- landing hero illustration
- arcade room background
- 4 to 6 cabinet variants
- player sprite sheet or key poses
- goal portal
- collectible icons
- bounce-pad effect
- hazard effect
- scan overlay
- loading illustration
- mechanic discovery badge
- stats room background
- social sharing card background

## 18.3 Asset consistency process

1. Establish one master reference image.
2. Reuse it as a style reference for all later assets.
3. Fix the palette and line treatment.
4. Export transparent PNGs where needed.
5. Compress all assets.
6. Store prompt notes in `/design/reve-prompts.md`.
7. Manually edit or combine outputs so the product does not feel unmodified or generic.

---

## 19. Error Handling

## 19.1 User-facing errors

### Unsupported photo

Message:

> We could not find enough clear objects. Try placing 3 to 8 objects on a plain surface with good lighting.

### AI generation failure

Message:

> We could not fully analyze this photo, so we created a simplified level. You can play it now or retake the photo.

### Upload failure

Message:

> The photo could not be uploaded. Check your connection and try again.

### Game loading failure

Message:

> This game could not load correctly. Refresh the page or return to the arcade.

## 19.2 Error categories

Create typed errors:

```ts
type ErrorCode =
  | "INVALID_IMAGE"
  | "UPLOAD_FAILED"
  | "BACKBOARD_TIMEOUT"
  | "BACKBOARD_INVALID_RESPONSE"
  | "SCHEMA_VALIDATION_FAILED"
  | "LEVEL_GENERATION_FAILED"
  | "LEVEL_UNREACHABLE"
  | "DATABASE_ERROR"
  | "RATE_LIMITED"
  | "UNKNOWN_ERROR";
```

## 19.3 Logging

Log:

- request ID
- game ID
- error code
- generation attempt
- model name
- latency
- validation issues

Do not log:

- API keys
- private environment variables
- full image bytes
- unnecessary personal data

---

## 20. Security and Abuse Prevention

## 20.1 API keys

Keep these server-only:

- `BACKBOARD_API_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Never expose them through `NEXT_PUBLIC_*`.

## 20.2 Input validation

Validate:

- image MIME type
- file size
- title length
- creator name length
- event type
- event payload size
- UUID formats
- game ownership for draft publishing

## 20.3 Rate limiting

At minimum rate limit:

- image uploads
- generation requests
- publish requests
- event submissions
- likes

Use an in-memory limiter for the hackathon only if running in a single process. A managed Redis limiter is more reliable for production but not required for MVP.

## 20.4 Row Level Security

Recommended simple rules:

- published games are publicly readable
- drafts are readable only through server-side privileged routes
- public clients may not directly update games
- gameplay events are inserted through a validated server API
- storage uploads occur through signed URLs or server routes
- service-role operations remain server-side

## 20.5 Content considerations

The product uses public user photos. Add:

- clear public-photo warning
- report button as stretch feature
- manual deletion capability
- basic title and creator-name filtering
- server-side ability to unpublish a game

---

## 21. Performance

## 21.1 Latency budget

Target:

| Stage | Target |
|---|---:|
| image compression | under 1 second |
| upload | under 3 seconds |
| Backboard analysis | 3 to 10 seconds |
| generation and validation | under 500 ms |
| Phaser initialization | under 2 seconds |
| total photo-to-play | ideally under 15 seconds |

## 21.2 Loading experience

Never display a static spinner for the entire process.

Show meaningful progress:

1. Uploading your photo
2. Finding objects
3. Turning objects into mechanics
4. Testing the level
5. Opening your game

These labels may be time-based visually, but the final success state must depend on real completion.

## 21.3 Caching

- cache published game data
- use optimized images
- load Phaser only on game and preview pages
- lazy-load arcade images
- avoid downloading all games at once
- paginate or use infinite scrolling

---

## 22. Testing Plan

## 22.1 Unit tests

Test:

- Zod schema parsing
- coordinate clamping
- object normalization
- role-to-mechanic mapping
- difficulty calculation
- graph edge calculation
- BFS reachability
- repair logic
- slug generation
- event validation

## 22.2 Fixture tests

Create fixed JSON fixtures:

- normal desk
- sparse scene
- overlapping objects
- invalid bounds
- unsupported role
- missing goal
- unreachable level
- portal mismatch
- extreme platform sizes

Every fixture should generate the same valid `GameSpec`.

## 22.3 Integration tests

Test:

1. upload image
2. mock Backboard response
3. generate level
4. save draft
5. publish game
6. retrieve game
7. submit events
8. load leaderboard

## 22.4 Manual device tests

Test on:

- desktop Chrome
- desktop Safari
- iPhone Safari
- Android Chrome if available
- narrow mobile viewport
- slow network simulation

## 22.5 Photo test matrix

Test photos with:

- 2 objects
- 5 objects
- 10 objects
- plain background
- cluttered background
- shadows
- tilted camera
- portrait orientation
- low light
- reflective objects
- overlapping objects
- screens containing text
- human hands partially visible

## 22.6 Demo reliability tests

Before judging:

- generate at least 20 games
- confirm all published pages load
- confirm every game is finishable
- verify database counts
- verify live stats update
- verify camera permissions
- verify fallback photo upload works
- verify one prepared photo can always generate a strong game

---

## 23. Development Sequence

## Phase 1: Foundation

- initialize Next.js project
- install dependencies
- configure Tailwind
- create Supabase project
- create environment files
- create database migrations
- configure storage
- establish visual tokens
- deploy blank application to Vercel

**Exit condition:** Public site loads and can read/write a test database row.

## Phase 2: Baseline game engine

- install Phaser
- create platformer scene
- implement movement
- implement static platforms
- implement hazards
- implement collectibles
- implement goal
- implement timer
- implement death and reset
- load one reference `GameSpec`

**Exit condition:** A complete reference game is playable on desktop and mobile.

## Phase 3: GameSpec-driven engine

- define TypeScript types
- render entities from JSON
- add moving platforms
- add bounce pads
- add portals if time permits
- add validation guards

**Exit condition:** Changing JSON alone produces a different playable game.

## Phase 4: Image capture and upload

- implement camera
- implement file upload fallback
- add image preview
- compress image
- upload to Supabase Storage
- create draft game record

**Exit condition:** A user can take a photo and retrieve its public or signed URL.

## Phase 5: Backboard integration

- create Backboard client
- create assistant prompt
- select vision model
- send image
- parse JSON
- validate with Zod
- implement retries
- store generation metadata

**Exit condition:** Ten test photos produce valid scene analyses at an acceptable success rate.

## Phase 6: Procedural generation

- normalize object geometry
- assign mechanics
- build platforms
- place spawn
- place goal
- calculate difficulty
- generate `GameSpec`

**Exit condition:** Real AI output produces playable preview levels.

## Phase 7: Reachability validation

- build platform graph
- run BFS
- implement repair strategies
- add runtime safety checks
- record repair metadata

**Exit condition:** All test levels have a verified route to the goal.

## Phase 8: Publishing and arcade

- build publish form
- generate slugs
- create public game pages
- build arcade cards or cabinets
- add newest sorting
- display source image
- add share URL

**Exit condition:** A stranger can discover and play another person's game.

## Phase 9: Analytics

- add session creation
- submit gameplay events
- calculate metrics
- build stats page
- add three charts
- add live updates

**Exit condition:** The stats page changes after real gameplay.

## Phase 10: Polish

- apply Reve visual system
- add transformation animations
- improve loading states
- add sound effects
- improve mobile controls
- improve errors
- test deployment
- prepare demo games

**Exit condition:** Product feels intentional, understandable, and reliable.

---

## 24. Team Parallelization

### Developer A: AI and backend

- Backboard client
- prompts
- response parser
- Zod schemas
- Supabase database
- API routes
- generation metadata
- event APIs

### Developer B: Game engine

- Phaser setup
- GameSpec renderer
- entities
- movement and physics
- reachability validator
- repair logic
- mobile controls

### Developer C: Product and frontend

- camera flow
- create-page states
- arcade
- public game page
- stats UI
- responsive design
- visual animation integration

### Designer or shared responsibility

- Reve assets
- brand system
- arcade cabinets
- icons
- loading effects
- slide and Devpost visuals

If there are only two developers, split into:

- **AI/backend/data**
- **frontend/game/design**

Integrate early using a shared reference `GameSpec`.

---

## 25. Environment Variables

```bash
# Public Supabase configuration
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Server-only Supabase key
SUPABASE_SERVICE_ROLE_KEY=

# Backboard
BACKBOARD_API_KEY=
BACKBOARD_ASSISTANT_ID=
BACKBOARD_PRIMARY_PROVIDER=
BACKBOARD_PRIMARY_MODEL=
BACKBOARD_FALLBACK_PROVIDER=
BACKBOARD_FALLBACK_MODEL=

# Application
NEXT_PUBLIC_APP_URL=
GAME_EVENT_SECRET=
```

Provide `.env.example`, never commit `.env.local`.

---

## 26. AI Assistant Coding Rules

Any AI coding assistant working on this repository must follow these rules.

### 26.1 Product rules

1. Preserve the core loop: **Arrange → Snap → Play → Publish**.
2. Do not add unnecessary onboarding.
3. Do not add new game genres during MVP work.
4. Do not allow AI to generate executable game code.
5. Keep gameplay deterministic and schema-driven.
6. Keep the public arcade central to the product.

### 26.2 Code rules

1. Use TypeScript strict mode.
2. Avoid `any`.
3. Validate every external payload with Zod.
4. Keep server secrets out of client components.
5. Do not duplicate domain types.
6. Place game logic under `/game`.
7. Keep UI state separate from Phaser frame state.
8. Add error handling for every network call.
9. Avoid silently swallowing errors.
10. Use small, testable functions.
11. Do not make broad unrelated refactors.
12. Preserve current visual consistency.
13. Ensure every new interface works on mobile.
14. Run linting, type checking, and relevant tests before marking work complete.

### 26.3 AI integration rules

1. Use Backboard as the AI gateway.
2. Return JSON only from vision analysis.
3. Store the raw valid analysis for debugging.
4. Never use raw model output directly in Phaser.
5. Retry invalid responses no more than twice after the first attempt.
6. Use a safe deterministic fallback.
7. Keep prompts versioned in source control.
8. Store model metadata with each generated game.
9. Never expose the Backboard API key.
10. Do not claim a level is playable until deterministic validation passes.

### 26.4 Definition of done for every feature

A feature is done only when:

- it works in the deployed application
- it handles errors
- it works on mobile where relevant
- it has no TypeScript errors
- it does not break the creation flow
- it uses real data
- it has been manually tested

---

## 27. Demo Plan

## 27.1 Prepared setup

Before judging:

- place 5 visually distinct objects on a clean surface
- include one flat object
- include one tall object
- include one long thin object
- include one small collectible-like object
- include one unusual object for a strong mechanic

Suggested objects:

- laptop or book
- water bottle
- pencil
- mug
- AirPods case

## 27.2 Live demo sequence

1. Open Snapcade.
2. Say: **The physical world is our level editor.**
3. Take one photo of the prepared arrangement.
4. Let the scan animation show object boxes and roles.
5. Load the generated game.
6. Play for approximately 10 seconds.
7. Reach the goal or intentionally die once to show tracking.
8. Publish the game.
9. Open the arcade on another device.
10. Show the new game appearing.
11. Play the public game.
12. Open statistics and show the counts changing live.

## 27.3 Technical explanation

Use one slide:

```text
Photo
  -> Backboard vision analysis
  -> structured object scene
  -> mechanic mapping
  -> deterministic level generation
  -> reachability validation and repair
  -> Phaser platformer
  -> public arcade and live analytics
```

Emphasize:

- AI interprets objects
- code guarantees playability
- every contribution becomes a real public game
- real gameplay data improves the shared artifact

## 27.4 Backup plan

Prepare:

- one strong pre-generated public game
- one local test image
- one short screen recording
- one fallback generation response fixture

The live demo should remain primary. Backups exist only for network failure.

---

## 28. Final Acceptance Checklist

### Creation

- [ ] Camera works
- [ ] Upload fallback works
- [ ] User can retake photo
- [ ] Public-photo warning is visible
- [ ] Upload is compressed
- [ ] Backboard receives image
- [ ] AI response validates
- [ ] Retry flow works
- [ ] Safe fallback works

### Generation

- [ ] Object bounds are normalized
- [ ] Objects map to supported mechanics
- [ ] Spawn is safe
- [ ] Goal exists
- [ ] Level is reachable
- [ ] Repairs are recorded
- [ ] GameSpec is stored

### Gameplay

- [ ] Desktop controls work
- [ ] Mobile controls work
- [ ] Player can jump
- [ ] Collisions work
- [ ] Hazards work
- [ ] Collectibles work
- [ ] Goal works
- [ ] Restart works
- [ ] Timer works
- [ ] Phaser instance cleans up correctly

### Publishing

- [ ] Title is editable
- [ ] Creator name is optional
- [ ] Unique slug is generated
- [ ] Public page loads
- [ ] Original photo is visible
- [ ] Game appears in arcade
- [ ] Share URL works

### Community

- [ ] Newest feed works
- [ ] Play count works
- [ ] Completion data works
- [ ] Death count works
- [ ] Fastest time works
- [ ] Stats use real data
- [ ] Live updates work

### Design

- [ ] Landing page is understandable in seconds
- [ ] Create flow has clear states
- [ ] Arcade has a distinctive visual identity
- [ ] Reve assets are consistent
- [ ] Mobile layout is polished
- [ ] Loading does not feel broken
- [ ] Error states are friendly

### Deployment

- [ ] Vercel environment variables are configured
- [ ] Supabase policies are configured
- [ ] Production database migration is applied
- [ ] Production storage bucket works
- [ ] No secrets are committed
- [ ] Type check passes
- [ ] Lint passes
- [ ] Critical tests pass
- [ ] Public URL works without team access

---

## 29. Future Product Direction

After the hackathon, Snapcade can expand into:

- top-down puzzle games
- racing tracks generated from object boundaries
- cooperative community challenges
- school-friendly physical game design lessons
- custom creator profiles
- generated game collections
- creator tournaments
- richer object cutout art
- advanced segmentation
- model-based level quality ranking
- community mechanic voting
- physical remix chains
- downloadable game packages
- creator analytics
- real-world scavenger hunts

The immediate implementation should not attempt these. The hackathon version wins by making one transformation feel magical and reliable.

---

## 30. Official Documentation References

- Backboard API introduction: https://docs.backboard.io/
- Backboard quickstart: https://docs.backboard.io/quickstart
- Backboard messages: https://docs.backboard.io/concepts/messages
- Backboard assistants: https://docs.backboard.io/concepts/assistants
- Backboard threads: https://docs.backboard.io/concepts/threads
- Phaser Arcade Physics: https://docs.phaser.io/phaser/concepts/physics/arcade
- Supabase documentation: https://supabase.com/docs
- Supabase Realtime: https://supabase.com/docs/guides/realtime
- Supabase database: https://supabase.com/docs/guides/database/overview
- Next.js App Router: https://nextjs.org/docs/app
- Next.js Route Handlers: https://nextjs.org/docs/app/getting-started/route-handlers
