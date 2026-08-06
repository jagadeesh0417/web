"use client";

import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { RoleProfilePage } from "@/components/dashboard/role-profile";

export default function AdminProfilePage() {
  return (
    <DashboardShell>
      <PageHeader title="My profile" description="Your administrator profile." />
      <RoleProfilePage />
    </DashboardShell>
  );
}
