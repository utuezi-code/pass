import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

// /themes reste public (lecture publique en RLS, cf. spec) : un visiteur doit
// pouvoir voir ce qu'il y a sur le site avant de créer un compte. Seules les
// actions qui engagent réellement (proposer, dashboard) exigent une session.
// Chemins exprimés sans préfixe de langue : comparés au pathname une fois le
// préfixe de locale retiré (cf. stripLocale ci-dessous).
const PROTECTED_PATHS = ["/dashboard", "/themes/new", "/circle", "/reset-password"];

function splitLocale(pathname: string) {
  const nonDefaultLocales = routing.locales.filter((l) => l !== routing.defaultLocale);
  for (const locale of nonDefaultLocales) {
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) {
      return { locale, rest: pathname.slice(`/${locale}`.length) || "/" };
    }
  }
  return { locale: routing.defaultLocale, rest: pathname };
}

export async function proxy(request: NextRequest) {
  const intlResponse = intlMiddleware(request);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          for (const { name, value, options } of cookiesToSet) {
            intlResponse.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { locale, rest } = splitLocale(request.nextUrl.pathname);
  const isProtected = PROTECTED_PATHS.some((path) => rest.startsWith(path));

  if (isProtected && !user) {
    const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
    const loginUrl = new URL(`${prefix}/login`, request.url);
    loginUrl.searchParams.set("next", rest);
    return NextResponse.redirect(loginUrl);
  }

  return intlResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
