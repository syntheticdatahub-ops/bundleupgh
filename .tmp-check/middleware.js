import { NextResponse } from "next/server";
const ADMIN_PATH_PREFIXES = ["/admin", "/sign-in", "/api/admin", "/api/auth"];
const WEBHOOK_PATH_PREFIXES = ["/api/payments/webhook", "/api/webhooks/datamart", "/api/payments/verify"];
export function middleware(request) {
    const { pathname } = request.nextUrl;
    if (pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon") ||
        pathname.includes(".") ||
        pathname === "/maintenance") {
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
    if (pathname.startsWith("/api/")) {
        return NextResponse.next();
    }
    return NextResponse.next();
}
export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
