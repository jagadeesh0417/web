// Only these keys may be returned as field errors; all have controls in the wizard.
export const applicationErrorFields = ["category", "program", "fullName", "email", "confirmEmail", "mobile", "dob", "gender", "college", "course", "branch", "graduationYear", "city", "state", "linkedin", "github", "agree"] as const;
const fields = new Set<string>(applicationErrorFields);

export function applicationErrorKey(key: string): string {
  if (key === "categorySlug") return "category";
  if (key === "programSlug" || key === "duration") return "program";
  return fields.has(key) ? key : "general";
}
