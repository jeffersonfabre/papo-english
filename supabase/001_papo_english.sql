-- Papo English (DomDevLabs) — projeto Supabase "Araleo Fragrances", dados independentes (prefixo papo_)
-- Já aplicado como migração "papo_english_init". Mantido aqui como referência.
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

create table if not exists public.papo_uso (
  user_id uuid not null references auth.users(id) on delete cascade,
  dia date not null default (now() at time zone 'America/Sao_Paulo')::date,
  chamadas int not null default 0,
  primary key (user_id, dia)
);
alter table public.papo_uso enable row level security;
create policy "papo_uso_select_proprio" on public.papo_uso for select to authenticated using ((select auth.uid()) = user_id);

create or replace function public.papo_registrar_uso(limite int default 400)
returns int language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); hoje date := (now() at time zone 'America/Sao_Paulo')::date; n int;
begin
  if uid is null then raise exception 'nao autenticado'; end if;
  insert into public.papo_uso (user_id, dia, chamadas) values (uid, hoje, 1)
  on conflict (user_id, dia) do update set chamadas = public.papo_uso.chamadas + 1
  returning chamadas into n;
  if n > limite then return -1; end if;
  return n;
end; $$;
revoke all on function public.papo_registrar_uso(int) from public, anon;
grant execute on function public.papo_registrar_uso(int) to authenticated;
