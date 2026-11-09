# Akradhii — Internship & Digital Services Platform

A full-stack SaaS platform for Akradhii: a digital marketing agency that offers **internships**, **certificates with QR verification**, and **client services** (websites, Meta Ads, CRMs, AI automation, SEO, branding).

Built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS v4**, **Supabase** (optional), and **Framer Motion**.

## Quick start

### Razorpay status and test setup

**Checkout is disabled.** Configuring keys does not enable payments; provider verification, durable transactional enrollment, webhook processing, refunds and reconciliation are not implemented. Do not accept live payments until those are implemented and verified end to end. Existing demo invoices are sample data, not proof of payment.

1. Sign in to the [Razorpay Dashboard](https://dashboard.razorpay.com/) and switch to **Test Mode**. Under **Account & Settings → API Keys**, generate a test key. Store the key ID as `RAZORPAY_KEY_ID` and `NEXT_PUBLIC_RAZORPAY_KEY_ID`, and the key secret as `RAZORPAY_KEY_SECRET` in the server's private environment. Never commit secrets.
2. Under **Account & Settings → Webhooks**, add a webhook and generate a separate secret for `RAZORPAY_WEBHOOK_SECRET`. No webhook endpoint exists in this version: do not configure a delivery URL until an authenticated raw-body webhook handler has been implemented and deployed. When implemented, use its exact public HTTPS endpoint, select the payment and refund events it supports, and test deliveries in test mode.
3. Restart the server and check **Admin → Payment Settings**. It reports only the presence and mode of credentials, not their validity. Never switch to live mode merely because values are present.

```bash
npm install
npm run dev        # http://localhost:3000
```

Without Supabase credentials the app runs in **demo mode**: authentication and all data are simulated in localStorage, seeded with rich sample data — no backend required.

### Demo accounts (password: `Akradhii@123`)

| Role     | Email                  | Redirects to |
| -------- | ---------------------- | ------------ |
| Student  | `student@akradhii.com` | `/student`   |
| Mentor   | `mentor@akradhii.com`  | `/mentor`    |
| Client   | `client@akradhii.com`  | `/client`    |
| Employee | `employee@akradhii.com`| `/employee`  |
| Admin    | `admin@akradhii.com`   | `/admin`     |

You can also register a new account — it starts as an intern/applicant.

## Production mode (Supabase)

1. Create a project at [supabase.com](https://supabase.com).
2. Run [`supabase/schema.sql`](./supabase/schema.sql) in the SQL editor (tables, RLS policies, triggers, `handle_new_user` profile sync).
3. Set env vars (see `.env.example`):

   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```

4. Configure auth redirect URLs to include `http://localhost:3000/auth/callback`.
5. (Optional) Add `RESEND_API_KEY` for transactional email.
6. (Optional) WhatsApp Cloud API for automatic lead delivery to **+91 98485 79053**:

   ```
   WHATSAPP_PHONE_NUMBER_ID=...
   WHATSAPP_ACCESS_TOKEN=...
   WHATSAPP_BUSINESS_ACCOUNT_ID=...
   WHATSAPP_API_VERSION=v21.0
   WHATSAPP_LEAD_TO=919848579053
   ```

   Without these, leads are still **stored** (`/api/leads` + `data/leads.json`) and visible under **Admin → Website Leads**; WhatsApp status is `skipped` until credentials are set. Prefer an approved template (`WHATSAPP_TEMPLATE_NAME`) for business-initiated messages.

## Scripts

```bash
npm run dev       # development (Turbopack)
npm run build     # production build
npm run start     # serve the build
npm run lint      # ESLint
```

## Project structure

```
src/
├─ app/
│  ├─ (marketing)/      # Home, services, about, portfolio, blog, internships (+ apply), contact, privacy, terms
│  ├─ (auth)/           # Login, register, forgot/reset password, verify email
│  ├─ (dashboard)/      # Role dashboards: student, mentor, client, employee, admin
│  ├─ api/verify/       # Certificate verification API
│  ├─ auth/             # Supabase callback & confirm routes
│  ├─ verify/           # Public certificate verification page (QR lookup)
│  ├─ dashboard/        # Role-aware redirect
│  ├─ globals.css       # Tailwind v4 theme, dark mode, print CSS
│  ├─ layout.tsx        # Root layout (fonts, providers, dark-mode script)
│  └─ not-found.tsx
├─ components/
│  ├─ ui/               # Button, Input, Card, Badge, Avatar, Dialog, Toast, Tabs, Progress…
│  ├─ marketing/        # Navbar, Footer, Reveal (scroll animations)
│  ├─ dashboard/        # Shell (sidebar + topbar), DataTable, PageHeader, StatCard…
│  └─ certificate/      # Certificate with QR + print styles
├─ config/site.ts       # Site-wide content & services
└─ lib/
   ├─ auth/             # demo-store (localStorage auth) + Supabase client/server
   ├─ data/             # sample-data (seed) + repository (demo DB layer)
   ├─ rbac.ts           # Permissions, roles, role-aware nav
   ├─ constants.ts      # Internship programs & categories
   ├─ validators.ts     # Zod schemas + file validation
   └─ utils.ts          # cn, formatters, ids, helpers
```

## Role & permissions model

Seven roles (`guest`, `user`, `applicant`, `intern`, `client`, `mentor`, `employee`, `admin`, `super_admin`) with a permission map in `src/lib/rbac.ts`; `src/middleware.ts` guards each role area by path prefix.

## Website leads → WhatsApp

All public enquiry forms use one pipeline:

`submitLead()` → `POST /api/leads` → disk store → WhatsApp Cloud API (optional)

| Form | Source label |
| ---- | ------------ |
| Contact | Contact Page |
| Internship apply (after payment) | Internship Application — {category} |
| Student support | Student Support |
| Client support ticket | Client Support Ticket |

Admin UI: `/admin/leads`. Secrets never ship to the browser.

## Certificates

- Issue from Admin → Certificates (or automatically after completion).
- Each certificate carries a **QR code** linking to `/verify?certificateId=…`.
- Public verification at `/verify` and machine-readable API at `/api/verify?certificateId=…`.

## Internship programs

| Program         | Duration | Fee      |
| --------------- | -------- | -------- |
| Foundation      | 4 weeks  | ₹149     |
| Professional    | 6 weeks  | ₹199     |
| Industry        | 8 weeks  | ₹299     |

10 categories (Web Development, Digital Marketing, AI & Data, UI/UX Design, etc.). Apply via the guided wizard at `/internships/apply` (account → profile → documents → review).

## Feedback

For issues or feature requests, open an issue in this repository or email support@akradhii.com.
