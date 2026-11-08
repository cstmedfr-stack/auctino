# Vandivo Production Checklist

## Environment

- NEXT_PUBLIC_SITE_URL is set to https://vandivo.ro
- Supabase project URL and anon key are configured
- Supabase Storage buckets are public where needed
- Product image bucket works
- Avatar bucket works
- Email confirmation settings are configured
- Authentication redirect URLs are configured for production domain

## Domains

- vandivo.ro points to production
- www.vandivo.ro redirects to vandivo.ro
- vandivo.com redirects to vandivo.ro
- vandivo.fr is reserved for France launch

## SEO

- Global metadata is configured
- Open Graph metadata is configured
- Twitter metadata is configured
- robots.txt is generated
- sitemap.xml is generated
- 404 page exists
- error page exists
- legacy routes redirect correctly

## Core flows

- Register
- Login
- Logout
- Add product
- Edit product
- Upload product images
- Delete product image
- Marketplace search and filters
- Product page
- Favorite product
- Place bid
- Receive bids
- Finalize auction
- Transaction confirmation
- Reviews
- Chat
- Notifications
- Public profile
- Private profile
- Suspend account
- Admin users
- Admin reports
- Admin disputes

## Responsive QA

Test these widths:

- 375px
- 390px
- 430px
- 768px
- 1024px
- 1440px

Pages:

- /
- /dashboard
- /categories
- /products/[id]
- /add-product
- /edit-product/[id]
- /my-products
- /my-bids
- /received-bids
- /transactions
- /chat
- /notifications
- /favorites
- /profile
- /account/profile
- /admin
- /admin/users
- /admin/reports
- /admin/disputes

## Final commands

```bash
npm run i18n:audit
npm run lint
npm run build