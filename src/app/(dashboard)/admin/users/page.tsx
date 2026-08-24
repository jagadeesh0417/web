"use client";

import { useEffect, useMemo, useState } from "react";
import { Shield, UserCog } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/toast";
import { getSession, demoGetAllUsers, demoUpdateUserRole } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/rbac";
import { formatDate } from "@/lib/utils";
import type { AppUser, Role } from "@/lib/types";

const roles: Role[] = ["user", "applicant", "intern", "client", "mentor", "employee", "admin", "super_admin"];

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [user, setUser] = useState<{ id: string; role?: Role } | null>(null);
  const [ready, setReady] = useState(false);
  const [users, setUsers] = useState<AppUser[]>([]);

  useEffect(() => {
    getSession().then(({ user }) => {
      setUser(user);
      setReady(true);
      setUsers(demoGetAllUsers());
    });
  }, []);

  const rows = useMemo(() => {
    const merged = [...users];
    const seed = [
      { id: "u_admin", name: "Arjun Reddy", email: "admin@akradhii.com", role: "super_admin" as Role, emailVerified: true },
      { id: "u_mentor1", name: "Sneha Kulkarni", email: "mentor@akradhii.com", role: "mentor" as Role, emailVerified: true },
      { id: "u_emp1", name: "Priya Sharma", email: "employee@akradhii.com", role: "employee" as Role, emailVerified: true },
      { id: "u_client1", name: "Vikram Malhotra", email: "client@akradhii.com", role: "client" as Role, emailVerified: true },
      { id: "u_student2", name: "Karthik Rao", email: "karthik@example.com", role: "intern" as Role, emailVerified: true },
      { id: "u_applicant", name: "Divya Menon", email: "applicant@example.com", role: "applicant" as Role, emailVerified: true },
    ];
    for (const s of seed) {
      if (!merged.some((m) => m.id === s.id)) merged.push({ ...s, createdAt: new Date().toISOString() });
    }
    return merged;
  }, [users]);

  if (!ready || !user) return <DashboardShell><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand-500" /></DashboardShell>;

  const changeRole = (id: string, role: Role) => {
    demoUpdateUserRole(id, role);
    setUsers(demoGetAllUsers());
    toast("success", "Role updated", `User now has the ${ROLE_LABEL[role]} role.`);
  };

  const columns: Column<AppUser>[] = [
    {
      key: "name",
      header: "User",
      cell: (r) => (
        <div className="flex items-center gap-3">
          <Avatar name={r.name} />
          <div>
            <p className="font-medium">{r.name}</p>
            <p className="text-xs text-muted-foreground">{r.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      cell: (r) => <Badge variant={r.role === "super_admin" || r.role === "admin" ? "primary" : "default"}>{ROLE_LABEL[r.role]}</Badge>,
    },
    {
      key: "verified",
      header: "Verification",
      cell: (r) => <Badge variant={r.emailVerified ? "success" : "warning"}>{r.emailVerified ? "Email verified" : "Unverified"}</Badge>,
    },
    {
      key: "createdAt",
      header: "Joined",
      cell: (r) => <span className="text-xs text-muted-foreground">{r.createdAt ? formatDate(r.createdAt) : "—"}</span>,
    },
    {
      key: "actions",
      header: "Change role",
      cell: (r) => (
        <Select
          className="h-8 w-36 text-xs"
          value={r.role}
          onChange={(e) => changeRole(r.id, e.target.value as Role)}
          disabled={r.id === user.id}
        >
          {roles.map((role) => <option key={role} value={role}>{ROLE_LABEL[role]}</option>)}
        </Select>
      ),
    },
  ];

  return (
    <DashboardShell>
      <PageHeader
        title="Users"
        description="Manage accounts and roles across the platform. Role changes take effect immediately."
        actions={
          <Button variant="outline" size="sm">
            <UserCog className="h-4 w-4" /> Invite user
          </Button>
        }
      />

      <Card className="mb-4 flex items-center gap-3 p-4 text-sm">
        <Shield className="h-5 w-5 text-brand-500" />
        <span className="text-muted-foreground">You are logged in as <b className="text-foreground">{user.role ? ROLE_LABEL[user.role] : "Admin"}</b> — you cannot change your own role.</span>
      </Card>

      <DataTable
        data={rows}
        columns={columns}
        searchPlaceholder="Search users…"
        searchKeys={["name", "email"]}
        filterRows={(r, fv) => (fv.Role === "all" || !fv.Role || r.role === fv.Role)}
        filters={[{ label: "Role", options: roles }]}
      />
    </DashboardShell>
  );
}
