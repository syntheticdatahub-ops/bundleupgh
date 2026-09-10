import { NextResponse } from "next/server";
import { verifyDataMartWebhookSignature } from "@/lib/datamart";
import { fsQuery, fsAdd, fsUpdate } from "@/lib/firestore-rest";
import { getOrderByFulfillmentProviderReference } from "@/lib/orders";
import { Order, WebhookEvent } from "@/types/domain";

export async function POST(req: Request) {
  try {
    const signature = req.headers.get("X-DataMart-Signature");
    const rawBody = await req.text();

    if (!signature || !verifyDataMartWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch (e) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { event, data, timestamp } = payload;
    const orderReference = data?.orderReference;

    if (!orderReference) {
      return NextResponse.json({ error: "Missing orderReference" }, { status: 400 });
    }

    // Idempotency Check
    // Determine a unique ID for this event. Using signature as a cheap deterministic unique identifier
    // or we can build one based on reference + event. DataMart events might not have a unique event ID in payload.
    // Let's use reference + event + timestamp
    const eventId = `datamart-${orderReference}-${event}-${timestamp}`;
    
    const existingEvents = await fsQuery("webhook_events", [
      { field: "id", op: "EQUAL", value: eventId }
    ]);
    if (existingEvents.length > 0) {
      return NextResponse.json({ success: true, message: "Already processed" });
    }

    // Find the order
    const order = await getOrderByFulfillmentProviderReference(orderReference);
    if (!order) {
      // It's possible the order creation hasn't committed yet or wasn't tracked properly.
      // Store the webhook event anyway and return success so DataMart doesn't retry infinitely.
      await fsAdd("webhook_events", {
        id: eventId,
        provider: "DATAMART",
        eventType: event,
        providerReference: orderReference,
        payload,
        processed: false,
        error: "Order not found",
        createdAt: new Date().toISOString(),
      });
      return NextResponse.json({ success: true, message: "Order not found but webhook stored" });
    }

    // Process the event
    let newFulfillmentStatus = order.fulfillmentStatus;
    
    // Payment status must NEVER change to failed based on fulfillment
    
    // Mapping:
    // order.created -> PROCESSING
    // order.processing -> PROCESSING
    // order.waiting -> ON_HOLD
    // order.completed -> SUCCESS
    // order.failed -> FAILED
    // order.refunded -> REFUNDED

    if (event === "order.created" || event === "order.processing") {
      newFulfillmentStatus = "PROCESSING";
    } else if (event === "order.waiting") {
      newFulfillmentStatus = "ON_HOLD";
    } else if (event === "order.completed") {
      newFulfillmentStatus = "SUCCESS";
    } else if (event === "order.failed") {
      newFulfillmentStatus = "FAILED";
    } else if (event === "order.refunded") {
      newFulfillmentStatus = "REFUNDED";
    }

    // Do not downgrade from SUCCESS to anything else unless it's REFUNDED (and even then, only if business logic allows)
    if (order.fulfillmentStatus === "SUCCESS" && newFulfillmentStatus !== "SUCCESS" && newFulfillmentStatus !== "REFUNDED") {
      // Ignore late arriving processing/waiting events if already completed
      newFulfillmentStatus = order.fulfillmentStatus;
    }

    const updateData: Partial<Order> = {
      fulfillmentStatus: newFulfillmentStatus,
      providerStatus: data.status,
      providerEvent: event,
      providerUpdatedAt: data.updatedAt,
      lastProviderEventAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (data.transactionId) {
      updateData.fulfillmentProviderTransactionId = data.transactionId;
    }

    await fsUpdate("orders", order.id, updateData);

    // Record webhook success
    await fsAdd("webhook_events", {
      id: eventId,
      provider: "DATAMART",
      eventType: event,
      providerReference: orderReference,
      payload,
      processed: true,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DataMart webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
