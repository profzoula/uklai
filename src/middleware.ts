import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isSupabaseConfigured } from "@/lib/supabase/config";

function redirectInvalidHost(request: NextRequest): NextResponse | null {
  if (process.env.NODE_ENV !== "production") return null;

  const host = request.headers.get("host") ?? "";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

  const isInvalidHost = host.startsWith("0.0.0.0") || host.startsWith("127.0.0.1");

  if (!isInvalidHost || !appUrl) return null;

  try {
    const target = new URL(appUrl);
    const redirectUrl = new URL(request.nextUrl.pathname + request.nextUrl.search, target);
    return NextResponse.redirect(redirectUrl);
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const hostRedirect = redirectInvalidHost(request);
  if (hostRedirect) return hostRedirect;

  if (!isSupabaseConfigured()) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webm)$).*)",
  ],
};
