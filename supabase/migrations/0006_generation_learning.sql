-- Learning loop: every generation stores what it produced so the next run
-- can avoid repeats and tune pressure to real completion rates. Rows are
-- written and read exclusively through the server's service-role client.

create table if not exists public.generation_insights (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games (id) on delete cascade,
  mode text not null,
  -- Seeds are unsigned 32-bit, which overflows integer.
  seed bigint not null default 0,
  theme text not null default 'default',
  difficulty smallint not null default 3 check (difficulty between 1 and 5),
  title text not null,
  object_labels text[] not null default '{}',
  mechanics text[] not null default '{}',
  magic_patterns_id text,
  magic_patterns_editor_url text,
  prompt_version text not null default '1',
  created_at timestamptz not null default now()
);

create index if not exists generation_insights_created_idx
  on public.generation_insights (created_at desc);
create index if not exists generation_insights_game_idx
  on public.generation_insights (game_id);
create index if not exists generation_insights_mode_idx
  on public.generation_insights (mode, created_at desc);

-- Service-role only: RLS enabled with no anon/authenticated policies.
alter table public.generation_insights enable row level security;

-- game_summaries gains the game mode for arcade cards and mode analytics.
-- Dropped and recreated (rather than create-or-replace) so the column can
-- sit next to theme; grants are re-issued below.
drop view if exists public.game_summaries;

create view public.game_summaries as
select
  g.id,
  coalesce(g.slug, g.id::text) as slug,
  g.title,
  g.creator_name,
  g.theme,
  coalesce(g.game_spec->>'mode', 'classic') as mode,
  g.difficulty,
  g.source_image_url,
  g.detected_object_count,
  g.published_at,
  g.parent_game_id,
  g.is_demo,
  coalesce(s.plays, 0) as plays,
  coalesce(s.completions, 0) as completions,
  coalesce(s.deaths, 0) as deaths,
  case when coalesce(s.plays, 0) = 0 then 0
       else s.completions::numeric / s.plays end as completion_rate,
  s.fastest_ms,
  coalesce(l.likes, 0) as likes,
  coalesce(r.remixes, 0) as remixes
from public.games g
left join (
  select
    game_id,
    count(*) as plays,
    count(*) filter (where completed) as completions,
    sum(death_count) as deaths,
    min(duration_ms) filter (where completed) as fastest_ms
  from public.game_sessions
  group by game_id
) s on s.game_id = g.id
left join (
  select game_id, count(*) as likes from public.game_likes group by game_id
) l on l.game_id = g.id
left join (
  select parent_game_id, count(*) as remixes
  from public.games
  where parent_game_id is not null and status = 'published'
  group by parent_game_id
) r on r.parent_game_id = g.id
where g.status = 'published';

grant select on public.game_summaries to anon, authenticated;
