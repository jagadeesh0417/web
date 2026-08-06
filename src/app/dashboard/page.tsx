"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/auth";
import { homeForRole } from "@/lib/rbac";

export default function DashboardRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    getSession().then(({ user }) => {
      if (!user) {
        router.replace("/login");
        return;
      }
      router.replace(homeForRole(user.role));
    });
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand-500" />
      <p className="text-sm text-muted-foreground">Routing you to your dashboard…</p>
    </div>
  );
}
