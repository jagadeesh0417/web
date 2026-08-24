import type { InAppNotification } from "@/lib/types";
import { generateId } from "@/lib/utils";

export type NotificationKind = InAppNotification["kind"];

interface MailPayload {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(payload: MailPayload): Promise<{ ok: boolean; error?: string }> {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.info(`[akradhii:email] (demo) To: ${payload.to} — ${payload.subject}`);
    return { ok: true };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL ?? "Akradhii <no-reply@akradhii.com>",
        to: [payload.to],
        subject: payload.subject,
        html: payload.html,
      }),
    });
    if (!res.ok) return { ok: false, error: `Resend error: ${res.status}` };
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unknown email error" };
  }
}

export function emailTemplates() {
  const layout = (title: string, body: string, cta?: { label: string; url: string }) => `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#0b1020;border-radius:16px;color:#e2e8f0">
      <div style="font-size:22px;font-weight:800;background:linear-gradient(90deg,#8b5cf6,#6366f1);-webkit-background-clip:text;background-clip:text;color:transparent">Akradhii</div>
      <h1 style="font-size:20px;margin:20px 0 8px;color:#fff">${title}</h1>
      <p style="font-size:14px;line-height:1.7;color:#cbd5e1">${body}</p>
      ${cta ? `<a href="${cta.url}" style="display:inline-block;margin-top:16px;padding:12px 22px;border-radius:10px;background:linear-gradient(90deg,#8b5cf6,#6366f1);color:#fff;text-decoration:none;font-weight:700;font-size:14px">${cta.label}</a>` : ""}
      <p style="margin-top:28px;font-size:12px;color:#64748b">You received this email because of activity on your Akradhii account.</p>
    </div>`;
  return {
    verification: (name: string) =>
      layout("Verify your email", `Hi ${name},<br/><br/>Welcome to Akradhii. Please confirm your email address to activate your account.`),
    createPassword: (name: string, url: string) =>
      layout("Create your account password", `Hi ${name},<br/><br/>Your internship has been confirmed and your student account is ready. Click below to create a password and activate your dashboard.<br/><br/>This link expires in 24 hours.`, { label: "Create password", url }),
    paymentConfirmation: (name: string, data: { programTitle: string; amount: number; orderId: string; invoiceNumber: string; enrollmentId: string; studentId: string }) =>
      layout("Payment successful", `
        Hi ${name},<br/><br/>
        Your payment for <strong>${data.programTitle}</strong> was successful.<br/><br/>
        <table style="width:100%;font-size:13px;border-collapse:collapse">
          <tr><td style="padding:4px 0;color:#94a3b8">Invoice number</td><td style="padding:4px 0;text-align:right;font-family:monospace">${data.invoiceNumber}</td></tr>
          <tr><td style="padding:4px 0;color:#94a3b8">Order ID</td><td style="padding:4px 0;text-align:right;font-family:monospace">${data.orderId}</td></tr>
          <tr><td style="padding:4px 0;color:#94a3b8">Enrollment ID</td><td style="padding:4px 0;text-align:right;font-family:monospace">${data.enrollmentId}</td></tr>
          <tr><td style="padding:4px 0;color:#94a3b8">Student ID</td><td style="padding:4px 0;text-align:right;font-family:monospace">${data.studentId}</td></tr>
          <tr><td style="padding:4px 0;color:#94a3b8">Amount paid</td><td style="padding:4px 0;text-align:right;font-weight:700">₹${data.amount.toLocaleString("en-IN")}</td></tr>
        </table>
        <p style="margin-top:12px">The invoice is attached to this email and available in your dashboard.</p>`),
    offerLetter: (name: string, data: { programTitle: string; durationWeeks: number; startDate: string; endDate: string; studentId: string }) =>
      layout("Your internship offer letter", `
        Hi ${name},<br/><br/>
        Congratulations! We are delighted to offer you the <strong>${data.programTitle}</strong>.<br/><br/>
        <table style="width:100%;font-size:13px;border-collapse:collapse">
          <tr><td style="padding:4px 0;color:#94a3b8">Internship</td><td style="padding:4px 0;text-align:right">${data.programTitle}</td></tr>
          <tr><td style="padding:4px 0;color:#94a3b8">Duration</td><td style="padding:4px 0;text-align:right">${data.durationWeeks} weeks</td></tr>
          <tr><td style="padding:4px 0;color:#94a3b8">Joining date</td><td style="padding:4px 0;text-align:right">${data.startDate}</td></tr>
          <tr><td style="padding:4px 0;color:#94a3b8">Completion date</td><td style="padding:4px 0;text-align:right">${data.endDate}</td></tr>
          <tr><td style="padding:4px 0;color:#94a3b8">Student ID</td><td style="padding:4px 0;text-align:right;font-family:monospace">${data.studentId}</td></tr>
        </table>
        <p style="margin-top:12px">Your signed offer letter is attached. It is also available from the Downloads page in your dashboard.</p>`),
    welcome: (name: string, data: { programTitle: string; dashboardUrl: string }) =>
      layout("Welcome to Akradhii", `
        Hi ${name},<br/><br/>
        Welcome aboard the <strong>${data.programTitle}</strong>! Your dashboard is live.<br/><br/>
        Here's how to get started:<br/>
        1. Watch the Week 1 lessons and mark them complete.<br/>
        2. Submit the weekly assignment as a Google Drive, GitHub, Figma or Canva link.<br/>
        3. Your mentor reviews it — approval unlocks the next week.<br/>
        4. Finish all weeks, pass the final assessment, and your certificate is issued automatically.<br/><br/>
        Need help? Write to support@akradhii.com.`, { label: "Open dashboard", url: data.dashboardUrl }),
    assignmentFeedback: (name: string, data: { title: string; status: string; feedback: string }) =>
      layout("Assignment update", `Hi ${name},<br/><br/>Your assignment <strong>${data.title}</strong> was reviewed.<br/><br/>Status: <strong>${data.status}</strong><br/><br/>Mentor feedback:<br/><em>"${data.feedback}"</em>`),
    certificateIssued: (name: string, id: string, verifyUrl: string) =>
      layout("Your certificate is ready", `Congratulations ${name}! Your certificate (${id}) has been issued and is available in your dashboard.<br/><br/>Anyone can verify it at ${verifyUrl}.`, { label: "Verify certificate", url: verifyUrl }),
    sessionReminder: (title: string, date: string, link: string) =>
      layout("Live session reminder", `Reminder: <strong>${title}</strong> on ${date}.<br/><br/>Join here: ${link}`),
    deadline: (title: string, date: string) =>
      layout("Assignment deadline approaching", `Your assignment <strong>${title}</strong> is due on ${date}. Submit before the deadline to stay on track.`),
    passwordChanged: () => layout("Password changed", "Your Akradhii password was successfully changed. If this wasn't you, reset it immediately."),
  };
}

export function pushNotification(userId: string, title: string, body: string, kind: NotificationKind = "general"): InAppNotification {
  const notification: InAppNotification = {
    id: generateId("ntf"),
    userId,
    title,
    body,
    kind,
    read: false,
    createdAt: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("ak_demo_notifications");
      const list: InAppNotification[] = raw ? JSON.parse(raw) : [];
      list.unshift(notification);
      localStorage.setItem("ak_demo_notifications", JSON.stringify(list.slice(0, 50)));
    } catch {
      /* ignore */
    }
  }
  return notification;
}

export async function notifyAndEmail(opts: {
  userId: string;
  email: string;
  title: string;
  body: string;
  kind?: NotificationKind;
  mailSubject?: string;
  mailHtml?: string;
}) {
  pushNotification(opts.userId, opts.title, opts.body, opts.kind);
  await sendEmail({ to: opts.email, subject: opts.mailSubject ?? opts.title, html: opts.mailHtml ?? opts.body });
}

export async function sendWorkflowEmail(opts: { to: string; subject: string; template: string; html: string }) {
  const res = await sendEmail({ to: opts.to, subject: opts.subject, html: opts.html });
  try {
    const { logEmail } = await import("@/lib/data/repository");
    logEmail({ to: opts.to, subject: opts.subject, template: opts.template, status: res.ok ? "sent" : "failed" });
  } catch {
    /* ignore */
  }
  return res;
}
