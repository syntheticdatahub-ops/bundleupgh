import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionJwt } from "@/lib/auth-verify";
import { fsDelete, fsQuery } from "@/lib/firestore-rest";

const RESET_CONFIRMATION = "RESET BUNDLEUP DATA";
const ALLOWED_RESET_COLLECTIONS = ["customers", "orders", "payments", "webhookEvents", "notifications", "supportTickets"] as const;

function isAdminUser(user: { uid: string; email?: string } | null) {
  if (!user) return false;

  const uid = user.uid?.toLowerCase();
  const email = user.email?.toLowerCase();

  return (
    uid === "admin" ||
    uid === "bundleup-admin" ||
    email === "admin@bundleup.com.gh" ||
    email === "admin@bundleup.com" ||
    email === "admin@bundleup.io"
  );
}

async function deleteCollectionDocuments(collectionName: string) {
  const docs = await fsQuery(collectionName, []);

  for (const doc of docs) {
    if (!doc?.id) continue;
    await fsDelete(collectionName, doc.id);
  }

  return docs.length;
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session");

    if (!session?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await verifySessionJwt(session.value);
    if (!user || !isAdminUser(user)) {
      return NextResponse.json({ error: "Forbidden: admin access required" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const confirmation = typeof body?.confirmation === "string" ? body.confirmation.trim() : "";

    if (confirmation !== RESET_CONFIRMATION) {
      return NextResponse.json({ error: "Confirmation mismatch" }, { status: 400 });
    }

    const resetResults: Record<string, number> = {};
    const deletedCollections: string[] = [];

    for (const collectionName of ALLOWED_RESET_COLLECTIONS) {
      try {
        const deletedCount = await deleteCollectionDocuments(collectionName);
        resetResults[collectionName] = deletedCount;
        deletedCollections.push(collectionName);
      } catch (error: any) {
        console.error(`[reset-data] Failed to reset ${collectionName}:`, error);
        resetResults[collectionName] = -1;
      }
    }

    const failedCollections = Object.entries(resetResults)
      .filter(([, count]) => count === -1)
      .map(([collectionName]) => collectionName);

    if (failedCollections.length > 0) {
      return NextResponse.json({
        error: `Reset partially failed for: ${failedCollections.join(", ")}`,
        resetResults,
        success: false,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Reset request accepted and business data reset completed.",
      resetCollections: deletedCollections,
      resetResults,
      actor: {
        uid: user.uid,
        email: user.email ?? null,
      },
    });
  } catch (error: any) {
    console.error("[reset-data] Failure:", error);
    return NextResponse.json({
      error: error.message || "Failed to reset business data.",
      success: false,
    }, { status: 500 });
  }
}
