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

| schema_name | table_name      | rls_enabled | rls_forced |
| ----------- | --------------- | ----------- | ---------- |
| public      | bids            | true        | false      |
| public      | categories      | true        | false      |
| public      | conversations   | true        | false      |
| public      | favorites       | true        | false      |
| public      | messages        | true        | false      |
| public      | notifications   | true        | false      |
| public      | product_images  | true        | false      |
| public      | product_reports | true        | false      |
| public      | products        | true        | false      |
| public      | profiles        | true        | false      |
| public      | reviews         | true        | false      |
| public      | subcategories   | true        | false      |
| public      | transactions    | true        | false      |


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


| schemaname | tablename    | policyname         | permissive | roles    | cmd    |     | with_check             |
| ---------- | -------------- | ------------------------------------------------ | ---------- | -------------------- | ------ | -----------------------------------------------------------------------
| public     | bids           | Anyone can view bids | PERMISSIVE | {public}    | SELECT | true   | null                   |
| public     | bids           | Users can insert their own bids                  | PERMISSIVE | {public}             | INSERT | null                                                                                                                                                                                                                                                                               | (auth.uid() = user_id) |
| public     | categories     | Anyone can read active categories                | PERMISSIVE | {public}             | SELECT | (is_active = true)                                                                                                                                                                                                                                                                 | null                   |
| public     | conversations  | Users can view their conversations               | PERMISSIVE | {authenticated}      | SELECT | ((auth.uid() = seller_id) OR (auth.uid() = buyer_id))                                                                                                                                                                                                                              | null                   |
| public     | favorites      | Users can view their own favorites               | PERMISSIVE | {authenticated}      | SELECT | (user_id = auth.uid())                                                                                                                                                                                                                                                             | null                   |
| public     | messages       | Users can view messages from their conversations | PERMISSIVE | {authenticated}      | SELECT | (EXISTS ( SELECT 1
   FROM conversations
  WHERE ((conversations.id = messages.conversation_id) AND ((conversations.seller_id = auth.uid()) OR (conversations.buyer_id = auth.uid())))))                                                                                           | null                   |
| public     | notifications  | Users can view own notifications                 | PERMISSIVE | {authenticated}      | SELECT | (auth.uid() = user_id)                                                                                                                                                                                                                                                             | null                   |
| public     | product_images | Public can read product images                   | PERMISSIVE | {anon,authenticated} | SELECT | true                                                                                                                                                                                                                                                                               | null                   |
| public     | products       | Anyone can view active products                  | PERMISSIVE | {public}             | SELECT | (status = 'active'::text)                                                                                                                                                                                                                                                          | null                   |
| public     | products       | Transaction participants can view product        | PERMISSIVE | {authenticated}      | SELECT | ((auth.uid() = user_id) OR (auth.uid() = winner_id) OR (EXISTS ( SELECT 1
   FROM transactions t
  WHERE ((t.product_id = products.id) AND ((t.seller_id = auth.uid()) OR (t.buyer_id = auth.uid()))))))                                                                           | null                   |
| public     | products       | Users can view products                          | PERMISSIVE | {authenticated}      | SELECT | ((status = ANY (ARRAY['active'::text, 'ended'::text, 'expired'::text])) OR (auth.uid() = user_id) OR (auth.uid() = winner_id) OR (EXISTS ( SELECT 1
   FROM transactions t
  WHERE ((t.product_id = products.id) AND ((t.seller_id = auth.uid()) OR (t.buyer_id = auth.uid())))))) | null                   |
| public     | profiles       | Users can insert their own profile               | PERMISSIVE | {public}             | INSERT | null                                                                                                                                                                                                                                                                               | (auth.uid() = id)      |
| public     | profiles       | Users can view their own profile                 | PERMISSIVE | {authenticated}      | SELECT | (id = auth.uid())                                                                                                                                                                                                                                                                  | null                   |
| public     | reviews        | Published reviews and own drafts are visible     | PERMISSIVE | {public}             | SELECT | ((COALESCE(is_published, false) = true) OR (reviewer_id = auth.uid()))                                                                                                                                                                                                             | null                   |
| public     | subcategories  | Anyone can read active subcategories             | PERMISSIVE | {public}             | SELECT | (is_active = true)                                                                                                                                                                                                                                                                 | null                   |
| public     | transactions   | Participants and admins can view transactions    | PERMISSIVE | {authenticated}      | SELECT | ((auth.uid() = seller_id) OR (auth.uid() = buyer_id) OR is_active_admin())                                                                                                                                                                                                         | null                   |
-- 3. Storage buckets
select
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
from storage.buckets
order by id;

| id             | name           | public | file_size_limit | allowed_mime_types                      |
| -------------- | -------------- | ------ | --------------- | --------------------------------------- |
| avatars        | avatars        | true   | 3145728         | ["image/jpeg","image/png","image/webp"] |
| product-images | product-images | true   | 5242880         | ["image/jpeg","image/png","image/webp"] |

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

| schemaname | tablename | policyname                                | permissive | roles           | cmd    | qual                                                                                                                                                                                                                           | with_check                                                                                                                                                                                                                     |
| ---------- | --------- | ----------------------------------------- | ---------- | --------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| storage    | objects   | Owners can delete editable product images | PERMISSIVE | {authenticated} | DELETE | ((bucket_id = 'product-images'::text) AND (array_length(string_to_array(name, '/'::text), 1) = 3) AND (split_part(name, '/'::text, 1) = (auth.uid())::text) AND can_manage_own_product_images(split_part(name, '/'::text, 2))) | null                                                                                                                                                                                                                           |
| storage    | objects   | Owners can upload editable product images | PERMISSIVE | {authenticated} | INSERT | null                                                                                                                                                                                                                           | ((bucket_id = 'product-images'::text) AND (array_length(string_to_array(name, '/'::text), 1) = 3) AND (split_part(name, '/'::text, 1) = (auth.uid())::text) AND can_manage_own_product_images(split_part(name, '/'::text, 2))) |
| storage    | objects   | Public can read Auctino product images    | PERMISSIVE | {public}        | SELECT | (bucket_id = 'product-images'::text)                                                                                                                                                                                           | null                                                                                                                                                                                                                           |
| storage    | objects   | Public can read avatars                   | PERMISSIVE | {public}        | SELECT | (bucket_id = 'avatars'::text)                                                                                                                                                                                                  | null                                                                                                                                                                                                                           |
| storage    | objects   | Users can delete own avatar               | PERMISSIVE | {authenticated} | DELETE | ((bucket_id = 'avatars'::text) AND (name = ((auth.uid())::text || '/avatar'::text)) AND (owner = auth.uid()))                                                                                                                  | null                                                                                                                                                                                                                           |
| storage    | objects   | Users can update own avatar               | PERMISSIVE | {authenticated} | UPDATE | ((bucket_id = 'avatars'::text) AND (name = ((auth.uid())::text || '/avatar'::text)) AND (owner = auth.uid()))                                                                                                                  | ((bucket_id = 'avatars'::text) AND (name = ((auth.uid())::text || '/avatar'::text)))                                                                                                                                           |
| storage    | objects   | Users can upload own avatar               | PERMISSIVE | {authenticated} | INSERT | null                                                                                                                                                                                                                           | ((bucket_id = 'avatars'::text) AND (name = ((auth.uid())::text || '/avatar'::text)))                                                                                                                                           |
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

| table_schema | table_name     | grantee       | privilege_type |
| ------------ | -------------- | ------------- | -------------- |
| public       | bids           | anon          | REFERENCES     |
| public       | bids           | anon          | TRIGGER        |
| public       | bids           | anon          | TRUNCATE       |
| public       | bids           | authenticated | REFERENCES     |
| public       | bids           | authenticated | TRIGGER        |
| public       | bids           | authenticated | TRUNCATE       |
| public       | categories     | anon          | DELETE         |
| public       | categories     | anon          | INSERT         |
| public       | categories     | anon          | REFERENCES     |
| public       | categories     | anon          | SELECT         |
| public       | categories     | anon          | TRIGGER        |
| public       | categories     | anon          | TRUNCATE       |
| public       | categories     | anon          | UPDATE         |
| public       | categories     | authenticated | DELETE         |
| public       | categories     | authenticated | INSERT         |
| public       | categories     | authenticated | REFERENCES     |
| public       | categories     | authenticated | SELECT         |
| public       | categories     | authenticated | TRIGGER        |
| public       | categories     | authenticated | TRUNCATE       |
| public       | categories     | authenticated | UPDATE         |
| public       | conversations  | anon          | REFERENCES     |
| public       | conversations  | anon          | SELECT         |
| public       | conversations  | anon          | TRIGGER        |
| public       | conversations  | anon          | TRUNCATE       |
| public       | conversations  | authenticated | REFERENCES     |
| public       | conversations  | authenticated | SELECT         |
| public       | conversations  | authenticated | TRIGGER        |
| public       | conversations  | authenticated | TRUNCATE       |
| public       | favorites      | authenticated | REFERENCES     |
| public       | favorites      | authenticated | SELECT         |
| public       | favorites      | authenticated | TRIGGER        |
| public       | favorites      | authenticated | TRUNCATE       |
| public       | messages       | anon          | REFERENCES     |
| public       | messages       | anon          | SELECT         |
| public       | messages       | anon          | TRIGGER        |
| public       | messages       | anon          | TRUNCATE       |
| public       | messages       | authenticated | REFERENCES     |
| public       | messages       | authenticated | SELECT         |
| public       | messages       | authenticated | TRIGGER        |
| public       | messages       | authenticated | TRUNCATE       |
| public       | notifications  | anon          | REFERENCES     |
| public       | notifications  | anon          | SELECT         |
| public       | notifications  | anon          | TRIGGER        |
| public       | notifications  | anon          | TRUNCATE       |
| public       | notifications  | authenticated | REFERENCES     |
| public       | notifications  | authenticated | SELECT         |
| public       | notifications  | authenticated | TRIGGER        |
| public       | notifications  | authenticated | TRUNCATE       |
| public       | product_images | anon          | REFERENCES     |
| public       | product_images | anon          | SELECT         |
| public       | product_images | anon          | TRIGGER        |
| public       | product_images | anon          | TRUNCATE       |
| public       | product_images | authenticated | REFERENCES     |
| public       | product_images | authenticated | SELECT         |
| public       | product_images | authenticated | TRIGGER        |
| public       | product_images | authenticated | TRUNCATE       |
| public       | products       | anon          | REFERENCES     |
| public       | products       | anon          | SELECT         |
| public       | products       | anon          | TRIGGER        |
| public       | products       | anon          | TRUNCATE       |
| public       | products       | authenticated | REFERENCES     |
| public       | products       | authenticated | SELECT         |
| public       | products       | authenticated | TRIGGER        |
| public       | products       | authenticated | TRUNCATE       |
| public       | profiles       | anon          | REFERENCES     |
| public       | profiles       | anon          | TRIGGER        |
| public       | profiles       | anon          | TRUNCATE       |
| public       | profiles       | authenticated | REFERENCES     |
| public       | profiles       | authenticated | SELECT         |
| public       | profiles       | authenticated | TRIGGER        |
| public       | profiles       | authenticated | TRUNCATE       |
| public       | reviews        | anon          | REFERENCES     |
| public       | reviews        | anon          | SELECT         |
| public       | reviews        | anon          | TRIGGER        |
| public       | reviews        | anon          | TRUNCATE       |
| public       | reviews        | authenticated | REFERENCES     |
| public       | reviews        | authenticated | SELECT         |
| public       | reviews        | authenticated | TRIGGER        |
| public       | reviews        | authenticated | TRUNCATE       |
| public       | subcategories  | anon          | DELETE         |
| public       | subcategories  | anon          | INSERT         |
| public       | subcategories  | anon          | REFERENCES     |
| public       | subcategories  | anon          | SELECT         |
| public       | subcategories  | anon          | TRIGGER        |
| public       | subcategories  | anon          | TRUNCATE       |
| public       | subcategories  | anon          | UPDATE         |
| public       | subcategories  | authenticated | DELETE         |
| public       | subcategories  | authenticated | INSERT         |
| public       | subcategories  | authenticated | REFERENCES     |
| public       | subcategories  | authenticated | SELECT         |
| public       | subcategories  | authenticated | TRIGGER        |
| public       | subcategories  | authenticated | TRUNCATE       |
| public       | subcategories  | authenticated | UPDATE         |
| public       | transactions   | authenticated | REFERENCES     |
| public       | transactions   | authenticated | SELECT         |
| public       | transactions   | authenticated | TRIGGER        |
| public       | transactions   | authenticated | TRUNCATE       |

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

| schema_name | function_name                           | arguments                                                                                                                                                                                                                                                                                                                                                                                                           | returns                                                                                                                                                                                                                                                                                                         | security_definer | volatility | function_config             |
| ----------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ---------- | --------------------------- |
| public      | block_suspended_account_writes          |                                                                                                                                                                                                                                                                                                                                                                                                                     | trigger                                                                                                                                                                                                                                                                                                         | true             | v          | search_path=public          |
| public      | can_manage_own_product_images           | p_product_id_text text                                                                                                                                                                                                                                                                                                                                                                                              | boolean                                                                                                                                                                                                                                                                                                         | true             | s          | search_path=public, storage |
| public      | can_manage_product_images               | p_product_id_text text                                                                                                                                                                                                                                                                                                                                                                                              | boolean                                                                                                                                                                                                                                                                                                         | true             | s          | search_path=public          |
| public      | can_review_product                      | p_product_id uuid                                                                                                                                                                                                                                                                                                                                                                                                   | boolean                                                                                                                                                                                                                                                                                                         | true             | s          | search_path=public          |
| public      | cancel_transaction                      | p_transaction_id uuid, p_reason text                                                                                                                                                                                                                                                                                                                                                                                | transactions                                                                                                                                                                                                                                                                                                    | true             | v          | search_path=public          |
| public      | close_own_finished_auction              | p_product_id uuid                                                                                                                                                                                                                                                                                                                                                                                                   | jsonb                                                                                                                                                                                                                                                                                                           | true             | v          | search_path=public          |
| public      | confirm_transaction                     | p_transaction_id uuid                                                                                                                                                                                                                                                                                                                                                                                               | transactions                                                                                                                                                                                                                                                                                                    | true             | v          | search_path=public          |
| public      | create_own_product                      | p_title text, p_description text, p_category_id uuid, p_subcategory_id uuid, p_condition text, p_starting_price numeric, p_location text, p_duration_days integer, p_market_code text DEFAULT 'RO'::text                                                                                                                                                                                                            | products                                                                                                                                                                                                                                                                                                        | true             | v          | search_path=public          |
| public      | create_transaction_review               | p_transaction_id uuid, p_rating integer, p_communication integer DEFAULT NULL::integer, p_accuracy integer DEFAULT NULL::integer, p_comment text DEFAULT NULL::text                                                                                                                                                                                                                                                 | reviews                                                                                                                                                                                                                                                                                                         | true             | v          | search_path=public          |
| public      | delete_own_product                      | p_product_id uuid                                                                                                                                                                                                                                                                                                                                                                                                   | boolean                                                                                                                                                                                                                                                                                                         | true             | v          | search_path=public          |
| public      | delete_own_product_image                | p_image_id uuid                                                                                                                                                                                                                                                                                                                                                                                                     | text                                                                                                                                                                                                                                                                                                            | true             | v          | search_path=public          |
| public      | delete_own_product_image_secure         | p_image_id uuid                                                                                                                                                                                                                                                                                                                                                                                                     | text                                                                                                                                                                                                                                                                                                            | true             | v          | search_path=public, storage |
| public      | dismiss_product_report                  | p_report_id uuid, p_reason text                                                                                                                                                                                                                                                                                                                                                                                     | product_reports                                                                                                                                                                                                                                                                                                 | true             | v          | search_path=public          |
| public      | finalize_auction_and_create_transaction | p_product_id uuid                                                                                                                                                                                                                                                                                                                                                                                                   | transactions                                                                                                                                                                                                                                                                                                    | true             | v          | search_path=public          |
| public      | get_admin_disputes                      |                                                                                                                                                                                                                                                                                                                                                                                                                     | TABLE(id uuid, product_id uuid, seller_id uuid, buyer_id uuid, final_price numeric, status transaction_status, dispute_reason text, disputed_by uuid, disputed_at timestamp with time zone, created_at timestamp with time zone, product_title text, product_image_url text, seller_name text, buyer_name text) | true             | v          | search_path=public          |
| public      | get_admin_product_reports               |                                                                                                                                                                                                                                                                                                                                                                                                                     | TABLE(id uuid, product_id uuid, reporter_id uuid, reason text, status text, created_at timestamp with time zone, product_title text, product_image_url text, product_price numeric, product_status text, seller_id uuid, seller_name text, reporter_name text, reporter_email text)                             | true             | v          | search_path=public, auth    |
| public      | get_admin_users                         |                                                                                                                                                                                                                                                                                                                                                                                                                     | TABLE(id uuid, email text, full_name text, role text, account_status text, rating numeric, suspension_reason text, suspended_by uuid, suspended_at timestamp with time zone, created_at timestamp with time zone, products_count bigint, purchases_count bigint, sales_count bigint)                            | true             | v          | search_path=public, auth    |
| public      | get_marketplace_products                | p_search text DEFAULT NULL::text, p_category_id uuid DEFAULT NULL::uuid, p_subcategory_id uuid DEFAULT NULL::uuid, p_county text DEFAULT NULL::text, p_condition text DEFAULT NULL::text, p_min_price numeric DEFAULT NULL::numeric, p_max_price numeric DEFAULT NULL::numeric, p_sort text DEFAULT 'newest'::text, p_page integer DEFAULT 1, p_page_size integer DEFAULT 24, p_market_code text DEFAULT 'RO'::text | jsonb                                                                                                                                                                                                                                                                                                           | false            | s          | search_path=public          |
| public      | get_my_bid_products                     |                                                                                                                                                                                                                                                                                                                                                                                                                     | jsonb                                                                                                                                                                                                                                                                                                           | true             | v          | search_path=public          |
| public      | get_my_received_bid_products            |                                                                                                                                                                                                                                                                                                                                                                                                                     | jsonb                                                                                                                                                                                                                                                                                                           | true             | v          | search_path=public          |
| public      | get_or_create_product_conversation      | p_product_id uuid, p_buyer_id uuid                                                                                                                                                                                                                                                                                                                                                                                  | conversations                                                                                                                                                                                                                                                                                                   | true             | v          | search_path=public          |
| public      | get_public_product_bids                 | p_product_id uuid                                                                                                                                                                                                                                                                                                                                                                                                   | TABLE(id uuid, amount numeric, created_at timestamp with time zone, is_my_bid boolean)                                                                                                                                                                                                                          | true             | s          | search_path=public          |
| public      | get_public_profile                      | p_user_id uuid                                                                                                                                                                                                                                                                                                                                                                                                      | jsonb                                                                                                                                                                                                                                                                                                           | true             | s          | search_path=public          |
| public      | get_public_profiles                     | p_user_ids uuid[]                                                                                                                                                                                                                                                                                                                                                                                                   | jsonb                                                                                                                                                                                                                                                                                                           | true             | s          | search_path=public          |
| public      | handle_new_user                         |                                                                                                                                                                                                                                                                                                                                                                                                                     | trigger                                                                                                                                                                                                                                                                                                         | true             | v          | search_path=public          |
| public      | is_active_admin                         |                                                                                                                                                                                                                                                                                                                                                                                                                     | boolean                                                                                                                                                                                                                                                                                                         | true             | s          | search_path=public          |
| public      | is_own_favorite                         | p_product_id uuid, p_market_code text DEFAULT 'RO'::text                                                                                                                                                                                                                                                                                                                                                            | boolean                                                                                                                                                                                                                                                                                                         | true             | s          | search_path=public          |
| public      | mark_all_own_notifications_as_read      |                                                                                                                                                                                                                                                                                                                                                                                                                     | integer                                                                                                                                                                                                                                                                                                         | true             | v          | search_path=public          |
| public      | mark_own_conversation_messages_as_read  | p_conversation_id uuid                                                                                                                                                                                                                                                                                                                                                                                              | integer                                                                                                                                                                                                                                                                                                         | true             | v          | search_path=public          |
| public      | mark_own_notification_as_read           | p_notification_id uuid                                                                                                                                                                                                                                                                                                                                                                                              | boolean                                                                                                                                                                                                                                                                                                         | true             | v          | search_path=public          |
| public      | notify_auctions_ending_soon             |                                                                                                                                                                                                                                                                                                                                                                                                                     | integer                                                                                                                                                                                                                                                                                                         | true             | v          | search_path=public          |
| public      | notify_review_received                  |                                                                                                                                                                                                                                                                                                                                                                                                                     | trigger                                                                                                                                                                                                                                                                                                         | true             | v          | search_path=public          |
| public      | notify_transaction_changes              |                                                                                                                                                                                                                                                                                                                                                                                                                     | trigger                                                                                                                                                                                                                                                                                                         | true             | v          | search_path=public          |
| public      | open_transaction_dispute                | p_transaction_id uuid, p_reason text                                                                                                                                                                                                                                                                                                                                                                                | transactions                                                                                                                                                                                                                                                                                                    | true             | v          | search_path=public          |
| public      | place_bid_atomic                        | p_product_id uuid, p_amount numeric, p_market_code text DEFAULT 'RO'::text                                                                                                                                                                                                                                                                                                                                          | jsonb                                                                                                                                                                                                                                                                                                           | true             | v          | search_path=public          |
| public      | prevent_seller_bid                      |                                                                                                                                                                                                                                                                                                                                                                                                                     | trigger                                                                                                                                                                                                                                                                                                         | false            | v          | null                        |
| public      | protect_product_moderation              |                                                                                                                                                                                                                                                                                                                                                                                                                     | trigger                                                                                                                                                                                                                                                                                                         | true             | v          | search_path=public          |
| public      | protect_profile_account_status          |                                                                                                                                                                                                                                                                                                                                                                                                                     | trigger                                                                                                                                                                                                                                                                                                         | true             | v          | search_path=public          |
| public      | protect_profile_role                    |                                                                                                                                                                                                                                                                                                                                                                                                                     | trigger                                                                                                                                                                                                                                                                                                         | true             | v          | search_path=public          |
| public      | publish_own_review                      | p_review_id uuid                                                                                                                                                                                                                                                                                                                                                                                                    | reviews                                                                                                                                                                                                                                                                                                         | true             | v          | search_path=public          |
| public      | recalculate_profile_rating              | p_user_id uuid                                                                                                                                                                                                                                                                                                                                                                                                      | void                                                                                                                                                                                                                                                                                                            | true             | v          | search_path=public          |
| public      | refresh_own_product_main_image          | p_product_id uuid                                                                                                                                                                                                                                                                                                                                                                                                   | boolean                                                                                                                                                                                                                                                                                                         | true             | v          | search_path=public          |
| public      | refresh_own_product_main_image_secure   | p_product_id uuid                                                                                                                                                                                                                                                                                                                                                                                                   | text                                                                                                                                                                                                                                                                                                            | true             | v          | search_path=public          |
| public      | register_own_product_image              | p_product_id uuid, p_storage_path text, p_image_url text                                                                                                                                                                                                                                                                                                                                                            | uuid                                                                                                                                                                                                                                                                                                            | true             | v          | search_path=public, storage |
| public      | register_product_image                  | p_product_id uuid, p_storage_path text, p_image_url text                                                                                                                                                                                                                                                                                                                                                            | uuid                                                                                                                                                                                                                                                                                                            | true             | v          | search_path=public          |
| public      | relist_expired_product                  | p_product_id uuid, p_duration_days integer                                                                                                                                                                                                                                                                                                                                                                          | boolean                                                                                                                                                                                                                                                                                                         | true             | v          | search_path=public          |
| public      | remove_own_avatar                       |                                                                                                                                                                                                                                                                                                                                                                                                                     | text                                                                                                                                                                                                                                                                                                            | true             | v          | search_path=public          |
| public      | remove_reported_product                 | p_report_id uuid, p_reason text                                                                                                                                                                                                                                                                                                                                                                                     | product_reports                                                                                                                                                                                                                                                                                                 | true             | v          | search_path=public          |
| public      | report_product                          | p_product_id uuid, p_reason text                                                                                                                                                                                                                                                                                                                                                                                    | product_reports                                                                                                                                                                                                                                                                                                 | true             | v          | search_path=public          |
| public      | resolve_transaction_dispute             | p_transaction_id uuid, p_decision text, p_reason text                                                                                                                                                                                                                                                                                                                                                               | transactions                                                                                                                                                                                                                                                                                                    | true             | v          | search_path=public          |
| public      | send_message_with_notification          | p_conversation_id uuid, p_content text                                                                                                                                                                                                                                                                                                                                                                              | messages                                                                                                                                                                                                                                                                                                        | true             | v          | search_path=public          |
| public      | set_own_avatar                          | p_avatar_url text                                                                                                                                                                                                                                                                                                                                                                                                   | profiles                                                                                                                                                                                                                                                                                                        | true             | v          | search_path=public, storage |
| public      | set_own_favorite                        | p_product_id uuid, p_should_be_favorite boolean, p_market_code text DEFAULT 'RO'::text                                                                                                                                                                                                                                                                                                                              | boolean                                                                                                                                                                                                                                                                                                         | true             | v          | search_path=public          |
| public      | set_transaction_updated_at              |                                                                                                                                                                                                                                                                                                                                                                                                                     | trigger                                                                                                                                                                                                                                                                                                         | false            | v          | null                        |
| public      | set_user_account_status                 | p_user_id uuid, p_status text, p_reason text DEFAULT NULL::text                                                                                                                                                                                                                                                                                                                                                     | profiles                                                                                                                                                                                                                                                                                                        | true             | v          | search_path=public          |
| public      | update_finished_auctions                |                                                                                                                                                                                                                                                                                                                                                                                                                     | integer                                                                                                                                                                                                                                                                                                         | true             | v          | search_path=public          |
| public      | update_own_product                      | p_product_id uuid, p_title text, p_description text, p_category_id uuid, p_subcategory_id uuid, p_condition text, p_location text                                                                                                                                                                                                                                                                                   | products                                                                                                                                                                                                                                                                                                        | true             | v          | search_path=public          |
| public      | update_own_public_profile               | p_full_name text DEFAULT NULL::text, p_phone text DEFAULT NULL::text, p_city text DEFAULT NULL::text, p_avatar_url text DEFAULT NULL::text                                                                                                                                                                                                                                                                          | profiles                                                                                                                                                                                                                                                                                                        | true             | v          | search_path=public          |
| public      | update_profile_rating_after_review      |                                                                                                                                                                                                                                                                                                                                                                                                                     | trigger                                                                                                                                                                                                                                                                                                         | true             | v          | search_path=public          |

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

| routine_schema | routine_name                            | grantee       | privilege_type |
| -------------- | --------------------------------------- | ------------- | -------------- |
| public         | block_suspended_account_writes          | anon          | EXECUTE        |
| public         | block_suspended_account_writes          | authenticated | EXECUTE        |
| public         | can_manage_own_product_images           | anon          | EXECUTE        |
| public         | can_manage_own_product_images           | authenticated | EXECUTE        |
| public         | can_review_product                      | anon          | EXECUTE        |
| public         | can_review_product                      | authenticated | EXECUTE        |
| public         | cancel_transaction                      | anon          | EXECUTE        |
| public         | cancel_transaction                      | authenticated | EXECUTE        |
| public         | close_own_finished_auction              | anon          | EXECUTE        |
| public         | close_own_finished_auction              | authenticated | EXECUTE        |
| public         | confirm_transaction                     | anon          | EXECUTE        |
| public         | confirm_transaction                     | authenticated | EXECUTE        |
| public         | create_own_product                      | authenticated | EXECUTE        |
| public         | create_transaction_review               | anon          | EXECUTE        |
| public         | create_transaction_review               | authenticated | EXECUTE        |
| public         | delete_own_product                      | anon          | EXECUTE        |
| public         | delete_own_product                      | authenticated | EXECUTE        |
| public         | delete_own_product_image_secure         | anon          | EXECUTE        |
| public         | delete_own_product_image_secure         | authenticated | EXECUTE        |
| public         | dismiss_product_report                  | authenticated | EXECUTE        |
| public         | finalize_auction_and_create_transaction | anon          | EXECUTE        |
| public         | finalize_auction_and_create_transaction | authenticated | EXECUTE        |
| public         | get_admin_disputes                      | anon          | EXECUTE        |
| public         | get_admin_disputes                      | authenticated | EXECUTE        |
| public         | get_admin_product_reports               | authenticated | EXECUTE        |
| public         | get_admin_users                         | anon          | EXECUTE        |
| public         | get_admin_users                         | authenticated | EXECUTE        |
| public         | get_marketplace_products                | anon          | EXECUTE        |
| public         | get_marketplace_products                | authenticated | EXECUTE        |
| public         | get_my_bid_products                     | anon          | EXECUTE        |
| public         | get_my_bid_products                     | authenticated | EXECUTE        |
| public         | get_my_received_bid_products            | anon          | EXECUTE        |
| public         | get_my_received_bid_products            | authenticated | EXECUTE        |
| public         | get_or_create_product_conversation      | anon          | EXECUTE        |
| public         | get_or_create_product_conversation      | authenticated | EXECUTE        |
| public         | get_public_product_bids                 | anon          | EXECUTE        |
| public         | get_public_product_bids                 | authenticated | EXECUTE        |
| public         | get_public_profile                      | anon          | EXECUTE        |
| public         | get_public_profile                      | authenticated | EXECUTE        |
| public         | get_public_profiles                     | anon          | EXECUTE        |
| public         | get_public_profiles                     | authenticated | EXECUTE        |
| public         | handle_new_user                         | anon          | EXECUTE        |
| public         | handle_new_user                         | authenticated | EXECUTE        |
| public         | is_active_admin                         | anon          | EXECUTE        |
| public         | is_active_admin                         | authenticated | EXECUTE        |
| public         | is_own_favorite                         | authenticated | EXECUTE        |
| public         | mark_all_own_notifications_as_read      | anon          | EXECUTE        |
| public         | mark_all_own_notifications_as_read      | authenticated | EXECUTE        |
| public         | mark_own_conversation_messages_as_read  | anon          | EXECUTE        |
| public         | mark_own_conversation_messages_as_read  | authenticated | EXECUTE        |
| public         | mark_own_notification_as_read           | anon          | EXECUTE        |
| public         | mark_own_notification_as_read           | authenticated | EXECUTE        |
| public         | notify_auctions_ending_soon             | anon          | EXECUTE        |
| public         | notify_auctions_ending_soon             | authenticated | EXECUTE        |
| public         | notify_review_received                  | anon          | EXECUTE        |
| public         | notify_review_received                  | authenticated | EXECUTE        |
| public         | notify_transaction_changes              | anon          | EXECUTE        |
| public         | notify_transaction_changes              | authenticated | EXECUTE        |
| public         | open_transaction_dispute                | anon          | EXECUTE        |
| public         | open_transaction_dispute                | authenticated | EXECUTE        |
| public         | place_bid_atomic                        | authenticated | EXECUTE        |
| public         | prevent_seller_bid                      | anon          | EXECUTE        |
| public         | prevent_seller_bid                      | authenticated | EXECUTE        |
| public         | protect_product_moderation              | anon          | EXECUTE        |
| public         | protect_product_moderation              | authenticated | EXECUTE        |
| public         | protect_profile_account_status          | anon          | EXECUTE        |
| public         | protect_profile_account_status          | authenticated | EXECUTE        |
| public         | protect_profile_role                    | anon          | EXECUTE        |
| public         | protect_profile_role                    | authenticated | EXECUTE        |
| public         | publish_own_review                      | anon          | EXECUTE        |
| public         | publish_own_review                      | authenticated | EXECUTE        |
| public         | recalculate_profile_rating              | anon          | EXECUTE        |
| public         | recalculate_profile_rating              | authenticated | EXECUTE        |
| public         | refresh_own_product_main_image_secure   | anon          | EXECUTE        |
| public         | refresh_own_product_main_image_secure   | authenticated | EXECUTE        |
| public         | register_own_product_image              | anon          | EXECUTE        |
| public         | register_own_product_image              | authenticated | EXECUTE        |
| public         | relist_expired_product                  | anon          | EXECUTE        |
| public         | relist_expired_product                  | authenticated | EXECUTE        |
| public         | remove_own_avatar                       | anon          | EXECUTE        |
| public         | remove_own_avatar                       | authenticated | EXECUTE        |
| public         | remove_reported_product                 | authenticated | EXECUTE        |
| public         | report_product                          | authenticated | EXECUTE        |
| public         | resolve_transaction_dispute             | anon          | EXECUTE        |
| public         | resolve_transaction_dispute             | authenticated | EXECUTE        |
| public         | send_message_with_notification          | anon          | EXECUTE        |
| public         | send_message_with_notification          | authenticated | EXECUTE        |
| public         | set_own_avatar                          | anon          | EXECUTE        |
| public         | set_own_avatar                          | authenticated | EXECUTE        |
| public         | set_own_favorite                        | authenticated | EXECUTE        |
| public         | set_transaction_updated_at              | anon          | EXECUTE        |
| public         | set_transaction_updated_at              | authenticated | EXECUTE        |
| public         | set_user_account_status                 | anon          | EXECUTE        |
| public         | set_user_account_status                 | authenticated | EXECUTE        |
| public         | update_own_product                      | anon          | EXECUTE        |
| public         | update_own_product                      | authenticated | EXECUTE        |
| public         | update_own_public_profile               | anon          | EXECUTE        |
| public         | update_own_public_profile               | authenticated | EXECUTE        |
| public         | update_profile_rating_after_review      | anon          | EXECUTE        |
| public         | update_profile_rating_after_review      | authenticated | EXECUTE        |

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

| table_name      | column_name         | foreign_table_name | foreign_column_name | constraint_name                       |
| --------------- | ------------------- | ------------------ | ------------------- | ------------------------------------- |
| bids            | product_id          | products           | id                  | bids_product_id_fkey                  |
| conversations   | product_id          | products           | id                  | conversations_product_id_fkey         |
| favorites       | product_id          | products           | id                  | favorites_product_id_fkey             |
| messages        | conversation_id     | conversations      | id                  | messages_conversation_id_fkey         |
| notifications   | conversation_id     | conversations      | id                  | notifications_conversation_id_fkey    |
| notifications   | product_id          | products           | id                  | notifications_product_id_fkey         |
| notifications   | transaction_id      | transactions       | id                  | notifications_transaction_id_fkey     |
| product_images  | product_id          | products           | id                  | product_images_product_id_fkey        |
| product_reports | product_id          | products           | id                  | product_reports_product_id_fkey       |
| product_reports | reporter_id         | profiles           | id                  | product_reports_reporter_id_fkey      |
| product_reports | resolved_by         | profiles           | id                  | product_reports_resolved_by_fkey      |
| products        | category_id         | categories         | id                  | products_category_id_fkey             |
| products        | removed_by          | profiles           | id                  | products_removed_by_fkey              |
| products        | subcategory_id      | subcategories      | id                  | products_subcategory_id_fkey          |
| profiles        | suspended_by        | profiles           | id                  | profiles_suspended_by_fkey            |
| reviews         | product_id          | products           | id                  | reviews_product_id_fkey               |
| reviews         | transaction_id      | transactions       | id                  | reviews_transaction_id_fkey           |
| subcategories   | category_id         | categories         | id                  | subcategories_category_id_fkey        |
| transactions    | buyer_id            | profiles           | id                  | transactions_buyer_id_fkey            |
| transactions    | cancelled_by        | profiles           | id                  | transactions_cancelled_by_fkey        |
| transactions    | dispute_resolved_by | profiles           | id                  | transactions_dispute_resolved_by_fkey |
| transactions    | disputed_by         | profiles           | id                  | transactions_disputed_by_fkey         |
| transactions    | product_id          | products           | id                  | transactions_product_id_fkey          |
| transactions    | seller_id           | profiles           | id                  | transactions_seller_id_fkey           |

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

| table_name      | constraint_name                    | constraint_type |
| --------------- | ---------------------------------- | --------------- |
| bids            | 2200_17680_1_not_null              | CHECK           |
| bids            | 2200_17680_2_not_null              | CHECK           |
| bids            | 2200_17680_3_not_null              | CHECK           |
| bids            | 2200_17680_4_not_null              | CHECK           |
| bids            | bids_product_id_fkey               | FOREIGN KEY     |
| bids            | bids_user_id_fkey                  | FOREIGN KEY     |
| bids            | bids_pkey                          | PRIMARY KEY     |
| categories      | 2200_18269_1_not_null              | CHECK           |
| categories      | 2200_18269_2_not_null              | CHECK           |
| categories      | 2200_18269_4_not_null              | CHECK           |
| categories      | 2200_18269_7_not_null              | CHECK           |
| categories      | 2200_18269_8_not_null              | CHECK           |
| categories      | 2200_18269_9_not_null              | CHECK           |
| categories      | categories_pkey                    | PRIMARY KEY     |
| categories      | categories_slug_key                | UNIQUE          |
| conversations   | 2200_17952_1_not_null              | CHECK           |
| conversations   | 2200_17952_2_not_null              | CHECK           |
| conversations   | 2200_17952_3_not_null              | CHECK           |
| conversations   | 2200_17952_4_not_null              | CHECK           |
| conversations   | conversations_buyer_id_fkey        | FOREIGN KEY     |
| conversations   | conversations_product_id_fkey      | FOREIGN KEY     |
| conversations   | conversations_seller_id_fkey       | FOREIGN KEY     |
| conversations   | conversations_pkey                 | PRIMARY KEY     |
| favorites       | 2200_17699_1_not_null              | CHECK           |
| favorites       | 2200_17699_2_not_null              | CHECK           |
| favorites       | 2200_17699_3_not_null              | CHECK           |
| favorites       | favorites_product_id_fkey          | FOREIGN KEY     |
| favorites       | favorites_user_id_fkey             | FOREIGN KEY     |
| favorites       | favorites_pkey                     | PRIMARY KEY     |
| favorites       | favorites_product_id_user_id_key   | UNIQUE          |
| messages        | 2200_17974_1_not_null              | CHECK           |
| messages        | 2200_17974_2_not_null              | CHECK           |
| messages        | 2200_17974_3_not_null              | CHECK           |
| messages        | 2200_17974_4_not_null              | CHECK           |
| messages        | messages_conversation_id_fkey      | FOREIGN KEY     |
| messages        | messages_sender_id_fkey            | FOREIGN KEY     |
| messages        | messages_pkey                      | PRIMARY KEY     |
| notifications   | 2200_17924_12_not_null             | CHECK           |
| notifications   | 2200_17924_1_not_null              | CHECK           |
| notifications   | 2200_17924_2_not_null              | CHECK           |
| notifications   | 2200_17924_4_not_null              | CHECK           |
| notifications   | 2200_17924_5_not_null              | CHECK           |
| notifications   | 2200_17924_6_not_null              | CHECK           |
| notifications   | notifications_conversation_id_fkey | FOREIGN KEY     |
| notifications   | notifications_product_id_fkey      | FOREIGN KEY     |
| notifications   | notifications_transaction_id_fkey  | FOREIGN KEY     |
| notifications   | notifications_user_id_fkey         | FOREIGN KEY     |
| notifications   | notifications_pkey                 | PRIMARY KEY     |
| notifications   | notifications_event_key_unique     | UNIQUE          |
| product_images  | 2200_18393_1_not_null              | CHECK           |
| product_images  | 2200_18393_2_not_null              | CHECK           |
| product_images  | 2200_18393_3_not_null              | CHECK           |
| product_images  | product_images_product_id_fkey     | FOREIGN KEY     |
| product_images  | product_images_pkey                | PRIMARY KEY     |
| product_reports | 2200_18718_10_not_null             | CHECK           |
| product_reports | 2200_18718_1_not_null              | CHECK           |
| product_reports | 2200_18718_2_not_null              | CHECK           |
| product_reports | 2200_18718_3_not_null              | CHECK           |
| product_reports | 2200_18718_4_not_null              | CHECK           |
| product_reports | 2200_18718_5_not_null              | CHECK           |
| product_reports | 2200_18718_9_not_null              | CHECK           |
| product_reports | product_reports_status_check       | CHECK           |
| product_reports | product_reports_product_id_fkey    | FOREIGN KEY     |
| product_reports | product_reports_reporter_id_fkey   | FOREIGN KEY     |
| product_reports | product_reports_resolved_by_fkey   | FOREIGN KEY     |
| product_reports | product_reports_pkey               | PRIMARY KEY     |
| products        | 2200_17665_1_not_null              | CHECK           |
| products        | 2200_17665_22_not_null             | CHECK           |
| products        | 2200_17665_2_not_null              | CHECK           |
| products        | 2200_17665_3_not_null              | CHECK           |
| products        | 2200_17665_7_not_null              | CHECK           |
| products        | products_market_code_check         | CHECK           |
| products        | products_category_id_fkey          | FOREIGN KEY     |
| products        | products_removed_by_fkey           | FOREIGN KEY     |
| products        | products_subcategory_id_fkey       | FOREIGN KEY     |
| products        | products_user_id_fkey              | FOREIGN KEY     |
| products        | products_pkey                      | PRIMARY KEY     |
| profiles        | 2200_17588_16_not_null             | CHECK           |
| profiles        | 2200_17588_1_not_null              | CHECK           |
| profiles        | 2200_17588_5_not_null              | CHECK           |
| profiles        | profiles_account_status_check      | CHECK           |
| profiles        | profiles_role_check                | CHECK           |
| profiles        | profiles_id_fkey                   | FOREIGN KEY     |
| profiles        | profiles_suspended_by_fkey         | FOREIGN KEY     |
| profiles        | profiles_pkey                      | PRIMARY KEY     |
| reviews         | 2200_18216_10_not_null             | CHECK           |
| reviews         | 2200_18216_1_not_null              | CHECK           |
| reviews         | 2200_18216_2_not_null              | CHECK           |
| reviews         | 2200_18216_3_not_null              | CHECK           |
| reviews         | 2200_18216_4_not_null              | CHECK           |
| reviews         | 2200_18216_5_not_null              | CHECK           |
| reviews         | 2200_18216_6_not_null              | CHECK           |
| reviews         | reviews_accuracy_check             | CHECK           |
| reviews         | reviews_communication_check        | CHECK           |
| reviews         | reviews_rating_check               | CHECK           |
| reviews         | reviews_review_type_check          | CHECK           |
| reviews         | reviews_product_id_fkey            | FOREIGN KEY     |
| reviews         | reviews_reviewed_user_id_fkey      | FOREIGN KEY     |
| reviews         | reviews_reviewer_id_fkey           | FOREIGN KEY     |
| reviews         | reviews_transaction_id_fkey        | FOREIGN KEY     |

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

  | table_name      | column_name        | data_type                | is_nullable |
| --------------- | ------------------ | ------------------------ | ----------- |
| bids            | id                 | uuid                     | NO          |
| bids            | product_id         | uuid                     | NO          |
| bids            | user_id            | uuid                     | NO          |
| bids            | amount             | numeric                  | NO          |
| bids            | created_at         | timestamp with time zone | YES         |
| conversations   | id                 | uuid                     | NO          |
| conversations   | product_id         | uuid                     | NO          |
| conversations   | seller_id          | uuid                     | NO          |
| conversations   | buyer_id           | uuid                     | NO          |
| conversations   | created_at         | timestamp with time zone | YES         |
| favorites       | id                 | uuid                     | NO          |
| favorites       | product_id         | uuid                     | NO          |
| favorites       | user_id            | uuid                     | NO          |
| favorites       | created_at         | timestamp with time zone | YES         |
| messages        | id                 | uuid                     | NO          |
| messages        | conversation_id    | uuid                     | NO          |
| messages        | sender_id          | uuid                     | NO          |
| messages        | content            | text                     | NO          |
| messages        | is_read            | boolean                  | YES         |
| messages        | created_at         | timestamp with time zone | YES         |
| notifications   | id                 | uuid                     | NO          |
| notifications   | user_id            | uuid                     | NO          |
| notifications   | product_id         | uuid                     | YES         |
| notifications   | title              | text                     | NO          |
| notifications   | message            | text                     | NO          |
| notifications   | type               | text                     | NO          |
| notifications   | is_read            | boolean                  | YES         |
| notifications   | created_at         | timestamp with time zone | YES         |
| notifications   | conversation_id    | uuid                     | YES         |
| notifications   | transaction_id     | uuid                     | YES         |
| notifications   | event_key          | text                     | YES         |
| notifications   | metadata           | jsonb                    | NO          |
| product_images  | id                 | uuid                     | NO          |
| product_images  | product_id         | uuid                     | NO          |
| product_images  | image_url          | text                     | NO          |
| product_images  | display_order      | integer                  | YES         |
| product_images  | created_at         | timestamp with time zone | YES         |
| product_images  | storage_path       | text                     | YES         |
| product_reports | id                 | uuid                     | NO          |
| product_reports | product_id         | uuid                     | NO          |
| product_reports | reporter_id        | uuid                     | NO          |
| product_reports | reason             | text                     | NO          |
| product_reports | status             | text                     | NO          |
| product_reports | resolved_by        | uuid                     | YES         |
| product_reports | resolution_reason  | text                     | YES         |
| product_reports | resolved_at        | timestamp with time zone | YES         |
| product_reports | created_at         | timestamp with time zone | NO          |
| product_reports | updated_at         | timestamp with time zone | NO          |
| products        | id                 | uuid                     | NO          |
| products        | user_id            | uuid                     | NO          |
| products        | title              | text                     | NO          |
| products        | description        | text                     | YES         |
| products        | category           | text                     | YES         |
| products        | condition          | text                     | YES         |
| products        | starting_price     | numeric                  | NO          |
| products        | current_price      | numeric                  | YES         |
| products        | location           | text                     | YES         |
| products        | image_url          | text                     | YES         |
| products        | status             | text                     | YES         |
| products        | created_at         | timestamp with time zone | YES         |
| products        | auction_start      | timestamp with time zone | YES         |
| products        | auction_end        | timestamp with time zone | YES         |
| products        | bid_count          | integer                  | YES         |
| products        | winner_id          | uuid                     | YES         |
| products        | category_id        | uuid                     | YES         |
| products        | subcategory_id     | uuid                     | YES         |
| products        | removed_by         | uuid                     | YES         |
| products        | removal_reason     | text                     | YES         |
| products        | removed_at         | timestamp with time zone | YES         |
| products        | market_code        | text                     | NO          |
| profiles        | id                 | uuid                     | NO          |
| profiles        | full_name          | text                     | YES         |
| profiles        | phone              | text                     | YES         |
| profiles        | city               | text                     | YES         |
| profiles        | role               | text                     | NO          |
| profiles        | is_verified        | boolean                  | YES         |
| profiles        | phone_verified     | boolean                  | YES         |
| profiles        | identity_verified  | boolean                  | YES         |
| profiles        | verification_level | text                     | YES         |
| profiles        | created_at         | timestamp with time zone | YES         |
| profiles        | avatar_url         | text                     | YES         |
| profiles        | rating             | numeric                  | YES         |
| profiles        | reviews_count      | integer                  | YES         |
| profiles        | sold_count         | integer                  | YES         |
| profiles        | won_auctions       | integer                  | YES         |
| profiles        | account_status     | text                     | NO          |
| profiles        | suspended_by       | uuid                     | YES         |
| profiles        | suspension_reason  | text                     | YES         |
| profiles        | suspended_at       | timestamp with time zone | YES         |
| reviews         | id                 | uuid                     | NO          |
| reviews         | product_id         | uuid                     | NO          |
| reviews         | reviewer_id        | uuid                     | NO          |
| reviews         | reviewed_user_id   | uuid                     | NO          |
| reviews         | review_type        | text                     | NO          |
| reviews         | rating             | integer                  | NO          |
| reviews         | communication      | integer                  | YES         |
| reviews         | accuracy           | integer                  | YES         |
| reviews         | comment            | text                     | YES         |
| reviews         | created_at         | timestamp with time zone | NO          |
| reviews         | is_published       | boolean                  | YES         |