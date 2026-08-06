import type { InternshipCategory, InternshipProgram } from "@/lib/types";

export const PROGRAMS: InternshipProgram[] = [
  {
    id: "p4",
    slug: "foundation",
    title: "Foundation Internship",
    durationWeeks: 4,
    tagline: "Perfect start for beginners",
    description:
      "A fast, focused immersion that builds your fundamentals with live mentorship, guided assignments and a mini project you can show off.",
    includes: [
      "4 live sessions",
      "4 assignments",
      "1 mini project",
      "Completion certificate",
      "Mentor support",
      "Dashboard access",
    ],
    price: 1999,
  },
  {
    id: "p6",
    slug: "professional",
    title: "Professional Internship",
    durationWeeks: 6,
    tagline: "Most popular",
    description:
      "Go deeper with weekly assessments, two real projects and a performance report that proves you are job-ready.",
    includes: [
      "6 live sessions",
      "8 assignments",
      "2 projects",
      "Weekly assessments",
      "Completion certificate",
      "Performance report",
      "Mentor support",
    ],
    price: 3499,
    featured: true,
  },
  {
    id: "p8",
    slug: "industry",
    title: "Industry Internship",
    durationWeeks: 8,
    tagline: "For career-focused candidates",
    description:
      "Work on client-based projects with full mentorship, portfolio building and a letter of recommendation based on your performance.",
    includes: [
      "Full mentorship",
      "Client-based project",
      "Portfolio building",
      "Weekly reviews",
      "Certificate",
      "Letter of recommendation (based on performance)",
      "Placement assistance (if offered)",
      "Final evaluation",
    ],
    price: 5499,
  },
];

export const CATEGORIES: InternshipCategory[] = [
  {
    id: "c1",
    slug: "web-development",
    name: "Web Development",
    icon: "Code2",
    gradient: "from-violet-600 to-indigo-600",
    description:
      "Build production-grade websites and web apps with modern React, Next.js and TypeScript — the stack Akradhii ships for real clients.",
    learningOutcomes: [
      "Build responsive, accessible interfaces with React & Tailwind",
      "Ship full-stack apps with Next.js App Router & APIs",
      "Work with databases, auth and secure uploads",
      "Deploy, measure and optimize for performance",
    ],
    skills: ["HTML/CSS", "JavaScript", "React", "Next.js", "TypeScript", "Tailwind CSS", "Git"],
    prerequisites: ["Basic programming familiarity", "A laptop with internet"],
    mentorId: "m1",
    faqs: [
      { q: "Do I need prior coding experience?", a: "Basic familiarity with any programming language helps, but our curriculum starts from first principles." },
      { q: "What will I build?", a: "A portfolio-grade project plus 4-8 guided assignments depending on your program duration." },
      { q: "Is this a paid internship?", a: "It's a project-based learning internship. You invest in the program and earn a certificate, portfolio and mentorship." },
    ],
  },
  {
    id: "c2",
    slug: "ui-ux-design",
    name: "UI/UX Design",
    icon: "Figma",
    gradient: "from-fuchsia-600 to-pink-600",
    description:
      "Design delightful digital products — research, wireframes, high-fidelity UI and interactive prototypes in Figma.",
    learningOutcomes: [
      "Conduct user research and define problems",
      "Create wireframes and interactive prototypes in Figma",
      "Apply design systems, typography and color theory",
      "Present and defend design decisions",
    ],
    skills: ["Figma", "Wireframing", "Prototyping", "Design Systems", "UX Research", "Typography"],
    prerequisites: ["No prior design experience required"],
    mentorId: "m2",
    faqs: [
      { q: "Which tools will I learn?", a: "Figma is the primary tool, alongside Miro for research and FigJam for collaboration." },
      { q: "Will I get real projects?", a: "Industry internship students work on client-style design briefs and portfolio case studies." },
    ],
  },
  {
    id: "c3",
    slug: "meta-ads",
    name: "Meta Ads",
    icon: "Megaphone",
    gradient: "from-blue-600 to-cyan-500",
    description:
      "Master Facebook & Instagram advertising — from campaign structure and creative testing to scaling profitable ad accounts.",
    learningOutcomes: [
      "Structure campaigns that scale profitably",
      "Design creative strategies and test plans",
      "Read dashboards and optimize on data",
      "Budget, forecast and report to clients",
    ],
    skills: ["Meta Ads Manager", "Audience Research", "A/B Testing", "Creative Strategy", "Analytics"],
    prerequisites: ["Interest in digital marketing", "Access to a Meta account"],
    mentorId: "m3",
    faqs: [
      { q: "Do I need money to run ads?", a: "No. You learn on simulations and our mentor's live account walkthroughs; we do not ask you to spend." },
      { q: "Will I get certified?", a: "You receive the Akradhii completion certificate; you can also attempt Meta Blueprint exams on your own." },
    ],
  },
  {
    id: "c4",
    slug: "digital-marketing",
    name: "Digital Marketing",
    icon: "TrendingUp",
    gradient: "from-emerald-600 to-teal-500",
    description:
      "The full funnel: brand strategy, content marketing, email, paid media and analytics — a complete modern marketer's toolkit.",
    learningOutcomes: [
      "Build an integrated marketing funnel",
      "Create content calendars and campaigns",
      "Use GA4 and analytics to make decisions",
      "Plan paid + organic growth strategies",
    ],
    skills: ["Content Strategy", "Email Marketing", "SEO Basics", "Google Analytics 4", "Campaign Planning"],
    prerequisites: ["Strong written communication"],
    mentorId: "m4",
    faqs: [
      { q: "What projects will I work on?", a: "You'll build a marketing plan for a fictional (or your own) brand and execute content tasks." },
    ],
  },
  {
    id: "c5",
    slug: "automation",
    name: "Automation",
    icon: "Workflow",
    gradient: "from-amber-500 to-orange-600",
    description:
      "Connect tools, automate workflows and build systems that save hours every day — using n8n and no-code platforms.",
    learningOutcomes: [
      "Design business workflows visually",
      "Integrate CRMs, email and spreadsheets",
      "Automate lead capture and follow-ups",
      "Build notification and reporting bots",
    ],
    skills: ["n8n", "Webhooks", "Zapier-style tools", "APIs basics", "Workflow Design"],
    prerequisites: ["Logical thinking", "Familiarity with common SaaS tools"],
    mentorId: "m1",
    faqs: [
      { q: "Do I need to code?", a: "No. Automation is built visually; we teach API basics along the way." },
    ],
  },
  {
    id: "c6",
    slug: "ai-automation",
    name: "AI Automation",
    icon: "BrainCircuit",
    gradient: "from-purple-600 to-violet-500",
    description:
      "Build AI assistants, chatbots and intelligent agents that automate support, sales and operations for real businesses.",
    learningOutcomes: [
      "Design AI assistants with modern LLM platforms",
      "Build RAG pipelines over documents",
      "Deploy chatbots to websites and WhatsApp",
      "Automate content and research workflows",
    ],
    skills: ["Prompt Engineering", "LLM APIs", "RAG", "Chatbot Deployment", "AI Workflows"],
    prerequisites: ["Comfort with computers", "Curiosity about AI"],
    mentorId: "m5",
    faqs: [
      { q: "Do I need ML knowledge?", a: "No — we work with no-code and API-first AI tools." },
      { q: "What do I build?", a: "A working AI assistant deployed on a real channel (web, WhatsApp or Slack)." },
    ],
  },
  {
    id: "c7",
    slug: "graphic-design",
    name: "Graphic Design",
    icon: "Palette",
    gradient: "from-rose-500 to-red-500",
    description:
      "Create scroll-stopping brand creatives, social media visuals and ad designs with a designer's eye and a marketer's mindset.",
    learningOutcomes: [
      "Master composition, color and typography",
      "Design brand kits and ad creatives",
      "Create social media templates that convert",
      "Build a professional portfolio",
    ],
    skills: ["Canva Pro", "Figma", "Adobe Photoshop", "Color Theory", "Typography"],
    prerequisites: ["No prior experience required"],
    mentorId: "m2",
    faqs: [
      { q: "Which software will I use?", a: "Canva and Figma as primary, with Photoshop fundamentals introduced." },
    ],
  },
  {
    id: "c8",
    slug: "content-writing",
    name: "Content Writing",
    icon: "PenLine",
    gradient: "from-sky-500 to-indigo-500",
    description:
      "Write content that ranks and converts — web copy, blogs, social posts and email sequences that businesses pay for.",
    learningOutcomes: [
      "Write SEO-optimized, engaging content",
      "Structure landing pages that convert",
      "Develop brand voice and tone guidelines",
      "Build a writing portfolio with real pieces",
    ],
    skills: ["SEO Writing", "Copywriting", "Email Sequences", "Editing", "Brand Voice"],
    prerequisites: ["Strong English proficiency"],
    mentorId: "m4",
    faqs: [
      { q: "Will my work get published?", a: "Top performers get their work featured on Akradhii's blog and client projects." },
    ],
  },
  {
    id: "c9",
    slug: "seo",
    name: "SEO",
    icon: "Search",
    gradient: "from-green-600 to-emerald-500",
    description:
      "Master technical SEO, on-page optimization and content strategy that compounds organic traffic over time.",
    learningOutcomes: [
      "Conduct technical SEO audits",
      "Build keyword strategies that match intent",
      "Optimize on-page elements systematically",
      "Track rankings and report impact",
    ],
    skills: ["Keyword Research", "On-page SEO", "Technical SEO", "Google Search Console", "Content Strategy"],
    prerequisites: ["Basic website familiarity"],
    mentorId: "m5",
    faqs: [
      { q: "What tools will I use?", a: "Google Search Console, Google Analytics 4, Screaming Frog and Ahrefs (trial)." },
    ],
  },
  {
    id: "c10",
    slug: "video-editing",
    name: "Video Editing",
    icon: "Clapperboard",
    gradient: "from-cyan-500 to-blue-600",
    description:
      "Edit reels, YouTube videos and ad creatives that stop the scroll — with captions, motion graphics and sound design.",
    learningOutcomes: [
      "Cut and pace short-form video effectively",
      "Add captions, transitions and motion graphics",
      "Mix audio and color-grade footage",
      "Produce ad creatives for Meta campaigns",
    ],
    skills: ["Premiere Pro", "CapCut", "DaVinci Resolve", "Motion Graphics", "Storytelling"],
    prerequisites: ["A computer that can run editing software"],
    mentorId: "m3",
    faqs: [
      { q: "Do I need a camera?", a: "No — you'll edit provided footage; you can use your phone to shoot your own content." },
    ],
  },
];

export const CATEGORY_BY_SLUG = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c]));
export const PROGRAM_BY_SLUG = Object.fromEntries(PROGRAMS.map((p) => [p.slug, p]));
