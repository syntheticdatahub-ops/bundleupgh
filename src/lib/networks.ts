import { fsQuery, fsGet } from "./firestore-rest";
import type { Network } from "@/types/domain";
import { revalidateTag, unstable_cache } from "next/cache";

// The active network catalog is stored in Next's server Data Cache so it can
// be reused across requests and Vercel instances, rather than only in one
// process.
//
// The networks collection is tiny (a few documents) and changes infrequently,
// so re-reading it on every request/render (homepage, buy flow, admin pages) is
// wasteful. The cache revalidates periodically and exposes
// invalidateNetworksCache() for any future write path.
const NETWORKS_TTL_MS = 60_000;
const NETWORKS_CACHE_TAG = "networks:active";
let activeNetworksInFlight: Promise<Network[]> | null = null;

const getCachedActiveNetworks = unstable_cache(
  async (): Promise<Network[]> => {
    const docs = await fsQuery("networks", [{ field: "active", op: "EQUAL", value: true }]);
    return docs as Network[];
  },
  [NETWORKS_CACHE_TAG],
  { revalidate: NETWORKS_TTL_MS / 1000, tags: [NETWORKS_CACHE_TAG] },
);

export function invalidateNetworksCache(): void {
  activeNetworksInFlight = null;
  revalidateTag(NETWORKS_CACHE_TAG, { expire: 0 });
}

export async function getNetworks(): Promise<Network[]> {
  if (!activeNetworksInFlight) {
    activeNetworksInFlight = getCachedActiveNetworks();
  }

  const request = activeNetworksInFlight;
  try {
    return await request;
  } finally {
    if (activeNetworksInFlight === request) {
      activeNetworksInFlight = null;
    }
  }
}

export async function getNetworkById(id: string): Promise<Network | null> {
  // Cheap single-doc read; kept fresh because order creation validates the
  // network by id. Served directly (not from the catalog cache).
  const doc = await fsGet("networks", id);
  return doc as Network | null;
}