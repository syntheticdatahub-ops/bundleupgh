import { fsQuery, fsGet } from "./firestore-rest";
// Short-lived in-process read-through cache for the bundles catalog.
//
// Bundles change infrequently (admin edits + occasional DataMart sync) yet are
// read on the homepage, buy flow and manual-fulfillment pages. Caching the
// small bundle list with a short TTL avoids a Firestore read on every request.
// Admin edits and DataMart sync call invalidateBundlesCache() so the catalog
// never goes stale beyond the TTL. There is no polling and no external cache.
const BUNDLES_TTL_MS = 60000;
let bundlesCache = null;
let allBundlesCache = null;
export function invalidateBundlesCache() {
    bundlesCache = null;
    allBundlesCache = null;
}
export async function getBundles() {
    const now = Date.now();
    if (bundlesCache && now < bundlesCache.expiresAt) {
        return bundlesCache.data;
    }
    const docs = (await fsQuery("bundles", [{ field: "active", op: "EQUAL", value: true }]));
    const data = docs.filter((b) => b.providerAvailable !== false);
    bundlesCache = { data, expiresAt: now + BUNDLES_TTL_MS };
    return data;
}
export async function getAllBundles() {
    const now = Date.now();
    if (allBundlesCache && now < allBundlesCache.expiresAt) {
        return allBundlesCache.data;
    }
    const docs = await fsQuery("bundles", []);
    const data = docs;
    allBundlesCache = { data, expiresAt: now + BUNDLES_TTL_MS };
    return data;
}
export async function getBundlesByNetwork(networkId) {
    // Reuses the cached active-bundle list (active + providerAvailable) rather
    // than issuing a dedicated Firestore query per network.
    const all = await getBundles();
    return all.filter((b) => b.networkId === networkId);
}
export async function getBundleById(id) {
    var _a;
    // Order creation/fulfillment validates active/providerAvailable and snapshots
    // the selling price, so this must stay fresh. It is a cheap single-doc fsGet,
    // intentionally NOT served from the catalog cache.
    const doc = await fsGet("bundles", id);
    if (doc)
        return doc;
    const docs = await fsQuery("bundles", [{ field: "id", op: "EQUAL", value: id }]);
    return (_a = docs[0]) !== null && _a !== void 0 ? _a : null;
}
