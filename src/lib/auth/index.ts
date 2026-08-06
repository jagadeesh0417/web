import type { AppUser, Role } from "@/lib/types";
import { homeForRole } from "@/lib/rbac";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  demoActivatePendingAccount,
  demoBootstrapUsers,
  demoCheckOtp,
  demoClearPendingVerify,
  demoCreatePendingAccount,
  demoFindUser,
  demoGetAllUsers,
  demoGetAllPendingAccounts,
  demoGetPendingByEmail,
  demoGetPendingAccount,
  demoGetProfile,
  demoGetSession,
  demoGetUserById,
  demoPendingVerify,
  demoRegister,
  demoResendVerification,
  demoSaveOtp,
  demoSaveProfile,
  demoSignIn,
  demoSignInAs,
  demoSignOut,
  demoUpdatePassword,
  demoUpdateUserRole,
  demoVerifyEmail,
} from "@/lib/auth/demo-store";
import type { DemoSession, PendingAccount } from "@/lib/auth/demo-store";
import { generateId, randomId } from "@/lib/utils";

export type AuthResult = { ok: true; user?: AppUser; redirect?: string } | { ok: false; error: string };

export function demoMode(): boolean {
  return !isSupabaseConfigured();
}

export function bootstrapDemo() {
  if (typeof window !== "undefined") demoBootstrapUsers();
}

export async function getSession(): Promise<{ user: AppUser | null }> {
  if (isSupabaseConfigured()) {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    const s = data.session;
    if (!s?.user) return { user: null };
    const meta = s.user.user_metadata ?? {};
    const profile = await fetchUserProfileFromDb(s.user.id).catch(() => null);
    return {
      user: {
        id: s.user.id,
        email: s.user.email ?? "",
        name: (meta.full_name as string) ?? s.user.email?.split("@")[0] ?? "User",
        role: (meta.role as Role) ?? "user",
        emailVerified: Boolean(s.user.email_confirmed_at),
        avatarUrl: s.user.user_metadata.avatar_url as string | undefined,
        createdAt: s.user.created_at,
        ...(profile?.company ? { company: profile.company } : {}),
      },
    };
  }
  const s = demoGetSession();
  if (!s) return { user: null };
  const u = demoGetUserById(s.userId);
  if (!u) return { user: null };
  const safe = { ...u };
  delete (safe as Record<string, unknown>).passwordHash;
  return { user: safe };
}

async function fetchUserProfileFromDb(userId: string) {
  const { createClient } = await import("@/lib/supabase/client");
  const supabase = createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
  return data as { company?: string } | null;
}

export async function getUser(): Promise<AppUser | null> {
  const { user } = await getSession();
  return user;
}

export async function getRole(): Promise<Role | null> {
  const user = await getUser();
  return user?.role ?? null;
}

export async function signUp(name: string, email: string, password: string, role: Role = "user"): Promise<AuthResult> {
  if (demoMode()) {
    const res = demoRegister(name, email, password, role);
    if (!res.ok) return res;
    demoPendingVerify(email);
    return { ok: true, redirect: "/verify-email" };
  }
  const { createClient } = await import("@/lib/supabase/client");
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name, role, provider: "email" },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true, redirect: data.session ? homeForRole(role) : "/verify-email" };
}

export async function signIn(email: string, password: string, remember: boolean): Promise<AuthResult> {
  if (demoMode()) {
    const res = demoSignIn(email, password, remember);
    if (!res.ok) return res;
    return { ok: true, user: res.user, redirect: homeForRole(res.user.role) };
  }
  const { createClient } = await import("@/lib/supabase/client");
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (error.message.toLowerCase().includes("email")) return { ok: false, error: "No account found with this email" };
    return { ok: false, error: "Incorrect password" };
  }
  const meta = data.user.user_metadata ?? {};
  const role = (meta.role as Role) ?? "user";
  return { ok: true, user: { id: data.user.id, email: data.user.email ?? "", name: (meta.full_name as string) ?? "", role, emailVerified: true, createdAt: data.user.created_at ?? new Date().toISOString() }, redirect: homeForRole(role) };
}

export async function signInWithGoogle(): Promise<AuthResult> {
  if (demoMode()) {
    const u = demoSignInAs("u_student");
    if (!u) return { ok: false, error: "Demo Google login failed" };
    return { ok: true, user: u, redirect: homeForRole(u.role) };
  }
  const { createClient } = await import("@/lib/supabase/client");
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  });
  if (error) return { ok: false, error: error.message };
  if (data.url) window.location.href = data.url;
  return { ok: true };
}

export async function signOut(): Promise<void> {
  if (demoMode()) {
    demoSignOut();
    return;
  }
  const { createClient } = await import("@/lib/supabase/client");
  const supabase = createClient();
  await supabase.auth.signOut();
}

export async function requestPasswordReset(email: string): Promise<AuthResult> {
  if (demoMode()) {
    const u = demoFindUser(email);
    if (!u) return { ok: false, error: "No account found with this email" };
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    demoSaveOtp(email, otp);
    demoPendingVerify(email);
    return { ok: true };
  }
  const { createClient } = await import("@/lib/supabase/client");
  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function verifyResetOtp(email: string, otp: string): Promise<AuthResult> {
  if (demoMode()) {
    if (!demoCheckOtp(email, otp)) return { ok: false, error: "Invalid or expired OTP" };
    demoClearPendingVerify();
    return { ok: true };
  }
  const { createClient } = await import("@/lib/supabase/client");
  const supabase = createClient();
  const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: "email" });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function updatePassword(email: string, newPassword: string): Promise<AuthResult> {
  if (demoMode()) {
    if (!demoUpdatePassword(email, newPassword)) return { ok: false, error: "Account not found" };
    return { ok: true };
  }
  const { createClient } = await import("@/lib/supabase/client");
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function resendVerification(email: string): Promise<AuthResult> {
  if (demoMode()) {
    const u = demoFindUser(email);
    if (!u) return { ok: false, error: "No account found with this email" };
    demoVerifyEmail(email);
    demoPendingVerify(email);
    return { ok: true };
  }
  const { createClient } = await import("@/lib/supabase/client");
  const supabase = createClient();
  const { error } = await supabase.auth.resend({ type: "signup", email });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function confirmEmailVerified(email: string): Promise<boolean> {
  if (demoMode()) {
    return demoVerifyEmail(email);
  }
  const { createClient } = await import("@/lib/supabase/client");
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  return Boolean(data.session?.user.email_confirmed_at);
}

export function demoOtpFor(email: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(`ak_demo_otp_${email.toLowerCase()}`) ? JSON.parse(localStorage.getItem(`ak_demo_otp_${email.toLowerCase()}`)!).otp : null;
}

export async function activatePendingAccount(token: string, password: string): Promise<AuthResult> {
  const res = demoActivatePendingAccount(token, password);
  if (!res.ok) return res;
  const { user } = res;
  demoSignIn(user.email, password, true);
  return { ok: true, user, redirect: "/student" };
}

export { demoGetSession, demoGetAllUsers, demoUpdateUserRole, demoGetProfile, demoSaveProfile, demoGetUserById, demoSignInAs, demoCreatePendingAccount, demoResendVerification, demoGetPendingByEmail, demoGetPendingAccount, demoGetAllPendingAccounts, generateId, randomId };
export type { DemoSession, PendingAccount };
