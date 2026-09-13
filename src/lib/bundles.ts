import { fsQuery, fsGet } from "./firestore-rest";
import type { Bundle } from "@/types/domain";

// Short-lived in-process read-through cache for the bundles catalog.
//
// Bundles change infrequently (admin edits + occasional DataMart sync) yet are
// read on the homepage, buy flow and manual-fulfillment pages. Caching the
// small bundle list with a short TTL avoids a Firestore read on every request.
// Admin edits and DataMart sync call invalidateBundlesCache() so the catalog
// never goes stale beyond the TTL. There is no polling and no external cache.
const BUNDLES_TTL_MS = 60_000;
let bundlesCache: { data: Bundle[]; expiresAt: number } | null = null;
let allBundlesCache: { data: Bundle[]; expiresAt: number } | null = null;

export function invalidateBundlesCache(): void {
  bundlesCache = null;
  allBundlesCache = null;
}

export async function getBundles(): Promise<Bundle[]> {
  const now = Date.now();
  if (bundlesCache && now < bundlesCache.expiresAt) {
    return bundlesCache.data;
  }
  const docs = (await fsQuery("bundles", [{ field: "active", op: "EQUAL", value: true }])) as Bundle[];
  const data = docs.filter((b) => b.providerAvailable !== false);
  bundlesCache = { data, expiresAt: now + BUNDLES_TTL_MS };
  return data;
}

export async function getAllBundles(): Promise<Bundle[]> {
  const now = Date.now();
  if (allBundlesCache && now < allBundlesCache.expiresAt) {
    return allBundlesCache.data;
  }
  const docs = await fsQuery("bundles", []);
  const data = docs as Bundle[];
  allBundlesCache = { data, expiresAt: now + BUNDLES_TTL_MS };
  return data;
}

export async function getBundlesByNetwork(networkId: string): Promise<Bundle[]> {
  // Reuses the cached active-bundle list (active + providerAvailable) rather
  // than issuing a dedicated Firestore query per network.
  const all = await getBundles();
  return all.filter((b) => b.networkId === networkId);
}

export async function getBundleById(id: string): Promise<Bundle | null> {
  // Order creation/fulfillment validates active/providerAvailable and snapshots
  // the selling price, so this must stay fresh. It is a cheap single-doc fsGet,
  // intentionally NOT served from the catalog cache.
  const doc = await fsGet("bundles", id);
  if (doc) return doc as Bundle;
  const docs = await fsQuery("bundles", [{ field: "id", op: "EQUAL", value: id }]);
  return (docs[0] as Bundle) ?? null;
}