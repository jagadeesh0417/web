// The adapters are injected so failure and concurrency behaviour can be tested
// independently of Next.js. MongoDB implements both operations atomically.
export async function submitApplication<T>(options: {
  rateLimit: () => Promise<boolean>;
  save: () => Promise<{ application: T; created: boolean } | null>;
}): Promise<{ status: number; application?: T; created?: boolean }> {
  try {
    if (!(await options.rateLimit())) return { status: 429 };
    const result = await options.save();
    if (!result) return { status: 409 };
    return { status: 200, ...result };
  } catch {
    return { status: 503 };
  }
}
