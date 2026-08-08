-- Database-backed registry for the supplied runtime sprites and UI catalog.
-- React/Phaser implementation stays in source control; this table stores the
-- stable identifiers and compatibility metadata needed for safe selection.

create table if not exists public.component_catalog (
  id text primary key,
  name text not null,
  category text not null,
  description text not null,
  tags text[] not null default '{}',
  aliases text[] not null default '{}',
  runtime_scope text not null,
  mechanic text,
  renderer_key text,
  enabled boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint component_catalog_id_format_check
    check (id ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint component_catalog_name_check
    check (length(trim(name)) between 1 and 120),
  constraint component_catalog_category_check
    check (category ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint component_catalog_runtime_scope_check
    check (runtime_scope in ('entity', 'player', 'world', 'ui', 'future')),
  constraint component_catalog_mechanic_check
    check (mechanic is null or mechanic in (
      'static_platform',
      'moving_platform',
      'bounce_pad',
      'hazard',
      'collectible',
      'portal',
      'goal'
    )),
  constraint component_catalog_entity_mechanic_check
    check (
      (runtime_scope = 'entity' and mechanic is not null)
      or (runtime_scope <> 'entity' and mechanic is null)
    ),
  constraint component_catalog_metadata_object_check
    check (jsonb_typeof(metadata) = 'object')
);

create index if not exists component_catalog_category_idx
  on public.component_catalog (category, name);

create index if not exists component_catalog_runtime_idx
  on public.component_catalog (runtime_scope, mechanic)
  where enabled;

create index if not exists component_catalog_tags_idx
  on public.component_catalog using gin (tags);

create index if not exists component_catalog_aliases_idx
  on public.component_catalog using gin (aliases);

alter table public.component_catalog enable row level security;

create policy "enabled components are readable"
  on public.component_catalog
  for select
  to anon, authenticated
  using (enabled);

revoke all on public.component_catalog from anon, authenticated;
grant select on public.component_catalog to anon, authenticated;

comment on table public.component_catalog is
  'Stable registry metadata for supplied Phaser sprites and React UI components; source code is not stored in Postgres.';

comment on column public.component_catalog.runtime_scope is
  'entity/player/world/ui are currently usable scopes; future is catalog-only.';

comment on column public.component_catalog.renderer_key is
  'Stable source-code renderer key. Null means the component is catalogued for a future implementation.';
