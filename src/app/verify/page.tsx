import Link from "next/link";
import { siteConfig } from "@/config/site";

export default function VerifyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <h1 className="text-4xl font-bold">Certificate verification</h1>
      <p className="mt-6 text-lg">Online certificate verification is not yet available.</p>
      <p className="mt-4 text-muted-foreground">To request manual verification, email <a className="underline" href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a> with the certificate ID and a copy of the certificate.</p>
      <p className="mt-6"><Link className="underline" href="/contact">Contact support</Link></p>
    </main>
  );
}
