# Todo App com Supabase

Aplicacao em Next.js App Router com Supabase Auth, operacoes CRUD de tarefas e dashboard de estatisticas.

## Recursos implementados

- Excluir tarefa por `id`
- Marcar tarefa como concluida com coluna `done`
- Autenticacao com email e senha
- Isolamento de tarefas por usuario autenticado
- Dashboard em `/dashboard` com totais, pendentes, concluidas e taxa de conclusao

## Configuracao do banco no Supabase

Antes de usar a nova versao, execute o SQL em `supabase/setup.sql` no editor do Supabase:

```sql
alter table public.tasks
  add column if not exists done boolean not null default false,
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.tasks enable row level security;

create policy "Users can read own tasks"
on public.tasks
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert own tasks"
on public.tasks
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own tasks"
on public.tasks
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own tasks"
on public.tasks
for delete
to authenticated
using (auth.uid() = user_id);
```

Se voce ja tem tarefas antigas sem `user_id`, elas precisarao ser removidas ou associadas a usuarios reais antes de tornar essa coluna obrigatoria.

Se a tabela `tasks` ainda nao existir, use esta versao:

```sql
create table if not exists public.tasks (
  id bigint generated always as identity primary key,
  title text not null,
  done boolean not null default false,
  user_id uuid not null references auth.users(id) on delete cascade
);
```

## Desenvolvimento

```bash
npm run dev
```
