-- ============================================================
--  Pakinda Limited · Supabase Database Schema
--  Run this entire file in the Supabase SQL Editor
-- ============================================================

-- ─── Extensions ──────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── USERS (extends Supabase auth.users) ─────────────────────
create table if not exists public.users (
  id            uuid primary key references auth.users(id) on delete cascade,
  name          text not null,
  email         text not null unique,
  phone         text,
  id_number     text,
  license_number text,
  id_image_url  text,
  license_image_url text,
  role          text not null default 'client' check (role in ('client','admin')),
  created_at    timestamptz default now()
);
alter table public.users enable row level security;
create policy "Users can read own record" on public.users for select using (auth.uid() = id);
create policy "Users can update own record" on public.users for update using (auth.uid() = id);
create policy "Admin reads all users" on public.users for select using (
  exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
);

-- ─── FLEET CARS ───────────────────────────────────────────────
create table if not exists public.fleet_cars (
  id            uuid primary key default uuid_generate_v4(),
  slug          text not null unique,
  name          text not null,
  series        text,
  category      text check (category in ('Luxury','SUV','Sports','Executive')),
  image_url     text,
  spec_hp       text,
  spec_top      text,
  spec_zero     text,
  price_per_day integer not null,
  description   text,
  features      text[] default '{}',
  available     boolean default true,
  created_at    timestamptz default now()
);
alter table public.fleet_cars enable row level security;
create policy "Anyone can view available cars" on public.fleet_cars for select using (true);
create policy "Admin manages fleet" on public.fleet_cars for all using (
  exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
);

-- ─── SERVICE RECORDS ──────────────────────────────────────────
create table if not exists public.service_records (
  id                uuid primary key default uuid_generate_v4(),
  car_id            uuid references public.fleet_cars(id) on delete cascade,
  last_service_date date,
  next_service_date date,
  service_notes     text,
  updated_at        timestamptz default now(),
  unique(car_id)
);
alter table public.service_records enable row level security;
create policy "Admin manages service records" on public.service_records for all using (
  exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
);

-- ─── BOOKINGS ─────────────────────────────────────────────────
create table if not exists public.bookings (
  id                  uuid primary key default uuid_generate_v4(),
  car_id              uuid references public.fleet_cars(id),
  car_name            text,
  car_slug            text,
  user_id             uuid references public.users(id),
  user_name           text,
  user_email          text,
  user_phone          text,
  user_id_number      text,
  user_license_number text,
  user_id_image_url   text,
  user_license_image_url text,
  start_date          date not null,
  end_date            date not null,
  num_days            integer,
  price_per_day       integer,
  total_price         integer,
  payment_method      text check (payment_method in ('mpesa','bank_transfer','card')),
  payment_ref         text,
  status              text default 'pending' check (status in ('pending','active','completed','cancelled')),
  pickup_location     text,
  returned_at         timestamptz,
  return_condition    text,
  return_notes        text,
  admin_notes         text,
  created_at          timestamptz default now()
);
alter table public.bookings enable row level security;
create policy "Users see own bookings" on public.bookings for select using (user_id = auth.uid());
create policy "Users create bookings" on public.bookings for insert with check (user_id = auth.uid());
create policy "Admin sees all bookings" on public.bookings for all using (
  exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
);

-- ─── MARKET LISTINGS (consignment / for-sale cars) ───────────
create table if not exists public.market_listings (
  id            uuid primary key default uuid_generate_v4(),
  seller_id     uuid references public.users(id),
  seller_name   text,
  seller_email  text,
  seller_phone  text,
  make          text,
  model         text,
  year          text,
  mileage       text,
  asking_price  integer,
  description   text,
  image_urls    text[] default '{}',
  status        text default 'pending' check (status in ('pending','approved','rejected','sold')),
  admin_notes   text,
  created_at    timestamptz default now()
);
alter table public.market_listings enable row level security;
create policy "Anyone views approved listings" on public.market_listings for select using (status = 'approved');
create policy "Seller views own listings" on public.market_listings for select using (seller_id = auth.uid());
create policy "Authenticated users create listings" on public.market_listings for insert with check (auth.uid() is not null);
create policy "Admin manages all listings" on public.market_listings for all using (
  exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
);

-- ─── NOTIFICATIONS ────────────────────────────────────────────
create table if not exists public.notifications (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references public.users(id) on delete cascade,
  type       text check (type in ('booking','document','approval','return','system')),
  title      text,
  message    text,
  read       boolean default false,
  created_at timestamptz default now()
);
alter table public.notifications enable row level security;
create policy "Users see own notifications" on public.notifications for select using (user_id = auth.uid());
create policy "Users update own notifications" on public.notifications for update using (user_id = auth.uid());
create policy "System inserts notifications" on public.notifications for insert with check (true);
create policy "Admin sees all notifications" on public.notifications for select using (
  exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
);

-- ─── Enable Realtime for notifications ────────────────────────
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.bookings;

-- ─── STORAGE BUCKETS ──────────────────────────────────────────
-- Run these in Supabase Dashboard → Storage, or via SQL:
insert into storage.buckets (id, name, public) values
  ('documents', 'documents', false),      -- ID cards & licenses (private)
  ('car-images', 'car-images', true),     -- Fleet & market car photos (public)
  ('market-photos', 'market-photos', true) -- Consignment photos (public)
on conflict do nothing;

-- Storage policies
create policy "Owners upload own documents" on storage.objects for insert with check (
  bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "Owners read own documents" on storage.objects for select using (
  bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "Admin reads all documents" on storage.objects for select using (
  bucket_id = 'documents' and
  exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
);
create policy "Public reads car images" on storage.objects for select using (
  bucket_id in ('car-images','market-photos')
);
create policy "Admin uploads car images" on storage.objects for insert with check (
  bucket_id = 'car-images' and
  exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
);
create policy "Authenticated upload market photos" on storage.objects for insert with check (
  bucket_id = 'market-photos' and auth.uid() is not null
);

-- ─── FUNCTIONS & TRIGGERS ─────────────────────────────────────

-- Auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
    coalesce(new.raw_user_meta_data->>'role', 'client')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto mark car unavailable when service date arrives
create or replace function public.check_service_dates()
returns void language plpgsql as $$
begin
  update public.fleet_cars fc
  set available = false
  from public.service_records sr
  where sr.car_id = fc.id
    and sr.next_service_date <= current_date
    and fc.available = true;
end;
$$;

-- ─── SEED ADMIN USER ──────────────────────────────────────────
-- After running this schema, create the admin via Supabase Auth dashboard:
-- Email: admin@driveharambee.co.ke  Password: admin123
-- Then run:
-- UPDATE public.users SET role = 'admin' WHERE email = 'admin@driveharambee.co.ke';
