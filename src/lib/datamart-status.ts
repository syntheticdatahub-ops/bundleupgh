import type { FulfillmentStatus } from "@/types/domain";

export function mapDataMartFulfillmentStatus(rawStatus: unknown): FulfillmentStatus | null {
  if (typeof rawStatus !== "string") return null;

  const orderStatus = rawStatus.toLowerCase().replace(/[_\s-]/g, "_");
  if (orderStatus === "completed" || orderStatus === "complete" || orderStatus === "delivered") {
    return "SUCCESS";
  }
  if (
    orderStatus === "failed" ||
    orderStatus === "rejected" ||
    orderStatus === "cancelled" ||
    orderStatus === "canceled"
  ) {
    return "FAILED";
  }
  if (
    orderStatus === "waiting" ||
    orderStatus === "on_hold" ||
    orderStatus === "beneficiary_not_allowed" ||
    orderStatus === "not_allowed" ||
    orderStatus === "pending_verification"
  ) {
    return "ON_HOLD";
  }
  if (orderStatus === "refunded") return "REFUNDED";
  if (orderStatus === "processing" || orderStatus === "created" || orderStatus === "pending") {
    return "PROCESSING";
  }
  return null;
}
