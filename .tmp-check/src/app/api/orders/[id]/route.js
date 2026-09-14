/**
 * GET /api/orders/[id]
 *
 * Returns a single order by public reference.
 * Used by the success page and the track flow.
 *
 * SECURITY: In production this must verify ownership
 * (e.g. OTP-based phone verification) before returning order data.
 */
import { NextResponse } from "next/server";
import { getOrderByReference } from "@/lib/orders";
export async function GET(_request, { params }) {
    const { id } = await params;
    const order = getOrderByReference(id);
    if (!order) {
        return NextResponse.json({ error: "NOT_FOUND", message: "Order not found." }, { status: 404 });
    }
    return NextResponse.json(order);
}
