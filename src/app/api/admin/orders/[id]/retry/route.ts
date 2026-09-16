import { NextResponse } from "next/server";
import { getOrderById } from "@/lib/orders";
import { fulfillDataMartOrder } from "@/lib/datamart";
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

    if (order.fulfillmentStatus === "SUCCESS") {
      return NextResponse.json({ error: "Cannot retry a successful order" }, { status: 400 });
    }

    // ALWAYS sync first to make sure we don't accidentally retry an order that just succeeded or is still processing
    const { syncDataMartOrderStatus } = await import("@/lib/datamart");
    const latestStatus = await syncDataMartOrderStatus(order);
    
    // Use the latest status if sync returned one, otherwise use the current one
    const effectiveStatus = latestStatus || order.fulfillmentStatus;

    if (effectiveStatus === "SUCCESS") {
      return NextResponse.json({ error: "Order is already successful. Refresh the page." }, { status: 400 });
    }
    if (effectiveStatus === "PROCESSING" || effectiveStatus === "ON_HOLD") {
      return NextResponse.json({ 
        error: `Order is currently ${effectiveStatus}. Please wait for it to fail before retrying to prevent double-charges.` 
      }, { status: 400 });
    }

    order.autoRetryCount = (order.autoRetryCount || 0) + 1;
    // Note: fsUpdate is called inside fulfillDataMartOrder but doesn't persist autoRetryCount currently.
    // Let's manually save it.
    const { fsUpdate } = await import("@/lib/firestore-rest");
    await fsUpdate("orders", order.id, { autoRetryCount: order.autoRetryCount });

    await fulfillDataMartOrder(order);

    return NextResponse.json({
      success: true,
      message: "Fulfillment retry triggered",
      order,
    });
  } catch (error: any) {
    console.error("[Admin Order Retry] Error:", error);
    return NextResponse.json(
      { error: "Failed to retry order fulfillment." },
      { status: 500 }
    );
  }
}
