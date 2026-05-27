-- =============================================================================
-- CTB Stats — Correção definitiva: public.users (+ espelho public.profiles)
-- Execute no SQL Editor do Supabase. Não remove dados existentes.
-- Sem ON CONFLICT — usa NOT EXISTS e garante PRIMARY KEY antes de inserir.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Criar tabela users (estrutura mínima se não existir)
-- -----------------------------------------------------------------------------

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  email text not null,
  created_at timestamptz not null default now()
);

-- Garantir PRIMARY KEY em users (tabelas legadas podem não ter)
do $$
begin
  if not exists (
    select 1
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public'
      and t.relname = 'users'
      and c.contype = 'p'
  ) then
    alter table public.users add primary key (id);
  end if;
exception
  when invalid_table_definition then null;
  when duplicate_table then null;
end $$;

-- -----------------------------------------------------------------------------
-- 2) Legado: coluna "foto" → "foto_url"
-- -----------------------------------------------------------------------------

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'users' and column_name = 'foto'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'users' and column_name = 'foto_url'
  ) then
    alter table public.users rename column foto to foto_url;
  end if;
end $$;

-- -----------------------------------------------------------------------------
-- 3) Adicionar colunas em users (if not exists)
-- -----------------------------------------------------------------------------

alter table public.users add column if not exists email text;
alter table public.users add column if not exists foto_url text;
alter table public.users add column if not exists cidade text;
alter table public.users add column if not exists nivel text;
alter table public.users add column if not exists mao_dominante text;
alter table public.users add column if not exists estilo_jogo text;
alter table public.users add column if not exists tipo_sanguineo text;
alter table public.users add column if not exists alergias text;
alter table public.users add column if not exists lesoes_recorrentes text;
alter table public.users add column if not exists observacoes_medicas text;
alter table public.users add column if not exists contato_emergencia text;
alter table public.users add column if not exists telefone_emergencia text;
alter table public.users add column if not exists medicacao_continua text;
alter table public.users add column if not exists restricoes_fisicas text;
alter table public.users add column if not exists saude_privada boolean;
alter table public.users add column if not exists saude_compartilhar_admins boolean;
alter table public.users add column if not exists ocultar_telefone_emergencia boolean;
alter table public.users add column if not exists created_at timestamptz;

-- -----------------------------------------------------------------------------
-- 4) Backfill users (preserva dados existentes)
-- -----------------------------------------------------------------------------

update public.users set cidade = '' where cidade is null;
update public.users set nivel = 'iniciante' where nivel is null;
update public.users set mao_dominante = 'direita' where mao_dominante is null;
update public.users set estilo_jogo = '' where estilo_jogo is null;
update public.users set saude_privada = true where saude_privada is null;
update public.users set saude_compartilhar_admins = false where saude_compartilhar_admins is null;
update public.users set ocultar_telefone_emergencia = true where ocultar_telefone_emergencia is null;
update public.users set created_at = now() where created_at is null;

update public.users u
set email = a.email
from auth.users a
where u.id = a.id and (u.email is null or u.email = '');

-- -----------------------------------------------------------------------------
-- 5) Defaults e NOT NULL em users
-- -----------------------------------------------------------------------------

alter table public.users alter column cidade set default '';
alter table public.users alter column nivel set default 'iniciante';
alter table public.users alter column mao_dominante set default 'direita';
alter table public.users alter column estilo_jogo set default '';
alter table public.users alter column saude_privada set default true;
alter table public.users alter column saude_compartilhar_admins set default false;
alter table public.users alter column ocultar_telefone_emergencia set default true;
alter table public.users alter column created_at set default now();

alter table public.users alter column cidade set not null;
alter table public.users alter column nivel set not null;
alter table public.users alter column mao_dominante set not null;
alter table public.users alter column estilo_jogo set not null;
alter table public.users alter column saude_privada set not null;
alter table public.users alter column saude_compartilhar_admins set not null;
alter table public.users alter column ocultar_telefone_emergencia set not null;
alter table public.users alter column created_at set not null;

-- -----------------------------------------------------------------------------
-- 6) Constraints em users (idempotente)
-- -----------------------------------------------------------------------------

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'users_email_key') then
    alter table public.users add constraint users_email_key unique (email);
  end if;
exception when duplicate_object then null;
end $$;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'users_nivel_check') then
    alter table public.users add constraint users_nivel_check
      check (nivel in ('iniciante', 'intermediario', 'avancado'));
  end if;
exception when duplicate_object then null;
end $$;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'users_mao_dominante_check') then
    alter table public.users add constraint users_mao_dominante_check
      check (mao_dominante in ('direita', 'esquerda'));
  end if;
exception when duplicate_object then null;
end $$;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'users_tipo_sanguineo_check') then
    alter table public.users add constraint users_tipo_sanguineo_check
      check (
        tipo_sanguineo is null
        or tipo_sanguineo in ('A+','A-','B+','B-','AB+','AB-','O+','O-')
      );
  end if;
exception when duplicate_object then null;
end $$;

-- -----------------------------------------------------------------------------
-- 7) RLS + policies em users
-- -----------------------------------------------------------------------------

alter table public.users enable row level security;

drop policy if exists "users_select_all" on public.users;
drop policy if exists "users_insert_own" on public.users;
drop policy if exists "users_update_own" on public.users;

create policy "users_select_all" on public.users
  for select using (true);

create policy "users_insert_own" on public.users
  for insert with check (auth.uid() = id);

create policy "users_update_own" on public.users
  for update using (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- 8) Tabela profiles (usada pelo app em src/lib/api.ts)
-- -----------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  email text not null,
  created_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public'
      and t.relname = 'profiles'
      and c.contype = 'p'
  ) then
    alter table public.profiles add primary key (id);
  end if;
exception
  when invalid_table_definition then null;
  when duplicate_table then null;
end $$;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'foto'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'foto_url'
  ) then
    alter table public.profiles rename column foto to foto_url;
  end if;
end $$;

alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists foto_url text;
alter table public.profiles add column if not exists cidade text;
alter table public.profiles add column if not exists nivel text;
alter table public.profiles add column if not exists mao_dominante text;
alter table public.profiles add column if not exists estilo_jogo text;
alter table public.profiles add column if not exists tipo_sanguineo text;
alter table public.profiles add column if not exists alergias text;
alter table public.profiles add column if not exists lesoes_recorrentes text;
alter table public.profiles add column if not exists observacoes_medicas text;
alter table public.profiles add column if not exists contato_emergencia text;
alter table public.profiles add column if not exists telefone_emergencia text;
alter table public.profiles add column if not exists medicacao_continua text;
alter table public.profiles add column if not exists restricoes_fisicas text;
alter table public.profiles add column if not exists saude_privada boolean;
alter table public.profiles add column if not exists saude_compartilhar_admins boolean;
alter table public.profiles add column if not exists ocultar_telefone_emergencia boolean;
alter table public.profiles add column if not exists created_at timestamptz;

update public.profiles set cidade = '' where cidade is null;
update public.profiles set nivel = 'iniciante' where nivel is null;
update public.profiles set mao_dominante = 'direita' where mao_dominante is null;
update public.profiles set estilo_jogo = '' where estilo_jogo is null;
update public.profiles set saude_privada = true where saude_privada is null;
update public.profiles set saude_compartilhar_admins = false where saude_compartilhar_admins is null;
update public.profiles set ocultar_telefone_emergencia = true where ocultar_telefone_emergencia is null;
update public.profiles set created_at = now() where created_at is null;

update public.profiles p
set email = a.email
from auth.users a
where p.id = a.id and (p.email is null or p.email = '');

alter table public.profiles alter column cidade set default '';
alter table public.profiles alter column nivel set default 'iniciante';
alter table public.profiles alter column mao_dominante set default 'direita';
alter table public.profiles alter column estilo_jogo set default '';
alter table public.profiles alter column saude_privada set default true;
alter table public.profiles alter column saude_compartilhar_admins set default false;
alter table public.profiles alter column ocultar_telefone_emergencia set default true;
alter table public.profiles alter column created_at set default now();

alter table public.profiles alter column cidade set not null;
alter table public.profiles alter column nivel set not null;
alter table public.profiles alter column mao_dominante set not null;
alter table public.profiles alter column estilo_jogo set not null;
alter table public.profiles alter column saude_privada set not null;
alter table public.profiles alter column saude_compartilhar_admins set not null;
alter table public.profiles alter column ocultar_telefone_emergencia set not null;
alter table public.profiles alter column created_at set not null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_email_key') then
    alter table public.profiles add constraint profiles_email_key unique (email);
  end if;
exception when duplicate_object then null;
end $$;

-- Copiar users → profiles (somente ids que ainda não existem em profiles)
insert into public.profiles (
  id, nome, email, foto_url, cidade, nivel, mao_dominante, estilo_jogo,
  tipo_sanguineo, alergias, lesoes_recorrentes, observacoes_medicas,
  contato_emergencia, telefone_emergencia, medicacao_continua, restricoes_fisicas,
  saude_privada, saude_compartilhar_admins, ocultar_telefone_emergencia, created_at
)
select
  u.id, u.nome, u.email, u.foto_url, u.cidade, u.nivel, u.mao_dominante, u.estilo_jogo,
  u.tipo_sanguineo, u.alergias, u.lesoes_recorrentes, u.observacoes_medicas,
  u.contato_emergencia, u.telefone_emergencia, u.medicacao_continua, u.restricoes_fisicas,
  u.saude_privada, u.saude_compartilhar_admins, u.ocultar_telefone_emergencia, u.created_at
from public.users u
where not exists (select 1 from public.profiles p where p.id = u.id);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_all" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_select_all" on public.profiles for select using (true);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- 9) Trigger: cadastro em users + profiles (sem ON CONFLICT)
-- -----------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.users where id = new.id) then
    insert into public.users (
      id, email, nome, cidade, nivel, mao_dominante, estilo_jogo,
      saude_privada, saude_compartilhar_admins, ocultar_telefone_emergencia
    )
    values (
      new.id,
      new.email,
      coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)),
      coalesce(new.raw_user_meta_data->>'cidade', ''),
      coalesce(new.raw_user_meta_data->>'nivel', 'iniciante'),
      coalesce(new.raw_user_meta_data->>'mao_dominante', 'direita'),
      coalesce(new.raw_user_meta_data->>'estilo_jogo', ''),
      true,
      false,
      true
    );
  end if;

  if not exists (select 1 from public.profiles where id = new.id) then
    insert into public.profiles (
      id, email, nome, cidade, nivel, mao_dominante, estilo_jogo,
      saude_privada, saude_compartilhar_admins, ocultar_telefone_emergencia
    )
    values (
      new.id,
      new.email,
      coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)),
      coalesce(new.raw_user_meta_data->>'cidade', ''),
      coalesce(new.raw_user_meta_data->>'nivel', 'iniciante'),
      coalesce(new.raw_user_meta_data->>'mao_dominante', 'direita'),
      coalesce(new.raw_user_meta_data->>'estilo_jogo', ''),
      true,
      false,
      true
    );
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- Fim — Verifique: public.users e public.profiles no Table Editor
-- -----------------------------------------------------------------------------
