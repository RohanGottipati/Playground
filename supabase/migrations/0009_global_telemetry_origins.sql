-- Site-wide (not per-game) live session + city count for the recap globe
-- hover card. Mirrors get_game_telemetry_counts but drops the game_id
-- filter. Application reads go through the server's service-role client.

create or replace function public.get_global_telemetry_origins(
  p_active_since timestamptz
)
returns table (
  active_sessions bigint,
  city_count bigint
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    (
      select count(distinct session_id)
      from public.game_events
      where session_id is not null
        and created_at >= p_active_since
        and event_type in (
          'game_started',
          'checkpoint_reached',
          'collectible_collected',
          'game_completed'
        )
    ) as active_sessions,
    (
      select count(distinct event_payload->>'city')
      from public.game_events
      where created_at >= p_active_since
        and event_payload->>'city' is not null
    ) as city_count;
$$;

revoke all on function public.get_global_telemetry_origins(timestamptz)
  from public, anon, authenticated;
grant execute on function public.get_global_telemetry_origins(timestamptz)
  to service_role;
