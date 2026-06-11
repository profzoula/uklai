import { createClient } from "@/lib/supabase/client";
import { getAuthCallbackUrl } from "@/lib/auth-utils";

export { safeAuthRedirect, getAuthCallbackUrl } from "@/lib/auth-utils";

export async function signInWithGoogle(nextPath?: string) {
  const supabase = createClient();
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: getAuthCallbackUrl(nextPath),
      queryParams: {
        access_type: "offline",
        prompt: "select_account",
      },
    },
  });
}
