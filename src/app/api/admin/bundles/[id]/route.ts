import { NextResponse } from "next/server";
import { fsUpdate } from "@/lib/firestore-rest";
import { cookies } from "next/headers";
import { verifySessionJwt } from "@/lib/auth-verify";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session");

    if (!session?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await verifySessionJwt(session.value);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const { sellingPrice, active } = body;

    if (typeof sellingPrice !== "number" || sellingPrice < 0) {
      return NextResponse.json({ error: "Invalid selling price" }, { status: 400 });
    }

    await fsUpdate("bundles", id, {
      sellingPrice,
      active: Boolean(active),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Update Bundle Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update bundle" }, { status: 500 });
  }
}
