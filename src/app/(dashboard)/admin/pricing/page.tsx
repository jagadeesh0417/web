"use client";

import { useEffect, useState } from "react";
import { IndianRupee, Save, Loader2, Tag, Users } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { Reveal } from "@/components/marketing/reveal";
import { getSession } from "@/lib/auth";

interface PricingConfig {
  fourWeekPrice: number;
  sixWeekPrice: number;
  eightWeekPrice: number;
  referralReward: number;
  minimumWithdrawal: number;
}

const defaults: PricingConfig = {
  fourWeekPrice: 149,
  sixWeekPrice: 199,
  eightWeekPrice: 249,
  referralReward: 20,
  minimumWithdrawal: 200,
};

export default function PricingPage() {
  const { toast } = useToast();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<PricingConfig>(defaults);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSession().then(async ({ user }) => {
      setUser(user);
      try {
        const res = await fetch("/api/admin/pricing");
        if (res.ok) {
          const data = await res.json();
          if (data.ok && data.config) {
            setForm({
              fourWeekPrice: data.config.fourWeekPrice ?? defaults.fourWeekPrice,
              sixWeekPrice: data.config.sixWeekPrice ?? defaults.sixWeekPrice,
              eightWeekPrice: data.config.eightWeekPrice ?? defaults.eightWeekPrice,
              referralReward: data.config.referralReward ?? defaults.referralReward,
              minimumWithdrawal: data.config.minimumWithdrawal ?? defaults.minimumWithdrawal,
            });
          }
        }
      } catch {
        // Use defaults
      } finally {
        setLoading(false);
        setReady(true);
      }
    });
  }, []);

  if (!ready || !user || loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      </DashboardShell>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Save failed");
      const data = await res.json();
      if (data.ok && data.config) {
        setForm({
          fourWeekPrice: data.config.fourWeekPrice ?? form.fourWeekPrice,
          sixWeekPrice: data.config.sixWeekPrice ?? form.sixWeekPrice,
          eightWeekPrice: data.config.eightWeekPrice ?? form.eightWeekPrice,
          referralReward: data.config.referralReward ?? form.referralReward,
          minimumWithdrawal: data.config.minimumWithdrawal ?? form.minimumWithdrawal,
        });
      }
      toast("success", "Pricing saved", "Program prices and referral settings updated successfully.");
    } catch {
      toast("error", "Save failed", "Could not save pricing configuration.");
    } finally {
      setSaving(false);
    }
  };

  const update = (patch: Partial<PricingConfig>) => setForm((f) => ({ ...f, ...patch }));

  return (
    <DashboardShell requiredRoles={["admin", "super_admin"]}>
      <PageHeader
        title="Pricing Management"
        description="Configure program prices and referral reward settings."
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="outline">Pricing Management</Badge>
            <Button variant="gradient" size="sm" onClick={handleSave} loading={saving}>
              <Save className="h-4 w-4" /> Save prices
            </Button>
          </div>
        }
      />

      {/* Current Prices */}
      <Reveal>
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <IndianRupee className="h-4 w-4 text-brand-500" />
                4 Weeks Program
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-brand-500">
                ₹{form.fourWeekPrice}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Per enrollment</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <IndianRupee className="h-4 w-4 text-brand-500" />
                6 Weeks Program
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-brand-500">
                ₹{form.sixWeekPrice}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Per enrollment</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <IndianRupee className="h-4 w-4 text-brand-500" />
                8 Weeks Program
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-brand-500">
                ₹{form.eightWeekPrice}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Per enrollment</p>
            </CardContent>
          </Card>
        </div>
      </Reveal>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Edit Prices */}
        <Reveal delay={0.1}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-brand-500" /> Program Prices
              </CardTitle>
              <CardDescription>Set the enrollment price for each internship program duration.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="4 Weeks Program Price (₹)" hint="Applied to all 4-week programs">
                <Input
                  type="number"
                  min={0}
                  value={form.fourWeekPrice}
                  onChange={(e) => update({ fourWeekPrice: Number(e.target.value) })}
                />
              </Field>
              <Field label="6 Weeks Program Price (₹)" hint="Applied to all 6-week programs">
                <Input
                  type="number"
                  min={0}
                  value={form.sixWeekPrice}
                  onChange={(e) => update({ sixWeekPrice: Number(e.target.value) })}
                />
              </Field>
              <Field label="8 Weeks Program Price (₹)" hint="Applied to all 8-week programs">
                <Input
                  type="number"
                  min={0}
                  value={form.eightWeekPrice}
                  onChange={(e) => update({ eightWeekPrice: Number(e.target.value) })}
                />
              </Field>
            </CardContent>
          </Card>
        </Reveal>

        {/* Referral Settings */}
        <Reveal delay={0.15}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-4 w-4 text-brand-500" /> Referral Settings
              </CardTitle>
              <CardDescription>Configure referral rewards and withdrawal minimums.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Referral Reward (₹)" hint="Amount credited per successful referral">
                <Input
                  type="number"
                  min={0}
                  value={form.referralReward}
                  onChange={(e) => update({ referralReward: Number(e.target.value) })}
                />
              </Field>
              <Field label="Minimum Withdrawal (₹)" hint="Minimum wallet balance to request withdrawal">
                <Input
                  type="number"
                  min={0}
                  value={form.minimumWithdrawal}
                  onChange={(e) => update({ minimumWithdrawal: Number(e.target.value) })}
                />
              </Field>
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </DashboardShell>
  );
}
