import type { LeadFormType, LeadFields, WebsiteLead } from "@/lib/leads/types";

const FIELD_LABELS: Record<string, string> = {
  name: "Name",
  fullName: "Full Name",
  email: "Email",
  phone: "Phone",
  mobile: "Phone",
  company: "Company",
  topic: "Service / Interest",
  service: "Service",
  budget: "Budget",
  message: "Message",
  subject: "Subject",
  body: "Message",
  priority: "Priority",
  college: "College",
  course: "Course / Degree",
  branch: "Branch",
  dob: "Date of Birth",
  gender: "Gender",
  city: "City",
  state: "State",
  graduationYear: "Graduation Year",
  linkedin: "LinkedIn",
  github: "GitHub",
  category: "Internship Category",
  program: "Program",
  duration: "Duration",
  internship: "Internship",
  resume: "Resume",
};

const SKIP_KEYS = new Set([
  "website",
  "honeypot",
  "agree",
  "password",
  "confirmPassword",
  "token",
  "resumeFile",
]);

function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string" && value.trim() === "") return true;
  if (typeof value === "boolean") return false;
  return false;
}

function formatValue(value: unknown): string {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return String(value);
  return String(value ?? "").trim();
}

function labelFor(key: string): string {
  return FIELD_LABELS[key] ?? key.replace(/([A-Z])/g, " $1").replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).trim();
}

function formatSubmittedAt(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  } catch {
    return iso;
  }
}

function pickTitle(formType: LeadFormType): string {
  if (formType === "internship_application") return "🎓 NEW INTERNSHIP APPLICATION";
  if (formType === "support") return "🛟 NEW SUPPORT REQUEST";
  if (formType === "consultation") return "🗓️ NEW CONSULTATION REQUEST";
  if (formType === "callback") return "📞 NEW CALLBACK REQUEST";
  if (formType === "service_enquiry") return "🎯 NEW SERVICE ENQUIRY";
  return "🔔 NEW WEBSITE LEAD";
}

/** Build a professional WhatsApp text from a stored lead (dynamic fields). */
export function buildWhatsAppMessage(lead: WebsiteLead): string {
  const lines: string[] = [
    "━━━━━━━━━━━━━━━━━━",
    pickTitle(lead.formType),
    "━━━━━━━━━━━━━━━━━━",
    "",
    "📍 Source:",
    lead.source,
    "",
  ];

  const orderedKeys = [
    "fullName",
    "name",
    "phone",
    "mobile",
    "email",
    "company",
    "college",
    "course",
    "branch",
    "graduationYear",
    "dob",
    "gender",
    "city",
    "state",
    "category",
    "program",
    "internship",
    "duration",
    "service",
    "topic",
    "budget",
    "subject",
    "priority",
    "linkedin",
    "github",
    "resume",
    "message",
    "body",
  ];

  const used = new Set<string>();
  const emit = (key: string, raw: unknown) => {
    if (used.has(key) || SKIP_KEYS.has(key) || isEmpty(raw)) return;
    used.add(key);
    const emoji =
      key === "email" || key === "Email"
        ? "📧"
        : key === "phone" || key === "mobile"
          ? "📱"
          : key === "fullName" || key === "name"
            ? "👤"
            : key === "company"
              ? "🏢"
              : key === "college"
                ? "🎓"
                : key === "category" || key === "internship" || key === "program"
                  ? "💻"
                  : key === "duration"
                    ? "⏳"
                    : key === "service" || key === "topic"
                      ? "🎯"
                      : key === "message" || key === "body" || key === "subject"
                        ? "💬"
                        : "•";
    lines.push(`${emoji} ${labelFor(key)}:`);
    lines.push(formatValue(raw));
    lines.push("");
  };

  for (const key of orderedKeys) {
    if (key in lead.fields) emit(key, lead.fields[key]);
    else if (key === "name" && lead.name) emit("name", lead.name);
    else if (key === "email" && lead.email) emit("email", lead.email);
    else if ((key === "phone" || key === "mobile") && lead.phone) emit("phone", lead.phone);
    else if (key === "company" && lead.company) emit("company", lead.company);
    else if (key === "service" && lead.service) emit("service", lead.service);
    else if (key === "internship" && lead.internship) emit("internship", lead.internship);
    else if (key === "course" && lead.course) emit("course", lead.course);
    else if (key === "duration" && lead.duration) emit("duration", lead.duration);
    else if (key === "message" && lead.message) emit("message", lead.message);
  }

  for (const [key, value] of Object.entries(lead.fields)) {
    emit(key, value);
  }

  lines.push("🌐 Page:");
  lines.push(lead.page || lead.pagePath || "—");
  lines.push("");
  lines.push("🕐 Submitted:");
  lines.push(formatSubmittedAt(lead.submittedAt));
  lines.push("");
  lines.push("━━━━━━━━━━━━━━━━━━");
  lines.push("Lead generated from Akradhii website");
  lines.push("━━━━━━━━━━━━━━━━━━");

  return lines.join("\n");
}

export function extractPrimaryFields(fields: LeadFields): {
  name: string;
  email: string;
  phone: string;
  company?: string;
  service?: string;
  internship?: string;
  course?: string;
  duration?: string;
  message?: string;
} {
  const str = (k: string) => {
    const v = fields[k];
    return v === null || v === undefined ? "" : String(v).trim();
  };

  const name = str("fullName") || str("name") || str("clientName") || "";
  const email = str("email") || "";
  const phone = str("phone") || str("mobile") || "";
  const company = str("company") || undefined;
  const service = str("service") || str("topic") || undefined;
  const internship =
    str("internship") ||
    [str("category"), str("program")].filter(Boolean).join(" — ") ||
    undefined;
  const course = str("course") || undefined;
  const duration = str("duration") ? String(fields.duration) : undefined;
  const message = str("message") || str("body") || str("subject") || undefined;

  return {
    name,
    email,
    phone,
    company: company || undefined,
    service: service || undefined,
    internship: internship || undefined,
    course: course || undefined,
    duration: duration || undefined,
    message: message || undefined,
  };
}
