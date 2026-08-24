"use client";

import type { AppUser, Profile, Role } from "@/lib/types";
import { generateId } from "@/lib/utils";

export interface DemoSession {
  userId: string;
  role: Role;
  email: string;
  name: string;
  remember: boolean;
}

interface DemoUserRecord extends AppUser {
  passwordHash: string;
  profile?: Partial<Profile>;
}

const USERS_KEY = "ak_demo_users";
const SESSION_KEY = "ak_demo_session";
const OTP_KEY = "ak_demo_otp";
const VERIFY_KEY = "ak_demo_pending_verify";
const PENDING_KEY = "ak_demo_pending_accounts";

export interface PendingAccount {
  token: string;
  email: string;
  name: string;
  mobile?: string;
  role: Role;
  enrollmentDbId: string;
  studentId: string;
  categorySlug: string;
  programSlug: string;
  createdAt: string;
}

export function demoCreatePendingAccount(input: {
  email: string;
  name: string;
  mobile?: string;
  enrollmentDbId: string;
  studentId: string;
  categorySlug: string;
  programSlug: string;
}): string {
  const token = generateId("vrf");
  const list = readPendingAccounts();
  const existing = list.find((p) => p.email.toLowerCase() === input.email.trim().toLowerCase());
  const account: PendingAccount = {
    token,
    email: input.email.trim().toLowerCase(),
    name: input.name.trim(),
    mobile: input.mobile,
    role: "intern",
    enrollmentDbId: input.enrollmentDbId,
    studentId: input.studentId,
    categorySlug: input.categorySlug,
    programSlug: input.programSlug,
    createdAt: new Date().toISOString(),
  };
  writePendingAccounts([...list.filter((p) => p.email.toLowerCase() !== account.email), account]);
  if (existing) return existing.token;
  return token;
}

export function demoResendVerification(email: string): string | null {
  const list = readPendingAccounts();
  const existing = list.find((p) => p.email.toLowerCase() === email.trim().toLowerCase());
  if (!existing) return null;
  const token = generateId("vrf");
  writePendingAccounts(list.map((p) => (p.email === existing.email ? { ...p, token } : p)));
  return token;
}

export function demoGetPendingAccount(token: string): PendingAccount | null {
  return readPendingAccounts().find((p) => p.token === token) ?? null;
}

export function demoGetAllPendingAccounts(): PendingAccount[] {
  return readPendingAccounts();
}

export function demoGetPendingByEmail(email: string): PendingAccount | null {
  return readPendingAccounts().find((p) => p.email.toLowerCase() === email.trim().toLowerCase()) ?? null;
}

export function demoActivatePendingAccount(token: string, password: string): { ok: true; user: AppUser; account: PendingAccount } | { ok: false; error: string } {
  const list = readPendingAccounts();
  const account = list.find((p) => p.token === token);
  if (!account) return { ok: false, error: "Invalid or expired verification link. Please request a new one." };
  const users = readUsers();
  if (users.some((u) => u.email.toLowerCase() === account.email)) {
    writePendingAccounts(list.filter((p) => p.token !== token));
    return { ok: false, error: "An account with this email already exists. Try logging in instead." };
  }
  const user: DemoUserRecord = {
    id: generateId("usr"),
    email: account.email,
    name: account.name,
    role: "intern",
    emailVerified: true,
    phone: account.mobile,
    createdAt: new Date().toISOString(),
    passwordHash: hash(password),
    profile: { fullName: account.name, email: account.email, mobile: account.mobile },
  };
  users.push(user);
  writeUsers(users);
  writePendingAccounts(list.filter((p) => p.token !== token));
  const safe = { ...user };
  delete (safe as Record<string, unknown>).passwordHash;
  return { ok: true, user: safe as AppUser, account };
}

function readPendingAccounts(): PendingAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    if (raw) return JSON.parse(raw) as PendingAccount[];
  } catch {
    /* ignore */
  }
  return [];
}

function writePendingAccounts(list: PendingAccount[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PENDING_KEY, JSON.stringify(list));
}

function hash(pw: string): string {
  let h = 5381;
  for (let i = 0; i < pw.length; i++) h = ((h << 5) + h + pw.charCodeAt(i)) >>> 0;
  return `h${h.toString(36)}:${btoa(unescape(encodeURIComponent(pw))).slice(0, 12)}`;
}

function readUsers(): DemoUserRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) return JSON.parse(raw) as DemoUserRecord[];
  } catch {
    /* ignore */
  }
  return [];
}

function writeUsers(users: DemoUserRecord[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function demoGetSession(): DemoSession | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(SESSION_KEY) ?? localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DemoSession;
  } catch {
    return null;
  }
}

export function demoSetSession(session: DemoSession | null, remember: boolean) {
  if (typeof window === "undefined") return;
  const store = remember ? localStorage : sessionStorage;
  if (session) {
    store.setItem(SESSION_KEY, JSON.stringify(session));
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
    store.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  }
  document.cookie = `ak_demo_session=${session ? encodeURIComponent(JSON.stringify(session)) : ""}; path=/; max-age=${session ? (remember ? 2592000 : 3600) : 0}; SameSite=Lax`;
}

export function demoFindUser(email: string): DemoUserRecord | undefined {
  return readUsers().find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
}

export function demoGetUserById(id: string): DemoUserRecord | undefined {
  return readUsers().find((u) => u.id === id);
}

export function demoRegister(name: string, email: string, password: string, role: Role): { ok: true; user: AppUser } | { ok: false; error: string } {
  const users = readUsers();
  if (users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
    return { ok: false, error: "An account with this email already exists" };
  }
  const user: DemoUserRecord = {
    id: generateId("usr"),
    email: email.trim().toLowerCase(),
    name: name.trim(),
    role,
    emailVerified: false,
    createdAt: new Date().toISOString(),
    passwordHash: hash(password),
  };
  users.push(user);
  writeUsers(users);
  return { ok: true, user };
}

export function demoVerifyEmail(email: string): boolean {
  const users = readUsers();
  const u = users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
  if (!u) return false;
  u.emailVerified = true;
  writeUsers(users);
  return true;
}

export function demoSignIn(email: string, password: string, remember: boolean): { ok: true; user: AppUser } | { ok: false; error: string } {
  const u = demoFindUser(email);
  if (!u) return { ok: false, error: "No account found with this email" };
  if (u.passwordHash !== hash(password)) return { ok: false, error: "Incorrect password" };
  const safe = { ...u };
  delete (safe as Record<string, unknown>).passwordHash;
  demoSetSession({ userId: u.id, role: u.role, email: u.email, name: u.name, remember }, remember);
  return { ok: true, user: safe as AppUser };
}

export function demoSignInAs(userId: string, remember = false): AppUser | null {
  const u = demoGetUserById(userId);
  if (!u) return null;
  const safe = { ...u };
  delete (safe as Record<string, unknown>).passwordHash;
  demoSetSession({ userId: u.id, role: u.role, email: u.email, name: u.name, remember }, remember);
  return safe as AppUser;
}

export function demoSignOut() {
  demoSetSession(null, false);
}

export function demoUpdatePassword(email: string, newPassword: string): boolean {
  const users = readUsers();
  const u = users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
  if (!u) return false;
  u.passwordHash = hash(newPassword);
  writeUsers(users);
  return true;
}

export function demoSaveOtp(email: string, otp: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${OTP_KEY}_${email.toLowerCase()}`, JSON.stringify({ otp, exp: Date.now() + 10 * 60 * 1000 }));
}

export function demoCheckOtp(email: string, otp: string): boolean {
  if (typeof window === "undefined") return false;
  const raw = localStorage.getItem(`${OTP_KEY}_${email.toLowerCase()}`);
  if (!raw) return false;
  try {
    const data = JSON.parse(raw) as { otp: string; exp: number };
    if (Date.now() > data.exp) return false;
    return data.otp === otp;
  } catch {
    return false;
  }
}

export function demoPendingVerify(email: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(VERIFY_KEY, email.toLowerCase());
}

export function demoClearPendingVerify() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(VERIFY_KEY);
}

export function demoGetPendingVerify(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(VERIFY_KEY);
}

export function demoGetProfile(userId: string): Partial<Profile> | undefined {
  return demoGetUserById(userId)?.profile;
}

export function demoSaveProfile(userId: string, profile: Partial<Profile>) {
  const users = readUsers();
  const u = users.find((x) => x.id === userId);
  if (!u) return;
  u.profile = { ...u.profile, ...profile };
  writeUsers(users);
}

export function demoGetAllUsers(): AppUser[] {
  return readUsers().map((u) => {
    const safe = { ...u };
    delete (safe as Record<string, unknown>).passwordHash;
    return safe;
  });
}

export function demoUpdateUserRole(userId: string, role: Role) {
  const users = readUsers();
  const u = users.find((x) => x.id === userId);
  if (!u) return;
  u.role = role;
  writeUsers(users);
}

export const demoBootstrapUsers = () => {
  if (typeof window === "undefined") return;
  const users = readUsers();
  const needed: Array<[string, string, string, Role]> = [
    ["admin@akradhii.com", "Arjun Reddy", "Akradhii@123", "super_admin"],
    ["mentor@akradhii.com", "Sneha Kulkarni", "Akradhii@123", "mentor"],
    ["employee@akradhii.com", "Priya Sharma", "Akradhii@123", "employee"],
    ["client@akradhii.com", "Vikram Malhotra", "Akradhii@123", "client"],
    ["student@akradhii.com", "Ananya Gupta", "Akradhii@123", "intern"],
  ] as Array<[string, string, string, Role]>;
  for (const [email, name, pw, role] of needed) {
    if (!users.some((u) => u.email === email)) {
      const res = demoRegister(name, email, pw, role);
      if (res.ok) demoVerifyEmail(email);
    }
  }
};
