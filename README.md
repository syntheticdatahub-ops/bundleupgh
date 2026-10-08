# BundleUp

BundleUp is a Ghana-focused data bundle ordering and administration platform. Customers can browse available bundles, place orders, pay through Paystack, and track fulfillment. Staff use the protected admin area to manage bundles, orders, customers, support, notifications, and site maintenance.

## Contents

- [Features](#features)
- [Technology](#technology)
- [Getting started](#getting-started)
- [Environment configuration](#environment-configuration)
- [Running and validating](#running-and-validating)
- [Application structure](#application-structure)
- [Order and payment lifecycle](#order-and-payment-lifecycle)
- [Admin access and operations](#admin-access-and-operations)
- [API overview](#api-overview)
- [Deployment](#deployment)
- [Security and operational notes](#security-and-operational-notes)

## Features

- Public bundle catalogue and purchase flow.
- Paystack payment initialization, verification, and signed webhook processing.
- DataMart fulfillment, signed status webhooks, and delivery tracking.
- Public order tracking by order reference.
- Admin dashboard for orders, customers, bundles, transactions, notifications, and support.
- Admin order status controls, fulfillment retry, and manual fulfillment.
- **Sync All Orders** to manually reconcile local fulfillment statuses against DataMart.
- Admin maintenance-mode control with a customizable public-facing message.
- Automatic retry of eligible failed fulfillment orders through a scheduled Vercel route.
- Firebase Authentication for admin sessions and Firestore-backed application data.

## Technology

- Next.js App Router and React
- TypeScript
- Firebase Authentication and Cloud Firestore
- Server-side Firestore REST helpers and Firebase service-account credentials
- Paystack payments
- DataMart bundle fulfilment
- Tailwind CSS and shared UI components
- Vercel deployment and scheduled functions

## Getting started

### Requirements

- Node.js 20.9 or newer
- npm
- A Firebase project with Authentication and Cloud Firestore configured
- Paystack and DataMart credentials for live payment and fulfillment operations

### Install dependencies

```bash
npm ci
```

### Configure local environment

Copy `.env.example` to `.env.local` and fill in the values for the integrations you intend to use. Keep `.env.local` private; it is ignored by Git.

```powershell
Copy-Item .env.example .env.local
```

See [Environment configuration](#environment-configuration) for the variable descriptions. Firebase service account credentials and provider secrets must only be supplied to the server environment. Never use real credentials in `.env.example` or commit them.

### Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment configuration

Set these variables in `.env.local` for local development and in the appropriate Vercel project environments for deployment.

| Variable | Required for | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Authentication | Firebase client API key, used for Firebase Auth and server-side ID-token lookup. |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Client Firebase setup | Firebase Authentication domain. |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firestore and Firebase | Firebase project ID. Also used by the Firestore REST client. |
| `FIREBASE_CLIENT_EMAIL` | Server Firestore access | Service-account email used to authorize Firestore REST access. |
| `FIREBASE_PRIVATE_KEY` | Server Firestore access | Service-account private key. In Vercel, store the value securely; for `.env.local`, newline characters may be represented as `\n`. |
| `PAYSTACK_SECRET_KEY` | Payments | Server-only Paystack secret used to initialize and verify transactions and validate webhook signatures. |
| `PAYSTACK_CALLBACK_URL` | Optional payment callback | Overrides the callback URL. If unset, the app derives it from Vercel's deployment URL or uses the local callback URL. |
| `DATAMART_API_KEY` | DataMart | Server-only API key for catalogue, purchase, status, and delivery requests. |
| `DATAMART_WEBHOOK_SECRET` | DataMart webhooks | Secret used to validate incoming DataMart webhook signatures. |
| `MAINTENANCE_MODE` | Maintenance fallback | Optional `on` or `off` fallback used only when no maintenance setting is stored in Firestore (or Firestore cannot be read). |
| `MAINTENANCE_MESSAGE` | Maintenance fallback | Optional message used together with `MAINTENANCE_MODE` when the Firestore setting is unavailable. |
| `CRON_SECRET` | Scheduled retry protection | Recommended secret for authorizing the auto-retry route. Vercel's automation bypass secret is also accepted by that route. |
| `RESET_DATA_SECRET` | Optional destructive admin tool | Server-only confirmation secret. The reset endpoint is disabled if this value is not configured. |
| `NEXT_PUBLIC_SUPPORT_WHATSAPP` | Support contact | Public WhatsApp contact displayed by the support experience. |
| `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` | Optional analytics | PostHog project token used by client-side analytics. |
| `NEXT_PUBLIC_POSTHOG_HOST` | Optional analytics | PostHog ingestion host used by client-side and server-side analytics. |

The `NEXT_PUBLIC_` prefix makes a value available to client bundles; use it only for values intended to be public. Do not put Paystack, DataMart, Firebase service-account, cron, or reset secrets behind that prefix.

The app reads and writes a Firestore maintenance document at `settings/maintenance`. When that document exists, its saved admin setting takes precedence over `MAINTENANCE_MODE`; the environment value is a fallback for a missing/unavailable Firestore setting. This allows admins to toggle maintenance without changing a Vercel variable or redeploying.

## Running and validating

```bash
npm run dev       # Start the development server
npx tsc --noEmit  # Type-check the project
npm run lint      # Run ESLint
npm run build     # Create a production build
npm run start     # Serve the production build
```

There is currently no dedicated test script configured in `package.json`.

## Application structure

```text
src/
  app/
    (auth)/                 Sign-in and authentication pages
    (public)/               Public site and purchase pages
    admin/                  Admin dashboard and management pages
    api/                    Route handlers for payments, orders, tracking, and admin
  components/
    admin/                  Admin tables, controls, and detail views
    buy/                    Customer purchase flow
    track/                  Public order tracking
    ui/                     Shared interface primitives
  data/                     Seed and mock data
  lib/
    auth-verify.ts          Firebase ID-token verification
    datamart.ts             DataMart API and fulfillment integration
    firestore-rest.ts       Server-side Firestore REST client
    maintenance.ts          Firestore maintenance state and fallback
    orders.ts               Order queries, pagination, and persistence
    paystack.ts             Paystack client and signature helpers
  types/
    domain.ts               Shared application and Firestore types
```

The `src/lib/firestore-rest.ts` helper uses a service-account-signed OAuth token to access the Firestore REST API. Keep its credentials on the server. Firestore security rules are maintained in `firestore.rules`.

## Order and payment lifecycle

1. An order is created with its bundle and customer details and an initial payment/fulfillment state.
2. The payment route initializes a Paystack transaction and stores the payment reference and payment record.
3. Paystack sends a signed webhook. The handler validates the signature, amount, and currency, then conditionally claims the successful payment to avoid duplicate processing.
4. Once payment is confirmed, the fulfillment service submits the order to DataMart. It records DataMart references used later for status lookups and webhook matching.
5. DataMart webhooks or an admin-triggered reconciliation update the fulfillment status. Payment status and payment metadata remain separate.

### Manual DataMart reconciliation

The Orders admin page provides **Sync All Orders**. The server-side endpoint:

- Requires a valid admin session and an account matching the existing admin UID/email allowlist.
- Reads paid/operational orders from Firestore in pages of 100.
- Checks orders that have a DataMart provider reference (the fulfillment provider reference, with the legacy provider reference as fallback).
- Queries DataMart's individual order-status endpoint with at most five concurrent lookups.
- Writes only a changed fulfillment status and does not call the purchase/fulfillment endpoint.
- Reports transitions and per-order lookup failures. Running it again is safe; matching statuses are not rewritten.

The current fulfillment mapping follows the existing DataMart status handling: completed/delivered becomes `SUCCESS`, failed/rejected becomes `FAILED`, waiting/verification states become `ON_HOLD`, refunded becomes `REFUNDED`, and processing/created/pending becomes `PROCESSING`. DataMart cancellation is mapped to the existing local `FAILED` state.

## Admin access and operations

Admin pages require a Firebase-authenticated session. Server-side admin APIs additionally check the project's admin UID/email allowlist; a valid Firebase login alone is not sufficient for protected operations.

The admin area includes:

- **Overview:** operational order metrics, recent/stuck orders, and the maintenance control.
- **Orders:** searchable and filterable order table, order details, individual status sync/retry, and bulk reconciliation.
- **Bundles:** bundle management and DataMart catalogue synchronization.
- **Customers:** customer and order history views.
- **Transactions:** payment records and statuses.
- **Manual fulfillment:** staff-initiated fulfillment.
- **Notifications and support:** operational notifications and support order lookup.

### Maintenance mode

Use the Maintenance Mode control on the admin overview, change the switch/message, and select **Save changes**. The saved Firestore setting takes precedence over environment fallback values. The public routes and maintenance page read this setting on the server.

### Automatic retry

`vercel.json` schedules `/api/admin/cron/auto-retry` once daily. The route considers failed fulfillment orders that meet its payment and retry eligibility rules, and processes a limited number per invocation to reduce provider load. Configure `CRON_SECRET` (or the supported Vercel automation bypass secret) in the deployment environment.

## API overview

All endpoints are implemented as Next.js route handlers under `src/app/api`.

| Area | Route(s) | Purpose |
| --- | --- | --- |
| Authentication | `/api/auth/session` | Create, inspect, or clear the admin session cookie. |
| Orders | `/api/orders`, `/api/orders/[id]` | Create and retrieve orders. |
| Payments | `/api/payments/initialize`, `/api/payments/verify`, `/api/payments/webhook` | Start, verify, and receive Paystack payments. |
| Bundles | `/api/bundles`, `/api/admin/bundles/*` | Read bundle catalogue, edit bundles, or synchronize the DataMart catalogue. |
| Admin orders | `/api/admin/orders/[id]/status`, `/api/admin/orders/[id]/sync`, `/api/admin/orders/[id]/retry`, `/api/admin/orders/sync` | Update, check, retry, or reconcile fulfillment status. |
| Admin maintenance | `/api/admin/maintenance` | Read and save the maintenance setting. |
| Admin cron | `/api/admin/cron/auto-retry` | Scheduled retry of eligible failed fulfillment orders. |
| Tracking | `/api/track`, `/api/track/delivery` | Public order and delivery tracking. |
| Webhooks | `/api/webhooks/datamart` | Receive signed DataMart order events. |
| Support | `/api/support/order-lookup`, `/api/admin/customers/orders` | Support order lookup and admin customer-order lookup. |

Protected admin routes validate the session server-side. Provider credentials are used only by server-side code and should never be returned to the browser.

## Deployment

The project is configured for Vercel (`vercel.json` contains the scheduled auto-retry job).

1. Connect the GitHub repository to the Vercel project.
2. Set the environment variables required by the production integrations in Vercel's project settings.
3. Ensure Firebase Authentication, Firestore, Paystack webhooks, and the DataMart webhook are configured for the production URL.
4. Deploy the `main` branch or the intended release branch.
5. Verify a production build and check the admin pages, payment callback/webhook delivery, DataMart fulfillment, maintenance switch, and scheduled function configuration.

The Paystack callback defaults to the Vercel production/deployment URL when `PAYSTACK_CALLBACK_URL` is not set. Configure an explicit URL if the provider setup requires a stable callback address.

## Security and operational notes

- Never commit `.env.local`, service-account JSON files, private keys, API keys, webhook secrets, or reset/cron secrets.
- Keep provider integrations and Firestore service-account access on the server.
- Paystack webhook signatures and DataMart webhook signatures are verified server-side.
- Payment state and fulfillment state are separate; DataMart reconciliation changes fulfillment state only.
- Manual reconciliation is admin-triggered. The Orders page does not poll DataMart automatically.
- The Firestore client is centralized in `src/lib/firestore-rest.ts`; use existing query and pagination helpers instead of fetching the entire orders collection for admin screens.
- Automatic fulfillment retries are guarded and rate-limited by the route's eligibility checks and per-invocation processing limit. Do not use reconciliation to submit new purchases.
