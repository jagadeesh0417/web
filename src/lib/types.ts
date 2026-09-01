export type Role =
  | "guest"
  | "user"
  | "client"
  | "applicant"
  | "intern"
  | "mentor"
  | "employee"
  | "admin"
  | "super_admin";

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatarUrl?: string;
  emailVerified: boolean;
  phone?: string;
  company?: string;
  referralCode?: string;
  referredByUserId?: string;
  referralEligible?: boolean;
  walletBalance?: number;
  totalReferralEarnings?: number;
  totalWithdrawn?: number;
  createdAt: string;
}

export interface Profile {
  id: string;
  userId: string;
  fullName: string;
  mobile: string;
  email: string;
  college?: string;
  course?: string;
  branch?: string;
  yearOfStudy?: string;
  graduationYear?: string;
  dob?: string;
  gender?: string;
  city?: string;
  state?: string;
  linkedin?: string;
  github?: string;
  resumeUrl?: string;
  idUrl?: string;
  skills?: string[];
  bio?: string;
  title?: string;
}

export interface InternshipProgram {
  id: string;
  slug: string;
  title: string;
  description: string;
  duration: string;
  price: number;
  featured: boolean;
  features: string[];
  modules: string[];
  projects: number;
  assessmentPassingScore: number;
  certificateIncluded: boolean;
  mentorshipIncluded: boolean;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface InternshipCategory {
  id: string;
  slug: string;
  name: string;
  icon: string;
  gradient: string;
  description: string;
  learningOutcomes: string[];
  skills: string[];
  prerequisites: string[];
  faqs: { question: string; answer: string }[];
  mentorId: string;
  status: "active" | "inactive";
  createdAt: string;
}

export type ApplicationStatus = "pending" | "under_review" | "approved" | "rejected" | "requested_info";

export interface Application {
  id: string;
  userId: string;
  categorySlug: string;
  programSlug: string;
  status: ApplicationStatus;
  profile: Partial<Profile>;
  notes?: string;
  agreementAccepted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Enrollment {
  id: string;
  enrollmentId: string;
  studentId: string;
  userId: string;
  applicationId?: string;
  categorySlug: string;
  programSlug: string;
  programTitle: string;
  durationWeeks: number;
  price: number;
  paymentId: string;
  invoiceNumber: string;
  status: "pending_verification" | "active" | "completed" | "withdrawn";
  startedAt: string;
  joinedAt?: string;
  completedAt?: string;
}

export interface Module {
  id: string;
  categorySlug: string;
  title: string;
  order: number;
  week: number;
  description: string;
  lessons: Lesson[];
  quiz: { question: string; options: string[]; answer: number; explanation?: string }[];
  assignmentId?: string;
  requiresPrevious: boolean;
  resources: { name: string; type: string }[];
}

export interface Lesson {
  id: string;
  title: string;
  duration: number;
  videoUrl?: string;
  notes: string;
  learningObjectives?: string[];
  type: "video" | "reading" | "live-recording";
}

export type SubmissionLinkType = "drive" | "github" | "figma" | "canva" | "other";

export interface Assignment {
  id: string;
  title: string;
  categorySlug: string;
  description: string;
  instructions: string[];
  deadlineDays: number;
  maxScore: number;
  submissionTypes: string[];
  linkTypes: SubmissionLinkType[];
  status?: "open" | "closed";
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  links: string[];
  linkType?: SubmissionLinkType;
  files: { name: string; size: number; type: string }[];
  note?: string;
  status: "submitted" | "reviewed" | "revision" | "approved";
  grade?: number;
  feedback?: string;
  submittedAt: string;
  reviewedAt?: string;
}

export interface LessonProgress {
  userId: string;
  lessonId: string;
  completedAt: string;
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  options: string[];
  answer: number;
  explanation?: string;
}

export interface AssessmentAttempt {
  id: string;
  userId: string;
  enrollmentId: string;
  questionIds: string[];
  score: number;
  total: number;
  passed: boolean;
  completedAt: string;
}

export interface EmailLog {
  id: string;
  to: string;
  subject: string;
  template: string;
  status: "sent" | "failed";
  createdAt: string;
}

export interface LiveSession {
  id: string;
  categorySlug: string;
  title: string;
  description: string;
  date: string;
  time: string;
  durationMin: number;
  link: string;
  host: string;
  attendees: string[];
}

export interface AttendanceRecord {
  studentId: string;
  sessionId: string;
  status: "present" | "absent";
}

export interface Certificate {
  id: string;
  certificateId: string;
  studentId: string;
  studentName: string;
  categoryName: string;
  programTitle: string;
  durationWeeks: number;
  startDate: string;
  endDate: string;
  issuedAt: string;
  score: number;
  issuedBy: string;
  status: "valid" | "revoked";
  revokedAt?: string;
  revokeReason?: string;
  pdfUrl?: string;
}

export interface CompanySettings {
  id: string;
  companyName: string;
  companyTagline: string;
  logoUrl: string;
  websiteUrl: string;
  udyamNumber: string;
  msmeInfo: string;
  address: string;
  authorizedSignatoryName: string;
  authorizedSignatoryDesignation: string;
  certificatePrefix: string;
  supportEmail: string;
  phone: string;
  updatedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  audience: string[];
  author: string;
  pinned?: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  fromId: string;
  toId: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  service: string;
  status: "planning" | "in_progress" | "review" | "completed";
  progress: number;
  budget: number;
  team: string[];
  startDate: string;
  dueDate: string;
  description: string;
  milestones: { title: string; done: boolean }[];
}

export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "overdue" | "draft";
  issuedAt: string;
  dueAt: string;
  items: { label: string; qty: number; rate: number }[];
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  category: string;
  tags: string[];
  readingTime: number;
  publishedAt: string;
  published: boolean;
  gradient: string;
  content: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  company: string;
  role: string;
  quote: string;
  rating: number;
  initials: string;
  gradient: string;
}

export interface PortfolioItem {
  id: string;
  slug: string;
  title: string;
  service: string;
  client: string;
  summary: string;
  challenge?: string;
  solution?: string;
  features?: string[];
  results: { label: string; value: string }[];
  gradient: string;
  tags: string[];
  year: string;
}

export interface SupportTicket {
  id: string;
  clientId: string;
  clientName: string;
  subject: string;
  body: string;
  priority: "low" | "medium" | "high";
  status: "open" | "in_progress" | "resolved";
  createdAt: string;
}

export interface EmployeeTask {
  id: string;
  assigneeId: string;
  assigneeName: string;
  title: string;
  description: string;
  projectId?: string;
  status: "todo" | "in_progress" | "review" | "done";
  priority: "low" | "medium" | "high";
  dueDate: string;
}

export interface TimesheetEntry {
  id: string;
  employeeId: string;
  date: string;
  hours: number;
  projectName: string;
  note: string;
  approved: boolean;
}

export interface Payment {
  id: string;
  orderId: string;
  clientName: string;
  email: string;
  amount: number;
  currency: string;
  provider: "razorpay" | "stripe";
  status: "succeeded" | "pending" | "failed";
  plan: string;
  method?: "upi" | "card" | "netbanking" | "wallet";
  invoiceNumber?: string;
  enrollmentId?: string;
  studentId?: string;
  userId?: string;
  categorySlug?: string;
  programSlug?: string;
  durationWeeks?: number;
  createdAt: string;
}

export interface InAppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  kind: "registration" | "verification" | "application" | "approval" | "deadline" | "session" | "message" | "certificate" | "password" | "general";
  read: boolean;
  createdAt: string;
}

export interface Analytics {
  totalUsers: number;
  totalClients: number;
  totalInterns: number;
  activeInternships: number;
  applications: number;
  certificatesIssued: number;
  revenue: number;
  conversionRate: number;
  websiteVisitors: number;
  supportTickets: number;
  projectStatus: Record<string, number>;
  usersByMonth: { month: string; users: number; visitors: number }[];
  revenueByMonth: { month: string; revenue: number; expenses: number }[];
  applicationsByCategory: { name: string; count: number }[];
}

export interface Video {
  id: string;
  title: string;
  description: string;
  driveUrl: string;
  driveFileId: string;
  embedUrl: string;
  moduleId: string;
  lessonOrder: number;
  duration?: string;
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
}

/** Re-export lead types for convenience */
export type { WebsiteLead, LeadFormType, WhatsAppDeliveryStatus } from "@/lib/leads/types";

// ─── Referral & Wallet Types ─────────────────────────────────────────────────

export interface Referral {
  id: string;
  referrerId: string;
  referredUserId: string;
  referralCode: string;
  rewardAmount: number;
  status: "pending" | "rewarded" | "expired";
  qualifyingPaymentId?: string;
  createdAt: string;
  rewardedAt?: string;
}

export type WalletTransactionType =
  | "REFERRAL_REWARD"
  | "WITHDRAWAL"
  | "WITHDRAWAL_REVERSAL";

export type WalletTransactionStatus = "completed" | "pending" | "reversed";

export interface WalletTransaction {
  id: string;
  userId: string;
  type: WalletTransactionType;
  amount: number;
  referenceId?: string;
  description: string;
  status: WalletTransactionStatus;
  createdAt: string;
}

export type WithdrawalStatus =
  | "pending"
  | "approved"
  | "processing"
  | "paid"
  | "rejected";

export interface Withdrawal {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  paymentMethod: "bank_transfer" | "upi";
  upiId?: string;
  accountHolderName?: string;
  accountNumber?: string;
  ifsc?: string;
  status: WithdrawalStatus;
  adminNote?: string;
  rejectionReason?: string;
  createdAt: string;
  processedAt?: string;
}

export interface ReferralConfig {
  id: string;
  fourWeekPrice: number;
  sixWeekPrice: number;
  eightWeekPrice: number;
  referralReward: number;
  minimumWithdrawal: number;
  attributionDays: number;
  updatedAt: string;
}
