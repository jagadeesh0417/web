# Website audit tracker

Initial triage only; routes not listed as verified have not received a complete visual or functional audit. Never use this document as evidence that production or protected workflows were tested. The working tree contains pre-existing uncommitted changes; observations refer to the local source unless stated otherwise.

| Route or scope | Severity | Finding and affected component | Proposed fix | Verification status |
|---|---|---|---|---|
| `/blog` | High | `next.config.ts` redirected the public blog link to `/about` even though a blog listing exists. Production reproduced the redirect. An older restructuring commit deliberately added it, but current navigation and sitemap point to the separate blog. | Remove the redirect and verify listing and article links in a preview. | Redirect removed locally; preview verification pending. |
| `/` | Low | FAQ says “maintenance retainings” in `src/app/(marketing)/page.tsx`. | Correct to “maintenance retainers”. | Fixed locally; browser verification pending. |
| `/internships`, `/internships/apply` | High | Cards, comparison and application read `PROGRAMS`, currently ₹149/₹199/₹299. Owner's reported figures differ; this alone does not establish authoritative business prices or database/payment settings. | Owner to confirm plan prices, then audit all configuration and payment paths before changing them. | Blocked on owner confirmation; no price changed. |
| `/services/web-development` | Medium | The shared `ProcessTimeline` renders separate desktop and mobile variants of the same steps, each hidden at the opposite breakpoint. | Test real viewports and accessibility tree before removing anything; avoid deleting the only mobile timeline. | Code inspected; rendered duplication not yet verified. |
| `/portfolio` and `/portfolio/[slug]` | Medium | `publicPortfolio` is empty pending independently verified and client-approved projects. | Obtain owner-approved content and screenshots; do not publish sample data as real work. | Source inspected; visual and route checks pending. |
| `/` and business claims | Medium | Statistics and client names need independent evidence; no owner confirmation has been supplied. | Request source, timeframes and permission before retaining or revising claims. | Unverified; no claims invented. |
| All public routes and responsive layouts | High | Full visual, links, images, performance and accessibility checks have not yet been performed. | Inventory routes, test desktop/tablet/mobile and record measurements and screenshots. | Pending. |
| Admin, student, mentor, employee and client routes | High | Protected functionality has not been tested with authorized accounts. | Use authorized test accounts and a safe test environment; avoid production writes. | Blocked on suitable test access and environment. |
| Authentication, applications, verification and payment | High | Unit/source checks do not prove deployed end-to-end functionality; payment flows require safe test configuration. | Test success and failure paths without real applications, payments or production data changes. | Pending safe environment and access. |

## Constraints

- Preserve the current theme colors; the supplied design specification and the current committed palette contain different values, so no palette migration was attempted.
- Do not publish invented images, testimonials, project results, prices or policies.
- Do not deploy or commit unrelated uncommitted work. Production promotion requires explicit approval.
