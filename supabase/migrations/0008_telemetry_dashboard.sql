-- Fast, exact per-game telemetry for the public dashboard. Application reads
-- go through the server's service-role client; anonymous clients cannot call
-- the aggregate function directly.

create index if not exists game_events_spatial_game_created_idx
  on public.game_events (game_id, created_at desc)
  include (event_type)
  where event_type in ('player_died', 'game_completed');

create index if not exists game_events_active_game_created_idx
  on public.game_events (game_id, created_at desc)
  include (session_id)
  where session_id is not null
    and event_type in (
      'game_started',
      'checkpoint_reached',
      'collectible_collected',
      'game_completed'
    );

create or replace function public.get_game_telemetry_counts(
  p_game_id uuid,
  p_active_since timestamptz
)
returns table (
  fatality_count bigint,
  active_sessions bigint
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    (
      select count(*)
      from public.game_events
      where game_id = p_game_id
        and event_type = 'player_died'
    ) as fatality_count,
    (
      select count(distinct session_id)
      from public.game_events
      where game_id = p_game_id
        and session_id is not null
        and created_at >= p_active_since
        and event_type in (
          'game_started',
          'checkpoint_reached',
          'collectible_collected',
          'game_completed'
        )
    ) as active_sessions;
$$;

revoke all on function public.get_game_telemetry_counts(uuid, timestamptz)
  from public, anon, authenticated;
grant execute on function public.get_game_telemetry_counts(uuid, timestamptz)
  to service_role;
