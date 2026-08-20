-- FlatSplit Supabase Schema & Realtime Setup for 4-Person Flat
-- Members: Adi Bhaiya, SSR, Harsh, Manoj

create extension if not exists "uuid-ossp";

-- Table: Flat
create table if not exists public.flats (
  id text primary key default 'flat-402',
  name text not null default 'Flat #402',
  address text default 'Apartment 402',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: Flat Members (Roommates)
create table if not exists public.roommates (
  id text primary key,
  name text not null,
  short_name text not null,
  room text not null,
  avatar text,
  color text not null,
  email text,
  auth_user_id uuid references auth.users(id) on delete set null
);

-- Insert the 4 canonical roommates
insert into public.roommates (id, name, short_name, room, avatar, color, email)
values
  ('adi', 'Adi Bhaiya', 'Adi', 'Room 101', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 'indigo', 'adi@flatmates.local'),
  ('ssr', 'SSR', 'SSR', 'Room 102', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 'emerald', 'ssr@flatmates.local'),
  ('harsh', 'Harsh', 'Harsh', 'Room 103', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', 'amber', 'harsh@flatmates.local'),
  ('manoj', 'Manoj', 'Manoj', 'Room 104', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80', 'rose', 'manoj@flatmates.local')
on conflict (id) do update set
  name = excluded.name,
  short_name = excluded.short_name,
  room = excluded.room,
  avatar = excluded.avatar,
  color = excluded.color,
  email = excluded.email;

-- Table: Expenses
create table if not exists public.expenses (
  id uuid primary key default uuid_generate_v4(),
  description text not null,
  amount numeric(12, 2) not null check (amount > 0),
  category text not null,
  paid_by text not null references public.roommates(id),
  date date not null default current_date,
  split_type text not null default 'equal' check (split_type in ('equal', 'selective', 'custom')),
  split_among text[] not null default array['adi', 'ssr', 'harsh', 'manoj'],
  custom_amounts jsonb,
  notes text,
  receipt_url text,
  is_utility boolean default false,
  electricity_meta jsonb,
  gas_meta jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  deleted_at timestamp with time zone
);

-- Table: Expense Splits (Relational audit breakdown)
create table if not exists public.expense_splits (
  id uuid primary key default uuid_generate_v4(),
  expense_id uuid not null references public.expenses(id) on delete cascade,
  roommate_id text not null references public.roommates(id),
  share_amount numeric(12, 2) not null check (share_amount >= 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (expense_id, roommate_id)
);

-- Table: Settlements
create table if not exists public.settlements (
  id uuid primary key default uuid_generate_v4(),
  from_id text not null references public.roommates(id),
  to_id text not null references public.roommates(id),
  amount numeric(12, 2) not null check (amount > 0),
  date date not null default current_date,
  status text not null default 'completed' check (status in ('completed', 'pending', 'cancelled')),
  note text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  check (from_id <> to_id)
);

-- Indexes for lightning fast queries & realtime performance
create index if not exists idx_expenses_date on public.expenses(date desc);
create index if not exists idx_expenses_paid_by on public.expenses(paid_by);
create index if not exists idx_expenses_category on public.expenses(category);
create index if not exists idx_expense_splits_exp on public.expense_splits(expense_id);
create index if not exists idx_settlements_date on public.settlements(date desc);
create index if not exists idx_settlements_parties on public.settlements(from_id, to_id);

-- Enable Row Level Security (RLS)
alter table public.flats enable row level security;
alter table public.roommates enable row level security;
alter table public.expenses enable row level security;
alter table public.expense_splits enable row level security;
alter table public.settlements enable row level security;

-- Policies for Authenticated & Flat Members
create policy "Allow read for roommates" on public.roommates for select using (true);
create policy "Allow read for flats" on public.flats for select using (true);

create policy "Allow read expenses" on public.expenses for select using (deleted_at is null);
create policy "Allow insert expenses" on public.expenses for insert with check (true);
create policy "Allow update expenses" on public.expenses for update using (true);
create policy "Allow delete expenses" on public.expenses for delete using (true);

create policy "Allow read splits" on public.expense_splits for select using (true);
create policy "Allow insert splits" on public.expense_splits for insert with check (true);
create policy "Allow update splits" on public.expense_splits for update using (true);

create policy "Allow read settlements" on public.settlements for select using (true);
create policy "Allow insert settlements" on public.settlements for insert with check (true);
create policy "Allow update settlements" on public.settlements for update using (true);
create policy "Allow delete settlements" on public.settlements for delete using (true);

-- Enable Supabase Realtime
alter publication supabase_realtime add table public.expenses;
alter publication supabase_realtime add table public.settlements;
