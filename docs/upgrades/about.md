# About page (`/about`): 30 upgrade steps

Source audit of `src/app/(marketing)/about/page.tsx` and the shared root layout. Line numbers refer to the files as inspected. These are recommendations, not claims that a feature is broken or that a business fact is verified. Validate changes with the team and real users before publication.

## SEO and structured data

1. Make the title more specific to the business and location, after confirming the intended search audience; the current title describes only digital services and learning (`src/app/(marketing)/about/page.tsx:8-10`).
2. Check the rendered title for a duplicated brand name: the page title already contains Akradhii while the root title template appends it (`src/app/(marketing)/about/page.tsx:9`; `src/app/layout.tsx:20-23`).
3. Add Hyderabad or India to the description if accurate and useful to the audience, while keeping the description natural (`src/app/(marketing)/about/page.tsx:10`).
4. Replace the SVG social preview with a 1200×630 PNG or JPEG and verify its absolute URL in social sharing debuggers (`src/app/(marketing)/about/page.tsx:12`).
5. Add explicit Twitter card title, description and raster image for this route instead of relying on inherited root values (`src/app/(marketing)/about/page.tsx:8-13`; `src/app/layout.tsx:50-55`).
6. Use a shared verified production origin for the canonical and social URLs rather than a separately hard-coded constant; test the rendered `/about` canonical (`src/app/(marketing)/about/page.tsx:7-12`).
7. Correct the shared ProfessionalService JSON-LD's Vercel URL, logo and image to the verified canonical production domain; this structured data is emitted on the About route too (`src/app/layout.tsx:65-75,104-110`).
8. Verify the address, coordinates, contact details, hours and social profiles before relying on the shared structured data; do not invent missing business details (`src/app/layout.tsx:75-101`).

## Copy and trust

9. Replace the abstract hero heading with a concise description of the agency and learning offering, while retaining the two-audience positioning (`src/app/(marketing)/about/page.tsx:45-47`).
10. Identify the intended business customers and learners in the opening paragraph so each visitor can quickly decide whether the page is relevant (`src/app/(marketing)/about/page.tsx:47`).
11. Add the verified founding story, date and location to “Our story” rather than leaving it entirely focused on generic business problems (`src/app/(marketing)/about/page.tsx:68-74`).
12. Support the claim that services combine multiple disciplines with links to approved examples or explain how the disciplines collaborate (`src/app/(marketing)/about/page.tsx:71-73`).
13. Give the mission a concrete, verifiable example of the outcomes the team seeks for clients and learners (`src/app/(marketing)/about/page.tsx:77-79`).
14. Explain what distinguishes the vision from the mission, or combine the two if no specific distinction can be substantiated (`src/app/(marketing)/about/page.tsx:78-79`).
15. Link the business capability descriptions to relevant service details so readers can inspect scope rather than infer it from a broad list (`src/app/(marketing)/about/page.tsx:23-30,89`).
16. Verify that every linked service is currently offered and uses the correct slug; the service links are generated from shared configuration (`src/app/(marketing)/about/page.tsx:4,84`).
17. Confirm whether recorded lessons, assessment duration and completion-dependent certificates reflect the live internship process; update the list and caveat together (`src/app/(marketing)/about/page.tsx:85`).
18. Link directly from the learning description to current program prices, eligibility and cancellation terms when those details are approved (`src/app/(marketing)/about/page.tsx:85`).
19. Add a certificate verification link beside the completion explanation, including a short explanation of what a verifier needs (`src/app/(marketing)/about/page.tsx:85`).
20. Add client-approved case studies or other attributable evidence to support the “connected capabilities” section; do not publish invented results (`src/app/(marketing)/about/page.tsx:89`).
21. Explain deliverables, customer participation and indicative timing for each process stage where the business can commit to them (`src/app/(marketing)/about/page.tsx:31-36,91`).
22. Pair each value with a concrete practice or example, such as how scope changes are communicated, rather than leaving the values as broad statements (`src/app/(marketing)/about/page.tsx:15-22,93`).
23. Replace the team placeholder with consented profiles and roles when approved, or remove the section until material is available (`src/app/(marketing)/about/page.tsx:95`).

## UX and accessibility

24. Give the hero a clearly dominant next step for the primary audience and keep the other audience's route visibly secondary; test whether three adjacent links create friction (`src/app/(marketing)/about/page.tsx:48-52`).
25. Clarify what happens after “Contact us” and the expected response time if the business can reliably support it (`src/app/(marketing)/about/page.tsx:95-96`).
26. Check keyboard focus visibility on the dynamically generated service links and lower-page links, not just the shared hero button style (`src/app/(marketing)/about/page.tsx:37,84,95-96`).
27. Test text contrast for violet and muted text across the dark surfaces, including small uppercase labels; adjust colors where measured contrast fails (`src/app/(marketing)/about/page.tsx:45,58,62,78-79`).
28. Test the `Reveal`-wrapped content with reduced motion, keyboard navigation and JavaScript disabled; ensure content never remains hidden when animation is unavailable (`src/app/(marketing)/about/page.tsx:44-54,68-70,91`).

## Measurement and performance

29. Instrument the service, internship and contact links with privacy-preserving, consent-gated events if analytics is configured; do not include personal data in event payloads (`src/app/(marketing)/about/page.tsx:48-51,84-85,96`).
30. Run mobile Lighthouse and field Core Web Vitals for `/about`, measuring the effect of repeated `Reveal` wrappers and decorative blur before changing them; the root already uses `next/font` (`src/app/(marketing)/about/page.tsx:44-56,89-96`; `src/app/layout.tsx:2,8-16`).
