-- Run once in the Supabase SQL editor (after schema.sql).
alter table courses add column cover text;                         -- carousel image URL
alter table courses add column gallery text[] not null default '{}'; -- detail page image URLs

insert into storage.buckets (id, name, public) values ('courses', 'courses', true);
-- public bucket: anyone can read by URL; only signed-in admins can change files
create policy "admins insert images" on storage.objects for insert to authenticated with check (bucket_id = 'courses');
create policy "admins update images" on storage.objects for update to authenticated using (bucket_id = 'courses');
create policy "admins delete images" on storage.objects for delete to authenticated using (bucket_id = 'courses');
