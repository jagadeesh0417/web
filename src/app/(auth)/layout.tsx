import Link from "next/link";
import { ShieldCheck, Zap, Award, HeartHandshake } from "lucide-react";
import { Logo } from "@/components/logo";
import { Reveal } from "@/components/marketing/reveal";

const perks = [
  { icon: ShieldCheck, title: "Bank-grade security", text: "Hashed passwords, rate limits, account locking and audit logs." },
  { icon: Zap, title: "Instant dashboard", text: "You're routed straight to the dashboard for your role." },
  { icon: Award, title: "Verifiable certificates", text: "Interns earn QR-verifiable certificates and reports." },
  { icon: HeartHandshake, title: "Real mentorship", text: "Clients and interns get a dedicated human team." },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between border-r border-border bg-card p-10 lg:flex">
        <div>
          <Logo />
        </div>
        <div>
          <Reveal>
            <h2 className="max-w-md text-3xl font-bold leading-tight">
              Your growth journey with <span className="text-gradient">Akradhii</span> starts here.
            </h2>
            <div className="mt-8 space-y-5">
              {perks.map((p) => (
                <div key={p.title} className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-600/10 text-brand-500">
                    <p.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{p.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Akradhii ·{" "}
          <Link href="/" className="underline hover:text-foreground">Back to website</Link>
        </p>
      </div>

      <div className="flex flex-col items-center justify-center bg-background px-4 py-10 sm:px-8">
        <div className="mb-8 lg:hidden">
          <Logo />
        </div>
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
