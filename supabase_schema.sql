-- Supabase schema for migrating the app off SQLite/local mocks
-- Run this script in the Supabase SQL editor or via the Supabase CLI

create extension if not exists "uuid-ossp";

-- Enumerations
create type deal_stage as enum (
  'New',
  'Discovery',
  'Qualified',
  'Proposal',
  'Negotiation',
  'Closed Won',
  'Closed Lost'
);

create type customer_status as enum (
  'Active',
  'Inactive',
  'Prospective',
  'Blacklisted'
);

-- Core tables
create table if not exists agents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  avatar text,
  activeClients integer default 0,
  salesThisMonth numeric,
  callsThisWeek integer,
  conversionRate numeric,
  inserted_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
create unique index if not exists agents_name_key on agents (name);

create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  customerSince date,
  status customer_status default 'Active',
  isHidden boolean default false,
  team text,
  salesman text,
  assignedAgent text,
  assigned_agent_id uuid references agents(id) on delete set null,
  referBy text,
  address text,
  province text,
  city text,
  area text,
  deliveryAddress text,
  tin text,
  priceGroup text,
  businessLine text,
  terms text,
  transactionType text,
  vatType text,
  vatPercentage text,
  dealershipTerms text,
  dealershipSince text,
  dealershipQuota numeric,
  creditLimit numeric,
  debtType text,
  comment text,
  contactPersons jsonb default '[]'::jsonb,
  name text,
  avatar text,
  totalSales numeric,
  balance numeric,
  salesByYear jsonb default '{}'::jsonb,
  interactions jsonb default '[]'::jsonb,
  comments jsonb default '[]'::jsonb,
  salesHistory jsonb default '[]'::jsonb,
  topProducts jsonb default '[]'::jsonb,
  stage deal_stage,
  dealValue numeric,
  aiScore numeric,
  winProbability numeric,
  aiReasoning text,
  inserted_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
create unique index if not exists contacts_company_key on contacts (company);
create index if not exists contacts_status_idx on contacts (status);
create index if not exists contacts_assigned_agent_idx on contacts (assignedAgent);
create index if not exists contacts_stage_idx on contacts (stage);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  part_no text not null,
  oem_no text,
  brand text,
  barcode text,
  no_of_pieces_per_box integer,
  item_code text,
  description text,
  size text,
  reorder_quantity integer,
  status text,
  category text,
  descriptive_inquiry text,
  no_of_holes text,
  replenish_quantity integer,
  original_pn_no text,
  application text,
  no_of_cylinder text,
  price_aa numeric,
  price_bb numeric,
  price_cc numeric,
  price_dd numeric,
  price_vip1 numeric,
  price_vip2 numeric,
  stock_wh1 integer,
  stock_wh2 integer,
  stock_wh3 integer,
  stock_wh4 integer,
  stock_wh5 integer,
  stock_wh6 integer,
  inserted_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
create unique index if not exists products_part_no_key on products (part_no);
create index if not exists products_status_idx on products (status);
create index if not exists products_category_idx on products (category);

create table if not exists deals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  company text,
  contactName text,
  avatar text,
  value numeric,
  currency text,
  stageId text,
  ownerName text,
  daysInStage integer,
  isOverdue boolean,
  isWarning boolean,
  inserted_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
create unique index if not exists deals_title_key on deals (title);
create index if not exists deals_stage_idx on deals (stageId);

create table if not exists call_logs (
  id uuid primary key default gen_random_uuid(),
  contactName text,
  company text,
  agent_id uuid references agents(id) on delete set null,
  agentName text,
  agentAvatar text,
  type text,
  status text,
  duration text,
  time text,
  outcome text,
  notes text,
  inserted_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
create unique index if not exists call_logs_unique_call on call_logs (lower(coalesce(agentName,'')), lower(coalesce(contactName,'')), time, type);
create index if not exists call_logs_status_idx on call_logs (status);

-- Profiles table used by Supabase Auth (optional but keeps UI happy)
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  avatar_url text,
  role text,
  inserted_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
create index if not exists profiles_role_idx on profiles (role);

