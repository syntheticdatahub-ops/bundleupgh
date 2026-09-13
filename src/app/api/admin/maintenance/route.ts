import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionJwt } from "@/lib/auth-verify";
import { DEFAULT_MAINTENANCE_MESSAGE, getMaintenanceState, setMaintenanceState } from "@/lib/maintenance";

function isAdminUser(user: { uid: string; email?: string } | null) {
  if (!user) return false;

  const uid = user.uid?.toLowerCase();
  const email = user.email?.toLowerCase();

  return (
    uid === "admin" ||
    uid === "bundleup-admin" ||
    email === "admin@bundleup.com.gh" ||
    email === "admin@bundleup.com" ||
    email === "admin@bundleup.io"
  );
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session");

    if (!session?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await verifySessionJwt(session.value);
    if (!user || !isAdminUser(user)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const state = getMaintenanceState();
    return NextResponse.json({
      enabled: state.enabled,
      message: state.message,
      updatedAt: state.updatedAt,
      source: state.source,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Unable to load maintenance state" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session");

    if (!session?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await verifySessionJwt(session.value);
    if (!user || !isAdminUser(user)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const enabled = typeof body?.enabled === "boolean" ? body.enabled : undefined;
    const message = typeof body?.message === "string" ? body.message : undefined;

    const updated = setMaintenanceState({
      enabled,
      message: message && message.trim().length > 0 ? message.trim() : DEFAULT_MAINTENANCE_MESSAGE,
    });

    return NextResponse.json({
      enabled: updated.enabled,
      message: updated.message,
      updatedAt: updated.updatedAt,
      source: updated.source,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Unable to update maintenance state" }, { status: 500 });
  }
}
