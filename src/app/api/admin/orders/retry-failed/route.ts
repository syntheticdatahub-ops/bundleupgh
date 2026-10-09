import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionJwt } from "@/lib/auth-verify";
import { getOrderById } from "@/lib/orders";
import { fsUpdate } from "@/lib/firestore-rest";
import { fulfillDataMartOrder } from "@/lib/datamart";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_ORDERS_PER_BATCH = 1;
const OPERATIONAL_PAYMENT_STATUSES = new Set(["SUCCESS", "NOT_APPLICABLE"]);

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

export async function POST(req: Request) {
  try {
    const session = (await cookies()).get("session");
    if (!session?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminUser = await verifySessionJwt(session.value);
    if (!isAdminUser(adminUser)) {
      return NextResponse.json({ error: "Forbidden: admin access required" }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    const orderIds = body?.orderIds;
    if (
      !Array.isArray(orderIds) ||
      orderIds.length === 0 ||
      orderIds.length > MAX_ORDERS_PER_BATCH ||
      orderIds.some((id) => typeof id !== "string" || !id.trim() || id.includes("/") || id.length > 256)
    ) {
      return NextResponse.json(
        { error: `Provide between 1 and ${MAX_ORDERS_PER_BATCH} valid order IDs.` },
        { status: 400 },
      );
    }

    const results = [];
    for (const orderId of [...new Set<string>(orderIds)]) {
      try {
        const order = await getOrderById(orderId);
        if (!order) {
          results.push({ id: orderId, reference: orderId, outcome: "error", message: "Order not found." });
          continue;
        }

        const reference = order.publicReference || order.id;
        if (!OPERATIONAL_PAYMENT_STATUSES.has(order.paymentStatus)) {
          results.push({
            id: order.id,
            reference,
            status: order.fulfillmentStatus,
            outcome: "skipped",
            message: "Order is not paid; no fulfillment request was sent.",
          });
          continue;
        }

        if (order.fulfillmentStatus !== "FAILED") {
          results.push({
            id: order.id,
            reference,
            status: order.fulfillmentStatus,
            outcome: "skipped",
            message: "Order is no longer marked as failed.",
          });
          continue;
        }

        order.autoRetryCount = (order.autoRetryCount || 0) + 1;
        await fsUpdate("orders", order.id, { autoRetryCount: order.autoRetryCount });
        await fulfillDataMartOrder(order);

        const updatedOrder = await getOrderById(order.id);
        results.push({
          id: order.id,
          reference,
          status: updatedOrder?.fulfillmentStatus ?? "FAILED",
          outcome: "retried",
          message: updatedOrder?.providerError,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown retry error.";
        console.error(`[Admin Bulk Order Retry] ${orderId} failed:`, error);
        results.push({ id: orderId, reference: orderId, outcome: "error", message });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("[Admin Bulk Order Retry] Failed:", error);
    return NextResponse.json(
      { error: "Failed to retry the selected orders." },
      { status: 500 },
    );
  }
}
