create table if not exists public.shop_settings (
  id integer primary key,
  ordering_open boolean not null default true,
  product_prices jsonb not null default '{}'::jsonb,
  sold_out_ids jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.orders (
  id text primary key,
  display_code bigint not null unique,
  created_at timestamptz not null default timezone('utc', now()),
  day_key text not null,
  status text not null default 'pending',
  eta_minutes integer null,
  eta_range text null,
  eta_note text null,
  accepted_at timestamptz null,
  completed_at timestamptz null,
  order_type text not null,
  customer jsonb not null default '{}'::jsonb,
  items jsonb not null default '[]'::jsonb,
  subtotal numeric(10,2) not null default 0,
  coupon_discount numeric(10,2) not null default 0,
  delivery_cost numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  coupon jsonb null
);

alter table public.shop_settings enable row level security;
alter table public.orders enable row level security;

revoke all on public.shop_settings from anon, authenticated;
revoke all on public.orders from anon, authenticated;

insert into public.shop_settings (id, ordering_open, product_prices, sold_out_ids)
values (1, true, '{}'::jsonb, '{}'::jsonb)
on conflict (id) do nothing;

create or replace function public.get_shop_settings()
returns table (
  ordering_open boolean,
  product_prices jsonb,
  sold_out_ids jsonb
)
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.shop_settings (id, ordering_open, product_prices, sold_out_ids)
  values (1, true, '{}'::jsonb, '{}'::jsonb)
  on conflict (id) do nothing;

  return query
  select s.ordering_open, s.product_prices, s.sold_out_ids
  from public.shop_settings s
  where s.id = 1;
end;
$$;

create or replace function public.save_shop_settings(
  p_ordering_open boolean,
  p_product_prices jsonb,
  p_sold_out_ids jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.shop_settings (id, ordering_open, product_prices, sold_out_ids, updated_at)
  values (
    1,
    coalesce(p_ordering_open, true),
    coalesce(p_product_prices, '{}'::jsonb),
    coalesce(p_sold_out_ids, '{}'::jsonb),
    timezone('utc', now())
  )
  on conflict (id) do update
    set ordering_open = excluded.ordering_open,
        product_prices = excluded.product_prices,
        sold_out_ids = excluded.sold_out_ids,
        updated_at = excluded.updated_at;
end;
$$;

create or replace function public.get_orders()
returns jsonb
language sql
security definer
set search_path = public
as $$
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', o.id,
        'displayCode', o.display_code,
        'createdAt', o.created_at,
        'dayKey', o.day_key,
        'status', o.status,
        'etaMinutes', o.eta_minutes,
        'etaRange', o.eta_range,
        'etaNote', o.eta_note,
        'acceptedAt', o.accepted_at,
        'completedAt', o.completed_at,
        'orderType', o.order_type,
        'customer', o.customer,
        'items', o.items,
        'subtotal', o.subtotal,
        'couponDiscount', o.coupon_discount,
        'deliveryCost', o.delivery_cost,
        'total', o.total,
        'coupon', o.coupon
      )
      order by o.created_at desc
    ),
    '[]'::jsonb
  )
  from public.orders o;
$$;

create or replace function public.create_order(p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_display_code bigint;
  v_id text;
  v_created_at timestamptz := timezone('utc', now());
  v_order public.orders%rowtype;
begin
  select coalesce(max(display_code), 1000) + 1 into v_display_code from public.orders;

  v_id := coalesce(nullif(trim(p_payload->>'id'), ''), 'ORD-' || extract(epoch from v_created_at)::bigint || '-' || substr(md5(random()::text), 1, 5));

  insert into public.orders (
    id,
    display_code,
    created_at,
    day_key,
    status,
    eta_minutes,
    eta_range,
    eta_note,
    accepted_at,
    completed_at,
    order_type,
    customer,
    items,
    subtotal,
    coupon_discount,
    delivery_cost,
    total,
    coupon
  )
  values (
    v_id,
    v_display_code,
    v_created_at,
    coalesce(nullif(p_payload->>'dayKey', ''), to_char(v_created_at, 'Dy Mon DD YYYY')),
    'pending',
    null,
    null,
    null,
    null,
    null,
    coalesce(p_payload->>'orderType', 'delivery'),
    coalesce(p_payload->'customer', '{}'::jsonb),
    coalesce(p_payload->'items', '[]'::jsonb),
    coalesce((p_payload->>'subtotal')::numeric, 0),
    coalesce((p_payload->>'couponDiscount')::numeric, 0),
    coalesce((p_payload->>'deliveryCost')::numeric, 0),
    coalesce((p_payload->>'total')::numeric, 0),
    case when jsonb_typeof(p_payload->'coupon') = 'object' then p_payload->'coupon' else null end
  )
  returning * into v_order;

  return jsonb_build_object(
    'id', v_order.id,
    'displayCode', v_order.display_code,
    'createdAt', v_order.created_at,
    'dayKey', v_order.day_key,
    'status', v_order.status,
    'etaMinutes', v_order.eta_minutes,
    'etaRange', v_order.eta_range,
    'etaNote', v_order.eta_note,
    'acceptedAt', v_order.accepted_at,
    'completedAt', v_order.completed_at,
    'orderType', v_order.order_type,
    'customer', v_order.customer,
    'items', v_order.items,
    'subtotal', v_order.subtotal,
    'couponDiscount', v_order.coupon_discount,
    'deliveryCost', v_order.delivery_cost,
    'total', v_order.total,
    'coupon', v_order.coupon
  );
end;
$$;

create or replace function public.accept_order_rpc(
  p_id text,
  p_eta_minutes integer default null,
  p_eta_range text default null,
  p_eta_note text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.orders
  set status = 'accepted',
      eta_minutes = p_eta_minutes,
      eta_range = p_eta_range,
      eta_note = p_eta_note,
      accepted_at = timezone('utc', now())
  where id = p_id;
end;
$$;

create or replace function public.complete_order_rpc(p_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.orders
  set status = 'completed',
      completed_at = timezone('utc', now())
  where id = p_id;
end;
$$;

revoke all on function public.get_shop_settings() from public;
revoke all on function public.save_shop_settings(boolean, jsonb, jsonb) from public;
revoke all on function public.get_orders() from public;
revoke all on function public.create_order(jsonb) from public;
revoke all on function public.accept_order_rpc(text, integer, text, text) from public;
revoke all on function public.complete_order_rpc(text) from public;

grant execute on function public.get_shop_settings() to anon, authenticated;
grant execute on function public.save_shop_settings(boolean, jsonb, jsonb) to anon, authenticated;
grant execute on function public.get_orders() to anon, authenticated;
grant execute on function public.create_order(jsonb) to anon, authenticated;
grant execute on function public.accept_order_rpc(text, integer, text, text) to anon, authenticated;
grant execute on function public.complete_order_rpc(text) to anon, authenticated;
