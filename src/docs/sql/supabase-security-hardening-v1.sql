begin;

-- 1. Remove unnecessary dangerous table privileges.
-- RLS does not make these privileges useful for the app.
revoke truncate, references, trigger
on all tables in schema public
from anon, authenticated;

-- 2. Categories and subcategories are public-read only from the app.
-- Admin editing should be done through controlled admin tools/RPC later, not direct anon/auth writes.
revoke insert, update, delete
on public.categories, public.subcategories
from anon, authenticated;

-- 3. Anonymous users should not have direct SELECT grants on private communication tables.
revoke select
on public.conversations,
   public.messages,
   public.notifications
from anon;

-- 4. Remove broad direct bid visibility.
-- Public bid display should go through get_public_product_bids(), which anonymizes the result.
drop policy if exists "Anyone can view bids"
on public.bids;

-- 5. Replace broad product_images SELECT policy.
drop policy if exists "Public can read product images"
on public.product_images;

create policy "Public can read active product images"
on public.product_images
for select
to public
using (
  exists (
    select 1
    from public.products p
    where
      p.id = product_images.product_id
      and p.status = 'active'
  )
);

create policy "Authenticated users can read allowed product images"
on public.product_images
for select
to authenticated
using (
  exists (
    select 1
    from public.products p
    where
      p.id = product_images.product_id
      and (
        p.status in ('active', 'ended', 'expired')
        or p.user_id = auth.uid()
        or p.winner_id = auth.uid()
        or exists (
          select 1
          from public.transactions t
          where
            t.product_id = p.id
            and (
              t.seller_id = auth.uid()
              or t.buyer_id = auth.uid()
            )
        )
        or public.is_active_admin()
      )
  )
);

-- 6. Clean old brand name from storage policy.
alter policy "Public can read product images"
on storage.objects
rename to "Public can read Vandivo product images";

commit;