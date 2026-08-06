# Akradhii — Internship & Digital Services Platform

A full-stack SaaS platform for Akradhii: a digital marketing agency that offers **internships**, **certificates with QR verification**, and **client services** (websites, Meta Ads, CRMs, AI automation, SEO, branding).

Built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS v4**, **Supabase** (optional), and **Framer Motion**.

## Quick start

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

## Certificates

- Issue from Admin → Certificates (or automatically after completion).
- Each certificate carries a **QR code** linking to `/verify?certificateId=…`.
- Public verification at `/verify` and machine-readable API at `/api/verify?certificateId=…`.

## Internship programs

| Program         | Duration | Fee      |
| --------------- | -------- | -------- |
| Foundation      | 4 weeks  | ₹1,999   |
| Professional    | 6 weeks  | ₹3,499   |
| Industry        | 8 weeks  | ₹5,499   |

10 categories (Web Development, Digital Marketing, AI & Data, UI/UX Design, etc.). Apply via the guided wizard at `/internships/apply` (account → profile → documents → review).

## Feedback

For issues or feature requests, open an issue in this repository or email support@akradhii.com.
