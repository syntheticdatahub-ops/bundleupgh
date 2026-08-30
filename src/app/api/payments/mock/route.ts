import { NextResponse } from "next/server";
import { fsUpdate, fsQuery } from "@/lib/firestore-rest";

export async function POST(req: Request) {
  try {
    const { orderId, paymentId, status } = await req.json();

    if (!orderId || !paymentId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const orders = await fsQuery("orders", [{ field: "publicReference", op: "EQUAL", value: orderId }]);
    const order = orders[0];
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update payment record
    await fsUpdate("payments", paymentId, {
      status,
      ...(status === "SUCCESS" ? { paidAt: new Date().toISOString() } : {}),
    });

    // Update order
    await fsUpdate("orders", order.id, {
      paymentStatus: status,
      fulfillmentStatus: status === "SUCCESS" ? "SUCCESS" : "FAILED",
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Mock payment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
