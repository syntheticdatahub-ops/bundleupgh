import { NextResponse } from "next/server";
import { getOrderById } from "@/lib/orders";
import { syncDataMartOrderStatus } from "@/lib/datamart";
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

    const resolvedParams = await Promise.resolve(context.params);
    const orderId = resolvedParams.id;

    if (!orderId) {
      return NextResponse.json({ error: "Missing order ID" }, { status: 400 });
    }

    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const providerRef = order.fulfillmentProviderReference || order.providerReference;
    if (!providerRef) {
      return NextResponse.json({ error: "No provider reference to sync" }, { status: 400 });
    }

    const newStatus = await syncDataMartOrderStatus(order);
    if (newStatus) {
      order.fulfillmentStatus = newStatus;
    }

    return NextResponse.json({
      success: true,
      status: newStatus || order.fulfillmentStatus,
      message: newStatus 
        ? `Status updated to ${newStatus}` 
        : "Status is already up to date or terminal",
      order,
    });
  } catch (error: any) {
    console.error("[Admin Order Sync] Error:", error);
    return NextResponse.json(
      { error: "Failed to sync order." },
      { status: 500 }
    );
  }
}
