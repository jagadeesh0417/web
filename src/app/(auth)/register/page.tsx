"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/internships/apply");
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
      <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
      <p className="text-sm text-muted-foreground">
        New applicants go through the internship application — taking you there now…
      </p>
      <button
        onClick={() => router.replace("/internships/apply")}
        className="text-xs font-medium text-brand-500 underline"
      >
        Continue to internship application
      </button>
    </div>
  );
}
