"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function ReferralCapture() {
  const params = useSearchParams();

  useEffect(() => {
    const ref = params.get("ref");
    if (ref && ref.length <= 20) {
      const existing = document.cookie
        .split(";")
        .map((c) => c.trim())
        .find((c) => c.startsWith("ak_ref="));
      if (!existing) {
        document.cookie = `ak_ref=${encodeURIComponent(ref)}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
      }
    }
  }, [params]);

  return null;
}
