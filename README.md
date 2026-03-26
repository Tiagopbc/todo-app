# Todo App com Supabase

Aplicacao em Next.js App Router com Supabase Auth, operacoes CRUD de tarefas e dashboard de estatisticas.

## Recursos implementados

- Excluir tarefa por `id`
- Marcar tarefa como concluida com coluna `done`
- Autenticacao com email e senha
- Isolamento de tarefas por usuario autenticado
- Dashboard em `/dashboard` com totais, pendentes, concluidas e taxa de conclusao

## Configuracao do banco no Supabase

Use `supabase/setup.sql` como source of truth do schema.

1. Abra o SQL Editor do Supabase.
2. Execute o conteudo de `supabase/setup.sql`.
3. Se a tabela `tasks` ainda nao existir, use o bloco comentado no final do proprio arquivo.

Se voce ja tem tarefas antigas sem `user_id`, elas precisarao ser removidas ou associadas a usuarios reais antes de tornar essa coluna obrigatoria.

## Variaveis de ambiente

Crie `.env.local` com:

```bash
NEXT_PUBLIC_SUPABASE_URL=URL_DO_PROJETO
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=CHAVE_PUBLICAVEL
```

Em producao, configure as mesmas variaveis no painel da Vercel.

## Desenvolvimento

```bash
npm run dev
npm run typecheck
```
