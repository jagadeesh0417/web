import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import path from "path";
import type {
  Announcement,
  AppUser,
  Application,
  AssessmentAttempt,
  AssessmentQuestion,
  Assignment,
  BlogPost,
  Certificate,
  CompanySettings,
  Enrollment,
  InAppNotification,
  Lesson,
  LessonProgress,
  Message,
  Module,
  Payment,
  PortfolioItem,
  Project,
  Referral,
  ReferralConfig,
  Submission,
  Testimonial,
  Video,
  WalletTransaction,
  Withdrawal,
} from "@/lib/types";

// ─── Extra types not in types.ts ─────────────────────────────────────────────

export interface Resource {
  id: string;
  name: string;
  type: "pdf" | "doc" | "link" | "file";
  url: string;
  categorySlug?: string;
  moduleId?: string;
  createdAt: string;
}

export interface Plan {
  id: string;
  programId: string;
  name: string;
  duration: string;
  price: number;
  currency: string;
  description: string;
  features: string[];
  modules: string[];
  projects: number;
  assessmentRequired: boolean;
  certificateIncluded: boolean;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface PlanConfig {
  id: string;
  razorpayKeyId: string;
  razorpayKeySecret: string;
  environment: "test" | "live";
  currency: string;
  updatedAt: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  status: "active" | "inactive";
  updatedAt: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: string;
  adminId?: string;
  createdAt: string;
}

// ─── Collection name → type mapping ──────────────────────────────────────────

export type CollectionName =
  | "users"
  | "enrollments"
  | "applications"
  | "payments"
  | "certificates"
  | "modules"
  | "lessons"
  | "videos"
  | "resources"
  | "tasks"
  | "projects"
  | "submissions"
  | "assessments"
  | "assessment-attempts"
  | "programs"
  | "categories"
  | "plans"
  | "plans-config"
  | "email-templates"
  | "audit-log"
  | "lesson-progress"
  | "blog-posts"
  | "testimonials"
  | "portfolio"
  | "announcements"
  | "messages"
  | "invoices"
  | "live-sessions"
  | "attendance"
  | "support-tickets"
  | "employee-tasks"
  | "timesheets"
  | "email-log"
  | "notifications"
  | "profiles"
  | "company-settings"
  | "referrals"
  | "wallet-transactions"
  | "withdrawals"
  | "referral-config";

export type CollectionTypeMap = {
  users: AppUser;
  enrollments: Enrollment;
  applications: Application;
  payments: Payment;
  certificates: Certificate;
  modules: Module;
  lessons: Lesson;
  videos: Video;
  resources: Resource;
  tasks: Assignment;
  projects: Project;
  submissions: Submission;
  assessments: AssessmentQuestion;
  "assessment-attempts": AssessmentAttempt;
  programs: { id: string; slug: string; title: string; description: string; duration: string; price: number; featured: boolean; features: string[]; modules: string[]; projects: number; assessmentPassingScore: number; certificateIncluded: boolean; mentorshipIncluded: boolean; status: "active" | "inactive"; createdAt: string; updatedAt: string };
  categories: { id: string; slug: string; name: string; icon: string; gradient: string; description: string; learningOutcomes: string[]; skills: string[]; prerequisites: string[]; faqs: { question: string; answer: string }[]; mentorId: string; status: "active" | "inactive"; createdAt: string };
  plans: Plan;
  "plans-config": PlanConfig;
  "email-templates": EmailTemplate;
  "audit-log": AuditLogEntry;
  "lesson-progress": LessonProgress;
  "blog-posts": BlogPost;
  testimonials: Testimonial;
  portfolio: PortfolioItem;
  announcements: Announcement;
  messages: Message;
  invoices: { id: string; number: string; clientId: string; clientName: string; amount: number; currency: string; status: "paid" | "pending" | "overdue" | "draft"; issuedAt: string; dueAt: string; items: { label: string; qty: number; rate: number }[] };
  "live-sessions": { id: string; categorySlug: string; title: string; description: string; date: string; time: string; durationMin: number; link: string; host: string; attendees: string[] };
  attendance: { studentId: string; sessionId: string; status: "present" | "absent" };
  "support-tickets": { id: string; clientId: string; clientName: string; subject: string; body: string; priority: "low" | "medium" | "high"; status: "open" | "in_progress" | "resolved"; createdAt: string };
  "employee-tasks": { id: string; assigneeId: string; assigneeName: string; title: string; description: string; projectId?: string; status: "todo" | "in_progress" | "review" | "done"; priority: "low" | "medium" | "high"; dueDate: string };
  timesheets: { id: string; employeeId: string; date: string; hours: number; projectName: string; note: string; approved: boolean };
  "email-log": { id: string; to: string; subject: string; template: string; status: "sent" | "failed"; createdAt: string };
  notifications: InAppNotification;
  profiles: { id: string; userId: string; fullName: string; mobile: string; email: string; college?: string; course?: string; branch?: string; yearOfStudy?: string; graduationYear?: string; dob?: string; gender?: string; city?: string; state?: string; linkedin?: string; github?: string; resumeUrl?: string; idUrl?: string; skills?: string[]; bio?: string; title?: string };
  "company-settings": CompanySettings;
  referrals: Referral;
  "wallet-transactions": WalletTransaction;
  withdrawals: Withdrawal;
  "referral-config": ReferralConfig;
};

// ─── Internal helpers ────────────────────────────────────────────────────────

const DATA_DIR = path.join(process.cwd(), "data");

function collectionFilePath(collection: string): string {
  const safe = collection.replace(/[^a-z0-9_-]/gi, "_");
  return path.join(DATA_DIR, `${safe}.json`);
}

/** Process-lifetime in-memory cache keyed by collection name. */
const cache = new Map<string, unknown[]>();

/** Track which collections have been loaded from disk (to avoid re-reading). */
const loaded = new Set<string>();

function ensureDataDir(): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readCollectionFromDisk<T>(collection: string): T[] {
  const filePath = collectionFilePath(collection);
  try {
    const raw = readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as T[];
  } catch {
    // File may not exist yet — that's fine.
  }
  return [];
}

function writeCollectionToDisk<T>(collection: string, items: T[]): void {
  ensureDataDir();
  const filePath = collectionFilePath(collection);
  writeFileSync(filePath, JSON.stringify(items, null, 2), "utf8");
}

function ensureLoaded<T>(collection: string): T[] {
  if (loaded.has(collection)) {
    return cache.get(collection) as T[];
  }
  const items = readCollectionFromDisk<T>(collection);
  cache.set(collection, items);
  loaded.add(collection);
  return items;
}

function mutate<T>(collection: string, fn: (items: T[]) => T[]): T[] {
  const items = ensureLoaded<T>(collection);
  const result = fn(items);
  cache.set(collection, result);
  writeCollectionToDisk(collection, result);
  return result;
}

// ─── Generic CRUD operations ─────────────────────────────────────────────────

export function getAll<T>(collection: string): T[] {
  return [...ensureLoaded<T>(collection)];
}

export function getById<T extends { id: string }>(collection: string, id: string): T | null {
  const items = ensureLoaded<T>(collection);
  return items.find((item) => item.id === id) ?? null;
}

export function create<T>(collection: string, data: T): T {
  mutate<T>(collection, (items) => {
    items.unshift(data);
    return items;
  });
  return data;
}

export function update<T extends { id: string }>(collection: string, id: string, patch: Partial<T>): T | null {
  let updated: T | null = null;
  mutate<T>(collection, (items) => {
    const idx = items.findIndex((item) => item.id === id);
    if (idx === -1) return items;
    items[idx] = { ...items[idx], ...patch };
    updated = items[idx];
    return items;
  });
  return updated;
}

export function remove(collection: string, id: string): boolean {
  let removed = false;
  mutate<unknown>(collection, (items) => {
    const idx = items.findIndex((item) => (item as { id: string }).id === id);
    if (idx === -1) return items;
    items.splice(idx, 1);
    removed = true;
    return items;
  });
  return removed;
}

export function count(collection: string): number {
  return ensureLoaded(collection).length;
}

export function find<T>(collection: string, predicate: (item: T) => boolean): T[] {
  return ensureLoaded<T>(collection).filter(predicate);
}

export function findOne<T>(collection: string, predicate: (item: T) => boolean): T | null {
  return ensureLoaded<T>(collection).find(predicate) ?? null;
}

export function upsert<T extends { id: string }>(collection: string, data: T): T {
  const existing = getById<T>(collection, data.id);
  if (existing) {
    return update<T>(collection, data.id, data) as T;
  }
  return create<T>(collection, data);
}

// ─── Seeding ─────────────────────────────────────────────────────────────────

let seeded = false;

export async function seedInitialData(): Promise<void> {
  if (seeded) return;
  seeded = true;

  // Only seed if collections are empty (first run)
  try {
    const { demoData } = await import("@/lib/data/sample-data");
    const { PROGRAMS, CATEGORIES } = await import("@/lib/constants");

    const seedIfEmpty = <T>(collection: string, data: T[]) => {
      const existing = ensureLoaded<T>(collection);
      if (existing.length === 0 && data.length > 0) {
        cache.set(collection, [...data]);
        loaded.add(collection);
        writeCollectionToDisk(collection, data);
      }
    };

    seedIfEmpty("users", demoData.demoUsers as unknown as CollectionTypeMap["users"][]);
    seedIfEmpty("applications", demoData.applications);
    seedIfEmpty("enrollments", demoData.enrollments);
    seedIfEmpty("payments", demoData.payments);
    seedIfEmpty("certificates", demoData.certificates);
    seedIfEmpty("modules", demoData.modules);
    seedIfEmpty("submissions", demoData.submissions);
    seedIfEmpty("announcements", demoData.announcements);
    seedIfEmpty("messages", demoData.messages);
    seedIfEmpty("projects", demoData.projects);
    seedIfEmpty("invoices", demoData.invoices);
    seedIfEmpty("blog-posts", demoData.blogPosts);
    seedIfEmpty("testimonials", demoData.testimonials);
    seedIfEmpty("portfolio", demoData.portfolioItems);
    seedIfEmpty("support-tickets", demoData.supportTickets);
    seedIfEmpty("employee-tasks", demoData.employeeTasks);
    seedIfEmpty("timesheets", demoData.timesheets);
    seedIfEmpty("notifications", demoData.notifications);
    seedIfEmpty("lesson-progress", demoData.lessonProgress);
    seedIfEmpty("assessments", demoData.assessmentQuestions);
    seedIfEmpty("assessment-attempts", []);
    seedIfEmpty("email-log", demoData.emailLog);
    seedIfEmpty("live-sessions", demoData.sessions);
    seedIfEmpty("attendance", demoData.attendanceRecords);

    seedIfEmpty("tasks", demoData.assignments);
    seedIfEmpty("programs", PROGRAMS);
    seedIfEmpty("categories", CATEGORIES);
    seedIfEmpty("videos", []);
    seedIfEmpty("resources", []);
    seedIfEmpty("plans", []);
    seedIfEmpty("plans-config", []);
    seedIfEmpty("email-templates", []);
    seedIfEmpty("audit-log", []);
    seedIfEmpty("profiles", []);
    seedIfEmpty("company-settings", [{
      id: "company_default",
      companyName: "Akradhii",
      companyTagline: "Digital Growth Studio",
      logoUrl: "",
      websiteUrl: "https://akradhii.vercel.app",
      udyamNumber: "UDYAM-TS-19-0012345",
      msmeInfo: "MSME Registered Enterprise",
      address: "HITEC City, Hyderabad, Telangana 500081, India",
      authorizedSignatoryName: "Akradhii",
      authorizedSignatoryDesignation: "Director",
      certificatePrefix: "AKR",
      supportEmail: "support@akradhii.com",
      phone: "+91 98485 79053",
      updatedAt: new Date().toISOString(),
    }] as CompanySettings[]);
    seedIfEmpty("referrals", []);
    seedIfEmpty("wallet-transactions", []);
    seedIfEmpty("withdrawals", []);
    seedIfEmpty("referral-config", [{
      id: "default",
      fourWeekPrice: 149,
      sixWeekPrice: 199,
      eightWeekPrice: 249,
      referralReward: 20,
      minimumWithdrawal: 200,
      attributionDays: 30,
      updatedAt: new Date().toISOString(),
    }] as ReferralConfig[]);
  } catch {
    // If import fails (e.g. in edge runtime), skip seeding.
  }
}

// ─── Audit log helper ────────────────────────────────────────────────────────

export function auditLog(
  action: string,
  resource: string,
  details?: string,
  adminId?: string,
  resourceId?: string,
): AuditLogEntry {
  const entry: AuditLogEntry = {
    id: `aud_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    action,
    resource,
    resourceId,
    details,
    adminId,
    createdAt: new Date().toISOString(),
  };
  create<AuditLogEntry>("audit-log", entry);
  return entry;
}

// ─── Typed collection accessors ──────────────────────────────────────────────

export const usersStore = {
  getAll: () => getAll<AppUser>("users"),
  getById: (id: string) => getById<AppUser>("users", id),
  create: (data: AppUser) => create<AppUser>("users", data),
  update: (id: string, patch: Partial<AppUser>) => update<AppUser>("users", id, patch),
  remove: (id: string) => remove("users", id),
  count: () => count("users"),
  find: (predicate: (item: AppUser) => boolean) => find<AppUser>("users", predicate),
  findOne: (predicate: (item: AppUser) => boolean) => findOne<AppUser>("users", predicate),
};

export const enrollmentsStore = {
  getAll: () => getAll<Enrollment>("enrollments"),
  getById: (id: string) => getById<Enrollment>("enrollments", id),
  create: (data: Enrollment) => create<Enrollment>("enrollments", data),
  update: (id: string, patch: Partial<Enrollment>) => update<Enrollment>("enrollments", id, patch),
  remove: (id: string) => remove("enrollments", id),
  count: () => count("enrollments"),
  find: (predicate: (item: Enrollment) => boolean) => find<Enrollment>("enrollments", predicate),
  findOne: (predicate: (item: Enrollment) => boolean) => findOne<Enrollment>("enrollments", predicate),
};

export const applicationsStore = {
  getAll: () => getAll<Application>("applications"),
  getById: (id: string) => getById<Application>("applications", id),
  create: (data: Application) => create<Application>("applications", data),
  update: (id: string, patch: Partial<Application>) => update<Application>("applications", id, patch),
  remove: (id: string) => remove("applications", id),
  count: () => count("applications"),
  find: (predicate: (item: Application) => boolean) => find<Application>("applications", predicate),
  findOne: (predicate: (item: Application) => boolean) => findOne<Application>("applications", predicate),
};

export const paymentsStore = {
  getAll: () => getAll<Payment>("payments"),
  getById: (id: string) => getById<Payment>("payments", id),
  create: (data: Payment) => create<Payment>("payments", data),
  update: (id: string, patch: Partial<Payment>) => update<Payment>("payments", id, patch),
  remove: (id: string) => remove("payments", id),
  count: () => count("payments"),
  find: (predicate: (item: Payment) => boolean) => find<Payment>("payments", predicate),
  findOne: (predicate: (item: Payment) => boolean) => findOne<Payment>("payments", predicate),
};

export const certificatesStore = {
  getAll: () => getAll<Certificate>("certificates"),
  getById: (id: string) => getById<Certificate>("certificates", id),
  create: (data: Certificate) => create<Certificate>("certificates", data),
  update: (id: string, patch: Partial<Certificate>) => update<Certificate>("certificates", id, patch),
  remove: (id: string) => remove("certificates", id),
  count: () => count("certificates"),
  find: (predicate: (item: Certificate) => boolean) => find<Certificate>("certificates", predicate),
  findOne: (predicate: (item: Certificate) => boolean) => findOne<Certificate>("certificates", predicate),
};

export const modulesStore = {
  getAll: () => getAll<Module>("modules"),
  getById: (id: string) => getById<Module>("modules", id),
  create: (data: Module) => create<Module>("modules", data),
  update: (id: string, patch: Partial<Module>) => update<Module>("modules", id, patch),
  remove: (id: string) => remove("modules", id),
  count: () => count("modules"),
  find: (predicate: (item: Module) => boolean) => find<Module>("modules", predicate),
  findOne: (predicate: (item: Module) => boolean) => findOne<Module>("modules", predicate),
};

export const lessonsStore = {
  getAll: () => getAll<Lesson>("lessons"),
  getById: (id: string) => getById<Lesson>("lessons", id),
  create: (data: Lesson) => create<Lesson>("lessons", data),
  update: (id: string, patch: Partial<Lesson>) => update<Lesson>("lessons", id, patch),
  remove: (id: string) => remove("lessons", id),
  count: () => count("lessons"),
  find: (predicate: (item: Lesson) => boolean) => find<Lesson>("lessons", predicate),
  findOne: (predicate: (item: Lesson) => boolean) => findOne<Lesson>("lessons", predicate),
};

export const videosStore = {
  getAll: () => getAll<Video>("videos"),
  getById: (id: string) => getById<Video>("videos", id),
  create: (data: Video) => create<Video>("videos", data),
  update: (id: string, patch: Partial<Video>) => update<Video>("videos", id, patch),
  remove: (id: string) => remove("videos", id),
  count: () => count("videos"),
  find: (predicate: (item: Video) => boolean) => find<Video>("videos", predicate),
  findOne: (predicate: (item: Video) => boolean) => findOne<Video>("videos", predicate),
};

export const resourcesStore = {
  getAll: () => getAll<Resource>("resources"),
  getById: (id: string) => getById<Resource>("resources", id),
  create: (data: Resource) => create<Resource>("resources", data),
  update: (id: string, patch: Partial<Resource>) => update<Resource>("resources", id, patch),
  remove: (id: string) => remove("resources", id),
  count: () => count("resources"),
  find: (predicate: (item: Resource) => boolean) => find<Resource>("resources", predicate),
  findOne: (predicate: (item: Resource) => boolean) => findOne<Resource>("resources", predicate),
};

export const tasksStore = {
  getAll: () => getAll<Assignment>("tasks"),
  getById: (id: string) => getById<Assignment>("tasks", id),
  create: (data: Assignment) => create<Assignment>("tasks", data),
  update: (id: string, patch: Partial<Assignment>) => update<Assignment>("tasks", id, patch),
  remove: (id: string) => remove("tasks", id),
  count: () => count("tasks"),
  find: (predicate: (item: Assignment) => boolean) => find<Assignment>("tasks", predicate),
  findOne: (predicate: (item: Assignment) => boolean) => findOne<Assignment>("tasks", predicate),
};

export const projectsStore = {
  getAll: () => getAll<Project>("projects"),
  getById: (id: string) => getById<Project>("projects", id),
  create: (data: Project) => create<Project>("projects", data),
  update: (id: string, patch: Partial<Project>) => update<Project>("projects", id, patch),
  remove: (id: string) => remove("projects", id),
  count: () => count("projects"),
  find: (predicate: (item: Project) => boolean) => find<Project>("projects", predicate),
  findOne: (predicate: (item: Project) => boolean) => findOne<Project>("projects", predicate),
};

export const submissionsStore = {
  getAll: () => getAll<Submission>("submissions"),
  getById: (id: string) => getById<Submission>("submissions", id),
  create: (data: Submission) => create<Submission>("submissions", data),
  update: (id: string, patch: Partial<Submission>) => update<Submission>("submissions", id, patch),
  remove: (id: string) => remove("submissions", id),
  count: () => count("submissions"),
  find: (predicate: (item: Submission) => boolean) => find<Submission>("submissions", predicate),
  findOne: (predicate: (item: Submission) => boolean) => findOne<Submission>("submissions", predicate),
};

export const assessmentsStore = {
  getAll: () => getAll<AssessmentQuestion>("assessments"),
  getById: (id: string) => getById<AssessmentQuestion>("assessments", id),
  create: (data: AssessmentQuestion) => create<AssessmentQuestion>("assessments", data),
  update: (id: string, patch: Partial<AssessmentQuestion>) => update<AssessmentQuestion>("assessments", id, patch),
  remove: (id: string) => remove("assessments", id),
  count: () => count("assessments"),
  find: (predicate: (item: AssessmentQuestion) => boolean) => find<AssessmentQuestion>("assessments", predicate),
  findOne: (predicate: (item: AssessmentQuestion) => boolean) => findOne<AssessmentQuestion>("assessments", predicate),
};

export const assessmentAttemptsStore = {
  getAll: () => getAll<AssessmentAttempt>("assessment-attempts"),
  getById: (id: string) => getById<AssessmentAttempt>("assessment-attempts", id),
  create: (data: AssessmentAttempt) => create<AssessmentAttempt>("assessment-attempts", data),
  update: (id: string, patch: Partial<AssessmentAttempt>) => update<AssessmentAttempt>("assessment-attempts", id, patch),
  remove: (id: string) => remove("assessment-attempts", id),
  count: () => count("assessment-attempts"),
  find: (predicate: (item: AssessmentAttempt) => boolean) => find<AssessmentAttempt>("assessment-attempts", predicate),
  findOne: (predicate: (item: AssessmentAttempt) => boolean) => findOne<AssessmentAttempt>("assessment-attempts", predicate),
};

export const programsStore = {
  getAll: () => getAll<CollectionTypeMap["programs"]>("programs"),
  getById: (id: string) => getById<CollectionTypeMap["programs"]>("programs", id),
  create: (data: CollectionTypeMap["programs"]) => create<CollectionTypeMap["programs"]>("programs", data),
  update: (id: string, patch: Partial<CollectionTypeMap["programs"]>) => update<CollectionTypeMap["programs"]>("programs", id, patch),
  remove: (id: string) => remove("programs", id),
  count: () => count("programs"),
  find: (predicate: (item: CollectionTypeMap["programs"]) => boolean) => find<CollectionTypeMap["programs"]>("programs", predicate),
  findOne: (predicate: (item: CollectionTypeMap["programs"]) => boolean) => findOne<CollectionTypeMap["programs"]>("programs", predicate),
};

export const categoriesStore = {
  getAll: () => getAll<CollectionTypeMap["categories"]>("categories"),
  getById: (id: string) => getById<CollectionTypeMap["categories"]>("categories", id),
  create: (data: CollectionTypeMap["categories"]) => create<CollectionTypeMap["categories"]>("categories", data),
  update: (id: string, patch: Partial<CollectionTypeMap["categories"]>) => update<CollectionTypeMap["categories"]>("categories", id, patch),
  remove: (id: string) => remove("categories", id),
  count: () => count("categories"),
  find: (predicate: (item: CollectionTypeMap["categories"]) => boolean) => find<CollectionTypeMap["categories"]>("categories", predicate),
  findOne: (predicate: (item: CollectionTypeMap["categories"]) => boolean) => findOne<CollectionTypeMap["categories"]>("categories", predicate),
};

export const plansStore = {
  getAll: () => getAll<Plan>("plans"),
  getById: (id: string) => getById<Plan>("plans", id),
  create: (data: Plan) => create<Plan>("plans", data),
  update: (id: string, patch: Partial<Plan>) => update<Plan>("plans", id, patch),
  remove: (id: string) => remove("plans", id),
  count: () => count("plans"),
  find: (predicate: (item: Plan) => boolean) => find<Plan>("plans", predicate),
  findOne: (predicate: (item: Plan) => boolean) => findOne<Plan>("plans", predicate),
};

export const plansConfigStore = {
  getAll: () => getAll<PlanConfig>("plans-config"),
  getById: (id: string) => getById<PlanConfig>("plans-config", id),
  create: (data: PlanConfig) => create<PlanConfig>("plans-config", data),
  update: (id: string, patch: Partial<PlanConfig>) => update<PlanConfig>("plans-config", id, patch),
  remove: (id: string) => remove("plans-config", id),
  count: () => count("plans-config"),
  find: (predicate: (item: PlanConfig) => boolean) => find<PlanConfig>("plans-config", predicate),
  findOne: (predicate: (item: PlanConfig) => boolean) => findOne<PlanConfig>("plans-config", predicate),
  getByKey: (key: string) => findOne<PlanConfig>("plans-config", (c) => c.id === key),
};

export const emailTemplatesStore = {
  getAll: () => getAll<EmailTemplate>("email-templates"),
  getById: (id: string) => getById<EmailTemplate>("email-templates", id),
  create: (data: EmailTemplate) => create<EmailTemplate>("email-templates", data),
  update: (id: string, patch: Partial<EmailTemplate>) => update<EmailTemplate>("email-templates", id, patch),
  remove: (id: string) => remove("email-templates", id),
  count: () => count("email-templates"),
  find: (predicate: (item: EmailTemplate) => boolean) => find<EmailTemplate>("email-templates", predicate),
  findOne: (predicate: (item: EmailTemplate) => boolean) => findOne<EmailTemplate>("email-templates", predicate),
  getByName: (name: string) => findOne<EmailTemplate>("email-templates", (t) => t.name === name),
};

export const auditLogStore = {
  getAll: () => getAll<AuditLogEntry>("audit-log"),
  getById: (id: string) => getById<AuditLogEntry>("audit-log", id),
  create: (data: AuditLogEntry) => create<AuditLogEntry>("audit-log", data),
  count: () => count("audit-log"),
  find: (predicate: (item: AuditLogEntry) => boolean) => find<AuditLogEntry>("audit-log", predicate),
  findOne: (predicate: (item: AuditLogEntry) => boolean) => findOne<AuditLogEntry>("audit-log", predicate),
};

export const lessonProgressStore = {
  getAll: () => getAll<LessonProgress>("lesson-progress"),
  create: (data: LessonProgress) => create<LessonProgress>("lesson-progress", data),
  count: () => count("lesson-progress"),
  find: (predicate: (item: LessonProgress) => boolean) => find<LessonProgress>("lesson-progress", predicate),
  findOne: (predicate: (item: LessonProgress) => boolean) => findOne<LessonProgress>("lesson-progress", predicate),
  getByUser: (userId: string) => find<LessonProgress>("lesson-progress", (p) => p.userId === userId),
};

export const blogPostsStore = {
  getAll: () => getAll<BlogPost>("blog-posts"),
  getById: (id: string) => getById<BlogPost>("blog-posts", id),
  create: (data: BlogPost) => create<BlogPost>("blog-posts", data),
  update: (id: string, patch: Partial<BlogPost>) => update<BlogPost>("blog-posts", id, patch),
  remove: (id: string) => remove("blog-posts", id),
  count: () => count("blog-posts"),
  find: (predicate: (item: BlogPost) => boolean) => find<BlogPost>("blog-posts", predicate),
  findOne: (predicate: (item: BlogPost) => boolean) => findOne<BlogPost>("blog-posts", predicate),
  getBySlug: (slug: string) => findOne<BlogPost>("blog-posts", (p) => p.slug === slug),
};

export const testimonialsStore = {
  getAll: () => getAll<Testimonial>("testimonials"),
  getById: (id: string) => getById<Testimonial>("testimonials", id),
  create: (data: Testimonial) => create<Testimonial>("testimonials", data),
  update: (id: string, patch: Partial<Testimonial>) => update<Testimonial>("testimonials", id, patch),
  remove: (id: string) => remove("testimonials", id),
  count: () => count("testimonials"),
  find: (predicate: (item: Testimonial) => boolean) => find<Testimonial>("testimonials", predicate),
  findOne: (predicate: (item: Testimonial) => boolean) => findOne<Testimonial>("testimonials", predicate),
};

export const portfolioStore = {
  getAll: () => getAll<PortfolioItem>("portfolio"),
  getById: (id: string) => getById<PortfolioItem>("portfolio", id),
  create: (data: PortfolioItem) => create<PortfolioItem>("portfolio", data),
  update: (id: string, patch: Partial<PortfolioItem>) => update<PortfolioItem>("portfolio", id, patch),
  remove: (id: string) => remove("portfolio", id),
  count: () => count("portfolio"),
  find: (predicate: (item: PortfolioItem) => boolean) => find<PortfolioItem>("portfolio", predicate),
  findOne: (predicate: (item: PortfolioItem) => boolean) => findOne<PortfolioItem>("portfolio", predicate),
  getBySlug: (slug: string) => findOne<PortfolioItem>("portfolio", (p) => p.slug === slug),
};

export const announcementsStore = {
  getAll: () => getAll<Announcement>("announcements"),
  getById: (id: string) => getById<Announcement>("announcements", id),
  create: (data: Announcement) => create<Announcement>("announcements", data),
  update: (id: string, patch: Partial<Announcement>) => update<Announcement>("announcements", id, patch),
  remove: (id: string) => remove("announcements", id),
  count: () => count("announcements"),
  find: (predicate: (item: Announcement) => boolean) => find<Announcement>("announcements", predicate),
  findOne: (predicate: (item: Announcement) => boolean) => findOne<Announcement>("announcements", predicate),
};

export const messagesStore = {
  getAll: () => getAll<Message>("messages"),
  getById: (id: string) => getById<Message>("messages", id),
  create: (data: Message) => create<Message>("messages", data),
  update: (id: string, patch: Partial<Message>) => update<Message>("messages", id, patch),
  remove: (id: string) => remove("messages", id),
  count: () => count("messages"),
  find: (predicate: (item: Message) => boolean) => find<Message>("messages", predicate),
  findOne: (predicate: (item: Message) => boolean) => findOne<Message>("messages", predicate),
};

export const notificationsStore = {
  getAll: () => getAll<InAppNotification>("notifications"),
  getById: (id: string) => getById<InAppNotification>("notifications", id),
  create: (data: InAppNotification) => create<InAppNotification>("notifications", data),
  update: (id: string, patch: Partial<InAppNotification>) => update<InAppNotification>("notifications", id, patch),
  remove: (id: string) => remove("notifications", id),
  count: () => count("notifications"),
  find: (predicate: (item: InAppNotification) => boolean) => find<InAppNotification>("notifications", predicate),
  findOne: (predicate: (item: InAppNotification) => boolean) => findOne<InAppNotification>("notifications", predicate),
};

export const companySettingsStore = {
  getAll: () => getAll<CompanySettings>("company-settings"),
  get: () => findOne<CompanySettings>("company-settings", (s) => s.id === "company_default"),
  update: (patch: Partial<CompanySettings>) => {
    const existing = findOne<CompanySettings>("company-settings", (s) => s.id === "company_default");
    if (existing) return update<CompanySettings>("company-settings", "company_default", { ...patch, updatedAt: new Date().toISOString() });
    return create<CompanySettings>("company-settings", {
      id: "company_default",
      companyName: "Akradhii",
      companyTagline: "Digital Growth Studio",
      logoUrl: "",
      websiteUrl: "https://akradhii.vercel.app",
      udyamNumber: "UDYAM-TS-19-0012345",
      msmeInfo: "MSME Registered Enterprise",
      address: "HITEC City, Hyderabad, Telangana 500081, India",
      authorizedSignatoryName: "Akradhii",
      authorizedSignatoryDesignation: "Director",
      certificatePrefix: "AKR",
      supportEmail: "support@akradhii.com",
      phone: "+91 98485 79053",
      updatedAt: new Date().toISOString(),
      ...patch,
    });
  },
};

// ─── Referral & Wallet stores ────────────────────────────────────────────────

export const referralsStore = {
  getAll: () => getAll<Referral>("referrals"),
  getById: (id: string) => getById<Referral>("referrals", id),
  create: (data: Referral) => create<Referral>("referrals", data),
  update: (id: string, patch: Partial<Referral>) => update<Referral>("referrals", id, patch),
  find: (predicate: (item: Referral) => boolean) => find<Referral>("referrals", predicate),
  findOne: (predicate: (item: Referral) => boolean) => findOne<Referral>("referrals", predicate),
};

export const walletTransactionsStore = {
  getAll: () => getAll<WalletTransaction>("wallet-transactions"),
  getById: (id: string) => getById<WalletTransaction>("wallet-transactions", id),
  create: (data: WalletTransaction) => create<WalletTransaction>("wallet-transactions", data),
  find: (predicate: (item: WalletTransaction) => boolean) => find<WalletTransaction>("wallet-transactions", predicate),
  findOne: (predicate: (item: WalletTransaction) => boolean) => findOne<WalletTransaction>("wallet-transactions", predicate),
};

export const withdrawalsStore = {
  getAll: () => getAll<Withdrawal>("withdrawals"),
  getById: (id: string) => getById<Withdrawal>("withdrawals", id),
  create: (data: Withdrawal) => create<Withdrawal>("withdrawals", data),
  update: (id: string, patch: Partial<Withdrawal>) => update<Withdrawal>("withdrawals", id, patch),
  find: (predicate: (item: Withdrawal) => boolean) => find<Withdrawal>("withdrawals", predicate),
};

export const referralConfigStore = {
  get: () => findOne<ReferralConfig>("referral-config", (c) => c.id === "default"),
  update: (patch: Partial<ReferralConfig>) => {
    const existing = findOne<ReferralConfig>("referral-config", (c) => c.id === "default");
    if (existing) return update<ReferralConfig>("referral-config", "default", { ...patch, updatedAt: new Date().toISOString() });
    return create<ReferralConfig>("referral-config", {
      id: "default",
      fourWeekPrice: 149,
      sixWeekPrice: 199,
      eightWeekPrice: 249,
      referralReward: 20,
      minimumWithdrawal: 200,
      attributionDays: 30,
      updatedAt: new Date().toISOString(),
      ...patch,
    });
  },
};
