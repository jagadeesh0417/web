"use client";

import { useEffect, useState } from "react";
import { LifeBuoy, MessageSquare, Mail, Send } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Field } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { getSession } from "@/lib/auth";
import { submitLead } from "@/lib/leads/client";
import type { AppUser } from "@/lib/types";

export default function StudentSupportPage() {
  const { toast } = useToast();
  const [user, setUser] = useState<AppUser | null>(null);
  const [ready, setReady] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getSession().then(({ user }) => {
      setUser(user);
      setReady(true);
    });
  }, []);

  if (!ready || !user) return <DashboardShell><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand-500" /></DashboardShell>;

  const send = async () => {
    if (busy) return;
    if (!subject.trim() || !message.trim()) {
      toast("error", "Missing fields", "Add a subject and describe your issue.");
      return;
    }
    setBusy(true);
    const result = await submitLead({
      formType: "support",
      source: "Student Support",
      page: "Student Support",
      pagePath: "/student/support",
      fields: {
        name: user.name,
        email: user.email,
        phone: user.phone ?? "",
        subject: subject.trim(),
        message: message.trim(),
        role: user.role,
        userId: user.id,
      },
    });
    setBusy(false);
    if (!result.ok) {
      toast("error", "Something went wrong. Please try again.", "");
      return;
    }
    setSubject("");
    setMessage("");
    toast("success", "Message Sent Successfully", "Support usually replies within 24 hours.");
  };

  return (
    <DashboardShell>
      <PageHeader title="Support" description="We're here to help — typically within 24 hours." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><LifeBuoy className="h-4 w-4 text-brand-500" /> Frequently asked</CardTitle>
            <CardDescription>Quick answers to common questions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {[
              { q: "Module is locked. What do I do?", a: "Complete every video of the previous week and get that week's assignment approved — the next week unlocks automatically." },
              { q: "My assignment link won't submit.", a: "Use one of the allowed formats (Google Drive, GitHub, Figma, Canva) with a full https:// URL." },
              { q: "How do I get my certificate?", a: "Finish all videos, get all assignments approved, then pass the final assessment with 70%+. Issue it from the Certificate page." },
              { q: "Can I change my program duration?", a: "Contact us — we can upgrade with the fee difference or issue a refund note." },
            ].map((f) => (
              <details key={f.q} className="group rounded-lg border border-border bg-muted/20 p-4">
                <summary className="cursor-pointer list-none font-medium">{f.q}</summary>
                <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MessageSquare className="h-4 w-4 text-brand-500" /> Contact support</CardTitle>
            <CardDescription>Describe your issue — attach any relevant links</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Field label="Subject">
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Week 3 assignment link rejected" />
            </Field>
            <Field label="Message">
              <Textarea rows={5} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Explain what happened and what you expected…" />
            </Field>
            <Button variant="gradient" onClick={send} loading={busy} disabled={busy}>
              <Send className="h-4 w-4" /> {busy ? "Sending..." : "Send message"}
            </Button>
            <div className="rounded-xl border border-border bg-muted/20 p-4 text-xs text-muted-foreground">
              <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-brand-500" /> Prefer email? Write to <strong className="text-foreground">support@akradhii.com</strong></p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
