# SmartCare master Supabase handoff

The public demo currently runs with `supabaseEnabled: false` and the local adapter in `js/db.js`. Keep that demo fallback working while wiring a real Supabase project.

## 1. Auth and profiles

Use Supabase Auth for passwords and sessions. Do not store password columns in application tables.

```sql
create extension if not exists pgcrypto;

create table if not exists public.professionals (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  hospital text not null,
  role text not null check (role in ('doctor', 'staff')),
  country text not null default 'India',
  state text,
  city text,
  created_at timestamptz not null default now()
);

create index if not exists professionals_role_idx on public.professionals(role);
```

The client signs in with `supabase.auth.signInWithPassword`, then reads the profile row. Password reset uses `resetPasswordForEmail`; no password hint or plaintext password flow should be reintroduced.

## 2. Queue and appointments

```sql
create table if not exists public.queue (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  age integer not null check (age between 0 and 120),
  gender text,
  doctor_pref text,
  area text,
  symptoms text not null check (char_length(symptoms) between 1 and 500),
  problem text,
  hospital text not null,
  country text not null default 'India',
  state text,
  city text,
  triage text not null default 'Green' check (triage in ('Green', 'Yellow', 'Red')),
  fee numeric(10,2) not null default 125 check (fee >= 0),
  status text not null default 'waiting' check (status in ('waiting', 'called', 'in_progress', 'completed', 'cancelled', 'no-show')),
  patient_auth_id uuid references auth.users(id) on delete set null,
  assigned_professional_id uuid references public.professionals(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists queue_created_at_idx on public.queue(created_at);
create index if not exists queue_hospital_status_idx on public.queue(hospital, status);
create index if not exists queue_triage_idx on public.queue(triage);
```

The current adapter reads the queue in arrival order, inserts a visit, updates status, and removes legacy demo records. The preferred production path is status updates rather than deletion so history remains auditable.

## 3. Row Level Security

Enable RLS before exposing the project:

```sql
alter table public.professionals enable row level security;
alter table public.queue enable row level security;

create policy "providers read own profile"
on public.professionals for select to authenticated
using (id = auth.uid());

create policy "providers read their centre queue"
on public.queue for select to authenticated
using (exists (
  select 1 from public.professionals p
  where p.id = auth.uid() and (p.role = 'staff' or p.hospital = queue.hospital)
));

create policy "patients read their own visits"
on public.queue for select to authenticated
using (patient_auth_id = auth.uid());
```

For inserts and status changes, prefer authenticated RPC functions or an API route that validates role and hospital ownership. Do not grant unrestricted anonymous insert/update/delete access. Never expose the Supabase service-role key in static frontend code.

## 3a. Donation support

Blood-centre lookup is public discovery data; donation interest is personal intent data. Keep the two tables separate and do not store medical eligibility decisions in either table.

```sql
create table if not exists public.blood_donation_centres (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  area text not null,
  city text not null,
  hours text,
  note text,
  supported_groups text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists blood_centres_city_idx on public.blood_donation_centres(city);
create index if not exists blood_centres_groups_idx on public.blood_donation_centres using gin(supported_groups);

create table if not exists public.donation_interests (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('organ', 'blood')),
  name text not null check (char_length(name) between 2 and 120),
  city text not null check (char_length(city) between 2 and 120),
  preference text,
  auth_user_id uuid references auth.users(id) on delete set null,
  status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  created_at timestamptz not null default now()
);

alter table public.blood_donation_centres enable row level security;
alter table public.donation_interests enable row level security;

create policy "anyone can read active blood centres"
on public.blood_donation_centres for select
to anon, authenticated
using (is_active = true);

-- Prefer an Edge Function/RPC for this insert in production. If direct inserts
-- are temporarily enabled for the demo, validate fields and rate-limit it.
create policy "authenticated users can create their donation interest"
on public.donation_interests for insert
to authenticated
with check (auth_user_id = auth.uid());

create policy "users can read their own donation interest"
on public.donation_interests for select
to authenticated
using (auth_user_id = auth.uid());
```

The static demo currently submits a non-binding organ interest without a real account. Keep that behavior only while Supabase is disabled. When enabling Supabase, route the form through an Edge Function or require a patient Auth session, attach `auth_user_id`, and never expose an unrestricted anonymous insert policy. Blood-group filtering in the client maps to `contains(supported_groups, [selected_group])`.

## 4. Realtime

After RLS is correct, add `public.queue` to the realtime publication and keep the existing `listenToQueue` subscription. Realtime should refresh the current filtered queue, not bypass authorization.

## 5. App configuration

```js
window.App.Config = {
  environment: 'production',
  supabaseEnabled: true,
  supabaseUrl: 'https://YOUR_PROJECT.supabase.co',
  supabaseAnonKey: 'YOUR_PUBLISHABLE_ANON_KEY'
};
```

Use deployment secrets or a generated environment-specific config. Do not commit real project credentials. For GitHub Pages, use the public anon key only after RLS is verified; GitHub Pages cannot safely host server-only secrets.

## 6. Production checklist

- Configure Auth email templates and redirect URLs for `/smart-care-app/login`.
- Configure Auth email templates and redirect URLs for `/smart-care-app/login`; the client uses `getSession`, `onAuthStateChange`, `signInWithPassword`, `resetPasswordForEmail`, and `updateUser`.
- Add an `updated_at` trigger for queue rows.
- Add audit events for call, start, complete, cancel, and no-show.
- Seed and protect active blood donation centres; connect organ interest to the country’s official registry workflow rather than treating SmartCare as legal consent.
- Add rate limits and server-side validation around public geocoding and queue mutations.
- Test role separation with patient, doctor, and admin accounts.
- Keep the local demo adapter and all demo credentials available for review builds only.
