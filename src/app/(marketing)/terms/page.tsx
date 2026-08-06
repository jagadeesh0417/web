import type { Metadata } from "next";
import { FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern use of Akradhii's platform and services.",
};

const sections = [
  {
    title: "1. Acceptance of terms",
    body: "By accessing the Akradhii platform (the \"Platform\") you agree to these Terms. If you are enrolling on behalf of a company or institution, you represent that you have authority to bind that entity.",
  },
  {
    title: "2. Accounts & eligibility",
    body: "You must be 16 years or older to create an account. You are responsible for keeping your credentials secure and for all activity under your account. Provide accurate information in applications; misrepresentation may result in termination and certificate revocation.",
  },
  {
    title: "3. Internship programs",
    body: "Internship fees vary by program (foundation 4 weeks, professional 6 weeks, industry 8 weeks). Fees are due before onboarding. Completion is based on module quizzes, assignments and mentor reviews; certificates are issued only upon successful completion.",
  },
  {
    title: "4. Payments & refunds",
    body: "Payments are non-refundable once onboarding has started, except where required by applicable consumer law. If a program is cancelled by Akradhii, you receive a full refund within 7 working days.",
  },
  {
    title: "5. Intellectual property",
    body: "Course content, materials and the Platform itself are owned by Akradhii. You may not copy, redistribute or resell any content. Your own submissions remain your IP, and you grant Akradhii a license to display them for certification and portfolio purposes.",
  },
  {
    title: "6. Acceptable use",
    body: "You agree not to misuse the Platform — including scraping, attacking infrastructure, impersonating others, or uploading malicious or infringing content.",
  },
  {
    title: "7. Certificates",
    body: "Certificates include a QR code that verifies authenticity against our public registry. We reserve the right to revoke certificates issued based on fraudulent submissions.",
  },
  {
    title: "8. Limitation of liability",
    body: "The Platform is provided \"as is\". To the maximum extent permitted by law, Akradhii is not liable for indirect, incidental or consequential damages arising from use of the Platform.",
  },
  {
    title: "9. Changes",
    body: "We may update these Terms from time to time; material changes are communicated by email. Continued use after changes constitutes acceptance.",
  },
  {
    title: "10. Contact",
    body: "Questions about these Terms? Email legal@akradhii.com.",
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
          <FileText className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Terms of Service</h1>
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
