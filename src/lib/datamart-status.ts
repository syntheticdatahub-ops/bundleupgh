import type { FulfillmentStatus } from "@/types/domain";

function normalizeProviderTimestamp(value: unknown): string | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const timestamp = typeof value === "number"
    ? new Date(value < 1_000_000_000_000 ? value * 1000 : value)
    : new Date(value);
  return Number.isNaN(timestamp.getTime()) ? null : timestamp.toISOString();
}

export function getDataMartDeliveredAt(data: unknown): string | null {
  if (typeof data !== "object" || data === null) return null;
  const record = data as Record<string, unknown>;
  const timestamps = typeof record.timestamps === "object" && record.timestamps !== null
    ? record.timestamps as Record<string, unknown>
    : {};

  for (const value of [
    record.deliveredAt,
    record.delivered_at,
    record.deliveryTime,
    record.deliveryDate,
    record.completedAt,
    record.completed_at,
    timestamps.deliveredAt,
    timestamps.delivered_at,
    timestamps.completedAt,
    timestamps.completed_at,
    record.updatedAt,
  ]) {
    const normalized = normalizeProviderTimestamp(value);
    if (normalized) return normalized;
  }

  return null;
}

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
