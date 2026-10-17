# Yaoundé and Douala Marketplace

A complete Next.js source project built from **Yaounde_Douala_Ecommerce_Project_Plan.pdf**, version 1.0, 15 October 2026. The attached 27-page plan is the product source of truth. No live merchant, retail price, testimonial, operator identity or photograph has been invented.

The application includes the documented public, buyer, seller and administration interfaces. Core database and API operations are implemented. **This is not a production payment integration:** MTN, Orange, contact verification, private evidence storage and onward settlement need approved contracts and adapters. Unsupported financial operations fail with an explicit error; the application never fabricates a successful payment.

## 1. What the documentation describes

A responsive website and installable PWA connecting buyers with participating shop owners across Yaoundé and Douala. Buyers discover markets, inspect seller-confirmed retail offers, compare equivalent packages, order from one shop at a time and collect from the verified shop. MTN Mobile Money and Orange Money are the documented payment methods. Successful purchase payments allocate **10%** to the platform, using integer-franc, half-up rounding. Refunds reverse the related allocations.

Mokolo and Mfoundi in Yaoundé, and Mboppi and Marché Central in Douala, are **proposed pilot markets**. They are not verified live locations or a complete register of either city. The plan's 40 shops, 400 offers and 90% freshness figures are planning targets, not existing inventory.

## 2. Stack

- Next.js 16.4.2, React 19, TypeScript and the App Router.
- Tailwind CSS 4; locally owned shadcn/ui-style primitives using Radix Slot and class-variance-authority; lucide icons.
- Framer Motion with reduced-motion support; light/dark theme support.
- Next.js route handlers; Prisma 6 and PostgreSQL.
- NextAuth.js 4 credentials structure, bcrypt password hashes, JWT sessions, database-backed role checks and TOTP checks for staff.
- Web manifest, install icons, service worker and a connection-status screen.

The user's explicit Next.js instruction supersedes the PDF's vanilla HTML/CSS/JavaScript preference. Node.js and PostgreSQL are retained.

## 3. Run locally

Install Node.js 22 LTS and PostgreSQL 17 or newer, then open this project folder:

```bash
npm install
cp .env.example .env
```

Create two different secrets and place them in `.env`:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Use the first for `NEXTAUTH_SECRET` and the second for `AUTH_ENCRYPTION_KEY`. Replace `DATABASE_URL` with the connection string for a database you own. Keep `APP_ORIGIN`, `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` at `http://localhost:3000` for local development.

If Docker is available, the supplied Compose file can start a local PostgreSQL database:

```bash
POSTGRES_PASSWORD=choose-a-local-password docker compose up -d db
```

Set the same database password in `DATABASE_URL`. The database port is bound to localhost.

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Open `http://localhost:3000`. The seed creates the two cities, four proposed pilot markets, documented ordinary-goods categories and unit candidates. It creates **no user, verified shop, purchasable offer or fabricated retail price**. An empty real catalogue is expected.

### Preview without a database

For an interactive layout preview, set `NEXT_PUBLIC_PREVIEW_MODE=true` in your local `.env`, then run `npm run dev`. It displays `[PLACEHOLDER]` products and a placeholder shop. Preview mutations intentionally return a clear configuration error rather than pretending to save data. Restore the flag to `false` before using the real API.

To create a static interface preview:

```bash
npm run preview:export
```

This builds a separate ignored staging tree and exports `out/`. It does not remove or replace the real Next.js API. The export includes only the documented routes and clearly marked placeholder records. It does not expose a production authentication or payment backend.

### Administrator provisioning

Set `ADMIN_EMAIL`, a strong `ADMIN_PASSWORD` of at least 16 characters, and `ADMIN_TOTP_SECRET` in the process environment. The authenticator secret must be the Base32 secret enrolled in the administrator's authenticator app. Set `AUTH_ENCRYPTION_KEY` first.

```bash
npm run admin:bootstrap
```

For subsequent staff accounts, an administrator first assigns the role. Set `STAFF_EMAIL`, `STAFF_TOTP_SECRET`, `AUTH_ENCRYPTION_KEY` and `STAFF_ENROLMENT_REASON` in a controlled process, then run `npm run staff:enrol`. The command refuses to overwrite an enrolled authenticator.

The bootstrap command creates the initial administrator once and never overwrites an existing account. Its display name is `[PLACEHOLDER]`; update it through the profile screen. No password or secret is printed. Administrator login requires the password and a six-digit authenticator code. Staff operations require an authenticator sign-in within the last 15 minutes; sign out and sign in again to renew it. Provision subsequent staff authenticator secrets through the controlled `staff:enrol` command described below. There are no shared demo credentials or browser-based privilege escalation shortcuts.

## 4. Site map

All routes below correspond to the PDF's public catalogue, buyer account, seller account, administration screens, required notices or collection forms.

| Area               | Routes                                                                                                                                                                            |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Home and discovery | `/`, `/markets`, `/markets/[id]`, `/shops/[id]`                                                                                                                                   |
| Offers             | `/products`, `/products/[id]`, `/compare`                                                                                                                                         |
| Authentication     | `/signup`, `/login`                                                                                                                                                               |
| Purchase           | `/cart`, `/checkout`, `/payments/[orderId]`                                                                                                                                       |
| Buyer              | `/account/orders`, `/account/orders/[id]`, `/account/orders/[id]/receipt`, `/account/addresses`, `/account/profile`                                                               |
| After sales        | `/support`, `/refunds`                                                                                                                                                            |
| Seller             | `/seller`, `/seller/onboarding`, `/seller/shop`, `/seller/products`, `/seller/products/new`, `/seller/products/[id]`, `/seller/import`, `/seller/orders`, `/seller/settlements`   |
| Administration     | `/admin`, `/admin/markets`, `/admin/verification`, `/admin/catalogue`, `/admin/payments`, `/admin/payouts`, `/admin/users`, `/admin/audit`, `/admin/collection`, `/admin/support` |
| Required notices   | `/legal/privacy`, `/legal/terms`, `/legal/refunds`, `/legal/merchant`                                                                                                             |

The optional catch-all App Router page resolves these paths through reusable screen components. Real IDs are supported in the server application; the static preview exports the four pilot markets and placeholder detail paths only.

## 5. Source structure

```text
app/
  [[...path]]/page.tsx             Route resolution and metadata
  api/[...path]/route.ts           Validated API entry point
  api/auth/[...nextauth]/route.ts  NextAuth entry point
  layout.tsx                      Providers, metadata, PWA settings
  globals.css                     Responsive light/dark design system
  loading.tsx                     Loading boundary
  error.tsx                       Error boundary
  not-found.tsx                   Not-found screen
components/
  screens/public.tsx              Home, markets, shops, search, detail, comparison, notices
  screens/buyer.tsx               Authentication, cart, checkout, orders, receipts, support
  screens/seller.tsx              Onboarding, shop, offers, import, orders, settlement
  screens/admin.tsx               Coverage, records, moderation, finance, access, collection
  ui/                             Reusable button, input/select/textarea and badge primitives
  providers.tsx                   Language, city, cart, comparison, session and theme state
  shared.tsx                      Forms, cards, tables, labels, status and loading UI
  shell.tsx                       Public and workspace navigation
  site-router.tsx                 Documented screen map
  query-router.tsx                Static-preview query adapter
lib/
  server/auth.ts                  Credentials, TOTP, JWT/session callbacks
  server/security.ts              Origin, role, ownership, body limits and audit helpers
  server/handlers.ts              Route-specific validation and authorisation
  server/catalogue.ts             Public projections and merchant offer writes
  server/orders.ts                Quotes, atomic stock reservations and order snapshots
  server/payments.ts              Durable payment intents and verified-capture posting
  server/csv.ts                   CSV validation and safe accounting export
  server/totp.ts                  Authenticator verification and secret encryption
  server/limiter.ts               Shared PostgreSQL request throttling
  server/validation.ts            Zod input contracts
  server/db.ts                    Prisma client lifecycle
  server/errors.ts                Typed application errors
  providers/payments.ts           Fail-closed MTN/Orange adapter interfaces
  money.ts                        Exact XAF, quantity, commission and refund arithmetic
  fixtures.ts                     Documented pilot names and explicit preview placeholders
  preview.ts                      Preview-only read responses
  routes.ts                       Allowed routes and static preview paths
  types.ts                        Browser-safe catalogue/order contracts
  utils.ts                        Formatting and class helpers
prisma/
  schema.prisma                   PostgreSQL entities, indexes, statuses and relations
  migrations/                     Initial SQL, audit immutability and ledger constraints
  seed.ts                         No invented trading data
public/                           Install icons, manifest, service worker and offline page
scripts/                          Build, preview export and controlled staff provisioning
tests/                           Money, security, CSV and route tests
docs/                             Requirements traceability, backend TODOs and operating notes
.env.example                      Environment-variable inventory
Dockerfile                        Next.js standalone application image
compose.yaml                      Local PostgreSQL development service
package.json / package-lock.json  Scripts and reproducible dependencies
```

See `docs/FILE_TREE.txt` for every delivered source file, including its actual path.

## 6. Implemented backend behaviour

- Registration permits buyer and shop-owner roles only. Every protected API request reloads active status and roles from PostgreSQL. Buyers cannot read someone else's order; sellers cannot edit another shop.
- Password hashes use bcrypt cost 12. Staff authentication requires encrypted TOTP secrets, rejects reused time steps and limits sensitive-operation session age. Login and selected mutation limits are stored atomically in PostgreSQL.
- Mutations require a matching origin and reject cross-site requests. Request types, byte limits, identifiers, decimal quantities and strings are validated. Public responses exclude owner contacts, passwords and private evidence.
- Shops record public identity, location and versioned publication consent. Verification and moderation require an independent reviewer and an audit reason. Public identity edits return a shop to review. A shop can pause sales.
- Offer writes use optimistic versions, consented source records, price history, explicit units, stock and expiry. Approved media URLs require an allowed HTTPS origin and publication permission.
- CSV imports are validated before commit, show rejected rows, and commit atomically into the moderation queue. Imports do not publish offers directly.
- Server quotes check current stock, verified markets/shops, beneficiary verification, exact units, minimum quantities, price expiry, buyer contact verification and published buyer terms. One shop per payment is enforced. Pickup has no delivery fee.
- Orders accept the exact quoted total and terms version, use stable idempotency keys, store immutable item snapshots and decrement stock atomically inside a serializable transaction. Quote expiry, edited offers and insufficient stock reject checkout. Retryable serialization conflicts are retried a bounded number of times.
- Cancellation releases stock only when no collection is successful or unresolved. A protected expiry job releases definitely unpaid expired reservations. Pending or unknown provider outcomes retain the reservation for reconciliation.
- The payment boundary refuses unconfigured providers. The future integration interface defines durable attempt/job records, server-verified provider events, account/amount/currency matching, duplicate-event protection, balanced allocation journals and separate late/excess collection liabilities.
- Refund requests check captured money minus previous paid or pending requests in a serializable transaction. Actual provider refunds remain blocked. Exact cumulative refund reversal arithmetic is implemented and tested.
- Seller settlement statements distinguish collections, commission, refunds and actual payouts. Requests cannot exceed verified, fulfilled, undisputed balances. Actual payout execution remains blocked until approved settlement and independent authorisation are connected.
- Buyers can maintain addresses/profile, open order/listing support cases, confirm collection and review their own completed purchases. Seller evidence is stored separately from buyer completion confirmation.
- Administrators manage directory records, register denominators, review queues, roles, versioned legal text, assignments and append-only audit records. Accounting CSV exports are restricted to finance/admin and neutralise spreadsheet formulas.

## 7. Assumptions Made

1. The attached PDF replaces the unfilled `PASTE YOUR DOCUMENTATION HERE` section in the prompt.
2. The explicit user-requested React/Next.js stack takes priority over the PDF's vanilla frontend instruction. Prisma maps the documented PostgreSQL model; NextAuth provides the requested authentication structure.
3. The release implements the documented **pickup pilot**. Delivery, native mobile binaries and multi-shop consolidated payments stay outside this release.
4. The PDF supplies no company brand, so the descriptive project title is used. The palette, spacing, typography, geometric icon and motion are design decisions, not claims about a supplied brand identity. No invented photography is used.
5. Quotes and unpaid stock reservations last at most **10 minutes**, additionally bounded by price validity. The plan requires visible time limits but does not specify their duration.
6. Quantities support **three decimal places**. XAF money remains integer francs. The application enforces a documented implementation bound of 9,000,000,000,000,000 XAF per amount.
7. Food uses the plan's conservative **24-hour** confirmation target until fresh/stable food classifications are supplied. Other initial ordinary-goods categories use the **seven-day** target. These are operating targets, not source publication schedules.
8. Existing accounts can browse and edit their own details without contact verification; placing a purchase requires verified contact. No contact is automatically marked verified by registration or profile edits.
9. TOTP is the chosen staff strong-authentication mechanism. Sensitive staff requests require a sign-in within 15 minutes. Separate reviewers are required for financial execution; actual thresholds remain a business-policy dependency.
10. Buyer confirmation completes an order. Merchant evidence alone is retained for review and does not silently settle the purchase. A fallback dispute/fulfilment policy is still required.
11. English and French are the initial interface languages, as required in section 6. Product and market names retain supplied local spellings.
12. Preview product records are `[PLACEHOLDER]` records, have no retail price and cannot be purchased. The placeholder shop is associated with Mokolo solely to exercise layout/navigation; this is not a real merchant relationship.
13. The public catalogue currently loads up to 500 offers/shops for the documented 400-offer pilot; add database-backed pagination/search before a larger catalogue rollout. Administrative queues also use explicit bounded reads.
14. The browser keeps only the selected city, language and cart. User switching/logout clears user cart state. Sensitive financial and identity records are not cached for offline use.

## 8. Placeholder register

| Missing content                                                     | Representation                                                            |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Platform operator / legal entity                                    | `[PLACEHOLDER]` in approved-text prerequisites; no company is invented    |
| Merchant and public owner names                                     | `[PLACEHOLDER]` in preview only; real API initially has no merchants      |
| Product names, descriptions and variant labels                      | `[PLACEHOLDER]` in preview only                                           |
| Retail prices                                                       | `null` in preview data, rendered as `[PLACEHOLDER]`; purchase is disabled |
| Product photographs                                                 | A labelled `[PLACEHOLDER]` photo area; no fabricated product image        |
| Market addresses, opening hours, coordinates and verification dates | `[PLACEHOLDER]` or absent map link until verified records exist           |
| Final privacy, buyer, merchant, fulfilment and refund text          | `[PLACEHOLDER]` until an approved version is published                    |
| Auth secrets and internal-job secret                                | `[PLACEHOLDER]` in `.env.example`; replace before use                     |
| Provider, messaging, media and beneficiary integration values       | Empty configuration plus explicit unavailable responses                   |
| Initial administrator's display name                                | `[PLACEHOLDER]` until the owner updates the profile                       |

The seed does not turn proposed markets into verified markets. Illustrative financial amounts used by unit tests come from the plan or are identified arithmetic edge cases; they are not product prices.

## 9. Backend TODOs and production dependencies

The full dependency list and the relevant source locations are in `docs/BACKEND_TODO.md`. In particular:

- Obtain and implement the contracted MTN and Orange collection/status/callback flows; wire the durable collection worker and its retries, with approved handling of the contact required by the provider. There is no fake sandbox charge endpoint.
- Implement provider-specific webhook authentication and server status verification before enabling an adapter.
- Implement provider refunds, verified cumulative ledger reversals, fee records, beneficiary approval, disbursements, dual approvals, settlement holds and reconciliation imports. A database balance is not proof of a transfer.
- Connect an approved contact-verification messaging service. Registration never bypasses verification.
- Connect protected identity/evidence storage, reviewed beneficiary records and secure merchant-verification operations. There is no public upload route accepting identity files.
- Publish actual operator details, required notices, merchant/customer terms and policy versions. Set `PUBLICATION_CONSENT_VERSION` to the published approved merchant version. Placeholder terms cannot be published through the API.
- Acquire current council/manager records, field assignments, merchant consent and real catalogue data. Reference datasets are not imported as purchasable offers.
- Complete a separate data-rights/retention workflow, access reviews, restore drills, monitoring and device accessibility/security checks.

## 10. Checks

```bash
npm run typecheck
npm test
npm run build
npm start
```

`npm run build` generates the Prisma client and builds the real Next.js application. `npm start` runs that application; use a configured PostgreSQL database. The Docker image runs the standalone server instead.

`npm test` covers documented commission examples, rounding ties, exact decimal quantities, cumulative partial refunds, overflow/refund bounds, origin checks, ownership, TOTP, body limits, expired/unverified offers, disabled providers, CSV validation/formula handling and recognised routes.

The delivered validation report records exactly which checks ran. **No claim is made that provider tests, real PostgreSQL concurrency tests, real-device PWA installation, screen-reader audits or WCAG conformance have passed.** These require the configured runtime and acceptance process described in the plan.

## 11. Deployment and jobs

Deploy the full app to a Node.js host with a private PostgreSQL database and HTTPS. Set the production origins, secret values and `NEXT_PUBLIC_PREVIEW_MODE=false` before building. Do not serve the static preview as a payment backend.

Apply `npm run db:migrate` as a controlled release step, using a migration-owner database role. Run the app with a restricted runtime role. Keep the database private; only the Node server accesses it. Configure encrypted backups, restore testing and payment-state reconciliation before launch.

The supplied `.openai/hosting.json` describes the hosted **interface preview**, not a replacement for the PostgreSQL/Node deployment. `SITES_STATIC_PREVIEW_BUILD=1` selects that export through the Sites build helper. Its private deployment remains a review surface; do not enable production collections on it.

A scheduler you control may call:

```text
POST /api/internal/expire-reservations
Authorization: Bearer <INTERNAL_JOB_SECRET>
```

The job is bounded to 100 eligible orders per run; repeat under the approved operating schedule. It never releases reservations with created, pending, successful or unresolved collection attempts. Provider reconciliation workers remain an integration TODO.

## 12. What was not supplied and is left out

- No invented company name, logo artwork, staff biography, testimonial, product photo, retail catalogue, live price, subscription plan or promotional pricing.
- No claim of complete citywide market coverage or existing council/payment partnerships.
- No GPS permission, platform wallet, escrow service, bank-card payment, subscription billing or unsupported payment method.
- No intercity delivery, delivery fee schedule, courier tracking integration, app-store binaries or multi-shop payment aggregation.
- No guessed provider endpoints, callback signature rules, refund capabilities, provider tariffs or beneficiary disbursement contract.
- No invented legal text, tax-invoice details, returns window, high-value approval threshold, retention period or settlement guarantee.

The plan's source register is transcribed, with its limitations, in `docs/DATA_SOURCES.md`; it supplies planned acquisition routes, not a pre-existing live catalogue.
