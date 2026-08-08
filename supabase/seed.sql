-- Optional demo row so a fresh arcade is not empty. Safe to skip.
-- The spec is intentionally minimal but valid: ground, two platforms, a
-- collectible and a goal.
insert into public.games (
  id, slug, title, creator_name, status, source_image_path, source_image_url,
  scene_analysis, game_spec, theme, difficulty, detected_object_count,
  generation_status, published_at, is_demo
)
values (
  '00000000-0000-4000-8000-000000000001',
  'demo-desk-run',
  'Demo Desk Run',
  'Snapcade',
  'published',
  'source-images/demo/original.jpg',
  'https://placehold.co/1600x900/1d1a26/f6efe2?text=Snapcade+Demo',
  '{"sceneType":"desk","orientation":"landscape","themeSuggestion":"arcade","titleSuggestion":"Demo Desk Run","warnings":[],"objects":[]}'::jsonb,
  '{
    "schemaVersion": 1,
    "title": "Demo Desk Run",
    "slug": "demo-desk-run",
    "theme": "arcade",
    "difficulty": 2,
    "world": { "width": 1600, "height": 900, "gravityY": 1100 },
    "player": { "spawnX": 90, "spawnY": 782, "moveSpeed": 260, "jumpVelocity": -500, "maxJumps": 1 },
    "entities": [
      { "id": "e1", "sourceLabel": "notebook", "mechanic": "static_platform", "bounds": { "x": 320, "y": 700, "width": 220, "height": 30 } },
      { "id": "e2", "sourceLabel": "mug", "mechanic": "bounce_pad", "bounds": { "x": 680, "y": 760, "width": 120, "height": 40 } },
      { "id": "e3", "sourceLabel": "eraser", "mechanic": "collectible", "bounds": { "x": 760, "y": 600, "width": 28, "height": 28 } },
      { "id": "e4", "sourceLabel": "book", "mechanic": "static_platform", "bounds": { "x": 980, "y": 640, "width": 240, "height": 30 } },
      { "id": "goal", "mechanic": "goal", "bounds": { "x": 1060, "y": 570, "width": 60, "height": 70 } }
    ],
    "validation": { "reachable": true, "repaired": false, "repairActions": [], "estimatedOptimalTimeSeconds": 14 },
    "source": { "imageUrl": "https://placehold.co/1600x900/1d1a26/f6efe2?text=Snapcade+Demo", "detectedObjectCount": 4 }
  }'::jsonb,
  'arcade',
  2,
  4,
  'ok',
  now(),
  true
)
on conflict (id) do nothing;
