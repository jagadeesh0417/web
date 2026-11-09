# Legal pages: technical gap checklist

This is not legal advice. Indian counsel must review the final text, applicable commencement dates and rules under the Digital Personal Data Protection Act, 2023, and other applicable law. Do not treat this checklist as a compliance determination.

## Current content and missing facts

- `src/app/(marketing)/privacy/page.tsx` and `terms/page.tsx` hard-code their text and an August 2026 last-updated label; they have no separately maintained effective date, change history or table of contents.
- Both need the correct legal entity name, full address, effective date, contact details and accountable owner. Privacy currently says Bengaluru, whereas the site configuration says HITEC City, Hyderabad; neither establishes the legal entity or its registered address.
- Identify a grievance contact/officer and procedure, identity verification and response target; confirm which legal rights, notices and mechanisms apply and how withdrawal and complaints are handled. Do not invent response deadlines or retention periods.
- Inventory actual data from contact, applications, accounts, payments, certificate verification, logs and analytics; document purposes, consent or other applicable basis, categories of recipients, subprocessors, transfers and safeguards. The current text names Razorpay or Stripe but provider use must be confirmed, and does not inventory hosting, email, messaging, advertising or analytics processors.
- Privacy claims deletion within 30 days, profile controls, marketing unsubscribe and no sale; verify each against real operations. It says certificates publish limited details, while the demo verification API also returns score and duration. The terms claim a seven-working-day refund in one case and particular program durations; owner and counsel must verify these commercial promises.
- Address children's data, age verification and parental consent where applicable; the terms' 16-year eligibility statement is not a substitute for a DPDP analysis. Confirm whether children use any service and the relevant statutory and rule requirements.
- Confirm client engagement scope, intellectual property, payment, revisions and confidentiality; internship eligibility, conduct, certificate/letter criteria and placement wording; and plan-specific refund/cancellation terms. All unresolved commercial facts are TODO(owner), not defaults.
- No category-based consent manager or footer settings control was identified. Source search did not find GA4/Meta Pixel implementation; inspect deployment-injected scripts too before claiming no tracking fires before consent.
- There is no documented authenticated data-request workflow with durable request IDs, status tracking and verified identity. Define minimisation, access control, retention and operational ownership before building one.
- Add explicit canonicals, review sitemap and footer/form links, accessible anchors and print presentation. Review required consent checkboxes individually rather than assuming every form has the same legal basis.

## Review process

TODO(owner): supply verified entity, address, processor inventory, contact and grievance details, commercial terms, retention schedule, policy dates and response targets. Counsel must approve wording and assess the Act, rules, commencement and other applicable requirements before publication.
