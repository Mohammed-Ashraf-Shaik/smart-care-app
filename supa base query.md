# Supabase query

This file is the backend handoff for SmartCare. The local demo intentionally runs without a Supabase connection, so these statements are for the next integration pass.

## 1. Create the provider table

```sql
create table if not exists public.professionals (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  hospital text not null,
  password text not null,
  role text not null check (role in ('doctor', 'staff')),
  country text not null default 'India',
  state text,
  city text,
  created_at timestamptz not null default now()
);
```

> Production note: do not store plaintext passwords. Replace this demo table with Supabase Auth and keep only the provider profile and role in `professionals`.

## 2. Create the queue table

```sql
create table if not exists public.queue (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  age integer not null check (age between 0 and 120),
  gender text,
  doctor_pref text,
  area text,
  symptoms text,
  problem text,
  hospital text not null,
  country text not null default 'India',
  state text,
  city text,
  triage text not null default 'Green' check (triage in ('Green', 'Yellow', 'Red')),
  fee numeric(10,2) not null default 75,
  status text not null default 'waiting' check (status in ('waiting', 'in_progress', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
```

## 3. Add the indexes used by the app

```sql
create index if not exists queue_created_at_idx on public.queue (created_at asc);
create index if not exists queue_centre_idx on public.queue (hospital, country, state, city, status);
create index if not exists professionals_role_idx on public.professionals (role);
```

## 4. Enable realtime for queue updates

```sql
alter table public.queue replica identity full;
alter publication supabase_realtime add table public.queue;
```

If the table is already part of the publication, skip the final statement rather than running it again.

## 5. Seed the three demo accounts

These accounts match the local demo buttons. They are suitable for a development database only.

```sql
insert into public.professionals (email, hospital, password, role, country, state, city)
values
  ('hospital@smartcare.demo', 'SmartCare Community Hospital', 'demo1234', 'doctor', 'India', 'Telangana', 'Hyderabad'),
  ('admin@smartcare.demo', 'SmartCare Operations Centre', 'demo1234', 'staff', 'India', 'Telangana', 'Hyderabad')
on conflict (email) do update set
  hospital = excluded.hospital,
  role = excluded.role,
  country = excluded.country,
  state = excluded.state,
  city = excluded.city;
```

## 6. Queue queries used by `js/db.js`

```sql
-- Initial queue load
select *
from public.queue
order by created_at asc;

-- Queue for one signed-in care centre
select *
from public.queue
where hospital = :hospital
  and country = :country
  and state = :state
  and city = :city
  and status in ('waiting', 'in_progress')
order by created_at asc;

-- Complete the next visit
update public.queue
set status = 'completed', completed_at = now()
where id = :queue_id;
```

## 7. Recommended production security

Enable Row Level Security before connecting a real project. The public client should never be allowed to update every queue row or read provider passwords.

```sql
alter table public.queue enable row level security;
alter table public.professionals enable row level security;
```

Use Supabase Auth claims and a server-side function for provider role checks. Keep the local `supabaseEnabled: false` setting until the project URL, anon key, Auth flow, RLS policies, and realtime publication have all been configured.
