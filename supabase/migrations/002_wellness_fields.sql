-- Migração: campos de corpo e mente nas partidas
-- Execute se já tiver criado o schema anterior

alter table public.matches
  add column if not exists humor_antes text[] not null default '{}',
  add column if not exists corpo_antes text[] not null default '{}',
  add column if not exists humor_depois text[] not null default '{}',
  add column if not exists corpo_depois text[] not null default '{}';
