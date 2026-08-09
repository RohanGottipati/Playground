-- Private, short-lived bearer-token sessions for handing a phone photo back to
-- the browser that created its QR code. Only server-side service-role code may
-- access these rows.

create table if not exists public.capture_sessions (
  id bigint generated always as identity primary key,
  game_id uuid not null default gen_random_uuid() unique,
  capture_token_hash text not null unique,
  status_token_hash text not null unique,
  status text not null default 'pending'
    check (status in ('pending', 'uploading', 'ready', 'cancelled')),
  image_path text,
  image_url text,
  upload_started_at timestamptz,
  ready_at timestamptz,
  expires_at timestamptz not null default (now() + interval '10 minutes'),
  created_at timestamptz not null default now(),
  constraint capture_sessions_capture_hash_length
    check (char_length(capture_token_hash) = 43),
  constraint capture_sessions_status_hash_length
    check (char_length(status_token_hash) = 43),
  constraint capture_sessions_expiry_after_creation
    check (expires_at > created_at),
  constraint capture_sessions_ready_has_image
    check (
      status <> 'ready'
      or (image_path is not null and image_url is not null and ready_at is not null)
    )
);

create index if not exists capture_sessions_expires_at_idx
  on public.capture_sessions (expires_at);

alter table public.capture_sessions enable row level security;
alter table public.capture_sessions force row level security;

-- Supabase grants table access to API roles by default. Pairing rows have no
-- public policies and no direct privileges; all access goes through our API.
revoke all on table public.capture_sessions from anon, authenticated;
revoke all on sequence public.capture_sessions_id_seq from anon, authenticated;
