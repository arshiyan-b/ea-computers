# EA Computers

A production-quality e-commerce platform for a Pakistani computer & technology hardware
retailer — laptops, desktops, GPUs, CPUs, components, peripherals and accessories.

Built as a modular monolith:

- **Backend** — NestJS + PostgreSQL + Prisma, REST API, JWT auth, Swagger docs
- **Storefront** — Next.js (App Router) + TypeScript + Tailwind CSS + Zustand
- **Admin** — Refine + Ant Design, consuming the same REST API

Everything runs as plain Node.js processes on your machine — no containers anywhere in
this project.

---

## 1. Architecture

```text
                         Cloudflare
                             |
                             v
                    Next.js Storefront ──┐
                                          │  REST API (JWT bearer + guest cart cookie)
                    Refine Admin ────────►│
                                          v
                                 NestJS Backend API
                                          |
                     +--------------------+--------------------+
                     |                    |                    |
                     v                    v                    v
                PostgreSQL             Prisma          Local / S3 / Cloudinary
                                                           image storage
```

Backend modules (`apps/backend/src/`):

```text
auth/        JWT auth, Passport strategy, JwtAuthGuard, RolesGuard, @Public/@OptionalAuth/@Roles
users/       User lookups, password hashing (bcrypt)
categories/  Hierarchical categories (self-referencing parentId)
brands/      Hardware brands
products/    Catalog, search/filter/sort/pagination, images, flexible specifications
cart/        Guest (signed cookie) + authenticated cart, guest→user merge on login
checkout/    Transactional, server-authoritative order creation
orders/      Customer order history + admin order management
admin/       Dashboard stats, admin order/user endpoints
uploads/     Swappable local/S3/Cloudinary image storage
health/      Liveness + DB connectivity check
common/      Shared DTOs, filters, pagination & sort helpers
prisma/      PrismaService/PrismaModule
```

Every write path (checkout, cart quantity, order creation) treats the database as the
single source of truth: **prices, stock and product names are always re-read from
PostgreSQL, never trusted from the client.**

---

## 2. Prerequisites

- Node.js 20+ and npm 10+
- A local PostgreSQL server (any recent version — developed against 16, tested fine
  against 18 too), installed directly on your machine (e.g. the official Windows/Mac
  installer, or your OS package manager)

---

## 3. Quick Start (local development)

### 3.1 Create the database

Using `psql` (or pgAdmin, or any client) against your local Postgres server:

```bash
psql -U postgres -c "CREATE DATABASE ea_computers;"
```

### 3.2 Backend

```bash
cd apps/backend
cp .env.example .env
```

Edit `.env` and set `DATABASE_URL` to match your local Postgres (adjust user/password/port
as needed):

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/ea_computers?schema=public"
```

Then:

```bash
npm install
npx prisma generate
npx prisma migrate dev    # creates the schema
npx prisma db seed        # loads demo categories/brands/products + an admin & customer user
npm run start:dev         # http://localhost:4000/api  (Swagger: http://localhost:4000/docs)
```

Seeded accounts (development only — **change the admin password before any real
deployment**):

| Role     | Email                     | Password        |
| -------- | ------------------------- | ---------------- |
| Admin    | admin@eacomputers.com     | ChangeMe123!     |
| Customer | customer@example.com      | Customer123!     |

### 3.3 Storefront

```bash
cd apps/storefront
cp .env.example .env.local
npm install
npm run dev                # http://localhost:3000
```

### 3.4 Admin dashboard

```bash
cd apps/admin
cp .env.example .env.local
npm install
npm run dev                # http://localhost:5174
```

> The admin dev server's default port (5174) is already included in the backend's
> `CORS_ORIGINS`. If you change it, update `apps/backend/.env` to match.

### 3.5 Running all three servers together

Each app (§3.2–3.4) is its own long-running process — start them in **three separate
terminal tabs/windows**, left open, one command per tab:

```bash
# terminal 1
cd apps/backend && npm run start:dev

# terminal 2
cd apps/storefront && npm run dev

# terminal 3
cd apps/admin && npm run dev
```

(Run the one-time `npm install`/`.env` setup from §3.2–3.4 first if you haven't already.)
Once all three are up:

| App              | URL                          |
| ----------------- | ----------------------------- |
| Backend API        | http://localhost:4000/api    |
| Swagger docs       | http://localhost:4000/docs   |
| Storefront          | http://localhost:3000        |
| Admin dashboard     | http://localhost:5174        |

Start the backend first — the storefront and admin both call it on load and will show
fetch errors until it's up. To stop a server, focus its terminal and press `Ctrl+C`.

---

## 4. Environment Variables

Each app has an `.env.example` documenting its variables. Backend highlights:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ea_computers?schema=public
JWT_SECRET=change-me-to-a-long-random-string-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:5173,http://localhost:5174
CART_COOKIE_NAME=ea_cart_sid
CART_COOKIE_SECRET=change-me-too-another-long-random-string
STORAGE_PROVIDER=local        # local | s3 | cloudinary
```

`STORAGE_PROVIDER=s3` works with AWS S3 or any S3-compatible service (MinIO, DigitalOcean
Spaces, Cloudflare R2, ...) via `S3_ENDPOINT`/`S3_ACCESS_KEY`/`S3_SECRET_KEY`/`S3_BUCKET`.
`STORAGE_PROVIDER=cloudinary` is the documented alternative. Neither is required for local
development — the default `local` provider writes to `apps/backend/uploads/` and serves it
back through the API.

`REDIS_URL` is present in `.env.example` but **not required to run the app** — it's
reserved for future caching/rate-limiting/queue use (see §9) and nothing reads it today.

**Never commit real secrets.** `.env` files are gitignored; only `.env.example` files are
tracked.

---

## 5. Database

- Prisma schema: `apps/backend/prisma/schema.prisma`
- Migrations: `apps/backend/prisma/migrations/`
- Seed script: `apps/backend/prisma/seed.ts` (idempotent — safe to re-run)

Common commands (run from `apps/backend`):

```bash
npx prisma migrate dev --name <description>   # create + apply a new migration
npx prisma migrate deploy                     # apply pending migrations (production)
npx prisma studio                             # visual data browser
npx prisma migrate reset --force              # ⚠ wipes and re-seeds the dev database
```

---

## 6. Testing

Backend has both unit tests (mocked Prisma — no database needed) and e2e tests (a real
Postgres database, per `DATABASE_URL`):

```bash
cd apps/backend
npm test                 # 44 unit tests — auth, products, cart, checkout, orders, guards
npm run test:e2e         # 33 e2e tests — full HTTP round-trips against a real database
```

e2e coverage includes: registration/login/invalid-credentials, admin-only route
authorization, product CRUD + validation, guest cart + stock limits + cart merge on login,
checkout (empty cart, insufficient stock, server-computed totals, stock decrement, cart
clearing), and order access control (a customer can only ever see their own orders; an
admin can see and update any order).

> e2e tests create their own throwaway users/categories/products (unique per run) directly
> in whatever database `DATABASE_URL` points at — point it at a disposable database, not
> one with data you care about.

---

## 7. API Documentation

Swagger/OpenAPI is served at **`http://localhost:4000/docs`** once the backend is running,
covering every module (auth, products, categories, brands, cart, checkout, orders, admin,
uploads). Use the "Authorize" button with a bearer token from `POST /auth/login` to try
protected endpoints interactively.

---

## 8. Production deployment notes

There's no Docker setup in this project by design — deploy each app the way you'd deploy
any plain Node.js/static app:

- **Backend**: `npm run build` then `node dist/main.js` (run `npx prisma migrate deploy`
  against the production database first). Needs a long-lived process manager (systemd,
  pm2, your host's equivalent) and all the `.env` variables set as real environment
  variables, not a checked-in file.
- **Storefront**: `npm run build` then `npm run start` (Next.js's own Node server), or
  deploy to any platform with first-class Next.js support. `NEXT_PUBLIC_API_URL` is baked
  in at build time — set it before building.
- **Admin**: `npm run build` produces a static `dist/` folder (Vite) — serve it from any
  static host/CDN with SPA fallback routing (rewrite all paths to `index.html`).
  `VITE_API_URL` is also baked in at build time.

---

## 9. What's deliberately not here yet

Per the project's own scope: no online payment gateway (Cash on Delivery only), no
microservices, no Meilisearch (Postgres `contains` search for now — `products/` is
structured so a real search engine can replace it without touching the controller layer),
no reviews/wishlist/coupons, no Redis-backed caching yet (the config is there, unused).
These are documented as straightforward future modules, not oversights:

```text
PaymentsModule   ShippingModule   ReviewsModule   WishlistModule
CouponsModule    NotificationsModule   InventoryModule (dedicated)   SearchModule (Meilisearch)
```

### Known follow-ups before a real deployment

- **Next.js version**: pinned to the latest `14.2.x` patch. `npm audit` still flags
  advisories that are only fixed by Next 16 (a breaking major-version jump); upgrading
  and re-testing the App Router setup is recommended before production use.
- **Admin category/brand select search**: the backend validates query parameters with
  a strict allow-list (`forbidNonWhitelisted`) by design, so the admin's category/brand
  pickers load the full list rather than searching server-side as you type. Fine at
  today's catalog size; revisit if the catalog grows into the thousands.

---

## 10. Project Structure

```text
ea-computers/
├── apps/
│   ├── backend/     NestJS REST API
│   ├── storefront/  Next.js customer storefront
│   └── admin/       Refine + Ant Design admin dashboard
└── README.md
```
