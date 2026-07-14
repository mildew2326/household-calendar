-- Duet household calendar schema (Supabase Postgres)
-- Apply via Supabase SQL editor or CLI

create extension if not exists "pgcrypto";

-- Enums as text checks for simplicity
create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Our Home',
  timezone text not null default 'America/New_York',
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  color text not null default '#0e7c66',
  created_at timestamptz not null default now()
);

create table if not exists public.household_members (
  household_id uuid not null references public.households (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null check (role in ('owner', 'adult')),
  joined_at timestamptz not null default now(),
  primary key (household_id, user_id),
  unique (user_id) -- v1: one household per user
);

create table if not exists public.invites (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  email text not null,
  token text not null unique default encode(gen_random_bytes(16), 'hex'),
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  title text not null,
  description text,
  location text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  all_day boolean not null default false,
  timezone text not null default 'America/New_York',
  created_by uuid not null references public.profiles (id),
  visibility text not null default 'shared' check (visibility in ('shared', 'private')),
  status text not null default 'confirmed' check (status in ('confirmed', 'tentative', 'cancelled')),
  category text,
  color_override text,
  recurrence_rule text,
  recurrence_parent_id uuid references public.events (id) on delete set null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table if not exists public.event_assignees (
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  primary key (event_id, user_id)
);

create table if not exists public.event_reminders (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  offset_minutes int not null,
  channel text not null default 'email'
);

create table if not exists public.event_activity (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  actor_id uuid references public.profiles (id),
  action text not null,
  payload jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  title text not null,
  notes text,
  assignee_id uuid references public.profiles (id),
  due_at timestamptz,
  completed_at timestamptz,
  priority text not null default 'none' check (priority in ('none', 'low', 'med', 'high')),
  created_by uuid not null references public.profiles (id),
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shopping_lists (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  name text not null default 'Groceries',
  created_at timestamptz not null default now()
);

create table if not exists public.shopping_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.shopping_lists (id) on delete cascade,
  name text not null,
  quantity text,
  category text,
  is_checked boolean not null default false,
  sort_order int not null default 0,
  added_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.meal_plans (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  week_start date not null,
  unique (household_id, week_start)
);

create table if not exists public.meals (
  id uuid primary key default gen_random_uuid(),
  meal_plan_id uuid not null references public.meal_plans (id) on delete cascade,
  day date not null,
  slot text not null default 'dinner',
  title text not null default '',
  notes text,
  recipe_url text,
  ingredients text,
  event_id uuid references public.events (id) on delete set null
);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists events_updated_at on public.events;
create trigger events_updated_at before update on public.events
for each row execute function public.set_updated_at();

drop trigger if exists todos_updated_at on public.todos;
create trigger todos_updated_at before update on public.todos
for each row execute function public.set_updated_at();

-- Helper: current user's household
create or replace function public.my_household_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select household_id from public.household_members where user_id = auth.uid() limit 1;
$$;

alter table public.households enable row level security;
alter table public.profiles enable row level security;
alter table public.household_members enable row level security;
alter table public.invites enable row level security;
alter table public.events enable row level security;
alter table public.event_assignees enable row level security;
alter table public.event_reminders enable row level security;
alter table public.event_activity enable row level security;
alter table public.todos enable row level security;
alter table public.shopping_lists enable row level security;
alter table public.shopping_items enable row level security;
alter table public.meal_plans enable row level security;
alter table public.meals enable row level security;

-- Profiles: users can read household co-members and self
create policy profiles_select on public.profiles for select using (
  id = auth.uid()
  or id in (
    select m2.user_id from public.household_members m1
    join public.household_members m2 on m1.household_id = m2.household_id
    where m1.user_id = auth.uid()
  )
);
create policy profiles_update_self on public.profiles for update using (id = auth.uid());
create policy profiles_insert_self on public.profiles for insert with check (id = auth.uid());

create policy households_member_select on public.households for select using (id = public.my_household_id());
create policy households_insert on public.households for insert with check (true);

create policy members_select on public.household_members for select using (household_id = public.my_household_id());
create policy members_insert on public.household_members for insert with check (
  user_id = auth.uid() or household_id = public.my_household_id()
);

-- Events: members see shared; private only metadata unless creator
create policy events_select on public.events for select using (
  household_id = public.my_household_id() and deleted_at is null
);
create policy events_insert on public.events for insert with check (
  household_id = public.my_household_id() and created_by = auth.uid()
);
create policy events_update on public.events for update using (
  household_id = public.my_household_id()
);
create policy events_delete on public.events for delete using (
  household_id = public.my_household_id()
);

create policy todos_all on public.todos for all using (household_id = public.my_household_id())
  with check (household_id = public.my_household_id());

create policy shopping_lists_all on public.shopping_lists for all using (household_id = public.my_household_id())
  with check (household_id = public.my_household_id());

create policy shopping_items_all on public.shopping_items for all using (
  list_id in (select id from public.shopping_lists where household_id = public.my_household_id())
) with check (
  list_id in (select id from public.shopping_lists where household_id = public.my_household_id())
);

create policy meal_plans_all on public.meal_plans for all using (household_id = public.my_household_id())
  with check (household_id = public.my_household_id());

create policy meals_all on public.meals for all using (
  meal_plan_id in (select id from public.meal_plans where household_id = public.my_household_id())
) with check (
  meal_plan_id in (select id from public.meal_plans where household_id = public.my_household_id())
);

-- Realtime
alter publication supabase_realtime add table public.events;
alter publication supabase_realtime add table public.todos;
alter publication supabase_realtime add table public.shopping_items;
alter publication supabase_realtime add table public.meals;
