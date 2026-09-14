import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionJwt } from "@/lib/auth-verify";
import { fsDelete, fsQuery } from "@/lib/firestore-rest";
const RESET_CONFIRMATION = "RESET BUNDLEUP DATA";
const ALLOWED_RESET_COLLECTIONS = ["customers", "orders", "payments", "webhookEvents", "notifications", "supportTickets"];
function isAdminUser(user) {
    var _a, _b;
    if (!user)
        return false;
    const uid = (_a = user.uid) === null || _a === void 0 ? void 0 : _a.toLowerCase();
    const email = (_b = user.email) === null || _b === void 0 ? void 0 : _b.toLowerCase();
    return (uid === "admin" ||
        uid === "bundleup-admin" ||
        email === "admin@bundleup.com.gh" ||
        email === "admin@bundleup.com" ||
        email === "admin@bundleup.io");
}
async function deleteCollectionDocuments(collectionName) {
    const docs = await fsQuery(collectionName, []);
    for (const doc of docs) {
        if (!(doc === null || doc === void 0 ? void 0 : doc.id))
            continue;
        await fsDelete(collectionName, doc.id);
    }
    return docs.length;
}
export async function POST(req) {
    var _a;
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get("session");
        if (!(session === null || session === void 0 ? void 0 : session.value)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const user = await verifySessionJwt(session.value);
        if (!user || !isAdminUser(user)) {
            return NextResponse.json({ error: "Forbidden: admin access required" }, { status: 403 });
        }
        const body = await req.json().catch(() => ({}));
        const confirmation = typeof (body === null || body === void 0 ? void 0 : body.confirmation) === "string" ? body.confirmation.trim() : "";
        if (confirmation !== RESET_CONFIRMATION) {
            return NextResponse.json({ error: "Confirmation mismatch" }, { status: 400 });
        }
        const resetResults = {};
        const deletedCollections = [];
        for (const collectionName of ALLOWED_RESET_COLLECTIONS) {
            try {
                const deletedCount = await deleteCollectionDocuments(collectionName);
                resetResults[collectionName] = deletedCount;
                deletedCollections.push(collectionName);
            }
            catch (error) {
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
                email: (_a = user.email) !== null && _a !== void 0 ? _a : null,
            },
        });
    }
    catch (error) {
        console.error("[reset-data] Failure:", error);
        return NextResponse.json({
            error: error.message || "Failed to reset business data.",
            success: false,
        }, { status: 500 });
    }
}
