import { NextResponse } from "next/server";
import { syncDataMartCatalog } from "@/lib/datamart-catalog";
import { cookies } from "next/headers";
import { verifySessionJwt } from "@/lib/auth-verify";

export async function POST() {
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

    const results = await syncDataMartCatalog();
    // Never return raw provider credentials or internal DataMart info
    return NextResponse.json(results);
  } catch (error: any) {
    console.error("[Sync Route] DataMart catalog sync error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to sync catalog from DataMart." },
      { status: 500 }
    );
  }
}
