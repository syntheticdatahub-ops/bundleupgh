import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionJwt } from "@/lib/auth-verify";
import { httpsRequest, getAccessToken } from "@/lib/firestore-rest";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
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

    const resolvedParams = await Promise.resolve(context.params);
    const orderId = resolvedParams.id;

    if (!orderId) {
      return NextResponse.json({ error: "Missing order ID" }, { status: 400 });
    }

    // Call Firestore REST API directly to delete
    const token = await getAccessToken();
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const dbPath = `/v1/projects/${projectId}/databases/(default)/documents/orders/${orderId}`;
    
    await httpsRequest({
      hostname: "firestore.googleapis.com",
      path: dbPath,
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    return NextResponse.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error: any) {
    console.error("[Admin Order Delete] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete order." },
      { status: 500 }
    );
  }
}
