# Auctino Pre-launch QA

## Goal

Validate that Auctino is ready for a controlled beta launch in Romania.

## Brand consistency

- Auctino name is used everywhere in UI
- No old project name references remain in UI.
- Metadata uses Auctino
- Footer uses Auctino
- Loading pages use Auctino
- Local storage keys use auctino
- Domain references use auctino.ro
- Future France domain is documented as auctino.fr

## Public pages

### Home

- Hero loads correctly
- Primary CTA leads to marketplace or product creation
- Trust section is visible
- Featured auctions load
- FAQ is readable on mobile
- Final CTA is visible
- No horizontal scroll on mobile

### Marketplace

- Products load
- Search works
- Filters work
- Sort works
- Reset filters works
- Mobile filter drawer works
- Load more works
- Empty state works
- Error state works

### Product page

- Gallery loads
- Price is visible
- Auction timer works
- Favorite button works
- Seller card is visible
- Contact seller works
- Bid form works
- Bid validation works
- Report product works
- Similar products load
- Removed products are handled correctly

### Public profile

- Profile hero loads
- Trust score loads
- Badges load
- Reviews load
- User products load
- Missing profile state works

## Auth flows

### Register

- Empty form validation
- Invalid email validation
- Password validation
- Successful registration
- Redirect after register
- Error state

### Login

- Empty form validation
- Invalid login error
- Successful login
- Redirect after login
- Suspended account handling

### Logout

- Logout works from desktop navbar
- Logout works from mobile navbar
- Logout redirects to login

## Seller flows

### Add product

- Required fields validation
- Price validation
- Category selection
- Subcategory selection
- County/location selection
- Auction duration selection
- Product creation success
- Product creation error

### Product images

- Upload image
- Reject invalid type
- Reject oversized image
- Delete image
- Main image displays
- Image gallery displays

### My products

- Active products show
- Ended products show
- Removed products show
- Delete confirmation works
- Relist works
- Edit blocked when product has bids
- Delete blocked when product has bids

## Buyer flows

### Favorites

- Add favorite
- Remove favorite
- Favorites page loads
- Empty favorites state

### Bidding

- Cannot bid while logged out
- Cannot bid on own product
- Cannot bid below minimum
- Successful bid updates price
- Bid history updates
- Auction extension notice appears when needed

### Received bids

- Seller sees received bids
- Filters work
- Product cards display correct status

### My bids

- Buyer sees placed bids
- Filters work
- Winning/losing states are clear

## Transaction flows

- Auction ends
- Transaction page becomes available
- Seller confirmation works
- Buyer confirmation works
- Review form works
- Review validation works
- Completed transaction state works

## Communication

### Chat

- Conversation opens from product page
- Message sends
- Message list updates
- Conversation search works
- Product context is visible

### Notifications

- Notification bell count works
- Dropdown opens
- Mark as read works
- Mark all as read works
- Notifications page filters work

## Admin flows

- Admin dashboard loads
- Admin users load
- Suspend user works
- Reactivate user works
- Reports load
- Report resolution works
- Disputes load
- Dispute resolution works
- Non-admin users cannot access admin pages

## System pages

- /robots.txt works
- /sitemap.xml works
- 404 page works
- error page works
- /cont redirects to /profile
- /licitatii redirects to /dashboard
- /edit-profile redirects to /account/profile

## Responsive widths

Test:

- 375px
- 390px
- 430px
- 768px
- 1024px
- 1440px

## Final commands

```bash
npm run i18n:audit
npm run lint
npm run build