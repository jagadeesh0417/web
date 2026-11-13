# Cleanup progress (incomplete)

Branch: `refactor/akradhii-final-cleanup`; base: `1f32761` (the local `origin/master` and `master-prod` tip). The local `release/akradhii-v2-final` and `akradhii-v2-integration` tips are ancestors of this commit. This does not establish that every other branch or uncommitted worktree change is integrated; remote state was not refreshed.

## Baseline

- Git tracked 432 files before cleanup. The earlier 438 local-file estimate included generated baseline artifacts and is not a reliable before count.
- `cleanup-baseline-files.csv` is a local inventory, not a count of inspected files. `cleanup-baseline-deps.txt` records only `npm ls --depth=0`, not the complete dependency graph. The lint and integration baseline outputs are in `cleanup-baseline-lint.txt` and `cleanup-baseline-tests.txt`.
- TypeScript passed; ESLint passed with 28 warnings; production build passed; `node --test tests/*.test.mjs` passed 53 tests; `npm run test:integration` passed 5 tests.

## Verified change

- Removed unused `Megaphone` and `Palette` imports in `src/components/services/service-icons.tsx`. The existing map keys and rendered icons are unchanged. ESLint now reports 26 warnings; TypeScript still passes.
- No files or dependencies deleted; no identifiers renamed or duplicate logic removed. No design or production settings changed.

## Remaining work and risks

The repository-wide audit, full dependency graph, unused-file classification, theme and asset review, end-to-end tests, and desktop/tablet/mobile browser verification remain incomplete. The production build and tests above were run before the import-only change, not after it. The README states checkout is disabled; production payment readiness must not be inferred from the passing tests. No deployment or merge was performed. The cleanup must not be considered production-ready on this evidence.

## Navigation follow-up

- Updated `src/components/marketing/navbar.tsx` to bridge the hover gap, distinguish hover from click-pinned menus, dismiss on outside click or Escape, and expose mobile section expansion state. Removed ARIA menu roles in favor of ordinary navigation links.
- Added `@playwright/test` and `tests/navigation.browser.spec.mjs`. Chromium checks passed for desktop hover movement, click toggling, outside click and Escape, tablet and mobile menu toggling, and an emulated touch viewport. Other routes, forms, keyboard traversal, browsers and integrations have not been comprehensively browser-tested.
- Production build and TypeScript passed. ESLint reported 15 warnings. Unit tests passed 53/53. Integration tests passed 5/5 when rerun separately; the first run failed to start its Next server while a build was running concurrently.
- `npm audit --omit=dev` reports two advisories including high-severity PostCSS issues through Next.js. npm suggests a breaking Next.js upgrade; no automatic security fix was applied.
- No repository files or dependencies were deleted in this follow-up. The complete audit, remaining warnings and release verification remain outstanding.
