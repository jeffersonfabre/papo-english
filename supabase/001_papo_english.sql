-- Papo English (DomDevLabs) — projeto Supabase "Araleo Fragrances", dados independentes (prefixo papo_)
create table if not exists public.papo_estado (
  user_id uuid primary key references auth.users(id) on delete cascade,
  dados jsonb not null default '{}'::jsonb,
  atualizado_em timestamptz not null default now()
);
alter table public.papo_estado enable row level security;
create policy "papo_estado_select_proprio" on public.papo_estado for select to authenticated using ((select auth.uid()) = user_id);
create policy "papo_estado_insert_proprio" on public.papo_estado for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "papo_estado_update_proprio" on public.papo_estado for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "papo_estado_delete_proprio" on public.papo_estado for delete to authenticated using ((select auth.uid()) = user_id);
