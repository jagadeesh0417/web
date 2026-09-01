import { ObjectId } from "mongodb";

export type UserRole = "USER" | "ADMIN";
export type AccountStatus = "ACTIVE" | "SUSPENDED" | "DISABLED";
export type CourseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type LessonStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type PurchaseStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "CANCELLED";
export type SubscriptionStatus = "ACTIVE" | "EXPIRED" | "CANCELLED";
export type ReferralStatus = "pending" | "rewarded" | "expired";
export type TransactionType = "REFERRAL_REWARD" | "WITHDRAWAL" | "WITHDRAWAL_REVERSAL";
export type WithdrawalStatus = "pending" | "approved" | "processing" | "paid" | "rejected";
export type AccessType = "PURCHASED" | "COMPLIMENTARY";

export interface User {
  _id: ObjectId;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
  referralCode: string;
  referredBy: ObjectId | null;
  walletBalance: number;
  totalReferralEarnings: number;
  totalWithdrawn: number;
  accountStatus: AccountStatus;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
}

export interface Course {
  _id: ObjectId;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  banner: string;
  category: string;
  duration: string;
  level: string;
  price: number;
  status: CourseStatus;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Module {
  _id: ObjectId;
  courseId: ObjectId;
  title: string;
  description: string;
  sortOrder: number;
  status: LessonStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lesson {
  _id: ObjectId;
  moduleId: ObjectId;
  courseId: ObjectId;
  title: string;
  description: string;
  sortOrder: number;
  status: LessonStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Video {
  _id: ObjectId;
  lessonId: ObjectId;
  moduleId: ObjectId;
  courseId: ObjectId;
  title: string;
  description: string;
  cloudinaryPublicId: string;
  cloudinaryUrl: string;
  thumbnailUrl: string;
  duration: number;
  sortOrder: number;
  status: LessonStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Pdf {
  _id: ObjectId;
  lessonId: ObjectId;
  moduleId: ObjectId;
  courseId: ObjectId;
  title: string;
  description: string;
  cloudinaryPublicId: string;
  cloudinaryUrl: string;
  fileSize: number;
  sortOrder: number;
  status: LessonStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Purchase {
  _id: ObjectId;
  userId: ObjectId;
  packageId: string;
  packageName: string;
  amountPaid: number;
  currency: string;
  paymentGateway: string;
  paymentId: string;
  orderId: string;
  status: PurchaseStatus;
  purchaseDate: Date;
  createdAt: Date;
}

export interface Subscription {
  _id: ObjectId;
  userId: ObjectId;
  purchaseId: ObjectId;
  packageId: string;
  packageName: string;
  startDate: Date;
  expiryDate: Date;
  status: SubscriptionStatus;
  createdAt: Date;
}

export interface Referral {
  _id: ObjectId;
  referrerId: ObjectId;
  referredUserId: ObjectId;
  referralCode: string;
  rewardAmount: number;
  status: ReferralStatus;
  qualifyingPurchaseId: ObjectId | null;
  createdAt: Date;
  rewardedAt: Date | null;
}

export interface WalletTransaction {
  _id: ObjectId;
  userId: ObjectId;
  type: TransactionType;
  amount: number;
  referenceId: ObjectId | null;
  description: string;
  status: string;
  createdAt: Date;
}

export interface Withdrawal {
  _id: ObjectId;
  userId: ObjectId;
  userName: string;
  amount: number;
  paymentMethod: string;
  upiId: string | null;
  accountHolderName: string | null;
  accountNumber: string | null;
  ifsc: string | null;
  status: WithdrawalStatus;
  adminNote: string | null;
  rejectionReason: string | null;
  createdAt: Date;
  processedAt: Date | null;
}

export interface PricingConfig {
  _id: "default";
  fourWeekPrice: number;
  sixWeekPrice: number;
  eightWeekPrice: number;
  referralReward: number;
  minimumWithdrawal: number;
  updatedAt: Date;
}

export interface CourseAccess {
  _id: ObjectId;
  userId: ObjectId;
  courseId: ObjectId;
  accessType: AccessType;
  grantedBy: ObjectId | null;
  expiresAt: Date | null;
  createdAt: Date;
}

export interface AuditLog {
  _id: ObjectId;
  adminId: ObjectId;
  action: string;
  targetType: string;
  targetId: ObjectId;
  previousValue: unknown;
  newValue: unknown;
  createdAt: Date;
}
