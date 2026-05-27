-- =============================================================================
-- CTB Stats — Corrigir RLS no cadastro (public.users + public.profiles)
-- Execute no SQL Editor do Supabase. Não remove dados existentes.
-- =============================================================================

-- Garantir que o trigger rode com privilégios corretos (bypass RLS via SECURITY DEFINER)
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

alter function public.handle_new_user() owner to postgres;

grant execute on function public.handle_new_user() to service_role;
grant execute on function public.handle_new_user() to supabase_auth_admin;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- public.users — RLS
-- -----------------------------------------------------------------------------

alter table public.users enable row level security;

drop policy if exists "users_select_all" on public.users;
drop policy if exists "users_insert_own" on public.users;
drop policy if exists "users_update_own" on public.users;
drop policy if exists "Users can insert own profile" on public.users;
drop policy if exists "Users can update own profile" on public.users;
drop policy if exists "Users can view profiles" on public.users;
drop policy if exists "Users can read all profiles" on public.users;

create policy "Users can view profiles"
on public.users
for select
using (true);

create policy "Users can insert own profile"
on public.users
for insert
to authenticated
with check (auth.uid() = id);

create policy "Users can update own profile"
on public.users
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- public.profiles — RLS (tabela usada pelo app em src/lib/api.ts)
-- -----------------------------------------------------------------------------

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_all" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can view profiles" on public.profiles;

create policy "Users can view profiles"
on public.profiles
for select
using (true);

create policy "Users can insert own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- Permissões para roles do Supabase
grant usage on schema public to anon, authenticated, service_role;

grant select on public.users to anon, authenticated;
grant insert, update on public.users to authenticated;

grant select on public.profiles to anon, authenticated;
grant insert, update on public.profiles to authenticated;
