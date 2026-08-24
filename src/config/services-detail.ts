import { services as hubServices } from "@/config/site";

export type ServiceDetail = {
  slug: string;
  title: string;
  shortDescription: string;
  keyBenefit: string;
  icon: string;
  gradient: string;
  heroHeadline: string;
  heroDescription: string;
  intro: string[];
  whatWeProvide: { title: string; description: string }[];
  benefits: { title: string; description: string }[];
  whoFor: string[];
  process: { step: string; title: string; description: string }[];
  deliverables: string[];
  technologies: string[];
  techLabel: string;
  whyUs: { title: string; description: string }[];
  portfolioService: string;
  faqs: { q: string; a: string }[];
  related: string[];
  seoTitle: string;
  seoDescription: string;
  ctaHeadline: string;
  ctaBody: string;
};

export const serviceDetails: ServiceDetail[] = [
  {
    slug: "web-development",
    title: "Website Design & Development",
    shortDescription:
      "High-converting, lightning-fast websites and web apps engineered for growth — from landing pages to full-scale platforms.",
    keyBenefit: "Ship a site that converts visitors into leads and customers",
    icon: "Code2",
    gradient: "from-violet-600 to-indigo-600",
    heroHeadline: "Websites and web apps built for speed, clarity and conversion",
    heroDescription:
      "From marketing sites to custom platforms — we design, develop and launch experiences that load fast, work on every device and support your growth goals.",
    intro: [
      "Your website is often the first serious conversation a prospect has with your brand. If it is slow, confusing or hard to update, you lose trust before sales ever starts.",
      "We build modern websites and web applications that balance design, performance and maintainability — so your team can publish content, capture leads and scale without constant rework.",
      "Our approach is product-minded: clear information architecture, mobile-first UI, secure foundations and a handoff your team can actually use day to day.",
    ],
    whatWeProvide: [
      { title: "Business & marketing websites", description: "Multi-page sites that explain your offer, build credibility and drive enquiries." },
      { title: "Landing pages", description: "Focused pages for campaigns, product launches and paid traffic with clear CTAs." },
      { title: "Web applications", description: "Custom dashboards, portals and internal tools tailored to your workflows." },
      { title: "E-commerce storefronts", description: "Product catalogues, carts and checkout flows integrated with payments where needed." },
      { title: "CMS & content systems", description: "Editable content structures so marketing can update pages without engineering every time." },
      { title: "API & third-party integrations", description: "CRMs, payment gateways, forms, analytics and automation tools wired cleanly." },
      { title: "Auth & admin panels", description: "Secure sign-in, roles and admin interfaces for managing data and users." },
      { title: "Performance & SEO foundations", description: "Core Web Vitals, clean markup, sitemaps and technical hygiene for search." },
      { title: "Hosting & deployment", description: "Production deploys, environments and monitoring setup for a reliable launch." },
    ],
    benefits: [
      { title: "Stronger first impressions", description: "A polished, professional site that matches the quality of your product or service." },
      { title: "More qualified enquiries", description: "Clear messaging, forms and CTAs designed to turn traffic into conversations." },
      { title: "Faster load times", description: "Performance-first builds that keep bounce rates down on mobile and desktop." },
      { title: "Easier content updates", description: "Structures that let your team change copy and pages without starting from scratch." },
      { title: "Room to grow", description: "Architecture that can expand into new features, languages or products later." },
      { title: "Lower long-term friction", description: "Documented handoff and sensible tech choices so maintenance stays predictable." },
    ],
    whoFor: [
      "Startups launching or rebuilding their primary website",
      "SMBs that need a credible online presence that generates leads",
      "Product companies needing marketing sites plus app shells",
      "Service businesses wanting booking or enquiry-led sites",
      "Teams migrating from outdated builders or legacy stacks",
    ],
    process: [
      { step: "01", title: "Discovery", description: "Goals, audience, competitors, content inventory and success metrics." },
      { step: "02", title: "IA & UX", description: "Sitemap, wireframes and user flows that make navigation obvious." },
      { step: "03", title: "Visual design", description: "UI design system, key templates and mobile layouts aligned to your brand." },
      { step: "04", title: "Development", description: "Frontend, backend, CMS and integrations built in iterative milestones." },
      { step: "05", title: "QA & polish", description: "Cross-device testing, accessibility checks, performance and content QA." },
      { step: "06", title: "Launch", description: "DNS, SSL, analytics, redirects and go-live checklist." },
      { step: "07", title: "Support", description: "Post-launch fixes, training and optional retainers for ongoing work." },
    ],
    deliverables: [
      "Responsive production website or web app",
      "Source code and deployment configuration",
      "CMS or admin access (where in scope)",
      "Form / CRM integrations configured",
      "Analytics baseline (e.g. events + page views)",
      "Basic technical SEO setup (meta, sitemap, robots)",
      "Launch checklist and short handoff guide",
    ],
    technologies: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Node.js", "Supabase", "Vercel", "REST APIs"],
    techLabel: "Technologies we commonly use",
    whyUs: [
      { title: "Business-first builds", description: "We design around conversion and operations — not just pretty pages." },
      { title: "Modern, maintainable stack", description: "Clean code and common tools so your next hire can pick up the project." },
      { title: "Mobile-first by default", description: "Layouts and performance tuned for the devices your audience actually uses." },
      { title: "Transparent milestones", description: "Clear scope, demos and feedback loops so you always know what ships next." },
    ],
    portfolioService: "Web Development",
    faqs: [
      { q: "How long does a typical website project take?", a: "Most marketing sites land in 4–8 weeks depending on pages, content readiness and integrations. Custom apps are scoped after discovery." },
      { q: "Can you rebuild our existing site?", a: "Yes. We can redesign and re-platform while preserving SEO value with redirects and content migration where needed." },
      { q: "Will the site work on mobile?", a: "Yes. Every build is responsive and tested across common phone and tablet sizes." },
      { q: "Can you integrate payments or a CRM?", a: "Yes — payment gateways, CRMs, calendars and marketing tools are common integrations when defined in scope." },
      { q: "Do we get the source code?", a: "Yes. You own the deliverables agreed in the statement of work, including source access for custom builds." },
      { q: "Can you maintain the site after launch?", a: "Optional support retainers cover updates, security patches, small features and performance checks." },
      { q: "Can you work with our existing domain and hosting?", a: "Usually yes. We can deploy to your preferred host or recommend a stack that fits your traffic and budget." },
    ],
    related: ["meta-ads", "seo", "branding", "crm"],
    seoTitle: "Website Design & Development Services | Akradhii",
    seoDescription:
      "Custom responsive websites and web applications from Akradhii — design, development, CMS, integrations and launch support for growing brands.",
    ctaHeadline: "Ready for a website that works as hard as you do?",
    ctaBody: "Tell us about your goals, timeline and current site. We’ll recommend a clear path from brief to launch.",
  },
  {
    slug: "meta-ads",
    title: "Meta Ads",
    shortDescription:
      "Full-funnel Facebook & Instagram ad campaigns built on creative strategy, precise targeting and relentless optimization.",
    keyBenefit: "Turn paid social into a predictable pipeline of leads and sales",
    icon: "Megaphone",
    gradient: "from-blue-600 to-cyan-500",
    heroHeadline: "Meta Ads that compound — creative, targeting and measurement together",
    heroDescription:
      "We plan, launch and optimize Facebook & Instagram campaigns so every rupee has a job: awareness, consideration or conversion.",
    intro: [
      "Paid social fails when creative, audience and offer are treated as separate problems. We run Meta as a system: research → creative tests → structure → scale → reporting.",
      "Whether you sell products online or generate B2B leads, we focus on unit economics — CPA, ROAS, lead quality — not vanity metrics alone.",
      "You get a clear weekly rhythm: what we tested, what worked, and what we will change next.",
    ],
    whatWeProvide: [
      { title: "Account & pixel setup", description: "Business Manager hygiene, pixels/CAPI guidance and event tracking foundations." },
      { title: "Funnel strategy", description: "Awareness, retargeting and conversion structures matched to your offer and budget." },
      { title: "Audience research", description: "Interest, lookalike and first-party audience plans grounded in your data." },
      { title: "Creative direction", description: "Hooks, formats and testing matrices for feed, stories and reels." },
      { title: "Campaign build & launch", description: "Ad sets, budgets, placements and naming conventions that stay maintainable." },
      { title: "Ongoing optimization", description: "Creative fatigue checks, bid strategy tweaks and budget reallocation." },
      { title: "Landing page feedback", description: "Notes on message match and conversion blockers on your site or LP." },
      { title: "Reporting", description: "Clear dashboards and narrative reports your team can act on." },
    ],
    benefits: [
      { title: "Faster learning cycles", description: "Structured tests that find winning creatives and audiences sooner." },
      { title: "Better cost efficiency", description: "Budget shifts toward what actually drives leads or purchases." },
      { title: "Full-funnel coverage", description: "Prospecting and retargeting working together instead of one-off ads." },
      { title: "Creative that sells", description: "Messaging and formats designed for the scroll — not just brand polish." },
      { title: "Transparent performance", description: "Reporting that ties spend to outcomes your business cares about." },
    ],
    whoFor: [
      "D2C and e-commerce brands scaling paid social",
      "Local and service businesses generating leads",
      "SaaS and B2B teams running demand generation",
      "Founders who have tried Meta Ads without a system",
      "Teams with creative assets ready to test at volume",
    ],
    process: [
      { step: "01", title: "Audit & goals", description: "Account review, offer clarity, KPIs and budget reality check." },
      { step: "02", title: "Tracking setup", description: "Events, UTMs and conversion definitions locked before spend scales." },
      { step: "03", title: "Strategy & creative plan", description: "Funnel map, audience plan and test backlog." },
      { step: "04", title: "Launch", description: "Campaigns live with controlled budgets and clear naming." },
      { step: "05", title: "Optimize", description: "Weekly creative and structure iterations based on data." },
      { step: "06", title: "Scale", description: "Expand winners carefully while protecting efficiency." },
      { step: "07", title: "Report & plan", description: "Insights, learnings and next-sprint priorities." },
    ],
    deliverables: [
      "Campaign structure and naming system",
      "Audience and creative testing plan",
      "Live Meta campaigns under agreed budgets",
      "Weekly optimization notes",
      "Performance reports (period agreed in SOW)",
      "Recommendations for landing pages and offers",
    ],
    technologies: ["Meta Ads Manager", "Meta Pixel / CAPI", "Creative testing frameworks", "UTM tracking", "Looker / Sheets dashboards"],
    techLabel: "Platforms & tools",
    whyUs: [
      { title: "Full-funnel operators", description: "We don’t stop at “boost a post” — structure and creative are designed together." },
      { title: "Creative-led growth", description: "Most gains come from hooks and offers; we treat creative as a primary lever." },
      { title: "Honest reporting", description: "You’ll know what is working, what isn’t, and why we’re changing course." },
      { title: "Integrated with your site", description: "We align ads with landing pages, CRM and analytics when those pieces exist." },
    ],
    portfolioService: "Meta Ads",
    faqs: [
      { q: "What budget do we need to start?", a: "It depends on your offer and market. We’ll recommend a test budget that can produce statistically useful learning — not a vanity spend." },
      { q: "Do you create ad creatives?", a: "We provide creative direction and testing plans. Production can be handled by your team, our design support, or a hybrid — scoped upfront." },
      { q: "How soon will we see results?", a: "Learning phases typically need 1–3 weeks of clean data. Sustainable efficiency usually emerges after several test cycles." },
      { q: "Can you manage an existing ad account?", a: "Yes. We start with an audit, fix tracking and structure issues, then rebuild where needed." },
      { q: "Do you handle Google Ads too?", a: "Our core paid offering here is Meta. Cross-channel plans can be discussed if your growth mix requires it." },
      { q: "How do you measure success?", a: "We align on primary KPIs (leads, purchases, CPA, ROAS) and secondary diagnostics before campaigns scale." },
    ],
    related: ["web-development", "seo", "branding", "automation"],
    seoTitle: "Meta Ads Management | Facebook & Instagram Ads | Akradhii",
    seoDescription:
      "Full-funnel Meta Ads from Akradhii — strategy, creative testing, targeting and optimization for Facebook and Instagram growth.",
    ctaHeadline: "Want paid social that actually compounds?",
    ctaBody: "Share your offer, monthly budget and current results. We’ll outline a practical Meta testing plan.",
  },
  {
    slug: "automation",
    title: "Business Automation",
    shortDescription:
      "Eliminate repetitive work with workflows that connect your tools, qualify leads and close deals on autopilot.",
    keyBenefit: "Reclaim hours every week with reliable, connected workflows",
    icon: "Workflow",
    gradient: "from-emerald-600 to-teal-500",
    heroHeadline: "Automate the busywork — keep humans for the high-value decisions",
    heroDescription:
      "We design and implement workflows that move data between your tools, trigger the right follow-ups and keep teams in sync without spreadsheet chaos.",
    intro: [
      "Most teams lose time to copy-paste, missed follow-ups and tools that don’t talk to each other. Automation fixes the plumbing so people can focus on selling, supporting and building.",
      "We map your real process first — then automate the steps that are rules-based, frequent and error-prone.",
      "The result is fewer dropped leads, faster response times and operations you can actually measure.",
    ],
    whatWeProvide: [
      { title: "Process mapping", description: "Document current workflows, bottlenecks and handoffs before building anything." },
      { title: "Workflow design", description: "Event-driven automations with clear triggers, conditions and owners." },
      { title: "Tool integration", description: "Connect CRM, forms, email, chat, sheets, payment and support tools." },
      { title: "Lead routing & nurturing", description: "Assign leads, notify teams and trigger sequences based on rules." },
      { title: "Notifications & SLAs", description: "Alerts on WhatsApp, email or chat when something needs attention." },
      { title: "Reporting pipelines", description: "Automatic rollups so leadership sees status without manual exports." },
      { title: "SOP automation", description: "Checklists and approvals embedded into the tools people already use." },
      { title: "Monitoring & fixes", description: "Error handling, logs and iteration after go-live." },
    ],
    benefits: [
      { title: "Hours back every week", description: "Repetitive tasks run without someone babysitting a spreadsheet." },
      { title: "Faster lead response", description: "New enquiries reach the right person in minutes, not hours." },
      { title: "Fewer human errors", description: "Consistent data entry and status updates across systems." },
      { title: "Better visibility", description: "Dashboards and alerts that show where work is stuck." },
      { title: "Scalable operations", description: "Handle more volume without linear headcount growth." },
    ],
    whoFor: [
      "Sales teams drowning in manual CRM updates",
      "Agencies and service businesses with multi-step delivery",
      "E-commerce ops with order and support handoffs",
      "Founders who outgrew Zapier spaghetti",
      "Teams connecting forms, WhatsApp, CRM and email",
    ],
    process: [
      { step: "01", title: "Discovery workshops", description: "Map tools, owners, pain points and success metrics." },
      { step: "02", title: "Prioritize automations", description: "Rank by impact vs complexity; pick a first shippable set." },
      { step: "03", title: "Design", description: "Flow diagrams, edge cases, data fields and failure modes." },
      { step: "04", title: "Build & integrate", description: "Implement workflows, auth and test environments." },
      { step: "05", title: "UAT", description: "Run real scenarios with your team and refine." },
      { step: "06", title: "Go-live", description: "Cut over carefully with monitoring." },
      { step: "07", title: "Iterate", description: "Tune based on usage and add the next wave of automations." },
    ],
    deliverables: [
      "Documented process map",
      "Live automations in agreed tools",
      "Integration credentials handoff guide",
      "Error handling and basic monitoring",
      "Team walkthrough / short training",
      "Backlog of next automation opportunities",
    ],
    technologies: ["n8n", "Make", "Zapier", "Webhooks", "HubSpot / CRM APIs", "Google Sheets", "WhatsApp APIs", "Custom Node scripts"],
    techLabel: "Tools & platforms",
    whyUs: [
      { title: "Process before platforms", description: "We automate the real workflow — not a generic template." },
      { title: "Reliable by design", description: "Retries, logging and ownership so automations don’t silently fail." },
      { title: "Human-friendly rollouts", description: "Training and change management so the team actually adopts it." },
      { title: "Works with your stack", description: "We meet you in the tools you already pay for when possible." },
    ],
    portfolioService: "Business Automation",
    faqs: [
      { q: "Which tools can you connect?", a: "Most modern CRMs, form tools, email platforms, sheets, chat apps and custom APIs. We’ll confirm during discovery." },
      { q: "Do we need developers on our side?", a: "Not always. Many automations are no/low-code. Custom APIs or internal systems may need light engineering support." },
      { q: "How long until the first automation is live?", a: "Simple workflows can ship in days after discovery. Multi-system projects are phased over weeks." },
      { q: "What if an automation fails?", a: "We add monitoring and failure paths (alerts, retries, manual fallback) so issues are visible quickly." },
      { q: "Can you replace our current Zapier setup?", a: "Yes — we can audit, consolidate and rebuild fragile zaps into a cleaner architecture." },
    ],
    related: ["crm", "ai-automation", "web-development", "meta-ads"],
    seoTitle: "Business Automation Services | Workflow & Integration | Akradhii",
    seoDescription:
      "Business automation by Akradhii — workflow design, tool integration, lead routing and reporting pipelines that save hours every week.",
    ctaHeadline: "Ready to stop doing the same task twice?",
    ctaBody: "Describe the process that drains your team. We’ll suggest automations with clear ROI.",
  },
  {
    slug: "crm",
    title: "CRM Solutions",
    shortDescription:
      "A single source of truth for your sales pipeline — set up, customized and adopted across your team.",
    keyBenefit: "One pipeline everyone trusts — from first touch to closed deal",
    icon: "Database",
    gradient: "from-sky-600 to-blue-700",
    heroHeadline: "CRM that your sales team will actually use",
    heroDescription:
      "We implement and customize CRM systems around your pipeline stages, fields and reporting — with training so adoption sticks.",
    intro: [
      "A CRM only creates value when data is clean, stages match reality and the team updates it as part of daily work.",
      "We help you choose or refine a CRM, design the pipeline, migrate data carefully and train people so the system becomes the source of truth — not a side chore.",
      "The goal is simple: know where every deal stands, what to do next, and how the funnel is performing.",
    ],
    whatWeProvide: [
      { title: "CRM selection guidance", description: "Fit assessment against your process, team size and budget." },
      { title: "Pipeline design", description: "Stages, exit criteria, owners and SLAs that match how you sell." },
      { title: "Custom fields & objects", description: "Data model for leads, deals, companies and custom entities." },
      { title: "Migration", description: "Import from sheets or legacy tools with cleanup and mapping." },
      { title: "Automations inside CRM", description: "Task creation, stage triggers, reminders and lead assignment." },
      { title: "Integrations", description: "Website forms, email, WhatsApp, calendars and billing tools." },
      { title: "Dashboards", description: "Pipeline, conversion and activity reports for managers and founders." },
      { title: "Team training", description: "Role-based sessions and short SOPs so adoption is practical." },
    ],
    benefits: [
      { title: "Visibility for leadership", description: "Forecast and bottleneck analysis without chasing updates in chat." },
      { title: "Consistent sales process", description: "Everyone follows the same stages and next steps." },
      { title: "Higher follow-up rates", description: "Tasks and reminders reduce dropped conversations." },
      { title: "Cleaner data over time", description: "Required fields and hygiene rules prevent garbage-in." },
      { title: "Faster onboarding", description: "New reps ramp on a documented pipeline, not tribal knowledge." },
    ],
    whoFor: [
      "Founder-led sales teams moving off spreadsheets",
      "Growing SMBs with multiple reps or partners",
      "Agencies tracking retainers and upsells",
      "B2B companies with multi-stage deals",
      "Teams migrating between CRM platforms",
    ],
    process: [
      { step: "01", title: "Process interview", description: "How leads arrive, how deals move, where things break." },
      { step: "02", title: "Blueprint", description: "Pipeline, fields, permissions and integration list." },
      { step: "03", title: "Configure", description: "Build the CRM environment and automations." },
      { step: "04", title: "Migrate", description: "Clean and import historical data carefully." },
      { step: "05", title: "Integrate", description: "Connect website, forms and communication tools." },
      { step: "06", title: "Train", description: "Hands-on sessions for reps and managers." },
      { step: "07", title: "Stabilize", description: "Office hours, tweaks and adoption checks post-launch." },
    ],
    deliverables: [
      "Configured CRM workspace",
      "Pipeline stages and field definitions",
      "Migrated contacts/deals (scope-dependent)",
      "Core automations and assignments",
      "Manager dashboards",
      "Training session + quick-reference SOP",
    ],
    technologies: ["HubSpot", "Zoho CRM", "Pipedrive", "Salesforce (light)", "Webhooks", "Form tools", "Google Workspace"],
    techLabel: "CRMs & integrations",
    whyUs: [
      { title: "Adoption-first implementation", description: "We design for how salespeople work — not just admin settings." },
      { title: "Clean data migration", description: "Mapping and cleanup so you don’t import years of mess." },
      { title: "Connected GTM stack", description: "CRM sits with your website, ads and automation — not in isolation." },
      { title: "Practical training", description: "Short, role-based enablement so the system sticks." },
    ],
    portfolioService: "Business Automation",
    faqs: [
      { q: "Which CRM should we use?", a: "It depends on team size, complexity and budget. We’ll recommend based on your process — not a one-size pitch." },
      { q: "Can you migrate from Google Sheets?", a: "Yes. We map columns, clean duplicates and import with validation." },
      { q: "Will our team actually use it?", a: "Adoption is part of the project: simple pipelines, required fields that make sense, and training tied to daily habits." },
      { q: "Do you build custom CRMs?", a: "Most clients are better served by configuring a proven CRM. Custom apps are only recommended when off-the-shelf tools truly cannot fit." },
      { q: "How long does setup take?", a: "Focused SMB setups often complete in 2–6 weeks including migration and training." },
    ],
    related: ["automation", "ai-automation", "web-development", "meta-ads"],
    seoTitle: "CRM Setup & Implementation Services | Akradhii",
    seoDescription:
      "CRM solutions from Akradhii — pipeline design, migration, automations, dashboards and team training so your sales system becomes the source of truth.",
    ctaHeadline: "Want a pipeline you can trust every Monday morning?",
    ctaBody: "Tell us how you sell today and which tools you use. We’ll propose a CRM blueprint that fits.",
  },
  {
    slug: "ai-automation",
    title: "AI Automation",
    shortDescription:
      "Custom AI assistants, chatbots and intelligent workflows that handle support, sales and operations at scale.",
    keyBenefit: "Put AI to work on real tasks — with guardrails your business can trust",
    icon: "BrainCircuit",
    gradient: "from-fuchsia-600 to-purple-700",
    heroHeadline: "AI that does useful work — not just demos",
    heroDescription:
      "We build AI assistants, document workflows and intelligent automations grounded in your data, policies and tools — with human oversight where it matters.",
    intro: [
      "AI creates value when it is connected to your knowledge, systems and quality bar — not when it is a standalone chatbot with generic answers.",
      "We scope use cases carefully: support deflection, internal Q&A, lead qualification, document extraction and content assists that save real hours.",
      "Safety, tone and escalation paths are part of the design so customers and staff know when a human takes over.",
    ],
    whatWeProvide: [
      { title: "Use-case discovery", description: "Identify high-ROI AI opportunities with clear success metrics." },
      { title: "Knowledge-grounded assistants", description: "Chat experiences powered by your docs, FAQs and policies." },
      { title: "Website & WhatsApp bots", description: "Lead capture and support bots with handoff to humans." },
      { title: "Document AI", description: "Extract, classify and route information from PDFs and forms." },
      { title: "Internal copilots", description: "Assistants for sales, support or ops teams inside existing tools." },
      { title: "Workflow orchestration", description: "AI steps embedded into automations with approvals." },
      { title: "Evaluation & monitoring", description: "Test sets, feedback loops and quality checks over time." },
      { title: "Governance basics", description: "Access control, data boundaries and prompt/version hygiene." },
    ],
    benefits: [
      { title: "Faster responses", description: "Customers and staff get answers without waiting in queues for common questions." },
      { title: "Consistent quality", description: "Responses grounded in approved knowledge reduce guesswork." },
      { title: "Lower repetitive load", description: "Teams spend time on exceptions, not copy-paste answers." },
      { title: "Always-on coverage", description: "Assistants handle off-hours FAQs and routing." },
      { title: "Measurable impact", description: "Deflection rates, time saved and conversion assists tracked clearly." },
    ],
    whoFor: [
      "Support teams with high FAQ volume",
      "Sales teams qualifying inbound leads",
      "Ops teams processing documents and tickets",
      "Product companies embedding assistants into portals",
      "Businesses ready to pilot AI with clear boundaries",
    ],
    process: [
      { step: "01", title: "Opportunity map", description: "Find use cases with data availability and clear ROI." },
      { step: "02", title: "Data & policy prep", description: "Sources, permissions, tone and escalation rules." },
      { step: "03", title: "Prototype", description: "A thin vertical slice users can try quickly." },
      { step: "04", title: "Integrate", description: "Connect channels, CRMs and authentication." },
      { step: "05", title: "Evaluate", description: "Test against real questions; fix failure modes." },
      { step: "06", title: "Launch with guardrails", description: "Human handoff, logging and rate limits." },
      { step: "07", title: "Improve", description: "Feedback loops and knowledge updates over time." },
    ],
    deliverables: [
      "Scoped AI use-case document",
      "Working assistant or workflow (MVP)",
      "Knowledge source connection",
      "Channel integration (web/WhatsApp/etc. as scoped)",
      "Basic evaluation set and monitoring notes",
      "Admin guide for updating knowledge",
    ],
    technologies: ["OpenAI / LLM APIs", "Retrieval (RAG)", "n8n / custom workers", "Vector stores", "WhatsApp / web chat", "Supabase"],
    techLabel: "AI stack & tooling",
    whyUs: [
      { title: "Grounded in your business", description: "We connect AI to real docs and systems — not generic chat." },
      { title: "Human-in-the-loop design", description: "Escalation paths keep quality and trust intact." },
      { title: "Pragmatic scope", description: "We start with one high-ROI use case before expanding." },
      { title: "Ops + product thinking", description: "Deployment includes monitoring, not just a demo link." },
    ],
    portfolioService: "Business Automation",
    faqs: [
      { q: "Will AI replace our support team?", a: "No. The goal is to handle repetitive questions and route complex cases to people faster." },
      { q: "Is our data used to train public models?", a: "We design with your privacy requirements. Enterprise API options and data boundaries are discussed during scoping." },
      { q: "How accurate will answers be?", a: "Accuracy depends on knowledge quality and evaluation. We set expectations, test real queries and keep humans for edge cases." },
      { q: "Can it work on WhatsApp?", a: "Yes — many clients start with web chat or WhatsApp for lead and support flows." },
      { q: "What does a pilot cost and take?", a: "Pilots are scoped after discovery; many MVPs land in a few weeks when data is ready." },
    ],
    related: ["automation", "crm", "web-development", "meta-ads"],
    seoTitle: "AI Automation & Custom AI Assistants | Akradhii",
    seoDescription:
      "AI automation services from Akradhii — custom assistants, document AI and intelligent workflows with guardrails for support, sales and operations.",
    ctaHeadline: "Have a process AI could take off your plate?",
    ctaBody: "Share the repetitive work slowing your team. We’ll recommend a safe, high-ROI pilot.",
  },
  {
    slug: "seo",
    title: "SEO",
    shortDescription:
      "Technical SEO, content strategy and authority building that compounds your organic visibility month after month.",
    keyBenefit: "Earn durable traffic from people already searching for what you offer",
    icon: "Search",
    gradient: "from-amber-500 to-orange-600",
    heroHeadline: "SEO that compounds — technical health, content and authority",
    heroDescription:
      "We improve how search engines understand and rank your site: fix technical blockers, target the right keywords and build content that earns clicks and trust.",
    intro: [
      "SEO is not a one-time checklist. It is the combination of a healthy site, relevant content and signals that you deserve to rank for the queries that matter.",
      "We start with measurement and technical foundations, then build a keyword and content plan tied to your services and funnel stages.",
      "Reporting focuses on rankings, qualified organic traffic and enquiries — not vanity keyword lists alone.",
    ],
    whatWeProvide: [
      { title: "Technical SEO audits", description: "Crawlability, indexation, Core Web Vitals, structured data and site architecture." },
      { title: "Keyword strategy", description: "Priority topics mapped to intent, competition and business value." },
      { title: "On-page optimization", description: "Titles, headings, internal links and content improvements on key pages." },
      { title: "Content roadmaps", description: "Pages and articles that support commercial and informational demand." },
      { title: "Local SEO", description: "Profiles, NAP consistency and location pages when relevant." },
      { title: "Authority building guidance", description: "Practical link and digital PR approaches — no shady shortcuts." },
      { title: "Analytics & Search Console", description: "Tracking setups and reviews that show what is working." },
      { title: "Monthly iteration", description: "Prioritized fixes and content ships based on data." },
    ],
    benefits: [
      { title: "Sustainable traffic", description: "Organic demand that does not turn off when ad spend pauses." },
      { title: "Higher-intent visitors", description: "People actively searching for solutions like yours." },
      { title: "Better site quality", description: "Technical fixes that help users and crawlers alike." },
      { title: "Content that sells", description: "Pages structured to educate and convert, not just rank." },
      { title: "Compounding results", description: "Each well-executed month builds on the last." },
    ],
    whoFor: [
      "Businesses with a website ready for organic growth",
      "Local service companies competing in their city",
      "SaaS and B2B brands with educational content needs",
      "E-commerce catalogues needing category/page SEO",
      "Teams that want a long-term channel beyond paid ads",
    ],
    process: [
      { step: "01", title: "Baseline", description: "Analytics, Search Console, rankings and competitor snapshot." },
      { step: "02", title: "Technical audit", description: "Crawl issues, speed, indexation and architecture findings." },
      { step: "03", title: "Strategy", description: "Keyword map, content priorities and quick wins." },
      { step: "04", title: "Implement fixes", description: "On-page and technical changes with your dev/content team." },
      { step: "05", title: "Content production", description: "New and improved pages against the roadmap." },
      { step: "06", title: "Authority & PR", description: "Ethical outreach and partnership opportunities as scoped." },
      { step: "07", title: "Measure & iterate", description: "Monthly reporting and backlog reprioritization." },
    ],
    deliverables: [
      "Technical audit report with prioritized fixes",
      "Keyword and content strategy document",
      "On-page recommendations for key URLs",
      "Content brief templates / roadmap",
      "Monthly performance report (retainer)",
      "Tracking checklist (Search Console / analytics)",
    ],
    technologies: ["Google Search Console", "Google Analytics", "Crawl tools", "Page speed tooling", "Schema / structured data", "Content briefs"],
    techLabel: "SEO tools",
    whyUs: [
      { title: "Technical + content together", description: "Rankings need both a healthy site and pages worth ranking." },
      { title: "Business-aligned keywords", description: "We prioritize queries that can become pipeline — not just volume." },
      { title: "No black-hat tactics", description: "Sustainable methods that protect your domain long term." },
      { title: "Clear communication", description: "Plain-language reports your leadership can understand." },
    ],
    portfolioService: "Web Development",
    faqs: [
      { q: "How long until SEO results show?", a: "Meaningful movement often takes 3–6 months depending on competition, site health and content velocity. Quick technical wins can appear sooner." },
      { q: "Do you guarantee #1 rankings?", a: "No ethical SEO provider can honestly guarantee rankings. We commit to process, transparency and continuous improvement against agreed KPIs." },
      { q: "Do you write the content?", a: "We provide strategy and briefs; full content production can be included or collaborative with your team." },
      { q: "Can you work with our developers?", a: "Yes. We deliver prioritized technical tickets your eng team can implement — or handle them if we also own the site." },
      { q: "Is SEO still worth it if we run ads?", a: "Yes. Organic and paid reinforce each other; SEO builds durable presence while ads fill gaps and test messaging." },
    ],
    related: ["web-development", "meta-ads", "branding", "automation"],
    seoTitle: "SEO Services | Technical SEO & Content Strategy | Akradhii",
    seoDescription:
      "SEO services from Akradhii — technical audits, keyword strategy, on-page optimization and content roadmaps that grow organic visibility.",
    ctaHeadline: "Want organic traffic that compounds?",
    ctaBody: "Share your website and target markets. We’ll outline the highest-leverage SEO moves for the next quarter.",
  },
  {
    slug: "branding",
    title: "Branding",
    shortDescription:
      "Distinctive brand identities — strategy, logo, visual language and guidelines that make you unforgettable.",
    keyBenefit: "A clear identity your team can apply consistently everywhere",
    icon: "Palette",
    gradient: "from-rose-600 to-pink-600",
    heroHeadline: "Brand systems that look sharp and work in the real world",
    heroDescription:
      "We define positioning, visual identity and guidelines so your website, ads and sales materials feel like one coherent brand.",
    intro: [
      "Strong brands are not only logos. They are a clear story, a recognizable visual system and rules that keep every touchpoint consistent.",
      "We help startups and growing companies articulate who they are for, how they sound and how they look — then deliver assets your team can use immediately.",
      "The outcome is confidence: marketing moves faster because the brand decisions are already made.",
    ],
    whatWeProvide: [
      { title: "Brand strategy", description: "Audience, positioning, personality and messaging pillars." },
      { title: "Naming support", description: "Guidance when a name or tagline needs sharpening (scoped)." },
      { title: "Logo & identity", description: "Primary marks, lockups and practical variations." },
      { title: "Visual system", description: "Color, type, spacing, photography direction and UI cues." },
      { title: "Brand guidelines", description: "A living document your team and vendors can follow." },
      { title: "Launch collateral", description: "Social kits, decks, stationery or packaging basics as scoped." },
      { title: "Website brand application", description: "Direction for how the identity lands on digital products." },
      { title: "Asset handoff", description: "Organized files in formats your designers and printers need." },
    ],
    benefits: [
      { title: "Instant recognition", description: "A look and feel people remember across channels." },
      { title: "Faster marketing execution", description: "Templates and rules reduce redesign debates." },
      { title: "Stronger trust", description: "Cohesive presence signals professionalism and care." },
      { title: "Clearer messaging", description: "Positioning that makes sales and content easier to write." },
      { title: "Scalable system", description: "Identity that works on apps, ads, decks and packaging." },
    ],
    whoFor: [
      "Startups defining identity before a major launch",
      "Businesses outgrowing a DIY or outdated logo",
      "Teams with inconsistent assets across channels",
      "Founders preparing fundraising or rebrand moments",
      "Product companies aligning product UI with brand",
    ],
    process: [
      { step: "01", title: "Discover", description: "Stakeholder interviews, audience and competitive landscape." },
      { step: "02", title: "Position", description: "Strategy narrative, personality and messaging directions." },
      { step: "03", title: "Explore", description: "Visual concepts and creative directions to choose from." },
      { step: "04", title: "Refine", description: "Logo system, color, type and supporting elements." },
      { step: "05", title: "Systemize", description: "Guidelines, templates and application examples." },
      { step: "06", title: "Deliver", description: "Final files, brand book and usage training." },
      { step: "07", title: "Extend", description: "Optional website, packaging or campaign applications." },
    ],
    deliverables: [
      "Brand strategy summary",
      "Logo suite and variations",
      "Color and typography system",
      "Brand guidelines document",
      "Core digital asset pack",
      "Organized source files handoff",
    ],
    technologies: ["Figma", "Adobe Illustrator", "Adobe Photoshop", "Brand guideline decks", "Icon systems"],
    techLabel: "Design tools",
    whyUs: [
      { title: "Strategy + craft", description: "Looks that are distinctive and grounded in positioning." },
      { title: "Built for usage", description: "Systems that work in ads, UI and print — not only moodboards." },
      { title: "Collaborative process", description: "Clear decision points so stakeholders stay aligned." },
      { title: "Connected to growth", description: "We think about website and campaigns while designing identity." },
    ],
    portfolioService: "Branding",
    faqs: [
      { q: "How long does a branding project take?", a: "Most identity projects run 3–8 weeks depending on stakeholder rounds and collateral scope." },
      { q: "Do we need a full rebrand?", a: "Not always. Sometimes a refresh (logo cleanup + system) is enough. Discovery will clarify." },
      { q: "Can you only design a logo?", a: "We can scope logo-focused work, but we recommend a minimal system so the mark stays consistent in real use." },
      { q: "Will you apply the brand to our website?", a: "Yes — brand application on web can be bundled with our web development service." },
      { q: "What files do we receive?", a: "Vector and export formats suitable for web, social and print, plus guidelines." },
    ],
    related: ["web-development", "meta-ads", "seo", "ai-automation"],
    seoTitle: "Branding & Brand Identity Services | Akradhii",
    seoDescription:
      "Branding services from Akradhii — strategy, logo systems, visual identity and guidelines that help growing brands show up consistently.",
    ctaHeadline: "Ready for a brand your team can actually use?",
    ctaBody: "Tell us where your brand feels inconsistent today. We’ll propose a focused identity engagement.",
  },
];

export function getServiceBySlug(slug: string): ServiceDetail | undefined {
  return serviceDetails.find((s) => s.slug === slug);
}

export function getAllServiceSlugs(): string[] {
  return serviceDetails.map((s) => s.slug);
}

export function getRelatedServices(slug: string, limit = 4): ServiceDetail[] {
  const current = getServiceBySlug(slug);
  if (!current) return [];
  return current.related
    .map((id) => getServiceBySlug(id))
    .filter((s): s is ServiceDetail => Boolean(s))
    .slice(0, limit);
}

/** Keep hub cards in sync with detailed pages */
export const servicesHub = serviceDetails.map((s) => {
  const base = hubServices.find((h) => h.id === s.slug);
  return {
    id: s.slug,
    title: s.title,
    description: s.shortDescription,
    keyBenefit: s.keyBenefit,
    icon: s.icon,
    gradient: s.gradient,
    features: base?.features ? [...base.features] : s.whatWeProvide.slice(0, 5).map((w) => w.title),
  };
});
