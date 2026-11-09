# Certificate verification baseline audit

Static review before changes; no production data or deployment was inspected.

## Flow and data

`src/app/verify/page.tsx` accepts an ID or legacy query parameter and calls `/api/verify`. The API uses `src/lib/data/repository.ts`, a demo-backed repository, and explicitly returns 503 in production. Outside production it returns name, program, category, duration, completion and issue dates, score, status and issuer. The client displays a certificate view and a revoked banner where appropriate. On any API failure, including 503, the client falls back to browser-local demo data and otherwise presents "not found".

## Risks and gaps

- **Critical: false assurance.** A local browser record can be displayed as verified even when the authoritative API is unavailable; an outage is otherwise misreported as an unknown certificate. Production verification is intentionally unavailable until a real registry is implemented.
- Public lookup exposes holder name and program information to anyone with an ID; it also exposes score and duration beyond the requested minimum. `/api/certificates/[id]` returns the entire demo record without authentication outside production, a separate exposure to review when replacing the registry.
- IDs use `AKR-YYYY-` plus eight random characters, without a check character or demonstrated persistent unique index. `randomId` falls back to `Math.random` if cryptographic randomness is unavailable. Rate limiting of `/api/verify` is per-process only (30 per 10 minutes), trusts forwarding headers according to deployment, and does not protect the separate certificate endpoint. There is no escalating CAPTCHA.
- Lookup status and public details distinguish known from unknown IDs, so enumeration remains possible; format errors are distinguishable too. The API logs via `logVerifyLookup`, but that function does nothing server-side; its browser implementation stores full IDs in localStorage. URL-based IDs can also be captured in access logs and browser history.
- The revocation endpoint checks an admin guard and records reason/date in the demo repository, but the registry is not durable and there is no reliable persistent change audit or reissue workflow. Lookup is case-insensitive whereas revocation matches case-sensitively.
- No `/verify/[id]` result route or noindex result metadata exists. Main-page metadata and canonical already exist. Result card shows extra information, and no employer/bulk-verification information was identified.
- Input has an accessible name but no visible label or persistent format explanation; errors and results lack explicit live announcements and focus management. Loading, not-found and revoked states exist, but service failure is not distinct.
- ID migration must preserve old identifiers through an explicit mapping; never silently change existing links. Add a durable unique index and concurrency-safe issuance before enabling a real registry.
- No verification-specific Playwright, abuse, screen-reader, 320px or Lighthouse results were verified.
