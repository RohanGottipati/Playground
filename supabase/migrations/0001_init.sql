-- Snapcade core schema.
create extension if not exists "pgcrypto";

create type game_status as enum ('draft', 'published', 'failed');

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  title text not null,
  creator_name text not null default 'Anonymous',
  status game_status not null default 'draft',
  source_image_path text not null,
  source_image_url text not null,
  thumbnail_path text,
  scene_analysis jsonb not null,
  game_spec jsonb not null,
  theme text not null default 'default',
  difficulty smallint not null default 3 check (difficulty between 1 and 5),
  detected_object_count smallint not null default 0,
  generation_latency_ms integer,
  generation_attempt_count smallint not null default 1,
  generation_status text not null default 'ok',
  llm_provider text,
  model_name text,
  backboard_assistant_id text,
  backboard_thread_id text,
  ai_schema_version text,
  parent_game_id uuid references public.games (id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  is_demo boolean not null default false
);

create index if not exists games_status_published_at_idx
  on public.games (status, published_at desc);
create index if not exists games_parent_idx on public.games (parent_game_id);

create table if not exists public.game_objects (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games (id) on delete cascade,
  source_object_id text not null,
  label text not null,
  normalized_bounds jsonb not null,
  properties text[] not null default '{}',
  suggested_role text,
  final_mechanic text,
  confidence real not null default 0.5
);

create index if not exists game_objects_game_idx on public.game_objects (game_id);
create index if not exists game_objects_label_idx on public.game_objects (lower(label));

create table if not exists public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games (id) on delete cascade,
  anonymous_session_id text not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  duration_ms integer check (duration_ms is null or duration_ms >= 0),
  death_count integer not null default 0,
  collectibles_collected integer not null default 0,
  completed boolean not null default false,
  user_agent text
);

create index if not exists game_sessions_game_idx on public.game_sessions (game_id);
create index if not exists game_sessions_fastest_idx
  on public.game_sessions (game_id, duration_ms)
  where completed;

create table if not exists public.game_events (
  id bigserial primary key,
  game_id uuid not null references public.games (id) on delete cascade,
  session_id uuid references public.game_sessions (id) on delete set null,
  event_type text not null,
  event_payload jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists game_events_game_idx on public.game_events (game_id, created_at desc);
create index if not exists game_events_type_idx on public.game_events (event_type, created_at desc);

create table if not exists public.game_likes (
  game_id uuid not null references public.games (id) on delete cascade,
  anonymous_session_id text not null,
  created_at timestamptz not null default now(),
  primary key (game_id, anonymous_session_id)
);

create table if not exists public.mechanic_discoveries (
  id uuid primary key default gen_random_uuid(),
  object_label text not null,
  normalized_object_label text not null,
  mechanic text not null,
  first_game_id uuid references public.games (id) on delete set null,
  discovery_count integer not null default 1,
  discovered_at timestamptz not null default now(),
  unique (normalized_object_label, mechanic)
);

-- Aggregated arcade card data.
create or replace view public.game_summaries as
select
  g.id,
  coalesce(g.slug, g.id::text) as slug,
  g.title,
  g.creator_name,
  g.theme,
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

create or replace view public.object_label_counts as
select lower(trim(label)) as label, count(*) as count
from public.game_objects o
join public.games g on g.id = o.game_id
where g.status = 'published'
group by 1
order by count desc;

create or replace view public.global_play_totals as
select
  count(*) as plays,
  count(*) filter (where completed) as completions,
  coalesce(sum(death_count), 0) as deaths
from public.game_sessions;

-- Upsert a discovery and report whether it is new.
create or replace function public.register_mechanic_discovery(
  p_object_label text,
  p_normalized_label text,
  p_mechanic text,
  p_game_id uuid
)
returns table (
  id uuid,
  object_label text,
  normalized_object_label text,
  mechanic text,
  first_game_id uuid,
  discovery_count integer,
  discovered_at timestamptz,
  is_new boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_existing public.mechanic_discoveries;
begin
  select * into v_existing
  from public.mechanic_discoveries d
  where d.normalized_object_label = p_normalized_label and d.mechanic = p_mechanic;

  if v_existing.id is null then
    insert into public.mechanic_discoveries (
      object_label, normalized_object_label, mechanic, first_game_id
    )
    values (p_object_label, p_normalized_label, p_mechanic, p_game_id)
    returning * into v_existing;

    return query select v_existing.id, v_existing.object_label,
      v_existing.normalized_object_label, v_existing.mechanic,
      v_existing.first_game_id, v_existing.discovery_count,
      v_existing.discovered_at, true;
  else
    update public.mechanic_discoveries
    set discovery_count = discovery_count + 1
    where id = v_existing.id
    returning * into v_existing;

    return query select v_existing.id, v_existing.object_label,
      v_existing.normalized_object_label, v_existing.mechanic,
      v_existing.first_game_id, v_existing.discovery_count,
      v_existing.discovered_at, false;
  end if;
end;
$$;

-- Row level security: anonymous clients may read published data only. All writes
-- go through the server using the service role key.
alter table public.games enable row level security;
alter table public.game_objects enable row level security;
alter table public.game_sessions enable row level security;
alter table public.game_events enable row level security;
alter table public.game_likes enable row level security;
alter table public.mechanic_discoveries enable row level security;

create policy "published games are readable"
  on public.games for select
  using (status = 'published');

create policy "objects of published games are readable"
  on public.game_objects for select
  using (exists (
    select 1 from public.games g
    where g.id = game_objects.game_id and g.status = 'published'
  ));

create policy "sessions of published games are readable"
  on public.game_sessions for select
  using (exists (
    select 1 from public.games g
    where g.id = game_sessions.game_id and g.status = 'published'
  ));

create policy "events of published games are readable"
  on public.game_events for select
  using (exists (
    select 1 from public.games g
    where g.id = game_events.game_id and g.status = 'published'
  ));

create policy "likes are readable"
  on public.game_likes for select using (true);

create policy "discoveries are readable"
  on public.mechanic_discoveries for select using (true);

grant select on public.game_summaries to anon, authenticated;
grant select on public.object_label_counts to anon, authenticated;
grant select on public.global_play_totals to anon, authenticated;
