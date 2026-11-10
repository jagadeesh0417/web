import Link from "next/link";
import { Logo } from "@/components/logo";
import { siteConfig, services } from "@/config/site";

export function Footer() {
  const waHref = `https://wa.me/${siteConfig.whatsapp}`;

  return (
    <footer className="relative border-t border-border bg-card">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-600 to-transparent" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-5 lg:px-8">
        <div className="space-y-4 lg:col-span-1">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">{siteConfig.description}</p>
          <div className="flex gap-3">
            {Object.entries(siteConfig.socials).map(([name, url]) => (
              <a
                key={name}
                href={url}
                target="_blank"
                rel="noreferrer"
                aria-label={`Akradhii on ${name}`}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-xs font-medium capitalize text-muted-foreground transition-colors hover:border-brand-500 hover:text-brand-400"
              >
                {name.slice(0, 1)}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold">Company</h4>
          <ul className="space-y-2.5">
            {[
              { href: "/about", label: "About us" },
              { href: "/services", label: "Services" },
              { href: "/portfolio", label: "Portfolio" },
              { href: "/contact", label: "Contact" },
              { href: "/company", label: "Company" },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-brand-400">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold">Services</h4>
          <ul className="space-y-2.5">
            {services.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/services/${s.id}`}
                  className="text-sm text-muted-foreground transition-colors hover:text-brand-400"
                >
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold">Programs & resources</h4>
          <ul className="space-y-2.5">
            {[
              { href: "/internships", label: "Internships" },
              { href: "/resources", label: "Resources" },
              { href: "/internships/apply", label: "Apply now" },
              { href: "/verify", label: "Manual certificate verification" },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-brand-400">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold">Contact</h4>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li>{siteConfig.address}</li>
            <li>
              <a href={`mailto:${siteConfig.email}`} className="transition-colors hover:text-brand-400">
                {siteConfig.email}
              </a>
            </li>
            <li>
              <a href={`tel:${siteConfig.phone.replace(/\s/g, "")}`} className="transition-colors hover:text-brand-400">
                {siteConfig.phone}
              </a>
            </li>
            <li>
              <a href={waHref} target="_blank" rel="noreferrer" className="transition-colors hover:text-brand-400">
                WhatsApp {siteConfig.whatsappDisplay}
              </a>
            </li>
            <li className="text-xs">{siteConfig.workingHours}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-5">
            <Link href="/verify" className="transition-colors hover:text-brand-400">
              Manual certificate verification
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-brand-400">
              Privacy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-brand-400">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
