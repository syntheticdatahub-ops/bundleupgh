import { NextResponse } from "next/server";
import { fsQuery, fsUpdate } from "@/lib/firestore-rest";
import { fulfillDataMartOrder } from "@/lib/datamart";
import type { Order } from "@/types/domain";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    // 1. Authorization: Support Vercel CRON_SECRET if provided
    const authHeader = req.headers.get("authorization");
    if (process.env.CRON_SECRET) {
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // 2. Query FAILED orders
    const docs = await fsQuery("orders", [
      { field: "fulfillmentStatus", op: "EQUAL", value: "FAILED" },
    ]);
    const failedOrders = docs as Order[];

    // 3. Filter eligible orders
    const now = Date.now();
    const FIVE_MINUTES = 5 * 60 * 1000;
    const MAX_RETRIES = 3;

    const eligibleOrders = failedOrders.filter((order) => {
      // Must be paid
      if (order.paymentStatus !== "SUCCESS" && order.paymentStatus !== "NOT_APPLICABLE") {
        return false;
      }
      // Must not exceed max retries
      if ((order.autoRetryCount || 0) >= MAX_RETRIES) {
        return false;
      }
      // Must have waited at least 5 minutes since last update
      if (now - new Date(order.updatedAt).getTime() < FIVE_MINUTES) {
        return false;
      }
      return true;
    });

    // 4. Sort oldest first and pick top 5 (avoid hitting serverless execution timeouts)
    eligibleOrders.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
    const ordersToRetry = eligibleOrders.slice(0, 5);

    if (ordersToRetry.length === 0) {
      return NextResponse.json({ success: true, message: "No eligible orders to auto-retry." });
    }

    const results = [];

    // 5. Process them
    for (const order of ordersToRetry) {
      try {
        const newCount = (order.autoRetryCount || 0) + 1;
        
        // Optimistically update status to prevent race conditions on next cron run
        await fsUpdate("orders", order.id, {
          autoRetryCount: newCount,
          fulfillmentStatus: "PROCESSING",
          updatedAt: new Date().toISOString(),
        });
        
        // Update local object so fulfillDataMartOrder has fresh data
        order.autoRetryCount = newCount;
        order.fulfillmentStatus = "PROCESSING";

        // Dispatch to DataMart
        await fulfillDataMartOrder(order);
        
        results.push({ id: order.id, reference: order.publicReference, status: "Retried", attempt: newCount });
      } catch (err: any) {
        console.error(`Failed to auto-retry order ${order.id}:`, err);
        results.push({ id: order.id, error: err.message });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Auto-retried ${ordersToRetry.length} orders.`,
      results,
    });
  } catch (error: any) {
    console.error("[Auto Retry Cron] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
