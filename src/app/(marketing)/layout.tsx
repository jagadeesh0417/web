import { Suspense } from "react";
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { ReferralCapture } from "@/components/marketing/referral-capture";
import { WhatsAppFAB } from "@/components/marketing/whatsapp-fab";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Suspense>
        <ReferralCapture />
      </Suspense>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppFAB />
    </div>
  );
}
