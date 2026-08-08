# RELAY Backend

Node.js + Express + MongoDB (Mongoose) backend for RELAY, a rental-management
platform. This backend serves the existing frontend (`public/relay_version_4.html`)
directly and exposes a JSON API under `/api/*`. The frontend itself is untouched.

## Stack

- Node.js (Express)
- MongoDB / Mongoose
- JWT auth (short-lived access token + httpOnly refresh cookie)
- bcryptjs for password hashing
- zod for request validation
- multer for image uploads (product images, company logos)
- pdfkit for invoice / report PDF export
- json2csv for CSV export

## Getting started

```bash
cd relay-backend
cp .env.example .env       # edit values as needed
npm install
npm run seed                # populates demo data matching the frontend mocks
npm run dev                 # nodemon, http://localhost:4000
# or: npm start
```

Everything runs from one server on one port — the frontend
(`relay_version_4.html`) is served as a static file at `/`, and the API lives
under `/api/*`. Any non-`/api` route falls through to `relay_version_4.html`
(SPA-style), and unmatched `/api/*` routes return a 404 JSON error.

### Demo logins (after `npm run seed`, password: `password123`)

| Role     | Email               |
|----------|----------------------|
| Admin    | admin@relay.app      |
| Vendor   | vendor@relay.app     |
| Customer | arjun.mehta@example.com (and 6 other seeded customers) |

## Environment variables (`.env`)

| Var                  | Description                                   |
|-----------------------|-----------------------------------------------|
| `PORT`                | Server port (default 4000)                    |
| `MONGODB_URI`         | Mongo connection string                       |
| `JWT_ACCESS_SECRET`   | Secret for signing access tokens              |
| `JWT_REFRESH_SECRET`  | Secret for signing refresh tokens             |
| `ACCESS_TOKEN_TTL`    | e.g. `15m`                                    |
| `REFRESH_TOKEN_TTL`   | e.g. `7d`                                     |

## Response shape

All API responses follow:

```json
{ "success": true, "data": { ... } }
```

or on error:

```json
{ "success": false, "error": { "message": "...", "code": "..." } }
```

List endpoints support `?page=&limit=` and return:

```json
{ "success": true, "data": { "items": [...], "total": 42, "page": 1, "pages": 3 } }
```

Mongo `_id` is always mapped to `id` in JSON responses.

## Auth

- `POST /api/auth/signup` — `{ name, email, password, role?, phone?, companyName?, gstIn? }` → `{ user, accessToken }`, sets `refresh_token` httpOnly cookie (scoped to `/api/auth`).
- `POST /api/auth/login` — `{ email, password }` → `{ user, accessToken }`, sets refresh cookie.
- `POST /api/auth/refresh` — reads the refresh cookie → `{ accessToken }` (rotates the refresh cookie).
- `POST /api/auth/logout` — clears the refresh cookie.
- `GET /api/auth/me` — requires `Authorization: Bearer <accessToken>` → current user.

Protected routes read the access token from `Authorization: Bearer <token>`.
Role middleware (`requireRole('admin', 'vendor', ...)`) guards admin/vendor-only
routes. Passwords are hashed with bcrypt; changing a password bumps
`tokenVersion` so old refresh tokens are invalidated.

## Roles & visibility

- **admin** — full access, only role that can view/edit `Settings`, publish
  products, and see platform-wide Reporting (or filter by `?vendor=`).
- **vendor** — manages own products / rental orders / invoices / pricelists /
  attributes / templates; Reporting is scoped to their own orders; cannot
  access Settings.
- **customer** — browses published products, creates/views own rental
  orders + invoices, sees their own notifications and profile.

## Routes

### Users (`/api/users`)
- `GET /` — admin-only, paginated, `?role=&search=`
- `GET /:id`
- `PATCH /:id` — update profile fields (self, or admin)
- `PATCH /me/profile` — convenience alias for the caller's own profile
- `POST /me/change-password` — `{ currentPassword, newPassword }`
- `DELETE /:id` — admin-only

### Products (`/api/products`)
- `GET /` — `?search=&type=&publish=&vendor=` (customers only see `publish:true`)
- `GET /:id`
- `POST /` — admin/vendor. Body includes `name, images[], type(goods|service), qtyOnHand, salesPrice, costPrice, attributes[], variants[], rental:{periodicityUnit, padding, pickupTime, returnTime, price, depositAmount, lateFeePerHour}`
- `PATCH /:id` — admin/vendor (owner)
- `PATCH /:id/publish` — admin-only, `{ publish? }` toggles or sets
- `DELETE /:id`

Deposit / downpayment / warranty line items are modeled as `type: "service"`
products attached to an order/invoice, per the wireframes.

### Attributes (`/api/attributes`) — admin/vendor
- `GET /`, `GET /:id`, `POST /`, `PATCH /:id`, `DELETE /:id`
- `{ name, displayType: radio|pills|checkbox|image, values: [{ value, extraPrice }] }`

### Price Lists (`/api/pricelists`)
- `GET /`, `GET /:id`
- `POST /` / `PATCH /:id` — admin/vendor
- `{ name, selectable, rules: [{ appliesTo:[productId], priceType: fixed|discount, fixedPrice, discountPercent, minQty, validFrom, validTo, unitPrice }] }`

### Quotation Templates (`/api/quotation-templates`) — admin/vendor
- `GET /`, `GET /:id`, `POST /`, `PATCH /:id`, `DELETE /:id`
- `{ name, validityDays, paymentTermsPercent, lines: [{ product, qty, unit }] }`

### Rental Orders (`/api/rental-orders`)
- `GET /` — `?status=&search=&filter=today|pickup|return|late`
- `GET /:id`
- `POST /` — creates as `quotation` with an auto-generated `orderRef` (`RL-xxxx`); body: `{ customer, invoiceAddress, deliveryAddress, rentalPeriod:{start,end}, priceList?, lines:[{product, qty, unit, rentalStart?, rentalEnd?}] }`
- `PATCH /:id` — edit lines/addresses/period while status is `draft|quotation|quotation_sent`; totals are recalculated server-side via `calcTotals`
- `POST /:id/send` → `quotation_sent`
- `POST /:id/confirm` → `sale_order`
- `POST /:id/cancel` → `cancelled` (allowed from any pre-active state)
- `POST /:id/pickup` → `pickup` then `active`; decrements product `qtyOnHand`; logs a pickup notification
- `POST /:id/return` — `{ condition, notes, damageDeduction? }`; computes late fee off `Settings.lateFee` (or a per-product override), settles `refund = deposit - lateFee - damage`, restores inventory, moves to `returned` then `completed`
- `POST /:id/create-invoice` — only once status is `sale_order` or later; creates a `draft` Invoice from the order's lines
- `DELETE /:id` — only `draft`/`quotation`

State machine is enforced server-side:
`draft → quotation → quotation_sent → sale_order → pickup → active → return_pending → returned → completed`,
with `cancelled` reachable from any pre-`active` state.

### Invoices (`/api/invoices`)
- `GET /` — `?status=&search=`
- `GET /:id`
- `GET /:id/pdf` — streams a pdfkit-generated PDF
- `PATCH /:id` — edit lines/addresses while `draft`
- `POST /:id/lines` — Add a Product / Add a note (`isNote: true`)
- `POST /:id/send` — logs a mock email to console
- `POST /:id/post` — `draft → posted`
- `POST /:id/pay` — `posted → paid`, sets `paidAt`

### Scheduler (`/api/scheduler`)
- `GET /?month=YYYY-MM` — per-day array of `{ orderRef, product, customer, qty, status, type }`, `type ∈ booked|pickup|late_pickup|return|late_return`
- `GET /day/:date` — same shape for a single day (`YYYY-MM-DD`)
- `POST /run-overdue-check` — flips overdue orders and creates `overdue` notifications (also runs automatically every 15 minutes via `setInterval` in `server.js`)

### Reporting (`/api/reports`) — admin/vendor
- `GET /summary?range=7d|30d&vendor=<id?>` → `{ lastNDays:{sales,lateFees,deposits}, revenueTrend[], utilizationByCategory[], mostRentedTop5[], underutilized[], demandForecast[] }`. Vendors are always scoped to their own orders; admins may pass `?vendor=` or omit it for platform-wide totals.
- `GET /export?format=csv|pdf` — streams a download

### Notifications (`/api/notifications`)
- `GET /?unreadOnly=true`
- `PATCH /:id/read`
- `POST /ai-call` — stubbed AI call outcome (`{ user?, rentalOrder? }` → logs a canned outcome string, no real telephony)

### Settings (`/api/settings`) — admin-only
- `GET /` `PATCH /` — `{ lateFee:{enabled, ratePerHour}, productDefaults:{variantsEnabled, priceListEnabled}, taxPercent }`

### Upload (`/api/upload`)
- `POST /` — multipart `file` field (product images / company logo) → `{ url, filename }`, saved to `/public/uploads`

## Business logic notes

- **Pricing** (`utils/calcTotals.js`): for each order line, resolves the best
  matching PriceList rule (fixed price wins over discount when both match,
  gated by `minQty` and the rule's `validFrom/validTo` window; falls back to
  the product's base rental price if nothing matches), multiplies by
  `qty * durationInPeriodicityUnits`, sums `untaxed`, applies each line's tax
  percent (default 18%) to get `tax`, and `total = untaxed + tax`. Deposit is
  tracked separately and is never taxed.
- **Late fees**: `Settings.lateFee.ratePerHour` is the default; a product's
  `rental.lateFeePerHour` overrides it. `POST /:id/return` and the overdue
  scheduler both use this.
- **Overdue check**: `POST /api/scheduler/run-overdue-check` (also on a
  15-minute interval in `server.js`) flips `pickup|active` orders whose
  `rentalPeriod.end` has passed into being flagged and creates an `overdue`
  Notification (idempotent — won't double-notify).

## Seed data

`npm run seed` wipes and repopulates MongoDB with data mirroring the
frontend's mocks: order refs `RL-1029, RL-1037, RL-1040…RL-1046`, customers
Arjun Mehta / Rohan Kapoor / Priya Sen / Meera Thomas / Neha Verma / Sameer
Rao / Isha Desai, and products Sony A7 IV, Canon R6, DJI RS3 Gimbal, Godox
SL200 III, GoPro Hero 12, 24–70mm Lens, Event PA System, Speaker Set — so once
the frontend is wired to real API calls it renders the same as before.

## Project layout

See the file tree in the repo — `server.js` / `app.js` at the root,
`config/`, `models/`, `controllers/`, `routes/`, `middleware/`, `utils/`,
`seed/`, and `public/` (static frontend + `uploads/`).
