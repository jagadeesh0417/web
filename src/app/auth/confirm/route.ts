import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token = searchParams.get("token");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/login";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (token && type && supabaseUrl && supabaseKey) {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    await supabase.auth.verifyOtp({ token_hash: token, type: type as "email" });
  }
  return NextResponse.redirect(`${origin}${next}`);
}
