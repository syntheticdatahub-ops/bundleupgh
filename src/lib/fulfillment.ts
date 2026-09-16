import { fulfillDataMartOrder } from "./datamart";
import { Order } from "@/types/domain";

export async function processFulfillment(order: Order): Promise<void> {
  if (order.paymentStatus === "SUCCESS" || order.paymentStatus === "NOT_APPLICABLE") {
    await fulfillDataMartOrder(order);
  }
}
