import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionJwt } from "@/lib/auth-verify";
import { fsGet, fsUpdate } from "@/lib/firestore-rest";
import { invalidateBundlesCache } from "@/lib/bundles";
import { getPostHogClient } from "@/lib/posthog-server";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
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

    const resolvedParams = await Promise.resolve(context.params);
    const bundleId = resolvedParams.id;
    if (!bundleId) {
      return NextResponse.json({ error: "Missing bundle ID" }, { status: 400 });
    }

    const body = await req.json();
    const sellingPrice = Number(body.sellingPrice);
    const activeValue = body.active;

    if (!Number.isFinite(sellingPrice) || sellingPrice < 0) {
      return NextResponse.json({ error: "Valid selling price is required." }, { status: 400 });
    }

    const bundle = await fsGet("bundles", bundleId);
    if (!bundle) {
      return NextResponse.json({ error: "Bundle not found" }, { status: 404 });
    }

    const nextPayload: Record<string, unknown> = {
      sellingPrice,
      updatedAt: new Date().toISOString(),
    };

    if (typeof activeValue === "boolean") {
      nextPayload.active = activeValue;
    }

    await fsUpdate("bundles", bundleId, nextPayload);
    invalidateBundlesCache();

    const posthog = getPostHogClient();
    posthog?.capture({
      distinctId: user.uid,
      event: "admin_bundle_updated",
      properties: {
        bundle_id: bundleId,
        selling_price: sellingPrice,
        active: typeof activeValue === "boolean" ? activeValue : undefined,
      },
    });
    await posthog?.flush();

    return NextResponse.json({
      success: true,
      bundle: {
        ...(bundle as Record<string, unknown>),
        ...nextPayload,
      },
    });
  } catch (error: any) {
    console.error("[Admin Bundle Update Route] Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update bundle." },
      { status: 500 }
    );
  }
}

