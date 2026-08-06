import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <Logo />
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500">
        <Compass className="h-8 w-8" />
      </div>
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-500">404</p>
        <h1 className="mt-2 text-3xl font-bold">Page not found</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has moved. Let&apos;s get you back on track.
        </p>
      </div>
      <div className="flex gap-3">
        <Link href="/">
          <Button variant="gradient">
            <ArrowLeft className="h-4 w-4" /> Back home
          </Button>
        </Link>
        <Link href="/internships">
          <Button variant="outline">Browse internships</Button>
        </Link>
      </div>
    </div>
  );
}
