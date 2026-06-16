-- =====================================================================
-- Finance App — Supabase schema (dung Supabase client nhu ORM)
-- Kien truc:
--   - Supabase Auth (email + Google) -> auth.users
--   - Express forward JWT user -> Supabase client (PostgREST) -> RLS loc theo auth.uid()
--   - KHONG RPC, KHONG transaction. Balance tinh DONG bang view de tranh lech so.
-- Tien: bigint VND.
-- =====================================================================

create extension if not exists pgcrypto;

-- ============ ENUMS ============
do $$ begin
  create type wallet_type   as enum ('payment','tracking');
exception when duplicate_object then null; end $$;

do $$ begin
  create type txn_direction as enum ('in','out');
exception when duplicate_object then null; end $$;

-- ============ PROFILES ============
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

-- ============ WALLETS (KHONG con cot balance) ============
create table if not exists wallets (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  type        wallet_type not null default 'payment',
  opening_balance bigint not null default 0,   -- so du ban dau; balance hien tai tinh qua view
  is_default  boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ============ SPENDING_GROUPS ============
create table if not exists spending_groups (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

-- ============ CATEGORIES ============
create table if not exists categories (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  spending_group_id uuid references spending_groups(id) on delete set null,
  name              text not null,
  icon              text,
  color             text default '#4CAF50',
  created_at        timestamptz not null default now()
);

-- ============ BUDGETS ============
create table if not exists budgets (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  month         smallint not null check (month between 1 and 12),
  year          smallint not null,
  total_income  bigint not null default 0,
  created_at    timestamptz not null default now(),
  unique (user_id, month, year)
);

-- ============ BUDGET_ALLOCATIONS (bo cot spent -> tinh dong) ============
create table if not exists budget_allocations (
  id           uuid primary key default gen_random_uuid(),
  budget_id    uuid not null references budgets(id) on delete cascade,
  category_id  uuid not null references categories(id) on delete cascade,
  allocated    bigint not null default 0,
  unique (budget_id, category_id)
);

-- ============ EMOTIONS (bang tra cuu chung) ============
create table if not exists emotions (
  id        smallint primary key,
  label     text not null,
  emoji_key text not null
);
insert into emotions (id, label, emoji_key) values
  (1,'Very Happy','emotion_happiest'),
  (2,'Satisfied','emotion_happy'),
  (3,'Neutral','emotion_neutral'),
  (4,'Regretful','emotion_sad'),
  (5,'Very Sad','emotion_saddest')
on conflict (id) do nothing;

-- ============ WALLET_TRANSFERS ============
create table if not exists wallet_transfers (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  from_wallet_id  uuid not null references wallets(id) on delete cascade,
  to_wallet_id    uuid not null references wallets(id) on delete cascade,
  amount          bigint not null check (amount > 0),
  note            text,
  transfer_date   date not null,
  created_at      timestamptz not null default now(),
  check (from_wallet_id <> to_wallet_id)
);

-- ============ EXPENSES ============
create table if not exists expenses (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  wallet_id    uuid not null references wallets(id) on delete cascade,
  category_id  uuid references categories(id) on delete set null,
  budget_id    uuid references budgets(id) on delete set null,
  emotion_id   smallint references emotions(id) on delete set null,
  direction    txn_direction not null default 'out',
  amount       bigint not null check (amount > 0),
  note         text,
  expense_date date not null,
  created_at   timestamptz not null default now()
);

-- ============ INDEXES ============
create index if not exists idx_wallets_user        on wallets(user_id);
create index if not exists idx_groups_user         on spending_groups(user_id);
create index if not exists idx_categories_user     on categories(user_id);
create index if not exists idx_budgets_user_period on budgets(user_id, year, month);
create index if not exists idx_alloc_budget        on budget_allocations(budget_id);
create index if not exists idx_transfers_user      on wallet_transfers(user_id);
create index if not exists idx_expenses_user_date  on expenses(user_id, expense_date desc);
create index if not exists idx_expenses_wallet     on expenses(wallet_id);
create index if not exists idx_expenses_category   on expenses(category_id);

-- =====================================================================
-- VIEW: so du vi tinh dong (opening + tien vao - tien ra +/- transfer)
-- Doc qua: supabase.from('wallet_balances').select()
-- =====================================================================
create or replace view wallet_balances as
select
  w.id   as wallet_id,
  w.user_id,
  w.name,
  w.type,
  w.opening_balance
    + coalesce((select sum(amount) from expenses e
                where e.wallet_id = w.id and e.direction = 'in'), 0)
    - coalesce((select sum(amount) from expenses e
                where e.wallet_id = w.id and e.direction = 'out'), 0)
    + coalesce((select sum(amount) from wallet_transfers t
                where t.to_wallet_id = w.id), 0)
    - coalesce((select sum(amount) from wallet_transfers t
                where t.from_wallet_id = w.id), 0)
  as balance
from wallets w;

-- =====================================================================
-- TRIGGER: seed profile khi co user moi (email hoac Google)
-- =====================================================================
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function handle_new_user();

-- =====================================================================
-- ROW LEVEL SECURITY (BAT BUOC vi dung PostgREST + forward JWT)
-- =====================================================================
alter table profiles           enable row level security;
alter table wallets            enable row level security;
alter table spending_groups    enable row level security;
alter table categories         enable row level security;
alter table budgets            enable row level security;
alter table budget_allocations enable row level security;
alter table wallet_transfers   enable row level security;
alter table expenses           enable row level security;
-- emotions: bang tra cuu chung, cho phep doc, khong cho ghi
alter table emotions           enable row level security;

create policy own_profile on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy own_wallets on wallets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy own_groups on spending_groups
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy own_categories on categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy own_budgets on budgets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- budget_allocations khong co user_id truc tiep -> kiem qua budget
create policy own_allocations on budget_allocations
  for all using (
    exists (select 1 from budgets b where b.id = budget_id and b.user_id = auth.uid())
  ) with check (
    exists (select 1 from budgets b where b.id = budget_id and b.user_id = auth.uid())
  );

create policy own_transfers on wallet_transfers
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy own_expenses on expenses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy read_emotions on emotions
  for select using (true);

-- =====================================================================
-- GHI CHU
--   - View wallet_balances tu loc theo RLS cua bang wallets/expenses ben duoi.
--   - Khong luu balance -> khong the lech so du khi insert that bai giua chung.
--   - "Tien chua co viec" = tong opening+thu-chi cua vi payment - tong allocated.
--     Tinh bang query khi can, khong can bang rieng.
-- =====================================================================