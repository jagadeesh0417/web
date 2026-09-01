"use client";

import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";

const waHref = `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent("Hi, I'm interested in your services.")}`;

export function WhatsAppFAB() {
  const pathname = usePathname();
  if (pathname === "/contact") return null;

  return (
    <a
      href={waHref}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      title="Chat with us now"
      className="group fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full bg-[#25D366] px-5 py-3 text-white shadow-lg shadow-[#25D366]/30 transition-all hover:bg-[#1eba5a] hover:shadow-xl hover:shadow-[#25D366]/45 hover:scale-105 sm:bottom-6 sm:right-6"
    >
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25D366] opacity-20" />
      <svg viewBox="0 0 32 32" fill="currentColor" className="relative h-5 w-5 shrink-0">
        <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16c0 3.5 1.132 6.744 3.058 9.374L1.054 31.29l6.118-1.97A15.907 15.907 0 0016.004 32C24.826 32 32 24.822 32 16S24.826 0 16.004 0zm9.318 22.594c-.39 1.094-1.932 2.004-3.154 2.27-.834.18-1.924.322-5.596-1.202-4.7-1.95-7.724-6.72-7.954-7.026-.224-.306-1.836-2.44-1.836-4.656 0-2.214 1.16-3.3 1.572-3.764.39-.434.936-.554 1.246-.554.312 0 .624.002.894.016.288.014.676-.108 1.056.806.39.94 1.324 3.232 1.44 3.464.116.232.194.504.038.81-.156.306-.232.496-.464.764-.232.268-.488.598-.694.804-.232.232-.472.484-.202.948.272.464 1.206 1.986 2.59 3.218 1.778 1.586 3.276 2.078 3.74 2.31.464.232.736.194 1.008-.116.272-.31 1.156-1.346 1.464-1.81.306-.464.616-.384 1.042-.232.428.156 2.714 1.28 3.182 1.514.466.232.776.348.894.54.116.2.116 1.15-.274 2.244z" />
      </svg>
      <span className="relative hidden text-sm font-semibold sm:inline">Chat on WhatsApp</span>
    </a>
  );
}
