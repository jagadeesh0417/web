import type { Metadata } from "next";
import { Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Akradhii collects, uses and protects your data.",
};

const sections = [
  {
    title: "Information we collect",
    body: "We collect information you provide directly — name, email, phone, college, resume and portfolio links during internship applications — plus limited technical data (device type, browser, pages visited) used to keep the platform fast and secure.",
  },
  {
    title: "How we use your data",
    body: "Your data is used to process applications, deliver courses and sessions, issue certificates, send service-related notifications, and improve our platform. We never sell personal data to third parties.",
  },
  {
    title: "Payments",
    body: "Payments are processed by Razorpay or Stripe. Card details are handled entirely by the payment gateway and are never stored on our servers.",
  },
  {
    title: "Certificates & QR codes",
    body: "Issued certificates are registered with a public verification record containing your name, program, and completion date. The QR code on your certificate links to our verification page so employers can confirm authenticity.",
  },
  {
    title: "Data retention",
    body: "Account data is retained while your account is active. You may request deletion at any time by writing to privacy@akradhii.com; we will remove personal data within 30 days unless legal obligations require otherwise.",
  },
  {
    title: "Your rights",
    body: "You can access, correct, export or delete your personal data from your profile settings or by contacting us. Marketing emails include a one-click unsubscribe.",
  },
  {
    title: "Contact",
    body: "Questions about this policy? Email privacy@akradhii.com or write to us at Akradhii, Bengaluru, India.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">Last updated: August 2026</p>
        </div>
      </div>
      <div className="mt-8 space-y-6">
        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="text-lg font-semibold">{s.title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
