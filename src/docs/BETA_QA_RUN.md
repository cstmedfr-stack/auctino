# Vandivo Beta QA Run

## Goal

Validate Vandivo with realistic user flows before beta launch.

A flow is not considered ready unless it works with real accounts, real Supabase data, real RLS policies and real browser navigation.

## Test accounts

### Seller

Email:

Status:
- role: user
- account_status: active

### Buyer

Email:

Status:
- role: user
- account_status: active

### Admin

Email:

Status:
- role: admin
- account_status: active

## Test environment

- Browser:
- Device:
- Screen width:
- Supabase project:
- Date:
- Tester:

## Result legend

- PASS: works as expected
- FAIL: broken or unsafe
- REVIEW: works but needs UX/content improvement
- BLOCKER: must fix before beta

---

# 1. Public pages

## 1.1 Homepage

Expected:
- page loads without console errors
- hero search works
- CTA marketplace works
- CTA sell works
- featured auctions load
- trust sections visible
- legal footer links visible

Result:

Notes:

## 1.2 Marketplace

Expected:
- `/dashboard` loads active products
- search works
- filters work
- sort works
- pagination/load more works if available
- empty state is understandable
- product cards link to product pages

Result:

Notes:

## 1.3 Categories

Expected:
- `/categories` loads
- category links work
- empty/error states are acceptable

Result:

Notes:

## 1.4 Legal pages

Expected:
- `/terms` loads
- `/privacy` loads
- `/safety` loads
- `/contact` loads
- footer links work
- sitemap includes legal routes

Result:

Notes:

---

# 2. Authentication

## 2.1 Register new user

Expected:
- user can register
- profile is created
- user is redirected correctly
- navbar updates authenticated state
- no console errors

Result:

Notes:

## 2.2 Login

Expected:
- user can log in
- wrong credentials show clear error
- correct credentials redirect correctly

Result:

Notes:

## 2.3 Logout

Expected:
- user can log out
- private nav disappears
- protected pages are blocked or redirect

Result:

Notes:

---

# 3. Seller flow

## 3.1 Create product

Account:
- seller

Expected:
- `/add-product` loads
- all fields validate correctly
- category/subcategory load
- county/city fields work
- price validation works
- duration selection works
- product can be created

Result:

Notes:

## 3.2 Upload images during create

Expected:
- valid JPEG/PNG/WebP images upload
- invalid file type is rejected
- oversized image is rejected
- product main image updates
- images appear on product page

Result:

Notes:

## 3.3 My products

Expected:
- created product appears in `/my-products`
- seller can view product
- seller can edit product before bids
- seller cannot edit product after bids
- seller can manage images only for own product
- seller can delete/relist only when business rules allow

Result:

Notes:

---

# 4. Buyer flow

## 4.1 View product

Account:
- buyer

Expected:
- buyer can open seller product
- product gallery loads
- price/timer/status are correct
- seller card is visible
- bid panel is visible

Result:

Notes:

## 4.2 Favorite product

Expected:
- buyer can save product
- buyer can remove product from favorites
- `/favorites` updates correctly
- seller cannot affect buyer favorites

Result:

Notes:

## 4.3 Place bid

Expected:
- buyer can place bid above current price
- buyer cannot place bid below/equal current price
- buyer cannot bid if product expired/removed/sold
- seller receives notification
- bid count/current price update
- `/my-bids` shows bid

Result:

Notes:

## 4.4 Seller cannot bid own product

Account:
- seller

Expected:
- seller cannot bid on own product
- bid UI is disabled or replaced with explanation
- database/RPC blocks attempt

Result:

Notes:

---

# 5. Chat flow

## 5.1 Buyer contacts seller

Account:
- buyer

Expected:
- contact seller starts or opens conversation
- buyer can send message
- seller receives notification
- message appears in chat

Result:

Notes:

## 5.2 Seller replies

Account:
- seller

Expected:
- seller sees conversation
- seller can reply
- buyer receives notification
- unread state updates

Result:

Notes:

## 5.3 Conversation privacy

Expected:
- unrelated user cannot see conversation
- direct URL access does not expose private messages

Result:

Notes:

---

# 6. Auction close and transaction

## 6.1 Close expired auction

Expected:
- ended auction can be finalized
- winner is selected correctly
- transaction is created
- product status updates correctly
- buyer/seller can view transaction

Result:

Notes:

## 6.2 Transaction confirmation

Expected:
- seller can confirm
- buyer can confirm
- transaction becomes completed after both confirm
- product becomes sold
- both users receive relevant state

Result:

Notes:

## 6.3 Cancel transaction

Expected:
- transaction can be cancelled only when allowed
- reason validation works
- product returns to ended/relistable state if applicable
- both users are notified

Result:

Notes:

## 6.4 Open dispute

Expected:
- buyer/seller can open dispute when allowed
- reason validation works
- transaction status becomes disputed
- admin sees dispute

Result:

Notes:

---

# 7. Reviews

## 7.1 Create review

Expected:
- review can be created only after completed transaction
- buyer can review seller
- seller can review buyer
- user cannot review self
- duplicate review is blocked/returns existing review
- public profile rating updates

Result:

Notes:

---

# 8. Reports

## 8.1 Report product

Account:
- buyer

Expected:
- buyer can report seller product
- buyer cannot report own product
- duplicate report is handled clearly
- admin receives/loads report

Result:

Notes:

## 8.2 Admin dismiss report

Account:
- admin

Expected:
- admin can dismiss report with reason
- reporter gets notification
- product remains active

Result:

Notes:

## 8.3 Admin remove reported product

Expected:
- admin can remove product with reason
- product becomes removed
- seller and reporters get notification
- removed product is not publicly listed

Result:

Notes:

---

# 9. Admin

## 9.1 Admin dashboard

Expected:
- admin can open `/admin`
- dashboard cards load
- recent disputes/reports load if available

Result:

Notes:

## 9.2 Admin users

Expected:
- admin can open `/admin/users`
- users load
- admin can suspend normal user
- admin can reactivate normal user
- admin cannot suspend self
- normal users cannot use admin RPC

Result:

Notes:

## 9.3 Admin reports

Expected:
- `/admin/reports` loads
- open reports display correctly
- dismiss/remove actions work
- empty state works

Result:

Notes:

## 9.4 Admin disputes

Expected:
- `/admin/disputes` loads
- disputed transactions display correctly
- resolve completed works
- resolve cancelled works
- normal users cannot resolve disputes

Result:

Notes:

---

# 10. Suspended account

## 10.1 Suspended user access

Expected:
- suspended user is redirected or blocked
- suspended user cannot create product
- suspended user cannot bid
- suspended user cannot message
- suspended user sees clear account status page

Result:

Notes:

---

# 11. Notifications

Expected:
- user sees own notifications only
- mark one as read works
- mark all as read works
- dropdown count updates
- notifications page filters work

Result:

Notes:

---

# 12. Responsive QA

Test widths:

- 360px
- 390px
- 768px
- 1024px
- 1440px

Pages:

- home
- dashboard
- product page
- add product
- profile
- chat
- transactions
- admin pages

Expected:
- no horizontal scroll
- navbar mobile menu works
- filters drawer works
- cards stack correctly
- forms are usable
- buttons are easy to tap

Result:

Notes:

---

# 13. Error states

Expected:
- unknown route shows custom 404
- loading state appears where needed
- auth errors are clear
- validation errors are clear
- no raw database errors shown to normal users where avoidable

Result:

Notes:

---

# 14. Final technical checks

Commands:

```bash
npm run i18n:audit > i18n-audit-beta-qa.txt
npm run lint
npm run build

---

# Batch 34B - Transaction + Review + Admin QA

## Starting state

Seller account:

Buyer account:

Admin account:

Product tested:

Product ID:

Current product status before test:

Bid count:

Highest bidder:

---

# 1. Auction close / transaction creation

## 1.1 Expire or close auction

Expected:
- auction can be finalized only after it is ended/expired
- highest bidder becomes winner
- transaction is created
- product status changes correctly
- buyer and seller can view transaction

Result:

Notes:

## 1.2 Buyer transaction access

Expected:
- buyer can open transaction page
- buyer sees product details
- buyer sees seller details
- buyer can confirm transaction when allowed
- buyer cannot access unrelated transactions

Result:

Notes:

## 1.3 Seller transaction access

Expected:
- seller can open transaction page
- seller sees buyer details
- seller can confirm transaction when allowed
- seller cannot access unrelated transactions

Result:

Notes:

---

# 2. Transaction confirmation

## 2.1 Seller confirms

Expected:
- seller can confirm own side
- transaction remains pending if buyer has not confirmed
- confirmation timestamp/state updates
- buyer sees updated state

Result:

Notes:

## 2.2 Buyer confirms

Expected:
- buyer can confirm own side
- transaction becomes completed after both confirmed
- product becomes sold
- transaction shows completed state
- both users see final state

Result:

Notes:

---

# 3. Reviews

## 3.1 Buyer reviews seller

Expected:
- buyer can review seller after completed transaction
- rating/comment save correctly
- seller public profile updates
- duplicate review is blocked or returns existing review

Result:

Notes:

## 3.2 Seller reviews buyer

Expected:
- seller can review buyer after completed transaction
- buyer public profile updates
- user cannot review self
- review appears correctly where expected

Result:

Notes:

---

# 4. Report product

## 4.1 Buyer reports product

Expected:
- buyer can report product
- reason validation works
- duplicate report is handled clearly
- admin can see report

Result:

Notes:

## 4.2 Seller cannot report own product

Expected:
- seller cannot report own product
- UI or RPC blocks action clearly

Result:

Notes:

---

# 5. Admin reports

## 5.1 Admin views reports

Expected:
- admin can open /admin/reports
- open reports load
- reported product details are visible
- reporter/seller context is visible

Result:

Notes:

## 5.2 Admin dismisses report

Expected:
- admin can dismiss report with reason
- report status changes
- product remains active
- reporter receives notification if implemented

Result:

Notes:

## 5.3 Admin removes reported product

Expected:
- admin can remove product with reason
- product status becomes removed
- removed product disappears from public marketplace
- seller receives notification if implemented

Result:

Notes:

---

# 6. Admin users

## 6.1 Admin opens users page

Expected:
- admin can open /admin/users
- users load
- email/name/status/role information is visible as intended

Result:

Notes:

## 6.2 Admin suspends normal user

Expected:
- admin can suspend seller or buyer
- reason validation works
- user account_status becomes suspended
- suspended user is redirected/blocked
- suspended user cannot create product, bid or message

Result:

Notes:

## 6.3 Admin reactivates user

Expected:
- admin can reactivate suspended user
- account_status becomes active
- user can access platform again

Result:

Notes:

## 6.4 Admin cannot suspend self

Expected:
- self-suspension is blocked
- clear error appears
- account remains active

Result:

Notes:

---

# 7. Disputes

## 7.1 Open dispute

Expected:
- buyer or seller can open dispute when transaction state allows
- reason validation works
- transaction becomes disputed
- admin can see dispute in /admin/disputes

Result:

Notes:

## 7.2 Admin resolves dispute as completed

Expected:
- admin can resolve disputed transaction as completed
- transaction becomes completed
- product becomes sold
- buyer and seller are notified or see updated state

Result:

Notes:

## 7.3 Admin resolves dispute as cancelled

Expected:
- admin can resolve disputed transaction as cancelled
- product returns to ended/relistable state if applicable
- buyer and seller see updated state

Result:

Notes:

---

# 8. Normal user admin protection

## 8.1 Buyer tries admin pages

Expected:
- buyer cannot access /admin
- buyer cannot access /admin/users
- buyer cannot access /admin/reports
- buyer cannot access /admin/disputes
- no admin data is visible

Result:

Notes:

## 8.2 Seller tries admin pages

Expected:
- seller cannot access admin pages
- no admin data is visible

Result:

Notes:

---

# 9. Result

Launch blockers found:

Non-blocking improvements:

Decision:
- PASS
- FAIL
- REVIEW