-- Migração: renomear tabela users → profiles (projetos CTB antigos)

do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'users'
  ) and not exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'profiles'
  ) then
    alter table public.users rename to profiles;
  end if;
end $$;

-- Recriar políticas com nomes corretos (se vieram de users_*)
drop policy if exists "users_select_all" on public.profiles;
drop policy if exists "users_insert_own" on public.profiles;
drop policy if exists "users_update_own" on public.profiles;

drop policy if exists "profiles_select_all" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_select_all" on public.profiles for select using (true);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Atualizar trigger para profiles
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
