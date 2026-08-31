"use client";

import { useEffect, useState } from "react";
import { CreditCard, ShieldCheck, TestTube, AlertTriangle } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { getSession } from "@/lib/auth";

interface PaymentConfig {
  keyId: string;
  keySecret: string;
  environment: "test" | "live";
  currency: string;
}

const defaultConfig: PaymentConfig = {
  keyId: "",
  keySecret: "",
  environment: "test",
  currency: "INR",
};

export default function AdminPaymentSettingsPage() {
  const { toast } = useToast();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [ready, setReady] = useState(false);
  const [config, setConfig] = useState<PaymentConfig>(defaultConfig);
  const [form, setForm] = useState<PaymentConfig>(defaultConfig);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [liveConfirm, setLiveConfirm] = useState(false);

  useEffect(() => {
    getSession().then(({ user }) => {
      setUser(user);
      setReady(true);
    });
    fetch("/api/admin/payment-config")
      .then((r) => r.json())
      .then((data: PaymentConfig) => {
        setConfig(data);
        setForm(data);
      })
      .catch(() => {});
  }, []);

  if (!ready || !user)
    return (
      <DashboardShell>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand-500" />
      </DashboardShell>
    );

  const handleSave = async () => {
    if (form.environment === "live" && !liveConfirm) {
      toast("error", "Confirmation required", "Please confirm switching to LIVE mode before saving.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/payment-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to save");
      setConfig(form);
      toast("success", "Configuration updated", "Changes take effect immediately for new payment orders.");
    } catch {
      toast("error", "Update failed", "Could not save payment configuration.");
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const res = await fetch("/api/admin/payment-config/test", { method: "POST" });
      if (!res.ok) throw new Error("Test failed");
      toast("success", "Configuration valid", "Razorpay credentials are working correctly.");
    } catch {
      toast("error", "Test failed", "Could not verify Razorpay credentials. Check your keys.");
    } finally {
      setTesting(false);
    }
  };

  const maskKey = (key: string) => {
    if (!key) return "Not configured";
    if (key.length <= 8) return "••••••••";
    return key.slice(0, 6) + "••••••" + key.slice(-4);
  };

  const envChanged = form.environment !== config.environment;

  return (
    <DashboardShell>
      <PageHeader
        title="Payment Settings"
        description="Configure Razorpay integration for processing payments."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Current Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-brand-500" />
              Current Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Environment</span>
              <Badge variant={config.environment === "live" ? "success" : "warning"}>
                {config.environment === "live" ? "🟢 LIVE" : "🟡 TEST"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Key ID</span>
              <span className="font-mono text-xs">{maskKey(config.keyId)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Key Secret</span>
              <span className="font-mono text-xs">••••••••</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Currency</span>
              <Badge variant="outline">{config.currency}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand-500" />
              Update Configuration
            </CardTitle>
            <CardDescription>
              Enter your Razorpay API credentials. Changes take effect immediately.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <Field label="Razorpay Key ID" hint="Starts with rzp_live_ or rzp_test_">
              <Input
                value={form.keyId}
                onChange={(e) => setForm({ ...form, keyId: e.target.value })}
                placeholder="rzp_test_..."
              />
            </Field>

            <Field label="Razorpay Key Secret" hint="Never stored in the browser — always masked">
              <Input
                type="password"
                value={form.keySecret}
                onChange={(e) => setForm({ ...form, keySecret: e.target.value })}
                placeholder="Enter key secret"
                autoComplete="off"
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Environment">
                <div className="flex gap-4 rounded-lg border border-border p-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="environment"
                      value="test"
                      checked={form.environment === "test"}
                      onChange={(e) => setForm({ ...form, environment: e.target.value as "test" | "live" })}
                      className="accent-violet-600"
                    />
                    Test
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="environment"
                      value="live"
                      checked={form.environment === "live"}
                      onChange={(e) => setForm({ ...form, environment: e.target.value as "test" | "live" })}
                      className="accent-violet-600"
                    />
                    Live
                  </label>
                </div>
              </Field>

              <Field label="Currency">
                <select
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
                >
                  <option value="INR">INR — Indian Rupee</option>
                  <option value="USD">USD — US Dollar</option>
                </select>
              </Field>
            </div>

            {envChanged && form.environment === "live" && (
              <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-950/30">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                      You are switching to LIVE mode. Real payments will be processed.
                    </p>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={liveConfirm}
                        onChange={(e) => setLiveConfirm(e.target.checked)}
                        className="accent-amber-600"
                      />
                      I understand real charges will apply
                    </label>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Button variant="gradient" loading={saving} onClick={handleSave}>
                Update Configuration
              </Button>
              <Button variant="outline" loading={testing} onClick={handleTest}>
                <TestTube className="h-4 w-4" />
                Test Configuration
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Notes */}
      <Card className="mt-6">
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
              <p className="text-sm text-muted-foreground">Key Secret is stored securely on the server</p>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
              <p className="text-sm text-muted-foreground">Key Secret is never sent to the browser</p>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
              <p className="text-sm text-muted-foreground">Changes take effect immediately for new payment orders</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
