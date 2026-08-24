"use client";

import { Share2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export function CopyLinkButton() {
  const { toast } = useToast();
  return (
    <button
      onClick={() => {
        void navigator.clipboard?.writeText(window.location.href);
        toast("success", "Link copied", "Share it with your network.");
      }}
      className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted"
    >
      <Share2 className="h-4 w-4" /> Copy link
    </button>
  );
}
