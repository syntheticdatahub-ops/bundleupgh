import { fsQuery, fsGet } from "./firestore-rest";
import type { Bundle } from "@/types/domain";
import { revalidateTag, unstable_cache } from "next/cache";

// The active catalog is stored in Next's server Data Cache so it can be reused
// across requests and Vercel instances, rather than only within one process.
//
// Bundles change infrequently (admin edits + occasional DataMart sync) yet are
// read on the homepage, buy flow and manual-fulfillment pages. Caching the
// small bundle list with a short TTL avoids a Firestore read on every request.
const BUNDLES_TTL_MS = 60_000;
const BUNDLES_CACHE_TAG = "bundles:active";
let allBundlesCache: { data: Bundle[]; expiresAt: number } | null = null;
let activeBundlesInFlight: Promise<Bundle[]> | null = null;

const getCachedActiveBundles = unstable_cache(
  async (): Promise<Bundle[]> => {
    const docs = (await fsQuery("bundles", [{ field: "active", op: "EQUAL", value: true }])) as Bundle[];
    return docs.filter((b) => b.providerAvailable !== false);
  },
  [BUNDLES_CACHE_TAG],
  { revalidate: BUNDLES_TTL_MS / 1000, tags: [BUNDLES_CACHE_TAG] },
);

export function invalidateBundlesCache(): void {
  allBundlesCache = null;
  activeBundlesInFlight = null;
  revalidateTag(BUNDLES_CACHE_TAG, { expire: 0 });
}

export async function getBundles(): Promise<Bundle[]> {
  if (!activeBundlesInFlight) {
    activeBundlesInFlight = getCachedActiveBundles();
  }

  const request = activeBundlesInFlight;
  try {
    return await request;
  } finally {
    if (activeBundlesInFlight === request) {
      activeBundlesInFlight = null;
    }
  }
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