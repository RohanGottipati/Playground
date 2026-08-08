-- Public buckets for source photos and thumbnails. Writes use the service role.
insert into storage.buckets (id, name, public)
values
  ('source-images', 'source-images', true),
  ('game-thumbnails', 'game-thumbnails', true)
on conflict (id) do nothing;

create policy "public read source images"
  on storage.objects for select
  using (bucket_id = 'source-images');

create policy "public read thumbnails"
  on storage.objects for select
  using (bucket_id = 'game-thumbnails');
