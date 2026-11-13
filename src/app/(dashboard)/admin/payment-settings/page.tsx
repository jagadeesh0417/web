"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Status = { mode: string; keyIdConfigured: boolean; keySecretConfigured: boolean; webhookSecretConfigured: boolean; publicKeyMatches: boolean };

export default function AdminPaymentSettingsPage() {
  const [status, setStatus] = useState<Status | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    fetch("/api/admin/payment-config", { cache: "no-store" })
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setStatus).catch(() => setError(true));
  }, []);
  return <DashboardShell>
    <PageHeader title="Payment Settings" description="Server environment configuration status" />
    <Card><CardHeader><CardTitle>Razorpay status</CardTitle></CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p role="status">Checkout is unavailable. Configuration alone does not enable payments.</p>
        {error ? <p role="alert">Unable to load payment configuration.</p> : !status ? <p>Loading…</p> : <dl className="space-y-2">
          <div><dt className="inline">Key mode: </dt><dd className="inline">{status.mode}</dd></div>
          <div><dt className="inline">Server key ID: </dt><dd className="inline">{status.keyIdConfigured ? "Configured" : "Missing"}</dd></div>
          <div><dt className="inline">Server key secret: </dt><dd className="inline">{status.keySecretConfigured ? "Configured" : "Missing"}</dd></div>
          <div><dt className="inline">Webhook secret: </dt><dd className="inline">{status.webhookSecretConfigured ? "Configured" : "Missing"}</dd></div>
          <div><dt className="inline">Public key matches: </dt><dd className="inline">{status.publicKeyMatches ? "Yes" : "No"}</dd></div>
        </dl>}
        <p>Set credentials in the server environment; never enter secrets in this interface. See README for setup and current limitations.</p>
      </CardContent>
    </Card>
  </DashboardShell>;
}
