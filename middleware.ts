import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const currentPath = request.nextUrl.pathname;
  const isPublic = currentPath === "/sign-in";
  const token = request.cookies.get("token")?.value || "";

  // Debug için console log ekleyelim (production'da kaldırılabilir)
  console.log("Middleware Debug:", {
    currentPath,
    isPublic,
    hasToken: !!token,
    tokenLength: token.length,
  });

  // Eğer public sayfadaysa (sign-in) ve token varsa ana sayfaya yönlendir
  if (isPublic && token.length > 0) {
    console.log("Redirecting to home because user has token on sign-in page");
    return NextResponse.redirect(new URL("/", request.nextUrl));
  }

  // Eğer protected sayfadaysa ve token yoksa sign-in'e yönlendir
  if (!isPublic && token.length === 0) {
    console.log("Redirecting to sign-in because no token on protected page");
    return NextResponse.redirect(new URL("/sign-in", request.nextUrl));
  }

  // Her durumda middleware'in devam etmesine izin ver
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
