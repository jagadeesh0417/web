# Verification wording changes for review

These changes describe manual verification; they do not establish that online verification exists. Dynamic values below are shown in braces.

| Location | Before | After |
|---|---|---|
| `src/app/(marketing)/page.tsx` | “Structured programs with live mentorship, real projects and verifiable certificates.” | “Structured programs with live mentorship, real projects and completion certificates.” |
| `src/app/(marketing)/company/page.tsx` | “Structured programs with projects, assessment and verifiable certificates.” | “Structured programs with projects, assessment and completion certificates.” |
| `src/app/(marketing)/internships/[category]/page.tsx` OG description | “Project-based {category} internship with mentorship, real projects and verifiable certificates.” | “Project-based {category} internship with mentorship, projects and completion certificates.” |
| `src/app/(marketing)/internships/page.tsx` metadata | “earn a verifiable certificate” / “QR-verifiable certificates” | “earn a completion certificate” / “completion certificates” |
| Same page hero | “Earn a verifiable certificate.” | “Earn a completion certificate.” |
| Same page learning flow | “Receive a QR-verifiable certificate of completion.” | “Receive a certificate of completion when eligible.” |
| Same page journey | “From program selection to a verified certificate — aligned with the live student dashboard.” | “From program selection to a completion certificate — aligned with the student dashboard.” |
| Same page benefits | “QR-verifiable certificate of completion” | “Certificate of completion” |
| Same page verification section | “Anyone … can instantly confirm it is authentic and has not been revoked” and four QR/API/status steps | “Online verification is not yet available. Contact support to request manual verification.” and email support with ID and certificate copy. |
| `src/app/(marketing)/privacy/page.tsx` **NEEDS LAWYER REVIEW** | “Issued certificates are registered with a public verification record containing your name, program, and completion date. The QR code on your certificate links to our verification page so employers can confirm authenticity.” | “Online certificate verification is not yet available. Contact support to request manual verification of a certificate.” |
| `src/app/(marketing)/terms/page.tsx` **NEEDS LAWYER REVIEW** | “Certificates include a QR code that verifies authenticity against our public registry. We reserve the right to revoke certificates issued based on fraudulent submissions.” | “Online certificate verification is not yet available. Contact support to request manual verification. We reserve the right to revoke certificates issued based on fraudulent submissions.” |
| `src/app/(auth)/layout.tsx` | “Verifiable certificates” / “Interns earn QR-verifiable certificates and reports.” | “Completion certificates” / “Interns can request manual certificate verification.” |
| `src/app/student/certificate/page.tsx` | “Proof of completion · verifiable online”; “Generating verification QR…” | “Proof of completion · manual verification on request”; “Generating verification information…” |
| `src/app/student/offer-letter/page.tsx` | “The certificate can be verified online using its unique ID by any employer.” | “Employers can contact support to request manual certificate verification.” |
| `src/app/(dashboard)/admin/certificates/page.tsx` | “Each has a unique ID, QR code and public verification.” | “Manual verification is available on request.” |
| `src/app/(dashboard)/admin/certificate-templates/page.tsx` | “Scan to verify”; “Verify authenticity at {verifyUrl}” | “Verification information”; “Manual verification information: {verifyUrl}” |
| `src/components/certificate/certificate-view.tsx` | “Scan to verify”; “Verify authenticity at {verifyUrl}” | “Verification information”; “Manual verification information: {verifyUrl}” |
| `src/lib/certificate/pdf-generator.ts` PDF | “Scan to verify” | “Verification information” |
| `src/lib/notifications.ts` certificate email | “Anyone can verify it at {verifyUrl}.”; CTA “Verify certificate” | “Manual verification information: {verifyUrl}.”; CTA “Verification information” |
| `src/app/verify/layout.tsx` | “Verify the authenticity … by entering the certificate ID or scanning the QR code.” | “Request manual verification of an Akradhii internship certificate from support.” |
| `src/app/verify/page.tsx` | Online lookup form and “Instant Verification” instructions | “Online certificate verification is not yet available” and support email for manual verification. |
| `src/components/marketing/footer.tsx` | “Verify certificate”; “Certificate verification” | “Manual certificate verification” for both links. |
| `src/lib/data/sample-data.ts` assessment | “What is a QR code used for on a certificate?” with “Quick verification of authenticity” as answer | “How can a certificate be verified while online verification is unavailable?” with “Contact support for manual verification” as answer. |
