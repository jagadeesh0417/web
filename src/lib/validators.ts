import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .email("Enter a valid email address")
  .max(254, "Email is too long");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters")
  .regex(/[A-Z]/, "Include at least one uppercase letter")
  .regex(/[a-z]/, "Include at least one lowercase letter")
  .regex(/[0-9]/, "Include at least one number");

export const nameSchema = z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name is too long");

export const phoneSchema = z
  .string()
  .trim()
  .min(10, "Enter a valid mobile number")
  .max(20, "Enter a valid mobile number")
  .refine((v) => {
    const digits = v.replace(/\D/g, "");
    if (/^[6-9]\d{9}$/.test(digits)) return true;
    if (/^91[6-9]\d{9}$/.test(digits)) return true;
    if (/^0[6-9]\d{9}$/.test(digits)) return true;
    return digits.length >= 10 && digits.length <= 15;
  }, "Enter a valid mobile number");

export const leadContactSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema.optional().or(z.literal("")),
  message: z.string().trim().max(4000).optional(),
});

export const otpSchema = z.string().trim().regex(/^[0-9]{6}$/, "OTP must be 6 digits");

export const signupSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const forgotSchema = z.object({ email: emailSchema });

export const resetSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match",
});

export const applicationSchema = z.object({
  fullName: nameSchema,
  email: emailSchema,
  mobile: phoneSchema,
  dob: z.string().min(1, "Date of birth is required"),
  gender: z.string().optional().or(z.literal("")),
  college: z.string().trim().min(2, "College name is required").max(200),
  course: z.string().trim().min(2, "Course is required").max(100),
  branch: z.string().trim().min(1, "Branch is required").max(100),
  graduationYear: z.string().trim().min(4, "Graduation year is required"),
  city: z.string().trim().min(1, "City is required").max(100),
  state: z.string().trim().min(1, "State is required").max(100),
  linkedin: z.string().trim().url("Enter a valid LinkedIn URL").optional().or(z.literal("")),
  github: z.string().trim().url("Enter a valid GitHub URL").optional().or(z.literal("")),
  resume: z.any().optional(),
  category: z.string().min(1, "Select a category"),
  program: z.string().min(1, "Select a program"),
  duration: z.coerce.number().refine((d) => [4, 6, 8].includes(d), "Select a valid duration"),
  agree: z.literal(true, { message: "You must accept the Terms & Conditions" }),
});

const WORK_LINK_PATTERNS: Array<{ type: "drive" | "github" | "figma" | "canva" | "other"; regex: RegExp }> = [
  { type: "drive", regex: /^(https?:\/\/)?(drive\.google\.com|docs\.google\.com)/i },
  { type: "github", regex: /^(https?:\/\/)?github\.com/i },
  { type: "figma", regex: /^(https?:\/\/)?figma\.com/i },
  { type: "canva", regex: /^(https?:\/\/)?canva\.com/i },
];

export function inferLinkType(url: string): "drive" | "github" | "figma" | "canva" | "other" {
  const match = WORK_LINK_PATTERNS.find((p) => p.regex.test(url.trim()));
  return match?.type ?? "other";
}

export function validateWorkLink(url: string, allowed: string[]): string | null {
  const value = url.trim();
  if (!value) return "Paste a link to your work";
  try {
    const parsed = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    if (!["https:", "http:"].includes(parsed.protocol)) return "Only http(s) links are allowed";
  } catch {
    return "Enter a valid URL";
  }
  const type = inferLinkType(value);
  if (allowed.length > 0 && !allowed.includes(type)) {
    return `This link type is not allowed. Paste a ${allowed.join(" or ")} link instead.`;
  }
  return null;
}

export const ALLOWED_UPLOAD_TYPES: Record<string, string[]> = {
  image: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  pdf: ["application/pdf"],
  document: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ],
  archive: ["application/zip", "application/x-zip-compressed", "application/x-rar-compressed"],
  video: ["video/mp4", "video/webm", "video/quicktime", "video/x-matroska"],
};

export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10 MB

export function validateFile(file: File, kind: keyof typeof ALLOWED_UPLOAD_TYPES): string | null {
  if (!ALLOWED_UPLOAD_TYPES[kind]?.includes(file.type)) {
    return `File type "${file.type || "unknown"}" is not allowed for ${kind} uploads`;
  }
  if (file.size > MAX_UPLOAD_SIZE) {
    return `File is too large (max ${MAX_UPLOAD_SIZE / 1024 / 1024} MB)`;
  }
  return null;
}

export function isStrongPassword(pw: string): boolean {
  return passwordSchema.safeParse(pw).success;
}
