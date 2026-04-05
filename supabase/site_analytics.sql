create table if not exists public.site_visitors (
  visitor_id text primary key,
  first_seen_at timestamptz not null default timezone('utc', now()),
  last_seen_at timestamptz not null default timezone('utc', now()),
  last_path text not null default '/',
  user_agent text not null default ''
);

alter table public.site_visitors enable row level security;

revoke all on public.site_visitors from anon, authenticated;

create or replace function public.touch_site_visit(
  p_visitor_id text,
  p_path text default '/',
  p_user_agent text default ''
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.site_visitors (visitor_id, first_seen_at, last_seen_at, last_path, user_agent)
  values (
    p_visitor_id,
    timezone('utc', now()),
    timezone('utc', now()),
    coalesce(nullif(trim(p_path), ''), '/'),
    coalesce(p_user_agent, '')
  )
  on conflict (visitor_id) do update
    set last_seen_at = timezone('utc', now()),
        last_path = excluded.last_path,
        user_agent = case
          when coalesce(excluded.user_agent, '') <> '' then excluded.user_agent
          else public.site_visitors.user_agent
        end;
end;
$$;

revoke all on function public.touch_site_visit(text, text, text) from public;
grant execute on function public.touch_site_visit(text, text, text) to anon, authenticated;

create or replace function public.get_site_stats()
returns table (
  online_now bigint,
  total_visitors bigint
)
language sql
security definer
set search_path = public
as $$
  select
    count(*) filter (where last_seen_at > timezone('utc', now()) - interval '90 seconds') as online_now,
    count(*) as total_visitors
  from public.site_visitors;
$$;

revoke all on function public.get_site_stats() from public;
grant execute on function public.get_site_stats() to anon, authenticated;
