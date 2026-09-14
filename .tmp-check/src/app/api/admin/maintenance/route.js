import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionJwt } from "@/lib/auth-verify";
import { DEFAULT_MAINTENANCE_MESSAGE, getMaintenanceState, setMaintenanceState } from "@/lib/maintenance";
function isAdminUser(user) {
    var _a, _b;
    if (!user)
        return false;
    const uid = (_a = user.uid) === null || _a === void 0 ? void 0 : _a.toLowerCase();
    const email = (_b = user.email) === null || _b === void 0 ? void 0 : _b.toLowerCase();
    return (uid === "admin" ||
        uid === "bundleup-admin" ||
        email === "admin@bundleup.com.gh" ||
        email === "admin@bundleup.com" ||
        email === "admin@bundleup.io");
}
export async function GET() {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get("session");
        if (!(session === null || session === void 0 ? void 0 : session.value)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const user = await verifySessionJwt(session.value);
        if (!user || !isAdminUser(user)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        const state = await getMaintenanceState();
        return NextResponse.json({
            enabled: state.enabled,
            message: state.message,
            updatedAt: state.updatedAt,
            source: state.source,
        });
    }
    catch (error) {
        return NextResponse.json({ error: (error === null || error === void 0 ? void 0 : error.message) || "Unable to load maintenance state" }, { status: 500 });
    }
}
export async function POST(req) {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get("session");
        if (!(session === null || session === void 0 ? void 0 : session.value)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const user = await verifySessionJwt(session.value);
        if (!user || !isAdminUser(user)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        const body = await req.json().catch(() => ({}));
        const enabled = typeof (body === null || body === void 0 ? void 0 : body.enabled) === "boolean" ? body.enabled : undefined;
        const message = typeof (body === null || body === void 0 ? void 0 : body.message) === "string" ? body.message : undefined;
        const updated = await setMaintenanceState({
            enabled,
            message: message && message.trim().length > 0 ? message.trim() : DEFAULT_MAINTENANCE_MESSAGE,
        });
        return NextResponse.json({
            enabled: updated.enabled,
            message: updated.message,
            updatedAt: updated.updatedAt,
            source: updated.source,
        });
    }
    catch (error) {
        return NextResponse.json({ error: (error === null || error === void 0 ? void 0 : error.message) || "Unable to update maintenance state" }, { status: 500 });
    }
}
