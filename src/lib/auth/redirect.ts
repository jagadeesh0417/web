// Only internal destinations in known account areas are accepted.
export function safeAuthRedirect(value: string | null, fallback = "/dashboard"): string {
  if (!value || !/^\/(dashboard|student|mentor|admin|client|employee)(?:\/[a-zA-Z0-9_-]+)*\/?$/.test(value)) return fallback;
  return value;
}
