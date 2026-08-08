-- Two polished demo games for a fresh arcade. Re-running this seed updates the
-- existing slugs in place, preserving their source image URLs and analytics.

insert into public.games as games (
  id, slug, title, creator_name, status, source_image_path, source_image_url,
  scene_analysis, game_spec, theme, difficulty, detected_object_count,
  generation_status, published_at, is_demo
)
values (
  '00000000-0000-4000-8000-000000000001',
  'demo-desk-run',
  'Demo Desk Run',
  'Playground',
  'published',
  'source-images/demo/original.jpg',
  'https://placehold.co/1600x900/1d1a26/f6efe2?text=Playground+Demo',
  '{
    "sceneType": "desk",
    "orientation": "landscape",
    "themeSuggestion": "arcade",
    "titleSuggestion": "Demo Desk Run",
    "warnings": [],
    "objects": [
      { "id": "demo-1", "label": "notebook", "confidence": 0.95, "bounds": { "x": 0.2, "y": 0.7, "width": 0.14, "height": 0.04 }, "properties": ["flat", "rigid"], "suggestedRole": "platform", "reasoning": "A wide notebook makes a stable landing." },
      { "id": "demo-2", "label": "mug", "confidence": 0.92, "bounds": { "x": 0.43, "y": 0.76, "width": 0.08, "height": 0.06 }, "properties": ["round", "hollow"], "suggestedRole": "bounce_pad", "reasoning": "The round mug becomes a playful launcher." },
      { "id": "demo-3", "label": "eraser", "confidence": 0.9, "bounds": { "x": 0.48, "y": 0.6, "width": 0.03, "height": 0.03 }, "properties": ["small", "soft"], "suggestedRole": "collectible", "reasoning": "The small eraser becomes a pickup." },
      { "id": "demo-4", "label": "book", "confidence": 0.96, "bounds": { "x": 0.61, "y": 0.64, "width": 0.15, "height": 0.04 }, "properties": ["flat", "large", "rigid"], "suggestedRole": "goal_landmark", "reasoning": "The final book supports the exit." }
    ]
  }'::jsonb,
  '{
    "schemaVersion": 1,
    "visualVersion": 1,
    "title": "Demo Desk Run",
    "slug": "demo-desk-run",
    "theme": "arcade",
    "difficulty": 2,
    "world": { "width": 1600, "height": 900, "gravityY": 1100 },
    "player": { "spawnX": 90, "spawnY": 782, "moveSpeed": 260, "jumpVelocity": -500, "maxJumps": 1 },
    "entities": [
      { "id": "e1", "sourceObjectId": "demo-1", "sourceLabel": "notebook", "mechanic": "static_platform", "bounds": { "x": 320, "y": 700, "width": 220, "height": 30 }, "visual": { "kind": "book-platform", "componentId": "stat-notebook" }, "metadata": { "role": "platform", "properties": "flat,rigid" } },
      { "id": "e2", "sourceObjectId": "demo-2", "sourceLabel": "mug", "mechanic": "bounce_pad", "bounds": { "x": 680, "y": 760, "width": 120, "height": 40 }, "visual": { "kind": "mug-bouncer", "componentId": "mechanic-mug-bouncer" }, "metadata": { "role": "bounce_pad", "properties": "round,hollow" } },
      { "id": "e3", "sourceObjectId": "demo-3", "sourceLabel": "eraser", "mechanic": "collectible", "bounds": { "x": 760, "y": 600, "width": 34, "height": 34 }, "visual": { "kind": "eraser", "componentId": "collectible-eraser" }, "metadata": { "role": "collectible", "properties": "small,soft" } },
      { "id": "e4", "sourceObjectId": "demo-4", "sourceLabel": "book", "mechanic": "static_platform", "bounds": { "x": 980, "y": 640, "width": 240, "height": 30 }, "visual": { "kind": "book-platform", "componentId": "stat-book" }, "metadata": { "role": "goal_landmark", "properties": "flat,large,rigid" } },
      { "id": "goal", "mechanic": "goal", "bounds": { "x": 1060, "y": 570, "width": 60, "height": 70 }, "visual": { "kind": "exit-door", "componentId": "mechanic-exit-door" }, "metadata": { "generated": true, "supportId": "e4" } }
    ],
    "validation": { "reachable": true, "repaired": false, "repairActions": [], "estimatedOptimalTimeSeconds": 14 },
    "source": { "imageUrl": "https://placehold.co/1600x900/1d1a26/f6efe2?text=Playground+Demo", "detectedObjectCount": 4 }
  }'::jsonb,
  'arcade',
  2,
  4,
  'ok',
  now(),
  true
)
on conflict (slug) do update set
  scene_analysis = excluded.scene_analysis,
  game_spec = jsonb_set(
    excluded.game_spec,
    '{source,imageUrl}',
    to_jsonb(games.source_image_url),
    true
  ),
  theme = excluded.theme,
  difficulty = excluded.difficulty,
  detected_object_count = excluded.detected_object_count,
  generation_status = excluded.generation_status,
  is_demo = true;

insert into public.games as games (
  id, slug, title, creator_name, status, source_image_path, source_image_url,
  scene_analysis, game_spec, theme, difficulty, detected_object_count,
  generation_status, published_at, is_demo
)
values (
  '00000000-0000-4000-8000-000000000002',
  'tabletop-trials',
  'Tabletop Trials',
  'E2E Tester',
  'published',
  'source-images/demo/tabletop-trials.jpg',
  'https://placehold.co/1600x900/2a1e17/f6efe2?text=Tabletop+Trials',
  '{
    "sceneType": "table",
    "orientation": "landscape",
    "themeSuggestion": "arcade",
    "titleSuggestion": "Tabletop Trials",
    "warnings": [],
    "objects": [
      { "id": "tabletop-1", "label": "sketchbook", "confidence": 0.9, "bounds": { "x": 0.18, "y": 0.59, "width": 0.16, "height": 0.06 }, "properties": ["flat", "rigid"], "suggestedRole": "platform", "reasoning": "A sketchbook starts the route." },
      { "id": "tabletop-2", "label": "water bottle", "confidence": 0.9, "bounds": { "x": 0.4, "y": 0.43, "width": 0.1, "height": 0.18 }, "properties": ["tall", "container"], "suggestedRole": "vertical_platform", "reasoning": "A bottle creates a climbable tower." },
      { "id": "tabletop-3", "label": "yellow pencil", "confidence": 0.88, "bounds": { "x": 0.56, "y": 0.37, "width": 0.14, "height": 0.03 }, "properties": ["long", "thin"], "suggestedRole": "bridge", "reasoning": "A pencil bridges the upper route." },
      { "id": "tabletop-4", "label": "key", "confidence": 0.86, "bounds": { "x": 0.47, "y": 0.31, "width": 0.04, "height": 0.04 }, "properties": ["small", "rigid"], "suggestedRole": "collectible", "reasoning": "The key becomes a collectible." },
      { "id": "tabletop-5", "label": "wide shelf", "confidence": 0.85, "bounds": { "x": 0.76, "y": 0.31, "width": 0.18, "height": 0.05 }, "properties": ["flat", "large"], "suggestedRole": "goal_landmark", "reasoning": "A shelf supports the finish door." }
    ]
  }'::jsonb,
  '{
    "schemaVersion": 1,
    "visualVersion": 1,
    "title": "Tabletop Trials",
    "slug": "tabletop-trials",
    "theme": "arcade",
    "difficulty": 2,
    "world": { "width": 1600, "height": 900, "gravityY": 1100 },
    "player": { "spawnX": 90, "spawnY": 782, "moveSpeed": 260, "jumpVelocity": -500, "maxJumps": 1 },
    "entities": [
      { "id": "e-tabletop-1", "sourceObjectId": "tabletop-1", "sourceLabel": "sketchbook", "mechanic": "static_platform", "bounds": { "x": 444, "y": 710, "width": 256, "height": 54 }, "visual": { "kind": "book-platform", "componentId": "stat-notebook" }, "metadata": { "role": "platform", "properties": "flat,rigid" } },
      { "id": "e-tabletop-2", "sourceObjectId": "tabletop-2", "sourceLabel": "water bottle", "mechanic": "static_platform", "bounds": { "x": 551.2, "y": 590, "width": 160, "height": 162 }, "visual": { "kind": "bottle-tower", "componentId": "terrain-bottle-tower" }, "metadata": { "role": "vertical_platform", "properties": "tall,container" } },
      { "id": "e-tabletop-4", "sourceObjectId": "tabletop-4", "sourceLabel": "key", "mechanic": "collectible", "bounds": { "x": 767, "y": 280, "width": 34, "height": 34 }, "visual": { "kind": "key", "componentId": "collectible-key" }, "metadata": { "role": "collectible", "properties": "small,rigid" } },
      { "id": "e-tabletop-3", "sourceObjectId": "tabletop-3", "sourceLabel": "yellow pencil", "mechanic": "static_platform", "bounds": { "x": 740, "y": 470, "width": 224, "height": 27 }, "visual": { "kind": "pencil-bridge", "componentId": "stat-pencil" }, "metadata": { "role": "bridge", "properties": "long,thin" } },
      { "id": "e-tabletop-5", "sourceObjectId": "tabletop-5", "sourceLabel": "wide shelf", "mechanic": "static_platform", "bounds": { "x": 1060, "y": 350, "width": 288, "height": 45 }, "visual": { "kind": "book-platform", "componentId": "terrain-book-platform" }, "metadata": { "role": "goal_landmark", "properties": "flat,large" } },
      { "id": "goal", "mechanic": "goal", "bounds": { "x": 1176, "y": 270, "width": 56, "height": 80 }, "visual": { "kind": "exit-door", "componentId": "mechanic-exit-door" }, "metadata": { "generated": true, "supportId": "e-tabletop-5" } }
    ],
    "validation": { "reachable": true, "repaired": true, "repairActions": ["Rebuilt the tabletop route for reliable demo play"], "estimatedOptimalTimeSeconds": 9 },
    "source": { "imageUrl": "https://placehold.co/1600x900/2a1e17/f6efe2?text=Tabletop+Trials", "detectedObjectCount": 5 }
  }'::jsonb,
  'arcade',
  2,
  5,
  'ok',
  now(),
  true
)
on conflict (slug) do update set
  scene_analysis = excluded.scene_analysis,
  game_spec = jsonb_set(
    excluded.game_spec,
    '{source,imageUrl}',
    to_jsonb(games.source_image_url),
    true
  ),
  theme = excluded.theme,
  difficulty = excluded.difficulty,
  detected_object_count = excluded.detected_object_count,
  generation_status = excluded.generation_status,
  is_demo = true;
