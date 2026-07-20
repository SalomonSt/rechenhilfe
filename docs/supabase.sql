-- Donauvista: Supabase setup for Admin Login + Product Management

create extension if not exists pgcrypto;

create table if not exists public.products (
  id text primary key,
  name text not null,
  price_cents integer not null check (price_cents >= 0),
  category text not null check (category in ('essen','alkoholfrei','bier-spritzer','longdrinks')),
  image_path text not null default '/products/cup.svg',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null default '',
  username text,
  is_active boolean not null default false,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.user_profiles add column if not exists email text not null default '';
alter table public.user_profiles add column if not exists username text;

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.user_profiles (user_id, email, username, is_active, is_admin)
  values (
    new.id,
    coalesce(new.email, ''),
    lower(coalesce(new.raw_user_meta_data ->> 'username', split_part(coalesce(new.email, ''), '@', 1))),
    false,
    false
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

update public.user_profiles p
set
  email = coalesce(u.email, p.email),
  username = lower(coalesce(p.username, u.raw_user_meta_data ->> 'username', split_part(coalesce(u.email, ''), '@', 1)))
from auth.users u
where u.id = p.user_id;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute procedure public.handle_new_user_profile();

create or replace function public.update_products_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute procedure public.update_products_updated_at();

alter table public.products enable row level security;
alter table public.user_profiles enable row level security;

drop policy if exists products_read_all on public.products;
create policy products_read_all
on public.products
for select
using (true);

drop policy if exists products_admin_write on public.products;
create policy products_admin_write
on public.products
for all
using (
  exists (
    select 1
    from public.user_profiles p
    where p.user_id = auth.uid()
      and p.is_active = true
      and p.is_admin = true
  )
)
with check (
  exists (
    select 1
    from public.user_profiles p
    where p.user_id = auth.uid()
      and p.is_active = true
      and p.is_admin = true
  )
);

drop policy if exists profile_read_own on public.user_profiles;
create policy profile_read_own
on public.user_profiles
for select
using (auth.uid() = user_id);

drop policy if exists profile_read_root_admin on public.user_profiles;
create policy profile_read_root_admin
on public.user_profiles
for select
using (
  exists (
    select 1
    from public.user_profiles p
    where p.user_id = auth.uid()
      and p.is_active = true
      and p.is_admin = true
      and (
        lower(coalesce(p.username, '')) = 'salislp'
        or split_part(lower(coalesce(p.email, '')), '@', 1) = 'salislp'
      )
  )
);

drop policy if exists profile_update_root_admin on public.user_profiles;
create policy profile_update_root_admin
on public.user_profiles
for update
using (
  exists (
    select 1
    from public.user_profiles p
    where p.user_id = auth.uid()
      and p.is_active = true
      and p.is_admin = true
      and (
        lower(coalesce(p.username, '')) = 'salislp'
        or split_part(lower(coalesce(p.email, '')), '@', 1) = 'salislp'
      )
  )
)
with check (
  exists (
    select 1
    from public.user_profiles p
    where p.user_id = auth.uid()
      and p.is_active = true
      and p.is_admin = true
      and (
        lower(coalesce(p.username, '')) = 'salislp'
        or split_part(lower(coalesce(p.email, '')), '@', 1) = 'salislp'
      )
  )
);

-- Optional initial products (upsert)
insert into public.products (id, name, price_cents, category, image_path)
values
  ('cola', 'Cola', 400, 'alkoholfrei', '/products/cup.svg'),
  ('almdudler', 'Almdudler', 400, 'alkoholfrei', '/products/cup.svg'),
  ('frucade', 'Frucade', 400, 'alkoholfrei', '/products/cup.svg'),
  ('eistee', 'Eistee', 400, 'alkoholfrei', '/products/cup.svg'),
  ('bier-05', 'Bier 0,5 l', 550, 'bier-spritzer', '/products/beer.svg'),
  ('bier-03', 'Bier 0,3 l', 400, 'bier-spritzer', '/products/beer.svg'),
  ('spritzer', 'Spritzer', 350, 'bier-spritzer', '/products/glass-full.svg'),
  ('grosser-spritzer', 'Grosser Spritzer', 700, 'bier-spritzer', '/products/glass-full.svg'),
  ('kaesekrainer', 'Kaesekrainer', 600, 'essen', '/products/sausage.svg'),
  ('kaesekrainer-hotdog', 'Kaesekrainer Hotdog', 650, 'essen', '/products/burger.svg'),
  ('frankfurter', 'Frankfurter', 500, 'essen', '/products/meat.svg'),
  ('gfb', 'GFB', 850, 'essen', '/products/sausage.svg'),
  ('bfb', 'BFB', 700, 'essen', '/products/sausage.svg'),
  ('cuba-libre', 'Cuba Libre', 900, 'longdrinks', '/products/glass-cocktail.svg')
on conflict (id) do update
set
  name = excluded.name,
  price_cents = excluded.price_cents,
  category = excluded.category,
  image_path = excluded.image_path;
