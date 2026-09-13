import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/buy", "/about", "/privacy", "/terms", "/refund-policy", "/help", "/track"];
const ADMIN_PATH_PREFIXES = ["/admin", "/sign-in", "/api/admin", "/api/auth"];
const WEBHOOK_PATH_PREFIXES = ["/api/payments/webhook", "/api/webhooks/datamart", "/api/payments/verify"];

function isMaintenanceModeForcedOn(): boolean {
  return (process.env.MAINTENANCE_MODE || "").trim().toLowerCase() === "on";
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".") ||
    pathname === "/maintenance"
  ) {
    return NextResponse.next();
  }

  const isAdminRequest = ADMIN_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix));
  if (isAdminRequest) {
    return NextResponse.next();
  }

  const isWebhookRequest = WEBHOOK_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix));
  if (isWebhookRequest) {
    return NextResponse.next();
  }

  if (!isMaintenanceModeForcedOn()) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { error: "Site temporarily closed for maintenance.", details: "Public ordering is unavailable while maintenance is active." },
      { status: 503 }
    );
  }

  const isPublicPath = PUBLIC_PATHS.includes(pathname) || pathname.startsWith("/track") || pathname.startsWith("/buy") || pathname.startsWith("/about") || pathname.startsWith("/help") || pathname.startsWith("/privacy") || pathname.startsWith("/terms") || pathname.startsWith("/refund-policy");

  if (!isPublicPath) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/maintenance";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
