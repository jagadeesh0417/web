# Internship application audit

Audit of the existing flow before redesign; findings describe the original implementation, not a claim of exhaustive security testing.

## Flow and correctness

- `src/app/(marketing)/internships/apply/page.tsx` is a five-step client wizard. It reads `program` and `category`, not `track`; non-empty unknown values pass the first step. Plan and duration are independently selectable, so Foundation can be submitted as eight weeks at the Foundation price. A prefilled plan still defaults to six weeks. The duration-specific project counts (2/3/4) conflict with `PROGRAMS` (1/2/4 and Industry's client-based wording).
- The resume is labelled required but is optional in `applicationSchema`, and is never sent to the server. The placeholder LinkedIn/GitHub URLs omit the protocol required by client validation. A future date of birth and arbitrary graduation year can pass. Consent is not sent or stored.
- Submission posts JSON to `/api/internships/apply`, which generates local IDs and writes a JSON file. A write failure is ignored and returns success. Concurrent writes can overwrite records; local storage is not durable or shared across serverless instances. Back and resubmit can create duplicate applications.
- The payment create and verify endpoints intentionally return 503. The client shows a Pay button despite checkout being unavailable and always moves to failure; the success state is unreachable. There is no provider order, webhook, receipt, transactional confirmation, retry queue, or durable application/payment reconciliation in this flow.
- Server errors returned on review are not rendered there; categorySlug/programSlug error keys do not match client field keys. General failures can be invisible until navigating back. The fetch code doesn't check HTTP status separately.

## Validation and security

- Client and server use different Zod schemas. The server accepts optional DOB, branch, graduation year, city and state, accepts arbitrary 10–20-character phone strings, doesn't validate URLs, doesn't verify plan-duration consistency, and doesn't require consent. Optional strings have no length limits. No honeypot, request rate limiting, CAPTCHA or explicit body-size control is present in this endpoint.
- Personal data including date of birth is stored unencrypted in a local JSON file with no retention, access, backup or concurrency guarantees shown. TODO(owner): approve data collection and retention requirements. No consent for abandoned-application follow-up is captured.
- Checkout fails closed rather than trusting a client callback, which must remain true. Production payments need server-created orders, verified provider webhooks, durable idempotency and transactional state changes before enabling checkout.

## Accessibility

- Plan and category `Field` labels have no `htmlFor` and their custom selects have generated IDs. Errors are not associated with controls through `aria-describedby` and there is no focusable error summary or focus transfer on step changes. The progress indicator does not announce the current step.
- The file input is `display:none`, making the upload control inaccessible by keyboard; its visible label is not explicitly associated with an input. Required state is not consistently exposed. The consent error is not associated with the checkbox. Duration buttons do not expose selected state to assistive technology.
- The custom combobox keeps focus on its trigger without `aria-activedescendant`; keyboard highlighting may not be announced. No form element provides native Enter-to-submit behavior. Mobile layout and screen-reader behavior require device testing.

## Owner decisions

TODO(owner): confirm age/guardian consent, required fields and resume handling, refund terms, tax treatment, the approved payment and email providers, and retention and follow-up consent. Do not enable checkout until those decisions and the payment/storage controls are implemented and tested.
