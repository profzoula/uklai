# Briclix — E-commerce Platform

A modern e-commerce website built with Next.js, styled after [PrebuiltUI Design](https://design.prebuiltui.com/), with Supabase database, Stripe payments, and a structured admin dashboard.

## Features

- **Storefront** — Hero, categories, featured products, testimonials, newsletter
- **Shopping Cart** — Persistent cart with Zustand
- **Stripe Checkout** — Secure payment processing
- **Supabase** — Database, auth, and row-level security
- **Admin Dashboard** — Products, orders, categories, customers, settings
- **Mock Data** — Works out of the box without configuration

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL + Auth)
- Stripe
- Zustand (cart state)
- Lucide React (icons)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the store works with mock data immediately.

### 3. Configure Supabase (optional)

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the SQL Editor
3. Copy `.env.local.example` to `.env.local` and add your keys

To make a user admin:

```sql
UPDATE profiles SET is_admin = true WHERE email = 'your@email.com';
```

### 4. Configure Stripe (optional)

1. Create an account at [stripe.com](https://stripe.com)
2. Add your keys to `.env.local`
3. Set up webhook endpoint: `https://your-domain.com/api/webhooks/stripe`
4. Listen for `checkout.session.completed` events

For local testing:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Project Structure

```
src/
├── app/
│   ├── (store)/          # Public storefront
│   │   ├── page.tsx      # Homepage
│   │   ├── shop/         # Product listing
│   │   ├── products/     # Product detail
│   │   ├── cart/         # Shopping cart
│   │   └── checkout/     # Success page
│   ├── admin/            # Admin dashboard
│   │   ├── products/     # Product management
│   │   ├── orders/       # Order management
│   │   ├── categories/   # Category management
│   │   └── settings/     # Store settings
│   ├── auth/             # Login & signup
│   └── api/              # API routes
├── components/
│   ├── store/            # Storefront components
│   └── admin/            # Admin components
├── lib/                  # Utilities & data fetching
├── store/                # Zustand stores
└── types/                # TypeScript types
supabase/
└── schema.sql            # Database schema + seed data
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage with hero, categories, products |
| `/shop` | All products with category filters |
| `/products/[slug]` | Product detail page |
| `/cart` | Shopping cart & checkout |
| `/admin` | Admin dashboard overview |
| `/admin/products` | Manage products |
| `/admin/orders` | View orders |
| `/auth/login` | User login |

## License

MIT
