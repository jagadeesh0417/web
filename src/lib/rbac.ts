import type { Role } from "@/lib/types";

export const PERMISSIONS = {
  DASHBOARD_VIEW: "dashboard:view",
  PROFILE_EDIT: "profile:edit",
  INTERNSHIP_APPLY: "internship:apply",
  INTERNSHIP_MANAGE: "internship:manage",
  APPLICATIONS_REVIEW: "applications:review",
  USERS_MANAGE: "users:manage",
  CERTIFICATES_VIEW: "certificates:view",
  CERTIFICATES_ISSUE: "certificates:issue",
  ANALYTICS_VIEW: "analytics:view",
  PAYMENTS_VIEW: "payments:view",
  CMS_MANAGE: "cms:manage",
  BLOG_MANAGE: "blog:manage",
  PROJECTS_MANAGE: "projects:manage",
  PROJECTS_VIEW: "projects:view",
  MESSAGES_SEND: "messages:send",
  ASSIGNMENTS_SUBMIT: "assignments:submit",
  ASSIGNMENTS_GRADE: "assignments:grade",
  ATTENDANCE_VIEW: "attendance:view",
  ATTENDANCE_TRACK: "attendance:track",
  SESSIONS_JOIN: "sessions:join",
  SESSIONS_CONDUCT: "sessions:conduct",
  ANNOUNCEMENTS_POST: "announcements:post",
  INVOICES_VIEW: "invoices:view",
  SUPPORT_TICKETS: "support:tickets",
  EMPLOYEE_TASKS: "employee:tasks",
  TIMESHEETS: "timesheets",
  TESTIMONIALS_MANAGE: "testimonials:manage",
  REPORTS_VIEW: "reports:view",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ROLE_RANK: Record<Role, number> = {
  guest: 0,
  user: 1,
  applicant: 1,
  client: 2,
  intern: 2,
  employee: 2,
  mentor: 3,
  admin: 4,
  super_admin: 5,
};

export const ROLE_LABEL: Record<Role, string> = {
  guest: "Guest",
  user: "Registered User",
  client: "Client",
  applicant: "Applicant",
  intern: "Intern",
  mentor: "Mentor",
  employee: "Employee",
  admin: "Admin",
  super_admin: "Super Admin",
};

const ALL = Object.values(PERMISSIONS);

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  guest: [],
  user: [PERMISSIONS.PROFILE_EDIT, PERMISSIONS.MESSAGES_SEND],
  applicant: [PERMISSIONS.PROFILE_EDIT, PERMISSIONS.MESSAGES_SEND, PERMISSIONS.INTERNSHIP_APPLY],
  client: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PROFILE_EDIT,
    PERMISSIONS.PROJECTS_VIEW,
    PERMISSIONS.INVOICES_VIEW,
    PERMISSIONS.SUPPORT_TICKETS,
    PERMISSIONS.MESSAGES_SEND,
  ],
  intern: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PROFILE_EDIT,
    PERMISSIONS.CERTIFICATES_VIEW,
    PERMISSIONS.ASSIGNMENTS_SUBMIT,
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.SESSIONS_JOIN,
    PERMISSIONS.MESSAGES_SEND,
  ],
  employee: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PROFILE_EDIT,
    PERMISSIONS.PROJECTS_VIEW,
    PERMISSIONS.EMPLOYEE_TASKS,
    PERMISSIONS.TIMESHEETS,
    PERMISSIONS.MESSAGES_SEND,
  ],
  mentor: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PROFILE_EDIT,
    PERMISSIONS.CERTIFICATES_VIEW,
    PERMISSIONS.ASSIGNMENTS_GRADE,
    PERMISSIONS.ATTENDANCE_TRACK,
    PERMISSIONS.SESSIONS_CONDUCT,
    PERMISSIONS.ANNOUNCEMENTS_POST,
    PERMISSIONS.MESSAGES_SEND,
    PERMISSIONS.PROJECTS_VIEW,
  ],
  admin: [
    ...ALL.filter((p) => p !== PERMISSIONS.DASHBOARD_VIEW),
    PERMISSIONS.DASHBOARD_VIEW,
  ],
  super_admin: ALL,
};

export function can(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasRole(userRole: Role, required: Role): boolean {
  return ROLE_RANK[userRole] >= ROLE_RANK[required];
}

export const ROLE_HOME: Record<Role, string> = {
  guest: "/",
  user: "/dashboard",
  applicant: "/student",
  client: "/client",
  intern: "/student",
  mentor: "/mentor",
  employee: "/employee",
  admin: "/admin",
  super_admin: "/admin",
};

export function homeForRole(role: Role): string {
  return ROLE_HOME[role] ?? "/";
}

export interface NavItem {
  href: string;
  label: string;
  icon: string;
  permissions?: Permission[];
}

export const ROLE_NAV: Partial<Record<Role, NavItem[]>> = {
  intern: [
    { href: "/student", label: "Dashboard", icon: "LayoutDashboard" },
    { href: "/student/internship", label: "My Internship", icon: "GraduationCap" },
    { href: "/student/modules", label: "Course Modules", icon: "BookOpen" },
    { href: "/student/timeline", label: "Timeline", icon: "Clock" },
    { href: "/student/assignments", label: "Assignments", icon: "FileText" },
    { href: "/student/projects", label: "Projects", icon: "FolderKanban" },
    { href: "/student/submissions", label: "Submissions", icon: "FileCheck" },
    { href: "/student/assessment", label: "Assessment", icon: "ClipboardCheck" },
    { href: "/student/resources", label: "Resources", icon: "Download" },
    { href: "/student/certificate", label: "Certificate", icon: "Award" },
    { href: "/student/profile", label: "Profile", icon: "User" },
    { href: "/student/support", label: "Support", icon: "LifeBuoy" },
    { href: "/student/refer", label: "Refer & Earn", icon: "Gift" },
  ],
  applicant: [
    { href: "/student", label: "Application", icon: "LayoutDashboard" },
    { href: "/student/profile", label: "Profile", icon: "User" },
  ],
  client: [
    { href: "/client", label: "Overview", icon: "LayoutDashboard" },
    { href: "/client/projects", label: "Projects", icon: "FolderKanban" },
    { href: "/client/invoices", label: "Invoices", icon: "Receipt" },
    { href: "/client/support", label: "Support", icon: "LifeBuoy" },
    { href: "/client/profile", label: "Profile", icon: "User" },
  ],
  employee: [
    { href: "/employee", label: "Overview", icon: "LayoutDashboard" },
    { href: "/employee/projects", label: "Projects", icon: "FolderKanban" },
    { href: "/employee/tasks", label: "Tasks", icon: "CheckSquare" },
    { href: "/employee/timesheets", label: "Timesheets", icon: "Clock" },
    { href: "/employee/profile", label: "Profile", icon: "User" },
  ],
  mentor: [
    { href: "/mentor", label: "Overview", icon: "LayoutDashboard" },
    { href: "/mentor/interns", label: "My Interns", icon: "Users" },
    { href: "/mentor/assignments", label: "Review Work", icon: "ClipboardCheck" },
    { href: "/mentor/sessions", label: "Live Sessions", icon: "Video" },
    { href: "/mentor/announcements", label: "Announcements", icon: "Megaphone" },
    { href: "/mentor/messages", label: "Messages", icon: "MessageSquare" },
    { href: "/mentor/profile", label: "Profile", icon: "User" },
  ],
  admin: [
    { href: "/admin", label: "Dashboard", icon: "BarChart3" },
    { href: "/admin/users", label: "Students", icon: "Users" },
    { href: "/admin/interns", label: "Interns", icon: "GraduationCap" },
    { href: "/admin/applications", label: "Applications", icon: "FileStack" },
    { href: "/admin/internships", label: "Programs & Plans", icon: "BookOpen" },
    { href: "/admin/modules", label: "Modules", icon: "LayoutList" },
    { href: "/admin/videos", label: "Video Lessons", icon: "Video" },
    { href: "/admin/resources", label: "Resources", icon: "FolderOpen" },
    { href: "/admin/tasks", label: "Tasks", icon: "ClipboardList" },
    { href: "/admin/submissions", label: "Submissions", icon: "FileCheck" },
    { href: "/admin/assignments", label: "Assignment Review", icon: "ClipboardCheck" },
    { href: "/admin/projects", label: "Projects", icon: "FolderKanban" },
    { href: "/admin/certificates", label: "Certificates", icon: "Award" },
    { href: "/admin/certificate-templates", label: "Cert Templates", icon: "FileText" },
    { href: "/admin/payments", label: "Payments", icon: "CreditCard" },
    { href: "/admin/payment-settings", label: "Payment Settings", icon: "Settings" },
    { href: "/admin/pricing", label: "Pricing", icon: "DollarSign" },
    { href: "/admin/company-settings", label: "Company Settings", icon: "Building2" },
    { href: "/admin/email-templates", label: "Email Templates", icon: "Mail" },
    { href: "/admin/emails", label: "Email Log", icon: "Inbox" },
    { href: "/admin/blog", label: "Blog", icon: "PenLine" },
    { href: "/admin/cms", label: "Website CMS", icon: "Globe" },
    { href: "/admin/testimonials", label: "Testimonials", icon: "Quote" },
    { href: "/admin/leads", label: "Website Leads", icon: "MessageSquare" },
    { href: "/admin/verification", label: "Verification", icon: "ShieldCheck" },
    { href: "/admin/reports", label: "Reports", icon: "FileBarChart" },
    { href: "/admin/audit-log", label: "Audit Log", icon: "FileText" },
    { href: "/admin/referrals", label: "Referrals & Withdrawals", icon: "Gift" },
    { href: "/admin/profile", label: "Profile", icon: "User" },
  ],
};

export function navForRole(role: Role): NavItem[] {
  return ROLE_NAV[role] ?? [];
}
