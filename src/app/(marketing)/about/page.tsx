import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Bot, Braces, ChartNoAxesCombined, Compass, GraduationCap, Layers3, Megaphone, Palette, ScanSearch } from "lucide-react";
import { servicesHub } from "@/config/services-detail";
import { Reveal } from "@/components/marketing/reveal";

const url = "https://www.akradhii.com";
export const metadata: Metadata = {
  title: "About Akradhii | Digital Services & Learning",
  description: "Meet Akradhii, a digital growth studio and learning platform bringing together practical technology, creative services and skill development.",
  alternates: { canonical: `${url}/about` },
  openGraph: { title: "About Akradhii", description: "Digital services and learning, connected by practical thinking.", url: `${url}/about`, images: [{ url: `${url}/og-default.svg`, alt: "Akradhii digital growth studio" }] },
};

const values = [
  ["Innovation", "Choose modern tools when they solve a real problem, not simply because they are new."],
  ["Transparency", "Discuss scope, constraints and progress clearly so decisions are informed."],
  ["Quality", "Review the details, test the experience and build for maintainability."],
  ["Client focus", "Begin with the people and business goals behind each brief."],
  ["Continuous learning", "Apply feedback and keep developing skills as technology changes."],
  ["Reliability", "Work towards agreed milestones and communicate when plans need to change."],
];
const capabilities = [
  { icon: Braces, title: "Development", text: "Websites, applications and commerce experiences designed around business needs." },
  { icon: Megaphone, title: "Marketing", text: "Campaigns, content and search strategies that connect brands with their audiences." },
  { icon: Bot, title: "AI & automation", text: "Practical workflows that reduce repetitive work and connect business tools." },
  { icon: Palette, title: "Design", text: "Brand identity and interfaces that make complex ideas easier to understand." },
  { icon: ChartNoAxesCombined, title: "Analytics", text: "Measurement and CRM insights to support more informed decisions." },
  { icon: GraduationCap, title: "Learning technology", text: "Structured digital learning experiences, progress and assessment." },
];
const stages = [
  ["Discovery", "Understand your goals, audience and constraints."], ["Strategy", "Define the direction and priorities together."],
  ["Planning", "Agree on scope, milestones and responsibilities."], ["Design", "Shape the experience, content and visual system."],
  ["Development", "Build the solution in manageable stages."], ["Testing", "Review functionality, accessibility and quality."],
  ["Launch", "Prepare the handover and release."], ["Support", "Discuss improvements and ongoing needs."],
];
const linkStyle = "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400 motion-reduce:transform-none";

export default function AboutPage() {
  return <div className="overflow-hidden">
    <section className="relative border-b border-white/10 bg-[#0b1020] text-white">
      <div className="absolute inset-0 bg-grid opacity-20" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-2 lg:gap-20 lg:px-8 lg:py-32">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-300">About Akradhii · Digital & learning</p>
          <h1 className="mt-6 text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">Better digital.<br /><span className="text-violet-300">Practical learning.</span></h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-slate-300">We bring digital services and structured learning together: helping businesses solve practical problems while giving learners a place to build their skills.</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link className={`${linkStyle} bg-white text-slate-950 hover:bg-violet-100`} href="/services">Explore services <ArrowRight size={16} /></Link>
            <Link className={`${linkStyle} border border-slate-500 text-white hover:border-white`} href="/internships">Explore internships</Link>
            <Link className={`${linkStyle} text-white underline decoration-violet-400 underline-offset-4`} href="/contact">Contact us</Link>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-[#151d35] p-6 sm:p-10">
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-violet-500/20 blur-3xl" aria-hidden="true" />
            <div className="relative rounded-2xl border border-white/10 bg-[#0d1529] p-6 sm:p-8">
              <div className="flex items-center justify-between border-b border-white/10 pb-5"><span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">The Akradhii approach</span><Layers3 className="text-violet-300" size={22} /></div>
              <div className="space-y-1 py-8 text-3xl font-medium tracking-tight sm:text-4xl"><p>Ideas into systems.</p><p className="text-violet-300">Skills into practice.</p></div>
              <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-6 text-sm text-slate-300"><div><span className="mb-2 block text-xs text-violet-300">01 / BUILD</span>Digital services</div><div><span className="mb-2 block text-xs text-violet-300">02 / LEARN</span>Internship learning</div></div>
            </div>
            <p className="relative mt-6 text-sm text-slate-400">A shared focus on useful work and continuous improvement.</p>
          </div>
        </Reveal>
      </div>
    </section>

    <section className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-12 lg:gap-20 lg:px-8 lg:py-28">
      <Reveal className="lg:col-span-5"><p className="text-sm font-semibold uppercase tracking-widest text-violet-400">Our story</p><h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Good ideas deserve a practical way forward.</h2></Reveal>
      <Reveal className="space-y-5 text-base leading-8 text-muted-foreground lg:col-span-7" delay={0.08}>
        <p>Growing businesses often have to piece together websites, marketing, customer management and everyday operations from disconnected tools. Akradhii exists to help make those moving parts more useful together, with technology chosen for the problem at hand.</p>
        <p>Our digital services bring strategy, design, development and growth into the same conversation. The aim is not technology for its own sake, but clear, maintainable solutions that teams can use.</p>
        <p>Alongside this work, our learning platform reflects a commitment to developing practical skills. The two sides share a belief in learning by doing: business challenges inform the skills that matter, while continuous learning keeps our approach open to improvement.</p>
      </Reveal>
    </section>

    <section className="border-y border-border bg-card/30"><div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 md:grid-cols-2 lg:px-8">
      <Reveal><Compass className="text-violet-400" /><p className="mt-6 text-sm uppercase tracking-widest text-violet-400">Our mission</p><h2 className="mt-3 text-3xl font-semibold tracking-tight">Make progress practical.</h2><p className="mt-4 max-w-lg leading-7 text-muted-foreground">Help businesses grow with integrated digital solutions and support learners as they develop useful, applicable skills.</p></Reveal>
      <Reveal delay={0.08}><ScanSearch className="text-violet-400" /><p className="mt-6 text-sm uppercase tracking-widest text-violet-400">Our vision</p><h2 className="mt-3 text-3xl font-semibold tracking-tight">Grow through clarity and craft.</h2><p className="mt-4 max-w-lg leading-7 text-muted-foreground">Be a trusted digital partner known for thoughtful work, transparent collaboration and a commitment to learning.</p></Reveal>
    </div></section>

    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28"><Reveal><p className="text-sm font-semibold uppercase tracking-widest text-violet-400">What we do</p><h2 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">Two sides. One practical mindset.</h2></Reveal>
      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <Reveal><div className="h-full rounded-3xl border border-border bg-card/50 p-7 sm:p-10"><span className="text-sm text-violet-400">01 / FOR BUSINESSES</span><h3 className="mt-4 text-3xl font-semibold">Akradhii Digital Services</h3><p className="mt-4 leading-7 text-muted-foreground">From websites and e-commerce to marketing, branding, AI, automation, CRM and analytics, we bring the right disciplines together around your goals. We also help teams explore the technology choices behind their projects.</p><div className="mt-8 divide-y divide-border border-y border-border">{servicesHub.map(s => <Link key={s.id} href={`/services/${s.id}`} className="flex items-center justify-between gap-4 py-3 text-sm font-medium transition-colors hover:text-violet-400"><span>{s.title}</span><ArrowUpRight size={16} /></Link>)}</div></div></Reveal>
        <Reveal delay={0.08}><div className="h-full rounded-3xl bg-[#1d1640] p-7 text-white sm:p-10"><span className="text-sm text-violet-300">02 / FOR LEARNERS</span><h3 className="mt-4 text-3xl font-semibold">Learning & internships</h3><p className="mt-4 leading-7 text-slate-300">Our intended paid learning journey connects recorded lessons and progress tracking with an assessment and results. Certificates are dependent on successful completion, not payment alone.</p><ol className="mt-8 space-y-3">{["Enrollment", "Recorded lessons", "Learning progress", "30-minute MCQ assessment", "Results", "Certificate on successful completion"].map((step, i) => <li key={step} className="flex items-center gap-4 border-b border-white/10 pb-3 text-sm"><span className="text-violet-300">0{i+1}</span>{step}</li>)}</ol><p className="mt-6 text-sm leading-6 text-slate-300">This describes the intended workflow; availability and program details should be confirmed before enrollment. No placement or employment is promised.</p><Link href="/internships" className="mt-6 inline-flex items-center gap-2 font-semibold text-white underline underline-offset-4">Explore current programs <ArrowRight size={16} /></Link></div></Reveal>
      </div>
    </section>

    <section className="border-y border-border bg-card/30"><div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"><Reveal><p className="text-sm font-semibold uppercase tracking-widest text-violet-400">Our expertise</p><h2 className="mt-4 text-4xl font-semibold tracking-tight">Connected capabilities.</h2></Reveal><div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">{capabilities.map((c,i) => <Reveal key={c.title} delay={i*0.04} className="h-full bg-card"><div className="h-full p-7 transition-colors hover:bg-violet-500/10"><c.icon className="text-violet-400" size={24}/><h3 className="mt-5 text-lg font-semibold">{c.title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{c.text}</p></div></Reveal>)}</div></div></section>

    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28"><Reveal><p className="text-sm font-semibold uppercase tracking-widest text-violet-400">How we work</p><h2 className="mt-4 text-4xl font-semibold tracking-tight">From first conversation to what comes next.</h2><p className="mt-4 max-w-2xl leading-7 text-muted-foreground">Every engagement is different, but a clear process helps everyone understand the next step.</p></Reveal><ol className="mt-12 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">{stages.map(([title,text],i) => <Reveal key={title} delay={i*0.04}><li className="border-t border-violet-500/40 pt-5"><span className="text-sm text-violet-400">0{i+1}</span><h3 className="mt-3 text-xl font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></li></Reveal>)}</ol></section>

    <section className="border-y border-border bg-card/30"><div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"><Reveal><p className="text-sm font-semibold uppercase tracking-widest text-violet-400">What guides us</p><h2 className="mt-4 text-4xl font-semibold tracking-tight">Values, put to work.</h2></Reveal><div className="mt-10 grid gap-x-12 sm:grid-cols-2 lg:grid-cols-3">{values.map(([title,text],i) => <Reveal key={title} delay={i*0.04}><div className="border-t border-border py-6"><h3 className="text-lg font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></div></Reveal>)}</div></div></section>

    <section id="team" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8"><Reveal><p className="text-sm font-semibold uppercase tracking-widest text-violet-400">Our team</p><h2 className="mt-4 text-4xl font-semibold tracking-tight">The people behind the work.</h2><p className="mt-5 max-w-2xl leading-7 text-muted-foreground">We believe good work starts with thoughtful collaboration. Team profiles will be shared here when approved information is available.</p><Link href="/contact" className="mt-6 inline-flex items-center gap-2 font-semibold text-violet-400 hover:text-violet-300">Get in touch <ArrowRight size={16} /></Link></Reveal></section>
    <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8"><Reveal><div className="rounded-3xl bg-[#211a43] px-7 py-12 text-white sm:p-14"><p className="text-sm uppercase tracking-widest text-violet-300">Let’s make something useful</p><h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight sm:text-5xl">Have a challenge worth solving?</h2><p className="mt-4 max-w-xl leading-7 text-slate-300">Tell us what you are working on, or explore a learning path that fits your goals.</p><div className="mt-8 flex flex-wrap gap-3"><Link href="/contact" className={`${linkStyle} bg-white text-slate-950`}>Contact us <ArrowRight size={16}/></Link><Link href="/internships" className={`${linkStyle} border border-white/40 text-white hover:border-white`}>Explore internships</Link></div></div></Reveal></section>
  </div>;
}
