-- Auctino Supabase Security Audit
-- Safe read-only audit script.
-- Run this in Supabase SQL Editor and copy the results back into the audit document.

-- 1. Public tables and RLS status
select
  n.nspname as schema_name,
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n
  on n.oid = c.relnamespace
where
  n.nspname = 'public'
  and c.relkind = 'r'
order by
  c.relname;

-- 2. Public policies
select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
order by
  tablename,
  policyname;

-- 3. Storage buckets
select
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
from storage.buckets
order by id;

-- 4. Storage policies
select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'storage'
order by
  tablename,
  policyname;

-- 5. Grants on public tables for anon/authenticated
select
  table_schema,
  table_name,
  grantee,
  privilege_type
from information_schema.role_table_grants
where
  table_schema = 'public'
  and grantee in ('anon', 'authenticated')
order by
  table_name,
  grantee,
  privilege_type;

-- 6. Public functions / RPC security overview
select
  n.nspname as schema_name,
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments,
  pg_get_function_result(p.oid) as returns,
  p.prosecdef as security_definer,
  p.provolatile as volatility,
  array_to_string(p.proconfig, ', ') as function_config
from pg_proc p
join pg_namespace n
  on n.oid = p.pronamespace
where n.nspname = 'public'
order by p.proname;

-- 7. Function grants for anon/authenticated
select
  routine_schema,
  routine_name,
  grantee,
  privilege_type
from information_schema.routine_privileges
where
  routine_schema = 'public'
  and grantee in ('anon', 'authenticated')
order by
  routine_name,
  grantee;

-- 8. Foreign keys overview
select
  tc.table_name,
  kcu.column_name,
  ccu.table_name as foreign_table_name,
  ccu.column_name as foreign_column_name,
  tc.constraint_name
from information_schema.table_constraints tc
join information_schema.key_column_usage kcu
  on tc.constraint_name = kcu.constraint_name
  and tc.table_schema = kcu.table_schema
join information_schema.constraint_column_usage ccu
  on ccu.constraint_name = tc.constraint_name
  and ccu.table_schema = tc.table_schema
where
  tc.constraint_type = 'FOREIGN KEY'
  and tc.table_schema = 'public'
order by
  tc.table_name,
  kcu.column_name;

-- 9. Important constraints overview
select
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type
from information_schema.table_constraints tc
where
  tc.table_schema = 'public'
  and tc.constraint_type in (
    'PRIMARY KEY',
    'UNIQUE',
    'CHECK',
    'FOREIGN KEY'
  )
order by
  tc.table_name,
  tc.constraint_type,
  tc.constraint_name;

-- 10. Check potentially sensitive public tables
select
  table_name,
  column_name,
  data_type,
  is_nullable
from information_schema.columns
where
  table_schema = 'public'
  and table_name in (
    'profiles',
    'products',
    'product_images',
    'favorites',
    'bids',
    'conversations',
    'messages',
    'notifications',
    'transactions',
    'reviews',
    'product_reports',
    'reports',
    'disputes'
  )
order by
  table_name,
  ordinal_position;