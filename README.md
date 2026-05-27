# CourtBook — Tênis Amador

MVP para jogadores amadores de tênis registrarem partidas, acompanhar estatísticas e evolução no esporte.

## Tecnologias

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- Recharts (gráficos)
- React Router
- Supabase (auth + banco) — com fallback em modo demonstração (localStorage)

## Funcionalidades

- Login e cadastro por e-mail/senha
- Perfil do jogador (nome, foto, cidade, nível, mão dominante, estilo)
- Dashboard com resumo de partidas e conquistas
- Cadastro, edição e exclusão de partidas
- Histórico, estatísticas com gráficos, ranking, rivalidades detalhadas
- Acompanhamento emocional e físico (antes/depois) com insights em "Corpo e mente"
- Feed social com curtidas
- Layout responsivo (sidebar desktop / navegação inferior mobile)

## Início rápido (modo demonstração)

Sem configurar Supabase, o app funciona com dados no navegador:

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`, crie uma conta e comece a usar.

## Configurar Supabase (produção)

1. Crie um projeto em [supabase.com](https://supabase.com)
2. No SQL Editor, execute o arquivo `supabase/schema.sql`
3. Copie `.env.example` para `.env` e preencha:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
```

4. Em Authentication → Providers, habilite **Email**
5. Reinicie o servidor: `npm run dev`

## Rotas

| Rota | Descrição |
|------|-----------|
| `/login` | Entrar |
| `/cadastro` | Criar conta |
| `/dashboard` | Resumo e conquistas |
| `/perfil` | Editar perfil |
| `/nova-partida` | Registrar jogo |
| `/historico` | Lista de partidas |
| `/estatisticas` | Gráficos |
| `/ranking` | Pontuação geral |
| `/rivalidades` | Análise por adversário |
| `/rivalidades/:adversario` | Detalhe do confronto |
| `/feed` | Partidas da comunidade |

## Scripts

```bash
npm run dev      # Desenvolvimento
npm run build    # Build de produção
npm run preview  # Preview do build
```

## Pontuação

- Vitória: **10 pontos**
- Derrota: **2 pontos**

## Estrutura do projeto

```
src/
  components/   # UI reutilizável, layout, formulários, gráficos
  context/      # Autenticação
  hooks/        # useMatches
  lib/          # API, stats, badges, charts, Supabase/local
  pages/        # Telas da aplicação
  types/        # Tipos TypeScript
supabase/
  schema.sql    # Schema do banco
```
