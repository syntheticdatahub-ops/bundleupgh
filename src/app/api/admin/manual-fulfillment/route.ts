import { NextResponse } from "next/server";
import { getBundleById } from "@/lib/bundles";
import { getNetworkById } from "@/lib/networks";
import { createOrder, getOrderById } from "@/lib/orders";
import { fulfillDataMartOrder } from "@/lib/datamart";
import { isValidPhone, normalizePhone } from "@/lib/phone";
import { createOrUpdateCustomer } from "@/lib/customers";
import { cookies } from "next/headers";
import { verifySessionJwt } from "@/lib/auth-verify";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session");

    if (!session?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminUser = await verifySessionJwt(session.value);
    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { recipientPhone, networkId, bundleId, adminNote } = body;

    if (!recipientPhone || !networkId || !bundleId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!isValidPhone(recipientPhone)) {
      return NextResponse.json({ error: "Invalid phone number format" }, { status: 400 });
    }

    const normalizedPhone = normalizePhone(recipientPhone) || recipientPhone;

    // 1. Verify bundle
    const bundle = await getBundleById(bundleId);
    if (!bundle) {
      return NextResponse.json({ error: "Bundle not found" }, { status: 404 });
    }
    if (!bundle.active || bundle.providerAvailable === false) {
      return NextResponse.json({ error: "Bundle is no longer active or available from provider" }, { status: 400 });
    }
    if (bundle.networkId !== networkId) {
      return NextResponse.json({ error: "Bundle does not belong to the selected network" }, { status: 400 });
    }

    // 2. Verify network
    const network = await getNetworkById(networkId);
    if (!network || !network.active) {
      return NextResponse.json({ error: "Invalid or inactive network" }, { status: 400 });
    }

    // 3. Get or create customer
    const customer = await createOrUpdateCustomer(normalizedPhone);

    // 4. Create manual order
    const order = await createOrder({
      customerId: customer.id,
      recipientPhone: normalizedPhone,
      networkId,
      bundleId,
      bundleNameSnapshot: bundle.name,
      dataSizeSnapshot: bundle.dataSize,
      providerCostSnapshot: bundle.providerCost,
      sellingPriceSnapshot: bundle.sellingPrice,
      profitSnapshot: bundle.sellingPrice - bundle.providerCost,
      paymentStatus: "NOT_APPLICABLE",
      fulfillmentStatus: "PROCESSING",
      source: "MANUAL",
      adminUid: adminUser.uid,
      adminEmail: adminUser.email,
      adminNote: adminNote || "",
      manualFulfillment: true,
    });

    // 5. Trigger DataMart fulfillment
    await fulfillDataMartOrder(order);

    // 6. Fetch the updated order to get the latest fulfillment status
    const updatedOrder = await getOrderById(order.id);

    return NextResponse.json({
      success: true,
      order: updatedOrder || order,
    });
  } catch (error: any) {
    console.error("[Manual Fulfillment Route] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process manual fulfillment." },
      { status: 500 }
    );
  }
}
