-- Everyday-object artwork is renderable independently of its preferred
-- gameplay mechanic. The final, validated GameEntitySpec still controls all
-- physics and collision behavior.

alter table public.component_catalog
  drop constraint if exists component_catalog_entity_mechanic_check;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'component_catalog_entity_renderer_check'
      and conrelid = 'public.component_catalog'::regclass
  ) then
    alter table public.component_catalog
      add constraint component_catalog_entity_renderer_check
      check (runtime_scope <> 'entity' or renderer_key is not null);
  end if;
end $$;

comment on column public.component_catalog.mechanic is
  'Preferred supported mechanic when known; null does not prevent an entity-scoped component from rendering.';
