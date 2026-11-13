# Old theme removal completion report — Akradhii repository

Removal date: 2026-11-10. Working branch: `redesign/akradhii-v2` (local branch name `redesign/animations`). Base commit: `7d25c6586fdb414d0e195e6464d2132fd0440f67`. Backup branch: `backup/pre-akradhii-v2`.

Scope: all source, config, scripts and public assets excluding `node_modules`, `.next`, `.git`, `.vercel`.

## Phase 1 — files and patterns identified

### 1. Theme configuration
- No `tailwind.config.*` file. Tailwind v4 is configured entirely in `src/app/globals.css` (`@theme inline`).
- Color tokens live in `src/app/globals.css` (`:root` and `@theme inline`).

### 2. Legacy Tailwind class-name references
Legacy `violet-*`, `indigo-*`, `purple-*` and `fuchsia-*` utility classes were used in 38 `src/` files across marketing pages, student dashboards, admin/mentor/employee/client dashboards, shared components and config/data files.

### 3. Hard-coded legacy hex colors
- `src/lib/notifications.ts` — email template gradients using `#8b5cf6`, `#6366f1`.
- `src/app/student/page.tsx` — SVG `stopColor="#7c3aed"`.
- `src/app/(dashboard)/admin/page.tsx` — chart colors `#8b5cf6`, `#6366f1`, etc.
- `src/app/(dashboard)/admin/certificate-templates/page.tsx` — `#7c3aed` border/accent colors.
- `scripts/gen-portfolio-placeholders.mjs`, `scripts/gen-blog-placeholders.mjs`, `scripts/gen-team-avatars.mjs` — placeholder SVG generation colors.

### 4. Legacy aliases in globals.css
`src/app/globals.css` contained a transitional alias block (lines 87–104) that remapped Tailwind `violet-*`, `indigo-*` and `blue-*` scales to gold/orange values so legacy classes would render the new brand palette.

## Phase 2 — backup and safety
- Backup branch created: `backup/pre-akradhii-v2` at `7d25c6586fdb414d0e195e6464d2132fd0440f67`.
- Working branch: `redesign/akradhii-v2` (local display name `redesign/animations`).
- No force-push, deletion or modification of `master`, `lms-paid-internships` or remote branches.
- Uncommitted V2 homepage work in `src/app/(marketing)/page.tsx` was reverted to `HEAD` before migration to avoid blocking type checking.

## Phase 3 — migration performed

### Class-name migration
- Replaced `violet-*`, `indigo-*`, `purple-*` and `fuchsia-*` Tailwind utility classes with semantic `brand-*` equivalents in 38 source files.
- Repaired a regex edge case where `from-violet-600`/`to-indigo-600` produced malformed `brand-\` strings; corrected to `brand-600`.

### Inline hex color migration
- `src/lib/notifications.ts` — email gradients migrated to `#D6A24A`/`#F58216`.
- `src/app/student/page.tsx` — SVG stop migrated to `#C75A19`.
- `src/app/(dashboard)/admin/page.tsx` — chart colors migrated to brand/gold palette.
- `src/app/(dashboard)/admin/certificate-templates/page.tsx` — accent colors migrated to brand palette.
- `scripts/gen-portfolio-placeholders.mjs`, `scripts/gen-blog-placeholders.mjs`, `scripts/gen-team-avatars.mjs` — placeholder generation colors migrated to brand hex values.

### Alias removal
- Removed the obsolete `violet-*`/`indigo-*`/`blue-*` Tailwind alias block from `src/app/globals.css`.

### Files deleted
- None. No theme files were proved unused; all legacy visual styling was migrated rather than deleted.

## Phase 4 — verification results

### Repository-wide search
- Searches for `violet-*`/`indigo-*`/`purple-*`/`fuchsia-*` class patterns: **0 matches**.
- Searches for legacy violet/indigo/purple/fuchsia hex values: **0 matches**.
- Searches for literal `violet`/`indigo`/`purple`/`fuchsia` in source files: **0 matches**.

### Build and tests
| Check | Result |
|-------|--------|
| `npm run lint` | Pass (27 pre-existing warnings, no new warnings) |
| `npx tsc --noEmit` | Pass |
| `npm run build` | Pass (126 routes generated) |
| `node --test tests/*.test.mjs` | 34/34 pass |
| `npm run test:integration` | 5/5 pass |

No new warnings, errors or regressions introduced.

## Phase 5 — STOP / awaiting approval

Old theme removal is **complete**. The application no longer depends on legacy violet/indigo/purple/fuchsia Tailwind classes, inline hex colors or the `globals.css` alias hack.

**Awaiting explicit approval before Phase 6:**

> OLD THEME REMOVAL APPROVED — START AKRADHII V2

Do not begin the new premium homepage/theme implementation until that message is received. Do not merge or deploy.

## Git summary

- Modified files: 41 (38 `src/` files + `src/app/globals.css` + 3 `scripts/*.mjs`).
- Deleted files: 0.
- New/untracked files preserved from earlier V2 exploration: `public/visual-assets/`, `src/components/marketing/hero-visual.tsx`, `src/components/motion/`, `src/lib/motion/`.
- Branch tip (pre-commit): `7d25c6586fdb414d0e195e6464d2132fd0440f67` plus working-tree changes.
