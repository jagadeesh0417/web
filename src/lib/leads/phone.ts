/** Normalize Indian (and general) phone numbers for storage / WhatsApp. */
export function normalizePhone(input: string): string {
  const raw = (input ?? "").trim();
  if (!raw) return "";

  let digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) digits = digits.slice(1);
  digits = digits.replace(/\D/g, "");

  // 10-digit Indian mobile
  if (/^[6-9]\d{9}$/.test(digits)) return `91${digits}`;
  // Already with country code 91
  if (/^91[6-9]\d{9}$/.test(digits)) return digits;
  // 0-prefixed local
  if (/^0[6-9]\d{9}$/.test(digits)) return `91${digits.slice(1)}`;

  return digits;
}

export function isValidPhone(input: string): boolean {
  const n = normalizePhone(input);
  if (!n) return false;
  // Accept 10–15 digits after normalization (E.164-ish without +)
  if (n.length < 10 || n.length > 15) return false;
  // Prefer Indian mobiles when 12 digits starting with 91
  if (n.startsWith("91") && n.length === 12) return /^91[6-9]\d{9}$/.test(n);
  return /^\d{10,15}$/.test(n);
}

export function formatPhoneDisplay(input: string): string {
  const n = normalizePhone(input);
  if (/^91[6-9]\d{9}$/.test(n)) {
    return `+91 ${n.slice(2, 7)} ${n.slice(7)}`;
  }
  if (n) return `+${n}`;
  return input.trim();
}
