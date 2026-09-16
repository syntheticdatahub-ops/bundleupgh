import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionJwt } from "@/lib/auth-verify";
import { fsUpdate } from "@/lib/firestore-rest";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session");

    if (!session?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminUser = await verifySessionJwt(session.value);
    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await Promise.resolve(context.params);
    const customerId = resolvedParams.id;

    if (!customerId) {
      return NextResponse.json({ error: "Missing customer ID" }, { status: 400 });
    }

    const body = await req.json();
    const { totalOrders, totalSpent } = body;

    if (typeof totalOrders !== "number" || typeof totalSpent !== "number") {
      return NextResponse.json({ error: "Invalid stats payload" }, { status: 400 });
    }

    await fsUpdate("customers", customerId, {
      totalOrders,
      totalSpent,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Customer Sync] Error:", error);
    return NextResponse.json({ error: "Failed to sync customer stats." }, { status: 500 });
  }
}
