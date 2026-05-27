-- Migração: sistema de títulos

alter table public.matches
  add column if not exists vale_titulo boolean not null default false,
  add column if not exists nome_torneio text,
  add column if not exists categoria_torneio text,
  add column if not exists nivel_torneio text,
  add column if not exists fase_partida text,
  add column if not exists conquistou_titulo boolean not null default false;

create table if not exists public.titles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  nome_torneio text not null,
  categoria text not null,
  nivel_torneio text not null,
  adversario_final text not null,
  placar_final text not null,
  tipo_quadra text not null,
  data_titulo date not null,
  match_id uuid references public.matches(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists titles_user_id_idx on public.titles(user_id);

alter table public.titles enable row level security;

create policy "titles_select_all" on public.titles for select using (true);
create policy "titles_insert_own" on public.titles for insert with check (auth.uid() = user_id);
create policy "titles_update_own" on public.titles for update using (auth.uid() = user_id);
create policy "titles_delete_own" on public.titles for delete using (auth.uid() = user_id);
