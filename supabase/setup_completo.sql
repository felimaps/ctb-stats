-- CTB Stats — Setup completo do Supabase
-- Execute no SQL Editor (projeto novo)

-- ========== profiles (perfil do jogador) ==========

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  email text not null unique,
  foto_url text,
  cidade text not null default '',
  nivel text not null default 'iniciante' check (nivel in ('iniciante', 'intermediario', 'avancado')),
  mao_dominante text not null default 'direita' check (mao_dominante in ('direita', 'esquerda')),
  estilo_jogo text not null default '',
  tipo_sanguineo text check (tipo_sanguineo is null or tipo_sanguineo in ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
  alergias text,
  lesoes_recorrentes text,
  observacoes_medicas text,
  contato_emergencia text,
  telefone_emergencia text,
  medicacao_continua text,
  restricoes_fisicas text,
  saude_privada boolean not null default true,
  saude_compartilhar_admins boolean not null default false,
  ocultar_telefone_emergencia boolean not null default true,
  created_at timestamptz not null default now()
);

-- ========== matches ==========

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  adversario text not null,
  data date not null,
  placar text not null,
  resultado text not null check (resultado in ('vitoria', 'derrota')),
  tipo_quadra text not null check (tipo_quadra in ('saibro', 'rapida', 'grama', 'indoor')),
  duracao integer,
  observacoes text,
  humor_antes text[] not null default '{}',
  corpo_antes text[] not null default '{}',
  humor_depois text[] not null default '{}',
  corpo_depois text[] not null default '{}',
  vale_titulo boolean not null default false,
  nome_torneio text,
  categoria_torneio text,
  nivel_torneio text check (nivel_torneio is null or nivel_torneio in ('amistoso', 'local', 'clube', 'regional', 'estadual', 'nacional')),
  fase_partida text check (fase_partida is null or fase_partida in ('fase_grupos', 'oitavas', 'quartas', 'semifinal', 'final')),
  conquistou_titulo boolean not null default false,
  categoria_jogo text,
  categoria_personalizada text,
  created_at timestamptz not null default now()
);

-- ========== titles ==========

create table if not exists public.titles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  nome_torneio text not null,
  categoria text not null,
  nivel_torneio text not null check (nivel_torneio in ('amistoso', 'local', 'clube', 'regional', 'estadual', 'nacional')),
  adversario_final text not null,
  placar_final text not null,
  tipo_quadra text not null check (tipo_quadra in ('saibro', 'rapida', 'grama', 'indoor')),
  data_titulo date not null,
  match_id uuid references public.matches(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ========== likes ==========

create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  unique (match_id, user_id)
);

create index if not exists matches_user_id_idx on public.matches(user_id);
create index if not exists matches_data_idx on public.matches(data desc);
create index if not exists likes_match_id_idx on public.likes(match_id);
create index if not exists titles_user_id_idx on public.titles(user_id);

-- ========== RLS ==========

alter table public.profiles enable row level security;
alter table public.matches enable row level security;
alter table public.titles enable row level security;
alter table public.likes enable row level security;

drop policy if exists "profiles_select_all" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_select_all" on public.profiles for select using (true);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

drop policy if exists "matches_select_all" on public.matches;
drop policy if exists "matches_insert_own" on public.matches;
drop policy if exists "matches_update_own" on public.matches;
drop policy if exists "matches_delete_own" on public.matches;
create policy "matches_select_all" on public.matches for select using (true);
create policy "matches_insert_own" on public.matches for insert with check (auth.uid() = user_id);
create policy "matches_update_own" on public.matches for update using (auth.uid() = user_id);
create policy "matches_delete_own" on public.matches for delete using (auth.uid() = user_id);

drop policy if exists "titles_select_all" on public.titles;
drop policy if exists "titles_insert_own" on public.titles;
drop policy if exists "titles_update_own" on public.titles;
drop policy if exists "titles_delete_own" on public.titles;
create policy "titles_select_all" on public.titles for select using (true);
create policy "titles_insert_own" on public.titles for insert with check (auth.uid() = user_id);
create policy "titles_update_own" on public.titles for update using (auth.uid() = user_id);
create policy "titles_delete_own" on public.titles for delete using (auth.uid() = user_id);

drop policy if exists "likes_select_all" on public.likes;
drop policy if exists "likes_insert_own" on public.likes;
drop policy if exists "likes_delete_own" on public.likes;
create policy "likes_select_all" on public.likes for select using (true);
create policy "likes_insert_own" on public.likes for insert with check (auth.uid() = user_id);
create policy "likes_delete_own" on public.likes for delete using (auth.uid() = user_id);

-- ========== Trigger: perfil ao cadastrar ==========

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, nome, cidade, nivel, mao_dominante, estilo_jogo)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'cidade', ''),
    coalesce(new.raw_user_meta_data->>'nivel', 'iniciante'),
    coalesce(new.raw_user_meta_data->>'mao_dominante', 'direita'),
    coalesce(new.raw_user_meta_data->>'estilo_jogo', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ========== Storage: avatars ==========

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

drop policy if exists "avatars_public_read" on storage.objects;
drop policy if exists "avatars_upload_own" on storage.objects;
drop policy if exists "avatars_update_own" on storage.objects;
drop policy if exists "avatars_delete_own" on storage.objects;

create policy "avatars_public_read"
on storage.objects for select using (bucket_id = 'avatars');

create policy "avatars_upload_own"
on storage.objects for insert
with check (bucket_id = 'avatars' and auth.uid()::text = split_part(name, '/', 1));

create policy "avatars_update_own"
on storage.objects for update
using (bucket_id = 'avatars' and auth.uid()::text = split_part(name, '/', 1));

create policy "avatars_delete_own"
on storage.objects for delete
using (bucket_id = 'avatars' and auth.uid()::text = split_part(name, '/', 1));
