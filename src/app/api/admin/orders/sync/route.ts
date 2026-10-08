import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionJwt } from "@/lib/auth-verify";
import { getDataMartOrderStatus } from "@/lib/datamart";
import { fsUpdate } from "@/lib/firestore-rest";
import { getReconciliationOrdersPage } from "@/lib/orders";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ORDER_LOOKUP_CONCURRENCY = 5;
const RECONCILED_PAYMENT_STATUSES = ["SUCCESS", "PAID", "NOT_APPLICABLE"] as const;

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

function getStatusLabel(status: string): string {
  if (!status) return "Unknown";
  if (status === "SUCCESS") return "Delivered";
  if (status === "ON_HOLD") return "On Hold";
  if (status === "REFUND_PENDING") return "Refund Pending";
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export async function POST() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session");
    if (!session?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminUser = await verifySessionJwt(session.value);
    if (!isAdminUser(adminUser)) {
      return NextResponse.json({ error: "Forbidden: admin access required" }, { status: 403 });
    }

    const transitions: Record<string, number> = {};
    const failures: Array<{ id: string; reference: string; error: string }> = [];
    let checked = 0;
    let updated = 0;
    let unchanged = 0;

    for (const paymentStatus of RECONCILED_PAYMENT_STATUSES) {
      let cursor: string | undefined;

      do {
        const page = await getReconciliationOrdersPage(paymentStatus, cursor);
        const ordersWithReferences = page.orders.flatMap((order) => {
          const providerReference = order.fulfillmentProviderReference || order.providerReference;
          return providerReference ? [{ order, providerReference }] : [];
        });

        for (let start = 0; start < ordersWithReferences.length; start += ORDER_LOOKUP_CONCURRENCY) {
          const batch = ordersWithReferences.slice(start, start + ORDER_LOOKUP_CONCURRENCY);
          await Promise.all(batch.map(async ({ order, providerReference }) => {
            checked += 1;

            try {
              const providerStatus = await getDataMartOrderStatus(providerReference);
              if (providerStatus.fulfillmentStatus === order.fulfillmentStatus) {
                unchanged += 1;
                return;
              }

              await fsUpdate("orders", order.id, {
                fulfillmentStatus: providerStatus.fulfillmentStatus,
              });

              const transition = `${getStatusLabel(order.fulfillmentStatus)} → ${getStatusLabel(providerStatus.fulfillmentStatus)}`;
              transitions[transition] = (transitions[transition] ?? 0) + 1;
              updated += 1;
            } catch (error) {
              const message = error instanceof Error ? error.message : "Unknown reconciliation error";
              console.error(`[Admin Order Reconciliation] ${order.id} (${providerReference}) failed:`, error);
              failures.push({
                id: order.id,
                reference: order.publicReference || order.id,
                error: message,
              });
            }
          }));
        }

        cursor = page.nextCursor;
        if (!page.hasMore) break;
      } while (cursor);
    }

    return NextResponse.json({
      success: true,
      message: "Sync completed",
      summary: {
        checked,
        updated,
        unchanged,
        failed: failures.length,
        transitions,
        failures,
      },
    });
  } catch (error) {
    console.error("[Admin Order Reconciliation] Failed:", error);
    return NextResponse.json(
      { error: "Order reconciliation could not be completed. Please try again." },
      { status: 500 },
    );
  }
}
