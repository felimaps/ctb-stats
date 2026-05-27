-- Migração: categorias do jogo nas partidas

alter table public.matches
  add column if not exists categoria_jogo text,
  add column if not exists categoria_personalizada text;
