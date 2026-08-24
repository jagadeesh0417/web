import type {
  Announcement,
  Application,
  AssessmentAttempt,
  Assignment,
  AttendanceRecord,
  BlogPost,
  Certificate,
  EmailLog,
  EmployeeTask,
  Enrollment,
  InAppNotification,
  Invoice,
  LessonProgress,
  LiveSession,
  Message,
  Module,
  Payment,
  PortfolioItem,
  Profile,
  Project,
  Submission,
  SupportTicket,
  Testimonial,
  TimesheetEntry,
} from "@/lib/types";
import { demoData } from "@/lib/data/sample-data";
import { CATEGORIES } from "@/lib/constants";
import { certificateId, generateId, randomId } from "@/lib/utils";

type DbShape = {
  applications: Application[];
  submissions: Submission[];
  sessions: LiveSession[];
  attendance: AttendanceRecord[];
  certificates: Certificate[];
  announcements: Announcement[];
  messages: Message[];
  projects: Project[];
  invoices: Invoice[];
  blogPosts: BlogPost[];
  testimonials: Testimonial[];
  portfolio: PortfolioItem[];
  tickets: SupportTicket[];
  tasks: EmployeeTask[];
  timesheets: TimesheetEntry[];
  payments: Payment[];
  notifications: InAppNotification[];
  enrollments: Enrollment[];
  lessonProgress: LessonProgress[];
  assessmentAttempts: AssessmentAttempt[];
  emailLog: EmailLog[];
};

const KEY = "ak_demo_db";

function seed(): DbShape {
  return {
    applications: [...demoData.applications],
    submissions: [...demoData.submissions],
    sessions: [...demoData.sessions],
    attendance: [...demoData.attendanceRecords],
    certificates: [...demoData.certificates],
    announcements: [...demoData.announcements],
    messages: [...demoData.messages],
    projects: [...demoData.projects],
    invoices: [...demoData.invoices],
    blogPosts: [...demoData.blogPosts],
    testimonials: [...demoData.testimonials],
    portfolio: [...demoData.portfolioItems],
    tickets: [...demoData.supportTickets],
    tasks: [...demoData.employeeTasks],
    timesheets: [...demoData.timesheets],
    payments: [...demoData.payments],
    notifications: [...demoData.notifications],
    enrollments: [...demoData.enrollments],
    lessonProgress: [...demoData.lessonProgress],
    assessmentAttempts: [],
    emailLog: [...demoData.emailLog],
  };
}

function loadDb(): DbShape {
  if (typeof window === "undefined") return seed();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as DbShape;
  } catch {
    /* ignore */
  }
  const s = seed();
  saveDb(s);
  return s;
}

function saveDb(db: DbShape) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(db));
}

function mutate<T>(fn: (db: DbShape) => T): T {
  const db = loadDb();
  const result = fn(db);
  saveDb(db);
  return result;
}

/* ---------- Applications ---------- */

export function getApplications(): Application[] {
  return loadDb().applications;
}

export function getApplicationByUser(userId: string): Application | undefined {
  return loadDb().applications.find((a) => a.userId === userId);
}

export function submitApplication(input: Omit<Application, "id" | "createdAt" | "updatedAt">): Application {
  return mutate((db) => {
    const existing = db.applications.find((a) => a.userId === input.userId);
    const app: Application = {
      ...input,
      id: existing?.id ?? generateId("app"),
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (existing) {
      db.applications = db.applications.map((a) => (a.id === existing.id ? app : a));
    } else {
      db.applications.unshift(app);
    }
    return app;
  });
}

export function updateApplicationStatus(id: string, status: Application["status"], notes?: string): Application | undefined {
  return mutate((db) => {
    const idx = db.applications.findIndex((a) => a.id === id);
    if (idx === -1) return undefined;
    db.applications[idx] = {
      ...db.applications[idx],
      status,
      notes: notes ?? db.applications[idx].notes,
      updatedAt: new Date().toISOString(),
    };
    return db.applications[idx];
  });
}

/* ---------- Modules / Assignments / Submissions ---------- */

export function getModules(categorySlug: string): Module[] {
  return demoData.modules.filter((m) => m.categorySlug === categorySlug);
}

export function getModuleById(id: string): Module | undefined {
  return demoData.modules.find((m) => m.id === id);
}

export function getAssignments(categorySlug?: string): Assignment[] {
  return demoData.assignments.filter((a) => !categorySlug || a.categorySlug === categorySlug);
}

export function getAssignmentById(id: string): Assignment | undefined {
  return demoData.assignments.find((a) => a.id === id);
}

export function getSubmissions(studentId?: string): Submission[] {
  return loadDb()
    .submissions.filter((s) => !studentId || s.studentId === studentId)
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
}

export function getSubmissionByAssignment(assignmentId: string, studentId: string): Submission | undefined {
  return loadDb().submissions.find((s) => s.assignmentId === assignmentId && s.studentId === studentId);
}

export function submitAssignment(input: Omit<Submission, "id" | "submittedAt" | "status">): Submission {
  return mutate((db) => {
    const existing = db.submissions.find((s) => s.assignmentId === input.assignmentId && s.studentId === input.studentId);
    const sub: Submission = {
      ...input,
      id: existing?.id ?? generateId("sub"),
      status: existing?.status === "approved" ? existing.status : "submitted",
      submittedAt: new Date().toISOString(),
    };
    if (existing) {
      db.submissions = db.submissions.map((s) => (s.id === existing.id ? sub : s));
    } else {
      db.submissions.unshift(sub);
    }
    return sub;
  });
}

export function reviewSubmission(id: string, data: { grade: number; feedback: string; status: "approved" | "revision" | "reviewed" }): Submission | undefined {
  return mutate((db) => {
    const idx = db.submissions.findIndex((s) => s.id === id);
    if (idx === -1) return undefined;
    db.submissions[idx] = { ...db.submissions[idx], ...data, reviewedAt: new Date().toISOString(), status: data.status };
    return db.submissions[idx];
  });
}

/* ---------- Enrollments / Payments / Invoices ---------- */

const YEAR = new Date().getFullYear();

export function getEnrollments(): Enrollment[] {
  return loadDb().enrollments;
}

export function getEnrollmentByUser(userId: string): Enrollment | undefined {
  return loadDb().enrollments.find((e) => e.userId === userId);
}

export function getEnrollmentById(id: string): Enrollment | undefined {
  return loadDb().enrollments.find((e) => e.id === id);
}

export function getPaymentForEnrollment(paymentId: string): Payment | undefined {
  return loadDb().payments.find((p) => p.id === paymentId);
}

export function getEnrollmentByEmail(email: string): Enrollment | undefined {
  const db = loadDb();
  const userEmail = email.trim().toLowerCase();
  const pay = db.payments.find((p) => p.email.toLowerCase() === userEmail);
  if (!pay?.enrollmentId) return undefined;
  return db.enrollments.find((e) => e.enrollmentId === pay.enrollmentId);
}

let idCounter = loadDb().enrollments.length + 1;

export function createEnrollment(input: {
  userId: string;
  applicationId?: string;
  categorySlug: string;
  programSlug: string;
  programTitle: string;
  durationWeeks: number;
  price: number;
  clientName: string;
  email: string;
  method: "upi" | "card" | "netbanking" | "wallet";
}): { enrollment: Enrollment; payment: Payment; invoiceNumber: string } {
  return mutate((db) => {
    const n = String(++idCounter).padStart(4, "0");
    const enrollmentId = `AKR-ENR-${YEAR}-${n}`;
    const studentId = `AKR-STU-${YEAR}-${n}`;
    const invoiceNumber = `INV-${YEAR}-${n}`;
    const orderId = `order_${randomId(10)}`;

    const payment: Payment = {
      id: generateId("pay"),
      orderId,
      clientName: input.clientName,
      email: input.email,
      amount: input.price,
      currency: "INR",
      provider: "razorpay",
      status: "succeeded",
      plan: `${input.programTitle} (${input.durationWeeks} weeks)`,
      method: input.method,
      invoiceNumber,
      enrollmentId,
      studentId,
      userId: input.userId,
      categorySlug: input.categorySlug,
      programSlug: input.programSlug,
      durationWeeks: input.durationWeeks,
      createdAt: new Date().toISOString(),
    };
    db.payments.unshift(payment);

    const enrollment: Enrollment = {
      id: generateId("enr"),
      enrollmentId,
      studentId,
      userId: input.userId,
      applicationId: input.applicationId,
      categorySlug: input.categorySlug,
      programSlug: input.programSlug,
      programTitle: input.programTitle,
      durationWeeks: input.durationWeeks,
      price: input.price,
      paymentId: payment.id,
      invoiceNumber,
      status: "pending_verification",
      startedAt: new Date().toISOString(),
    };
    db.enrollments.unshift(enrollment);
    return { enrollment, payment, invoiceNumber };
  });
}

export function activateEnrollment(enrollmentId: string): Enrollment | undefined {
  return mutate((db) => {
    const idx = db.enrollments.findIndex((e) => e.id === enrollmentId);
    if (idx === -1) return undefined;
    db.enrollments[idx] = { ...db.enrollments[idx], status: "active", joinedAt: new Date().toISOString() };
    return db.enrollments[idx];
  });
}

/* ---------- Lesson progress & module locking ---------- */

export function getLessonProgress(userId: string): LessonProgress[] {
  return loadDb().lessonProgress.filter((p) => p.userId === userId);
}

export function getCompletedLessonIds(userId: string): string[] {
  return getLessonProgress(userId).map((p) => p.lessonId);
}

export function isLessonComplete(userId: string, lessonId: string): boolean {
  return loadDb().lessonProgress.some((p) => p.userId === userId && p.lessonId === lessonId);
}

export function markLessonComplete(userId: string, lessonId: string): void {
  mutate((db) => {
    if (db.lessonProgress.some((p) => p.userId === userId && p.lessonId === lessonId)) return;
    db.lessonProgress.push({ userId, lessonId, completedAt: new Date().toISOString() });
  });
}

export function getAssignmentApproved(assignmentId: string, userId: string): boolean {
  const sub = loadDb().submissions.find((s) => s.assignmentId === assignmentId && s.studentId === userId);
  return sub?.status === "approved";
}

export function getStudentProgress(userId: string): {
  enrollment?: Enrollment;
  modules: Module[];
  completedLessons: number;
  totalLessons: number;
  approvedAssignments: number;
  totalAssignments: number;
  currentWeek: number;
  percent: number;
  allLessonsDone: boolean;
  allAssignmentsApproved: boolean;
} {
  const enrollment = getEnrollmentByUser(userId);
  const categorySlug = enrollment?.categorySlug ?? "web-development";
  const modules = getModules(categorySlug);
  const completed = getCompletedLessonIds(userId);
  const completedLessons = modules.reduce((acc, m) => acc + m.lessons.filter((l) => completed.includes(l.id)).length, 0);
  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const approvedAssignments = modules.filter((m) => m.assignmentId && getAssignmentApproved(m.assignmentId, userId)).length;
  const totalAssignments = modules.filter((m) => m.assignmentId).length;
  const allLessonsDone = totalLessons > 0 && completedLessons === totalLessons;
  const allAssignmentsApproved = totalAssignments > 0 && approvedAssignments === totalAssignments;
  let currentWeek = 1;
  for (const m of modules) {
    const lessonsDone = m.lessons.every((l) => completed.includes(l.id));
    const asgApproved = m.assignmentId ? getAssignmentApproved(m.assignmentId, userId) : true;
    if (lessonsDone && asgApproved) currentWeek = m.week + 1;
  }
  const percent = totalLessons === 0 ? 0 : Math.round(((completedLessons + approvedAssignments * 0.5) / (totalLessons + totalAssignments * 0.5)) * 100);
  return { enrollment, modules, completedLessons, totalLessons, approvedAssignments, totalAssignments, currentWeek, percent: Math.min(100, percent), allLessonsDone, allAssignmentsApproved };
}

export function isModuleUnlocked(userId: string, module: Module): { unlocked: boolean; reason?: string } {
  if (module.order === 1) return { unlocked: true };
  const previous = getModules(module.categorySlug)
    .filter((m) => m.order < module.order)
    .sort((a, b) => a.order - b.order);
  const last = previous[previous.length - 1];
  if (!last) return { unlocked: true };
  const lessonsDone = last.lessons.every((l) => isLessonComplete(userId, l.id));
  if (!lessonsDone) return { unlocked: false, reason: "Complete every lesson in the previous week first." };
  if (last.assignmentId && !getAssignmentApproved(last.assignmentId, userId)) {
    return { unlocked: false, reason: "Get the previous week's assignment approved to unlock this module." };
  }
  return { unlocked: true };
}

export function getModuleLockStates(userId: string, categorySlug: string): Record<string, { unlocked: boolean; reason?: string }> {
  const out: Record<string, { unlocked: boolean; reason?: string }> = {};
  for (const m of getModules(categorySlug)) out[m.id] = isModuleUnlocked(userId, m);
  return out;
}

/* ---------- Final assessment ---------- */

export const ASSESSMENT_RULES = { questionsPerAttempt: 30, passPercent: 70, maxAttempts: 3 } as const;

export function getAssessmentAttempts(userId: string): AssessmentAttempt[] {
  return loadDb().assessmentAttempts.filter((a) => a.userId === userId).sort((a, b) => b.completedAt.localeCompare(a.completedAt));
}

export function getAssessmentEligibility(userId: string): { eligible: boolean; reasons: string[] } {
  const p = getStudentProgress(userId);
  const reasons: string[] = [];
  if (!p.enrollment) reasons.push("Complete payment to enroll in a program.");
  else if (p.enrollment.status !== "active") reasons.push("Your account is still pending verification.");
  if (!p.allLessonsDone) reasons.push("Complete every lesson in all weeks.");
  if (!p.allAssignmentsApproved) reasons.push("Get all weekly assignments approved.");
  const attempts = getAssessmentAttempts(userId);
  if (attempts.filter((a) => !a.passed).length >= ASSESSMENT_RULES.maxAttempts) reasons.push("You have used all retake attempts.");
  return { eligible: reasons.length === 0, reasons };
}

export function submitAssessment(
  userId: string,
  enrollment: Enrollment,
  questions: { id: string; answer: number }[],
): AssessmentAttempt {
  const correct = questions.filter((q) => {
    const src = demoData.assessmentQuestions.find((x) => x.id === q.id);
    return src && src.answer === q.answer;
  }).length;
  const total = questions.length;
  const passed = (correct / total) * 100 >= ASSESSMENT_RULES.passPercent;
  const attempt: AssessmentAttempt = {
    id: generateId("att"),
    userId,
    enrollmentId: enrollment.id,
    questionIds: questions.map((q) => q.id),
    score: correct,
    total,
    passed,
    completedAt: new Date().toISOString(),
  };
  mutate((d) => {
    d.assessmentAttempts.unshift(attempt);
  });
  return attempt;
}

export function hasPassedAssessment(userId: string): boolean {
  return loadDb().assessmentAttempts.some((a) => a.userId === userId && a.passed);
}

/* ---------- Certificate gating ---------- */

export function getCertificateEligibility(userId: string): { eligible: boolean; reasons: string[] } {
  const p = getStudentProgress(userId);
  const reasons: string[] = [];
  if (!p.enrollment || p.enrollment.status !== "active") reasons.push("Enrollment must be active (payment confirmed + email verified).");
  if (!p.allLessonsDone) reasons.push("Complete all course videos.");
  if (!p.allAssignmentsApproved) reasons.push("Get all assignments approved.");
  if (!hasPassedAssessment(userId)) reasons.push("Pass the final assessment (70% or higher).");
  return { eligible: reasons.length === 0, reasons };
}

export function issueCertificateForUser(userId: string, issuedBy: string): Certificate | null {
  const p = getStudentProgress(userId);
  const eligibility = getCertificateEligibility(userId);
  if (!eligibility.eligible || !p.enrollment) return null;
  const existing = getCertificatesByStudent(userId)[0];
  if (existing) return existing;
  const start = p.enrollment.startedAt.slice(0, 10);
  const end = new Date(new Date(start).getTime() + p.enrollment.durationWeeks * 7 * 86400000).toISOString().slice(0, 10);
  return issueCertificate({
    certificateId: certificateId(),
    studentId: userId,
    studentName: (demoUsersName(userId) ?? "Student"),
    categoryName: categoryLabel(p.enrollment.categorySlug),
    programTitle: p.enrollment.programTitle,
    durationWeeks: p.enrollment.durationWeeks,
    startDate: start,
    endDate: end,
    score: getAssessmentAttempts(userId).find((a) => a.passed)?.score ?? 0,
    issuedBy,
  });
}

function demoUsersName(userId: string): string | undefined {
  const u = demoData.demoUsers.find((x) => x.id === userId);
  return u?.name;
}

export function categoryLabel(slug: string): string {
  return CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
}

/* ---------- Email log ---------- */

export function getEmailLog(): EmailLog[] {
  return loadDb().emailLog.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function logEmail(input: Omit<EmailLog, "id" | "createdAt">): EmailLog {
  return mutate((db) => {
    const log: EmailLog = { ...input, id: generateId("em"), createdAt: new Date().toISOString() };
    db.emailLog.unshift(log);
    return log;
  });
}

/* ---------- Verification log ---------- */

export interface VerifyLookup {
  certificateId: string;
  found: boolean;
  ip?: string;
  at: string;
}

export function getVerifyLog(): VerifyLookup[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("ak_verify_log");
    return raw ? (JSON.parse(raw) as VerifyLookup[]) : [];
  } catch {
    return [];
  }
}

export function logVerifyLookup(certificateId: string, found: boolean): void {
  if (typeof window === "undefined") return;
  try {
    const list = getVerifyLog();
    list.unshift({ certificateId, found, at: new Date().toISOString() });
    localStorage.setItem("ak_verify_log", JSON.stringify(list.slice(0, 100)));
  } catch {
    /* ignore */
  }
}

/* ---------- Sessions / Attendance ---------- */

export function getSessions(): LiveSession[] {
  return loadDb().sessions;
}

export function getSessionsByCategory(categorySlug: string): LiveSession[] {
  return loadDb().sessions.filter((s) => s.categorySlug === categorySlug);
}

export function getAttendance(studentId: string): AttendanceRecord[] {
  return loadDb().attendance.filter((a) => a.studentId === studentId);
}

export function markAttendance(studentId: string, sessionId: string, status: "present" | "absent"): void {
  mutate((db) => {
    const existing = db.attendance.find((a) => a.studentId === studentId && a.sessionId === sessionId);
    if (existing) {
      db.attendance = db.attendance.map((a) => (a === existing ? { ...a, status } : a));
    } else {
      db.attendance.push({ studentId, sessionId, status });
    }
  });
}

/* ---------- Certificates ---------- */

export function getCertificates(): Certificate[] {
  return loadDb().certificates;
}

export function getCertificatesByStudent(studentId: string): Certificate[] {
  return loadDb().certificates.filter((c) => c.studentId === studentId);
}

export function getCertificateById(certId: string): Certificate | undefined {
  return loadDb().certificates.find(
    (c) => c.certificateId.toLowerCase() === certId.trim().toLowerCase(),
  );
}

export function issueCertificate(input: Omit<Certificate, "id" | "issuedAt">): Certificate {
  return mutate((db) => {
    const cert: Certificate = { ...input, id: generateId("cert"), issuedAt: new Date().toISOString() };
    db.certificates.unshift(cert);
    return cert;
  });
}

/* ---------- Announcements / Messages ---------- */

export function getAnnouncementsForUser(userId: string): Announcement[] {
  return loadDb()
    .announcements.filter((a) => a.audience.length === 0 || a.audience.includes(userId))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function postAnnouncement(input: Omit<Announcement, "id" | "createdAt">): Announcement {
  return mutate((db) => {
    const ann: Announcement = { ...input, id: generateId("ann"), createdAt: new Date().toISOString() };
    db.announcements.unshift(ann);
    return ann;
  });
}

export function getMessagesForUser(userId: string): Message[] {
  return loadDb()
    .messages.filter((m) => m.fromId === userId || m.toId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function sendMessage(input: Omit<Message, "id" | "createdAt" | "read">): Message {
  return mutate((db) => {
    const msg: Message = { ...input, id: generateId("msg"), read: false, createdAt: new Date().toISOString() };
    db.messages.unshift(msg);
    return msg;
  });
}

/* ---------- Projects / Invoices / Tickets ---------- */

export function getProjects(): Project[] {
  return loadDb().projects;
}

export function getProjectsForClient(clientId: string): Project[] {
  return loadDb().projects.filter((p) => p.clientId === clientId);
}

export function getInvoicesForClient(clientId: string): Invoice[] {
  return loadDb().invoices.filter((i) => i.clientId === clientId);
}

export function getTickets(): SupportTicket[] {
  return loadDb().tickets;
}

export function getTicketsForClient(clientId: string): SupportTicket[] {
  return loadDb().tickets.filter((t) => t.clientId === clientId);
}

export function openTicket(input: Omit<SupportTicket, "id" | "createdAt" | "status">): SupportTicket {
  return mutate((db) => {
    const t: SupportTicket = { ...input, id: generateId("tkt"), status: "open", createdAt: new Date().toISOString() };
    db.tickets.unshift(t);
    return t;
  });
}

/* ---------- Employee ---------- */

export function getTasksForEmployee(employeeId: string): EmployeeTask[] {
  return loadDb().tasks.filter((t) => t.assigneeId === employeeId);
}

export function getAllTasks(): EmployeeTask[] {
  return loadDb().tasks;
}

export function getTimesheetsForEmployee(employeeId: string): TimesheetEntry[] {
  return loadDb().timesheets.filter((t) => t.employeeId === employeeId);
}

/* ---------- CMS content ---------- */

export function getBlogPosts(): BlogPost[] {
  return loadDb().blogPosts;
}

export function getTestimonials(): Testimonial[] {
  return loadDb().testimonials;
}

export function getPortfolioItems(): PortfolioItem[] {
  return loadDb().portfolio;
}

export function saveBlogPost(post: BlogPost): void {
  mutate((db) => {
    const idx = db.blogPosts.findIndex((b) => b.id === post.id);
    if (idx === -1) db.blogPosts.unshift(post);
    else db.blogPosts[idx] = post;
  });
}

export function saveTestimonial(t: Testimonial): void {
  mutate((db) => {
    const idx = db.testimonials.findIndex((x) => x.id === t.id);
    if (idx === -1) db.testimonials.unshift(t);
    else db.testimonials[idx] = t;
  });
}

/* ---------- Payments ---------- */

export function getPayments(): Payment[] {
  return loadDb().payments;
}

export function recordPayment(p: Omit<Payment, "id" | "createdAt">): Payment {
  return mutate((db) => {
    const pay: Payment = { ...p, id: generateId("pay"), createdAt: new Date().toISOString() };
    db.payments.unshift(pay);
    return pay;
  });
}

/* ---------- Notifications ---------- */

export function getNotificationsForUser(userId: string): InAppNotification[] {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem("ak_demo_notifications") : null;
    const local: InAppNotification[] = raw ? JSON.parse(raw) : [];
    const seeded = loadDb().notifications.filter((n) => n.userId === userId);
    return [...local, ...seeded].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 30);
  } catch {
    return [];
  }
}

export function markNotificationsRead(userId: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem("ak_demo_notifications");
    const list: InAppNotification[] = raw ? JSON.parse(raw) : [];
    localStorage.setItem(
      "ak_demo_notifications",
      JSON.stringify(list.map((n) => (n.userId === userId ? { ...n, read: true } : n))),
    );
  } catch {
    /* ignore */
  }
}

/* ---------- Profiles (demo) ---------- */

export function demoProfilesStore(): Record<string, Partial<Profile>> {
  return (demoData.demoProfiles as unknown as Record<string, Partial<Profile>>) ?? {};
}
