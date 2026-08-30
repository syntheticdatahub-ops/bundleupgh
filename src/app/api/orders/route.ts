import { NextResponse } from "next/server";
import { getBundleById } from "@/lib/bundles";
import { getNetworkById } from "@/lib/networks";
import { createOrder, createPayment } from "@/lib/orders";
import { createOrUpdateCustomer } from "@/lib/customers";
import { detectNetworkCode, isValidPhone } from "@/lib/phone";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { recipientPhone, networkId, bundleId } = body;

    if (!recipientPhone || !networkId || !bundleId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!isValidPhone(recipientPhone)) {
      return NextResponse.json({ error: "Invalid phone number format" }, { status: 400 });
    }

    // 1. Verify bundle
    const bundle = await getBundleById(bundleId);
    if (!bundle) {
      return NextResponse.json({ error: "Bundle not found" }, { status: 404 });
    }
    if (!bundle.active || bundle.providerAvailable === false) {
      return NextResponse.json({ error: "BUNDLE_UNAVAILABLE", message: "Bundle is currently unavailable." }, { status: 400 });
    }
    if (bundle.networkId !== networkId) {
      return NextResponse.json({ error: "Bundle does not belong to the selected network" }, { status: 400 });
    }

    // 2. Verify network
    const network = await getNetworkById(networkId);
    if (!network || !network.active) {
      return NextResponse.json({ error: "Invalid or inactive network" }, { status: 400 });
    }

    // 3. Detect network for the snapshot
    const detectedCode = detectNetworkCode(recipientPhone);
    // Find the network ID for the detected code (we'd need a way to look up by code, for now we will just query it or map it)
    // Actually, network documents in seed have `code` field. We can't query it easily without a new function, but since we are in V1:
    const detectedNetworkId = detectedCode === network.code ? network.id : undefined;

    // 4. Create/Get Customer
    const customer = await createOrUpdateCustomer(recipientPhone);

    // 5. Create Order with snapshotted pricing
    const order = await createOrder({
      customerId: customer.id,
      recipientPhone,
      networkId,
      detectedNetworkId,
      bundleId,
      bundleNameSnapshot: bundle.name,
      dataSizeSnapshot: bundle.dataSize,
      providerCostSnapshot: bundle.providerCost,
      sellingPriceSnapshot: bundle.sellingPrice,
      profitSnapshot: bundle.sellingPrice - bundle.providerCost,
      paymentStatus: "PENDING",
      fulfillmentStatus: "PENDING",
    });

    // 6. Create Payment Record (Mock Paystack for now)
    const payment = await createPayment({
      orderId: order.id,
      provider: "MOCK",
      amount: bundle.sellingPrice,
      currency: "GHS",
      status: "PENDING",
    });

    return NextResponse.json({ 
      success: true, 
      orderId: order.publicReference, 
      paymentId: payment.id 
    });

  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "An internal server error occurred while creating the order" },
      { status: 500 }
    );
  }
}
