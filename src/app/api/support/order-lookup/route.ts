import { NextResponse } from "next/server";
import { normalizePhone } from "@/lib/phone";
import { lookupOrdersByPhoneNumber } from "@/lib/support-order-lookup";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawPhone = typeof body?.phoneNumber === "string" ? body.phoneNumber.trim() : "";

    if (!rawPhone || rawPhone.length > 20) {
      return NextResponse.json({ error: "A valid phone number is required." }, { status: 400 });
    }

    const normalized = normalizePhone(rawPhone);
    if (!normalized) {
      return NextResponse.json({ error: "Please enter a valid Ghanaian phone number." }, { status: 400 });
    }

    const orders = await lookupOrdersByPhoneNumber(normalized, 5);

    return NextResponse.json({
      phoneNumber: normalized,
      count: orders.length,
      orders,
    });
  } catch (_error) {
    return NextResponse.json(
      { error: "I’m having trouble checking orders right now. Please try again in a moment or contact support." },
      { status: 500 }
    );
  }
}
