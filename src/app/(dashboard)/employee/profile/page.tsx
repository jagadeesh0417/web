"use client";

import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { RoleProfilePage } from "@/components/dashboard/role-profile";

export default function EmployeeProfilePage() {
  return (
    <DashboardShell>
      <PageHeader title="My profile" description="Your employee workspace profile." />
      <RoleProfilePage />
    </DashboardShell>
  );
}
