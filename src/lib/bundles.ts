import { fsQuery, fsGet } from "./firestore-rest";
import type { Bundle } from "@/types/domain";

export async function getBundles(): Promise<Bundle[]> {
  const docs = (await fsQuery("bundles", [{ field: "active", op: "EQUAL", value: true }])) as Bundle[];
  return docs.filter(b => b.providerAvailable !== false);
}

export async function getAllBundles(): Promise<Bundle[]> {
  const docs = await fsQuery("bundles", []);
  return docs as Bundle[];
}

export async function getBundlesByNetwork(networkId: string): Promise<Bundle[]> {
  const docs = (await fsQuery("bundles", [
    { field: "networkId", op: "EQUAL", value: networkId },
    { field: "active", op: "EQUAL", value: true },
  ])) as Bundle[];
  return docs.filter(b => b.providerAvailable !== false);
}

export async function getBundleById(id: string): Promise<Bundle | null> {
  const doc = await fsGet("bundles", id);
  if (doc) return doc as Bundle;

  const docs = await fsQuery("bundles", [{ field: "id", op: "EQUAL", value: id }]);
  return (docs[0] as Bundle) ?? null;
}
