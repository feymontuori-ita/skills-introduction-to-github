import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "@/lib/env";

const PUBLIC_PATHS = ["/login", "/auth", "/setup"];

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * Refreshes the Supabase session cookie on every request and gates the app:
 * signed out → /login, signed in as anyone but the allowed email → signed out.
 */
export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isSupabaseConfigured) {
    if (pathname === "/setup") return NextResponse.next();
    return NextResponse.redirect(new URL("/setup", request.url));
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  const user = data.user;
  const allowed = (process.env.ALLOWED_EMAIL ?? "").trim().toLowerCase();
  const ok = Boolean(user && allowed && user.email?.toLowerCase() === allowed);

  if (user && !ok) {
    await supabase.auth.signOut();
    const url = new URL("/login", request.url);
    url.searchParams.set("e", "closed");
    return NextResponse.redirect(url);
  }

  if (!ok && !isPublic(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (ok && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}
