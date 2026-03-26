-- Execute este script no SQL Editor do Supabase para alinhar o schema
-- esperado por esta aplicacao.

alter table public.tasks
  add column if not exists done boolean not null default false,
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.tasks enable row level security;

drop policy if exists "Users can read own tasks" on public.tasks;
create policy "Users can read own tasks"
on public.tasks
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own tasks" on public.tasks;
create policy "Users can insert own tasks"
on public.tasks
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own tasks" on public.tasks;
create policy "Users can update own tasks"
on public.tasks
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own tasks" on public.tasks;
create policy "Users can delete own tasks"
on public.tasks
for delete
to authenticated
using (auth.uid() = user_id);

notify pgrst, 'reload schema';

-- Se a tabela public.tasks ainda nao existir, crie-a com:
--
-- create table if not exists public.tasks (
--   id bigint generated always as identity primary key,
--   title text not null,
--   done boolean not null default false,
--   user_id uuid not null references auth.users(id) on delete cascade
-- );
