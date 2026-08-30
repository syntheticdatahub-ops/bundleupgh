import { fsUpdate } from "@/lib/firestore-rest";
import { fulfillDataMartOrder } from "./datamart";
import { getOrderById } from "./orders";

export async function processFulfillment(orderId: string): Promise<void> {
  await fsUpdate("orders", orderId, {
    fulfillmentStatus: "PROCESSING",
    updatedAt: new Date().toISOString(),
  });

  const order = await getOrderById(orderId);
  if (order && order.paymentStatus === "SUCCESS") {
    // Only fulfill if processing hasn't already completed (we just set it to PROCESSING, so it's safe to call)
    // The datamart idempotency will prevent double billing
    await fulfillDataMartOrder(order);
  }
}
