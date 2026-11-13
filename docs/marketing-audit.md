# Marketing routes audit

## Internships

`src/lib/constants.ts` is the typed shared source of the three plans and ten tracks; both homepage and overview import it. Prices shown by their plan cards match: Foundation 4 weeks ₹149, Professional 6 weeks ₹199, Industry 8 weeks ₹299. The overview comparison separately hard-codes these prices and durations. Its Foundation and Professional counts match the plan features; Industry sessions are described as “Full” and assignments as “—”. The overview says a 70% final assessment is required for everyone, whereas Industry data specifies 75%. The application wizard advertises 2/3/4 projects versus the plan data's 1/2/4; its duration can differ from the selected plan. The homepage's 300+ interns claim has no source in the shared data. TODO(owner): verify it.

The dynamic route folder is `[category]`, but originally `generateStaticParams`, metadata and page read `slug`; all ten routes consequently failed lookup. The route was corrected to use `category`; unknown categories use `notFound()`. Sitemap tracks now derive from the same category data.

All ten tracks have an overview, four learning outcomes, skills, prerequisites, and one to three FAQs. None has an approved per-week syllabus, learning outcomes per week, timings, weekly hours, named project deliverable with evidence, career roles, or verified mentor profile/photo/experience/LinkedIn. Web Development and AI Automation have a general project description in their FAQ; Digital Marketing and UI/UX describe a brief, but still lack deliverable evidence. Meta Ads, Automation, Graphic Design, Content Writing, SEO and Video Editing lack a specific approved project description. Named mentors in the route also appear in `sample-data.ts` demo users; TODO(owner): confirm identities and permissions before treating them as real. No approved intern testimonials or example reports were identified.

## Portfolio

Both routes deliberately use `src/lib/data/public-portfolio.ts`, an empty approval-gated array. The six requested projects only appear in `sample-data.ts` as demonstration fixtures; consequently all six detail URLs return 404 and none has approved images or verified results. Do not publish fixtures as client work. TODO(owner): provide approved case studies, permission, image assets, metric definitions and measurement periods. The fixtures lack complete challenge, approach, timeline, tools/team and evidence fields. The index and detail pages have canonical metadata; details use a generic OG image and gradient placeholder rather than screenshots.

## Blog

The source is `src/lib/data/sample-data.ts`: eight fixture posts, all flagged published, currently rendered on public routes. Each stores an author, category, tags, relative publication date and reading time; dates change on each execution. There is no updated date or author bio. The index provides client-side search and categories but no URL state or pagination. Related posts use tags/categories; there are no taxonomy routes or RSS feed. The detail route does not check `published`, so a draft can be accessed directly. TODO(owner): approve or remove demo posts and replace relative dates with actual publication dates before launch.

Smallest viable model: slug, title, excerpt, content, status (`draft`/`published`), stable published and updated dates, author name and bio, category, tags, image with alt text, and relevant service/track links. Render and syndicate only published records; validate unique slugs and dates.
