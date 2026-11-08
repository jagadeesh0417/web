import Link from "next/link";
import { Logo } from "@/components/logo";
import { siteConfig } from "@/config/site";
import { services } from "@/config/site";

const companyLinks = [
  { href: "/about", label: "About us" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/internships", label: "Internships" },
  { href: "/blog", label: "Resources" },
  { href: "/contact", label: "Contact" },
  { href: "/verify", label: "Verify certificate" },
];

export function Footer() {
  return (
    <footer className="relative border-t border-border bg-[#0B0C10]">
      <div className="gradient-hairline absolute inset-x-0 top-0" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div className="space-y-4">
          <Logo size="sm" />
          <p className="max-w-xs text-sm text-muted-foreground">{siteConfig.description}</p>
          <div className="flex gap-3">
            {Object.entries(siteConfig.socials).map(([name, url]) => (
              <a
                key={name}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-xs font-medium capitalize text-muted-foreground transition-colors hover:border-amber-500/50 hover:text-amber-400"
              >
                {name.slice(0, 1).toUpperCase()}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold text-foreground">Services</h4>
          <ul className="space-y-2.5">
            {services.slice(0, 7).map((s) => (
              <li key={s.id}>
                <Link
                  href={`/services#${s.id}`}
                  className="text-sm text-muted-foreground transition-colors hover:text-amber-400"
                >
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold text-foreground">Company</h4>
          <ul className="space-y-2.5">
            {companyLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-amber-400">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold text-foreground">Contact</h4>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li>{siteConfig.address}</li>
            <li>
              <a href={`mailto:${siteConfig.email}`} className="transition-colors hover:text-amber-400">
                {siteConfig.email}
              </a>
            </li>
            <li>
              <a href={`tel:${siteConfig.phone.replace(/\s/g, "")}`} className="transition-colors hover:text-amber-400">
                {siteConfig.phone}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/verify" className="transition-colors hover:text-amber-400">Certificate verification</Link>
            <Link href="/privacy" className="transition-colors hover:text-amber-400">Privacy</Link>
            <Link href="/terms" className="transition-colors hover:text-amber-400">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}