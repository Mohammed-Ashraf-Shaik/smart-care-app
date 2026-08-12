# SmartCare master Supabase query

This document is the backend handoff for the current SmartCare app. The public GitHub Pages demo keeps Supabase disabled and uses the local adapter in `js/db.js`. Run the SQL only after creating a Supabase project and reviewing the security section.

## 0. Extensions

```sql
create extension if not exists pgcrypto;
```

## 1. Provider profiles

The current adapter reads provider profiles by email, role, and care-centre location. The `password` column exists only for compatibility with the demo adapter; do not use it for production authentication.

```sql
create table if not exists public.professionals (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  hospital text not null,
  password text,
  role text not null check (role in ('doctor', 'staff')),
  country text not null default 'India',
  state text,
  city text,
  created_at timestamptz not null default now()
);

create index if not exists professionals_role_idx
  on public.professionals (role);
```

## 2. Patient queue

This matches the fields written by `DB.addPatient` and read by the doctor, queue, admin, and analytics views.

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
  triage text not null default 'Green'
    check (triage in ('Green', 'Yellow', 'Red')),
  fee numeric(10,2) not null default 125,
  status text not null default 'waiting'
    check (status in ('waiting', 'in_progress', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists queue_created_at_idx
  on public.queue (created_at asc);

create index if not exists queue_centre_status_idx
  on public.queue (hospital, country, state, city, status, created_at asc);
```

## 3. Demo provider records

Use these only in a development project. The public demo itself uses the same values in the local adapter and does not require these rows.

```sql
insert into public.professionals
  (email, hospital, password, role, country, state, city)
values
  ('hospital@smartcare.demo', 'SmartCare Community Hospital', 'demo1234', 'doctor', 'India', 'Telangana', 'Hyderabad'),
  ('admin@smartcare.demo', 'SmartCare Operations Centre', 'demo1234', 'staff', 'India', 'Telangana', 'Hyderabad')
on conflict (email) do update set
  hospital = excluded.hospital,
  password = excluded.password,
  role = excluded.role,
  country = excluded.country,
  state = excluded.state,
  city = excluded.city;
```

## 4. Queries used by the current adapter

```sql
-- Initial queue load
select *
from public.queue
order by created_at asc;

-- Queue for one care centre
select *
from public.queue
where hospital = :hospital
  and country = :country
  and state = :state
  and city = :city
  and status in ('waiting', 'in_progress')
order by created_at asc;

-- Insert a patient visit
insert into public.queue
  (name, age, gender, doctor_pref, area, symptoms, problem,
   hospital, country, state, city, triage, fee)
values
  (:name, :age, :gender, :doctor_pref, :area, :symptoms, :problem,
   :hospital, :country, :state, :city, :triage, :fee)
returning id;

-- Complete a visit
update public.queue
set status = 'completed', completed_at = now()
where id = :queue_id;

-- Cancel a visit without deleting the audit record
update public.queue
set status = 'cancelled'
where id = :queue_id;
```

## 5. Realtime queue updates

Run once in the Supabase SQL editor after confirming the table is not already in the publication:

```sql
alter table public.queue replica identity full;
alter publication supabase_realtime add table public.queue;
```

The browser adapter subscribes to `public.queue` changes and refetches the ordered queue after an event. If the table is already in `supabase_realtime`, skip the publication statement.

## 6. Production security migration

Do not expose provider passwords through a public table. The production path is:

1. Create Supabase Auth users for providers.
2. Store only the provider profile and role in `professionals`.
3. Link `professionals.id` or an `auth.users.id` to the authenticated user.
4. Move credential checks, role checks, queue mutations, and password recovery behind Auth and server-side policies.
5. Enable RLS only after the policies have been tested with authenticated users.

Baseline table hardening:

```sql
alter table public.queue enable row level security;
alter table public.professionals enable row level security;
```

Do not add an unrestricted `anon` policy. A provider should only read and mutate the queue for the assigned centre, while patients should only be able to create or read their own visits through an authenticated/server-side flow. The exact policy should be added with the final Auth identity model.

## 7. App configuration

Keep this disabled until the Supabase URL, anon key, Auth flow, RLS policies, and realtime publication are ready:

```js
window.App.Config = {
  environment: 'demo',
  supabaseEnabled: false,
  supabaseUrl: '',
  supabaseAnonKey: ''
};
```

Never commit service-role keys, passwords, or a production `.env` file. For GitHub Pages, public client configuration is visible to users, so sensitive operations must run on a trusted backend.
