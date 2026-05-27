-- Perfil: foto_url, saúde e privacidade

alter table public.users rename column foto to foto_url;

-- Se foto_url não existir ainda (instalação nova já usa foto_url):
-- alter table public.users add column if not exists foto_url text;

alter table public.users
  add column if not exists tipo_sanguineo text,
  add column if not exists alergias text,
  add column if not exists lesoes_recorrentes text,
  add column if not exists observacoes_medicas text,
  add column if not exists contato_emergencia text,
  add column if not exists telefone_emergencia text,
  add column if not exists medicacao_continua text,
  add column if not exists restricoes_fisicas text,
  add column if not exists saude_privada boolean not null default true,
  add column if not exists saude_compartilhar_admins boolean not null default false,
  add column if not exists ocultar_telefone_emergencia boolean not null default true;

-- Storage para avatares (criar bucket "avatars" público no painel ou via SQL)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatars_public_read"
on storage.objects for select
using (bucket_id = 'avatars');

create policy "avatars_upload_own"
on storage.objects for insert
with check (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "avatars_update_own"
on storage.objects for update
using (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "avatars_delete_own"
on storage.objects for delete
using (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);
