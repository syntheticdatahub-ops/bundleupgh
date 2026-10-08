import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionJwt } from "@/lib/auth-verify";
import { getDataMartOrderStatus } from "@/lib/datamart";
import { fsUpdate } from "@/lib/firestore-rest";
import { getReconciliationOrdersPage } from "@/lib/orders";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const ORDER_LOOKUP_CONCURRENCY = 5;
const ORDER_LOOKUPS_PER_BATCH = 20;
const ORDER_LOOKUPS_PER_MINUTE = 80;
const RECONCILED_PAYMENT_STATUSES = new Set(["SUCCESS", "PAID", "NOT_APPLICABLE"]);
type ReconciliationCursor = { afterId?: string };

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

function parseCursor(value: unknown): ReconciliationCursor | null {
  if (value === null || value === undefined) return {};
  if (typeof value !== "object" || value === null) return null;

  const cursor = value as Record<string, unknown>;
  if (
    cursor.afterId !== undefined &&
    (typeof cursor.afterId !== "string" || !cursor.afterId || cursor.afterId.includes("/") || cursor.afterId.length > 256)
  ) {
    return null;
  }

  return { afterId: cursor.afterId as string | undefined };
}

export async function POST(req: Request) {
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

    const body = await req.json().catch(() => ({}));
    const cursor = parseCursor(body?.cursor);
    if (!cursor) {
      return NextResponse.json({ error: "Invalid reconciliation cursor." }, { status: 400 });
    }

    const transitions: Record<string, number> = {};
    const failures: Array<{ id: string; reference: string; error: string }> = [];
    let checked = 0;
    let updated = 0;
    let unchanged = 0;

    let currentCursor: ReconciliationCursor | null = cursor;
    let done = false;

    while (currentCursor && checked < ORDER_LOOKUPS_PER_BATCH) {
      const page = await getReconciliationOrdersPage(currentCursor.afterId);
      const ordersWithReferences = page.orders.flatMap((order) => {
        const providerReference = order.fulfillmentProviderReference || order.providerReference;
        return (
          RECONCILED_PAYMENT_STATUSES.has(order.paymentStatus) && providerReference
            ? [{ order, providerReference }]
            : []
        );
      });
      const remainingCapacity = ORDER_LOOKUPS_PER_BATCH - checked;
      const batch = ordersWithReferences.slice(0, remainingCapacity);

      for (let start = 0; start < batch.length; start += ORDER_LOOKUP_CONCURRENCY) {
        const concurrentBatch = batch.slice(start, start + ORDER_LOOKUP_CONCURRENCY);
        await Promise.all(concurrentBatch.map(async ({ order, providerReference }) => {
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

      if (ordersWithReferences.length > batch.length) {
        currentCursor = { afterId: batch[batch.length - 1].order.id };
      } else if (page.hasMore) {
        currentCursor = { afterId: page.nextCursor };
      } else {
        currentCursor = null;
      }

      if (checked >= ORDER_LOOKUPS_PER_BATCH) break;
    }
    done = currentCursor === null;

    return NextResponse.json({
      success: true,
      message: done ? "Sync completed" : "Processing-order batch completed",
      done,
      nextCursor: currentCursor,
      nextAllowedAt: !done && checked > 0
        ? new Date(Date.now() + Math.ceil((checked * 60_000) / ORDER_LOOKUPS_PER_MINUTE)).toISOString()
        : null,
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
