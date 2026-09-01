export const siteConfig = {
  name: "Akradhii",
  tagline: "Digital Growth Studio",
  description:
    "Akradhii is a premium digital agency for website design & development, Meta Ads, business automation, CRM, AI automation, SEO and branding — plus structured internship programs that build real careers.",
  url: "https://akradhii.vercel.app",
  email: "hello@akradhii.com",
  phone: "+91 98485 79053",
  /** Lead / business WhatsApp (digits for wa.me links) */
  whatsapp: "919848579053",
  whatsappDisplay: "+91 98485 79053",
  address: "HITEC City, Hyderabad, Telangana 500081, India",
  city: "Hyderabad",
  region: "Telangana",
  country: "India",
  workingHours: "Mon–Sat, 10:00 AM – 7:00 PM IST",
  socials: {
    instagram: "https://instagram.com/akradhii",
    linkedin: "https://linkedin.com/company/akradhii",
    x: "https://x.com/akradhii",
    youtube: "https://youtube.com/@akradhii",
  },
  supportEmail: "support@akradhii.com",
  careersEmail: "careers@akradhii.com",
  internshipEmail: "internships@akradhii.com",
} as const;

export const services = [
  {
    id: "web-development",
    title: "Website Design & Development",
    description:
      "High-converting, lightning-fast websites and web apps engineered for growth — from landing pages to full-scale platforms.",
    icon: "Code2",
    features: ["Landing pages", "Business websites", "Web applications", "E-commerce", "Performance optimization"],
  },
  {
    id: "meta-ads",
    title: "Meta Ads",
    description:
      "Full-funnel Facebook & Instagram ad campaigns built on creative strategy, precise targeting and relentless optimization.",
    icon: "Megaphone",
    features: ["Campaign strategy", "Creative production", "Audience research", "Retargeting", "Monthly reporting"],
  },
  {
    id: "automation",
    title: "Business Automation",
    description:
      "Eliminate repetitive work with workflows that connect your tools, qualify leads and close deals on autopilot.",
    icon: "Workflow",
    features: ["Workflow design", "Tool integration", "Lead nurturing", "Reporting pipelines", "SOP automation"],
  },
  {
    id: "crm",
    title: "CRM Solutions",
    description:
      "A single source of truth for your sales pipeline — set up, customized and adopted across your team.",
    icon: "Database",
    features: ["CRM setup", "Pipeline design", "Migration", "Sales analytics", "Team training"],
  },
  {
    id: "ai-automation",
    title: "AI Automation",
    description:
      "Custom AI assistants, chatbots and intelligent workflows that handle support, sales and operations at scale.",
    icon: "BrainCircuit",
    features: ["AI chatbots", "Custom GPT agents", "Document AI", "Voice assistants", "AI content pipelines"],
  },
  {
    id: "seo",
    title: "SEO",
    description:
      "Technical SEO, content strategy and authority building that compounds your organic visibility month after month.",
    icon: "Search",
    features: ["Technical audits", "Keyword strategy", "Content roadmaps", "Link building", "Local SEO"],
  },
  {
    id: "branding",
    title: "Branding",
    description:
      "Distinctive brand identities — strategy, logo, visual language and guidelines that make you unforgettable.",
    icon: "Palette",
    features: ["Brand strategy", "Logo & identity", "Visual systems", "Brand guidelines", "Packaging"],
  },
] as const;

export const stats = [
  { label: "Projects delivered", value: "120+" },
  { label: "Interns trained", value: "300+" },
  { label: "Client satisfaction", value: "98%" },
  { label: "Certificates issued", value: "500+" },
] as const;

export const partners = ["GrowthBox", "NovaPay", "Sprintly", "Zenith", "CloudPeak", "Orbitly"] as const;
