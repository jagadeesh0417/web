# Contact form baseline audit

Static review before changes; deployment configuration and actual delivery were not tested.

## Current flow

`src/app/(marketing)/contact/page.tsx` validates name, email, optional Indian phone, service and a message of at least 20 characters in the browser. `submitLead` posts the fields, a honeypot and current-page UTM parameters to `/api/leads`. The API checks basic contact information, stores a lead through `src/lib/leads/store.ts`, and attempts a WhatsApp notification. It does not send email or write to a database. The UI displays an error with alternative contact details on HTTP/network failure, or a success panel and toast on a successful response.

## Bugs and risks

- **Critical: silent loss.** `writeToDisk` suppresses every write error and returns successfully; the API can report success although the lead exists only in process memory. The fallback `/tmp` is ephemeral, memory is per instance, whole-file concurrent writes can overwrite data, and the oldest leads are truncated after 5,000. There is no durable database or delivery queue.
- WhatsApp notification is best effort, can be skipped when unconfigured or fail, and has no retry; the UI still says the message was sent. There is no email notification or customer email confirmation. A network failure after persistence can prompt a retry and duplicate the lead: idempotency is in-memory and the client generates a fresh key on each attempt.
- The server checks only basic identity fields, not the form's service or minimum message requirements; client and server schemas are not shared. The request is read fully before the size check, and the check counts characters rather than bytes.
- A honeypot and 8-per-10-minute IP limit exist, but the limit is process-local, resets on cold start, and uses forwarded headers whose trust depends on deployment. It is not robust distributed spam protection; no CAPTCHA exists. A filled honeypot deliberately receives a success response without storage.
- Current-page UTM source/medium/campaign are captured, but earlier landing-page parameters, referrer and landing page are not preserved. No consent-gated conversion events were found in the reviewed source.
- Error text is not associated with inputs using `aria-describedby` or `aria-invalid`, and status changes are not explicitly announced or focused. The dismiss-error button has no accessible name. Required service defaults to a selection; budget is optional with unconfirmed ranges; there is no separate timeline or privacy consent.
- The page promises a 24-hour response and a 15-minute Calendly call without verified operational confirmation. Confirm the scheduling account, response target and budget ranges with the owner.
- The Google Maps iframe is lazy but still loads automatically as it approaches the viewport; it exposes visitor information to Google without an explicit click. WhatsApp is not prefilled from the service query. Hours are static without an open/closed indicator or directions link.
- Canonical and page metadata already exist in `contact/layout.tsx`; dedicated ContactPage/LocalBusiness structured data is absent. Root structured data uses a different hostname from `siteConfig.url`.
- No contact-specific Playwright, axe, screen-reader, 320px or Lighthouse results were found or verified in this review.
