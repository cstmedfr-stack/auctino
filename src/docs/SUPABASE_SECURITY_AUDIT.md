# Auctino Supabase Security Audit

## Goal

Validate that Auctino can safely accept real users during beta.

Client-side checks are not security. Supabase RLS policies, storage policies and secure RPC functions must enforce the real rules.

## Security priorities

- Users can only modify their own private data.
- Public data is intentionally public.
- Private profile data is not exposed through public queries.
- Buyers cannot manage seller data.
- Sellers cannot manage buyer data.
- Users cannot insert bids as someone else.
- Users cannot bid on their own products.
- Users cannot read private conversations unless they are participants.
- Users cannot read notifications that belong to someone else.
- Users cannot update transaction state unless they are buyer/seller/admin.
- Users cannot create reviews outside valid completed transactions.
- Users cannot resolve reports/disputes unless they are admins.
- Admin actions are enforced at database level, not only in UI.
- Storage uploads are path-scoped and owner-controlled.

## Tables to audit

- profiles
- products
- product_images
- favorites
- bids
- conversations
- messages
- notifications
- transactions
- reviews
- product_reports
- disputes

## Storage buckets to audit

- product-images
- avatars

## RPC/functions to audit

Known functions used by the app:

- get_public_product_bids
- set_own_avatar
- remove_own_avatar
- close_expired_auctions
- any transaction-related RPC
- any admin/report/dispute RPC
- any bid-related RPC

## Expected security model

### profiles

Public:
- limited profile information can be read for public profile pages.

Private:
- phone and private account details should not be broadly public unless intentionally exposed.
- users may update their own editable profile fields.
- admins may read/update moderation fields if needed.

### products

Public:
- active marketplace products can be read publicly.
- removed products should not be publicly visible unless viewer is owner or admin.

Owner:
- owner can create products.
- owner can edit products only while allowed by business rules.
- owner cannot edit/delete products once bids or locked statuses exist unless rules allow.

Admin:
- admin can moderate/remove products.

### product_images

Public:
- images for visible products can be read.

Owner:
- product owner can upload/delete images for own editable products.

Admin:
- admin may moderate if needed.

### favorites

Private:
- authenticated users can read/create/delete only their own favorites.

### bids

Private-sensitive:
- users can insert own bids only.
- users cannot bid on own products.
- users cannot bid on ended/removed/sold products.
- raw bidder identity should not be publicly exposed unless intentionally needed.
- sellers may see bids on their own products.
- buyers may see their own bids.

### conversations and messages

Private:
- only participants can read conversations.
- only participants can send/read messages.
- users cannot inject messages into other conversations.

### notifications

Private:
- users can read/update only notifications addressed to them.

### transactions

Private:
- seller and buyer can read related transaction.
- seller and buyer can update only allowed confirmation fields.
- admins may read/resolve where needed.

### reviews

Public/private mixed:
- public can read published reviews.
- only eligible transaction participants can create reviews.
- users cannot review themselves.
- duplicate reviews should be blocked.

### reports

Private/admin:
- authenticated users can create reports.
- admins can read/update reports.
- normal users should not see all reports.

### disputes

Private/admin:
- buyer/seller can read own dispute if applicable.
- admins can read/update all disputes.
- normal users cannot resolve disputes.

### storage: product-images

- public read is acceptable if images are meant to be public.
- authenticated upload only.
- user can upload only to allowed path.
- user can delete only images they own or images linked to their products.
- oversized/type validation exists in app, but storage policies still matter.

### storage: avatars

- public read is acceptable.
- authenticated upload only.
- user can upload only to their own path.
- user can delete only their own avatar.

## Launch blocker rules

Do not launch beta if:

- RLS is disabled on user-data tables.
- anon has direct write access to protected tables.
- authenticated users can read private rows belonging to other users.
- users can update another user's profile/product/bid/conversation/message.
- users can read other users' notifications.
- users can resolve reports or disputes without admin role.
- storage buckets allow arbitrary authenticated uploads to shared paths.
- security definer functions do not validate the caller.