# Authentication baseline audit

Static review before changes; this is not a complete penetration test. Several parallel authentication systems coexist.

## Flows

The `/login` UI calls `src/lib/auth/index.ts`: Supabase password authentication when configured, otherwise browser-local demo authentication. Separately, `/api/auth/login` uses MongoDB, bcrypt and a signed `session` JWT. Middleware primarily understands Supabase or a demo cookie rather than this Mongo session; individual APIs use different guards. Admin and student paths also have separate guard modules. This mismatch requires an end-to-end inventory before consolidating sessions.

## Findings

- The Mongo login and the client Supabase wrapper reveal different errors for nonexistent accounts versus incorrect passwords, enabling account enumeration. Demo password reset also reports whether an account exists. Mongo login has no rate limiter or lockout in the route; the login UI's attempt counter is only local state and does not enforce a lockout.
- Mongo passwords are bcrypt-hashed at cost 12 (`password.ts`). Its JWT expires after seven days and the `session` cookie is HttpOnly, SameSite=Lax and Secure in production. A new JWT is created at login, but there is no demonstrated server-side session revocation or rotation of a persistent session identifier; a copied JWT may remain valid until expiry. Supabase session settings must be verified in the deployed provider.
- No general CSRF token or explicit origin validation was identified in the reviewed login/guard paths. SameSite=Lax is defense in depth, not a substitute for reviewing every cookie-authenticated state-changing endpoint.
- `/login` accepts a `next` parameter without an explicit allow-list as a fallback; the OAuth callback concatenates a caller-provided `next` to the origin without validating it against approved internal paths. Assess redirect parsing and replace both with a shared internal-path allow-list.
- Supabase client code reads roles from user metadata, whereas middleware and the admin API guard read app metadata. User-editable metadata must never be trusted for authorization. Middleware treats `/api` as public except admin routes, so each API needs its own verified server-side role and ownership checks; this review does not establish that every route has them.
- Demo mode uses browser data and an unsigned demo cookie. Production middleware and the admin API guard explicitly fail closed rather than trusting that cookie, but the login client still chooses demo mode whenever public Supabase configuration is absent. Demo credentials and behavior must not be presented as production authentication.
- `/dashboard` has an early cookie-name check that may not match normal Supabase cookie naming or the separate Mongo `session` cookie. Test configured deployments and expired sessions. The remember-me checkbox is not read: `signIn` always receives `true`.
- Login has labels, current-password autocomplete, show-password control and loading state, but error feedback is a toast rather than a persistent error summary; the toggle does not expose pressed state. The page has no dedicated noindex metadata in the reviewed files.
- Role isolation, per-record ownership, upload limits, notification opt-outs, CSRF, session expiry and logout require adversarial automated tests; none were established by this static review.
