import { NextResponse } from "next/server";
import { findOrdersByRecipientPhone } from "@/lib/orders";
import { normalizePhone } from "@/lib/phone";
import { cookies } from "next/headers";
import { verifySessionJwt } from "@/lib/auth-verify";

export async function GET(req: Request) {
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

    const url = new URL(req.url);
    const phone = url.searchParams.get("phone");

    if (!phone) {
      return NextResponse.json({ error: "Missing phone parameter" }, { status: 400 });
    }

    const normalized = normalizePhone(phone) || phone;
    const orders = await findOrdersByRecipientPhone(normalized);

    // Sort newest first
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Look up the customer record so we can return their ID for auto-syncing stats
    const { getCustomerByPhone } = await import("@/lib/customers");
    const customer = await getCustomerByPhone(normalized) || await getCustomerByPhone(phone);

    return NextResponse.json({ success: true, orders, customerId: customer?.id || null });
  } catch (error: any) {
    console.error("[Customer Orders Route] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer orders." },
      { status: 500 }
    );
  }
}
