import { fsQuery, fsGet } from "./firestore-rest";
import type { Network } from "@/types/domain";

// Short-lived in-process read-through cache for the networks catalog.
//
// The networks collection is tiny (a few documents) and changes infrequently,
// so re-reading it on every request/render (homepage, buy flow, admin pages) is
// wasteful. We cache the active networks for a short TTL and expose
// invalidateNetworksCache() for any write path. There is no polling and the
// cache cannot go stale indefinitely.
const NETWORKS_TTL_MS = 60_000;
let networksCache: { data: Network[]; expiresAt: number } | null = null;

export function invalidateNetworksCache(): void {
  networksCache = null;
}

export async function getNetworks(): Promise<Network[]> {
  const now = Date.now();
  if (networksCache && now < networksCache.expiresAt) {
    return networksCache.data;
  }
  const docs = await fsQuery("networks", [{ field: "active", op: "EQUAL", value: true }]);
  const data = docs as Network[];
  networksCache = { data, expiresAt: now + NETWORKS_TTL_MS };
  return data;
}

export async function getNetworkById(id: string): Promise<Network | null> {
  // Cheap single-doc read; kept fresh because order creation validates the
  // network by id. Served directly (not from the catalog cache).
  const doc = await fsGet("networks", id);
  return doc as Network | null;
}