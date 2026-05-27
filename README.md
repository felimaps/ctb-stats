# CTB Stats — Tênis Amador

MVP para jogadores amadores de tênis registrarem partidas, acompanhar estatísticas e evolução no esporte.

## Tecnologias

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- Recharts (gráficos)
- React Router
- Supabase (auth + PostgreSQL + Storage para fotos)

## Funcionalidades

- Login e cadastro por e-mail/senha
- Perfil do jogador (nome, foto, cidade, nível, mão dominante, estilo)
- Dashboard com resumo de partidas e conquistas
- Cadastro, edição e exclusão de partidas
- Histórico, estatísticas com gráficos, ranking, rivalidades detalhadas
- Acompanhamento emocional e físico (antes/depois) com insights em "Corpo e mente"
- Feed social com curtidas
- Layout responsivo (sidebar desktop / navegação inferior mobile)

## Início rápido

```bash
npm install
cp .env.example .env   # preencha na raiz do projeto (não em src/)
npm run dev
```

## Configurar Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. No **SQL Editor**, execute **`supabase/setup_completo.sql`**
   - Se já rodou setup antigo com tabela `users`, execute também `supabase/migrations/006_rename_users_to_profiles.sql`
3. **Authentication → Providers** → habilite **Email**  
   - Para testes: desative **Confirm email** em Settings
4. **Project Settings → API** → copie URL e chave anon para `.env` na **raiz**:

```env
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
```

5. `npm run check:supabase && npm run dev`

| Recurso | Supabase |
|---------|----------|
| Auth (login, sessão) | Supabase Auth |
| Perfil | Tabela `profiles` |
| Partidas, categorias, humor/corpo | Tabela `matches` |
| Títulos | Tabela `titles` |
| Feed / curtidas | `matches` + `likes` |
| Foto | Storage `avatars` + URL em `profiles.foto_url` |

Rivalidades, dashboard e estatísticas são calculados em tempo real a partir das partidas no banco.

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
