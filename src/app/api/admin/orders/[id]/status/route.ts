import { NextResponse } from "next/server";
import { getOrderById } from "@/lib/orders";
import { fsUpdate, fsAdd } from "@/lib/firestore-rest";
import { cookies } from "next/headers";
import { verifySessionJwt } from "@/lib/auth-verify";

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

    // Resolve params (Next.js 15+ compatible)
    const resolvedParams = await Promise.resolve(context.params);
    const orderId = resolvedParams.id;

    if (!orderId) {
      return NextResponse.json({ error: "Missing order ID" }, { status: 400 });
    }

    const body = await req.json();
    const { status, note } = body;

    const validStatuses = ["PROCESSING", "ON_HOLD", "SUCCESS", "FAILED", "REFUNDED"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const previousStatus = order.fulfillmentStatus;

    if (previousStatus === status) {
      return NextResponse.json({ success: true, order }); // No change
    }

    const now = new Date().toISOString();

    // 1. Update the order
    await fsUpdate("orders", orderId, {
      fulfillmentStatus: status,
      updatedAt: now,
    });

    // 2. Create audit record
    await fsAdd("order_status_history", {
      orderId,
      previousStatus,
      newStatus: status,
      source: "ADMIN",
      adminUid: adminUser.uid,
      adminEmail: adminUser.email || "",
      note: note || "",
      timestamp: now,
    });

    const updatedOrder = await getOrderById(orderId);

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error("[Admin Status Update Route] Error:", error);
    return NextResponse.json(
      { error: "Failed to update order status." },
      { status: 500 }
    );
  }
}
