import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = createClient();
    const { error, data } = await (
      await supabase
    ).auth.exchangeCodeForSession(code);

    if (!error && data.session) {
      // Check if user has a password set
      const {
        data: { user },
      } = await (await supabase).auth.getUser();

      // If user signed in via magic link and doesn't have password set,
      // redirect to password setup (optional)
      // Users who have set up a password will have has_password metadata
      // or will have signed in recently with password authentication
      if (user && !user.user_metadata?.has_password) {
        return NextResponse.redirect(`${origin}/setup-password`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
