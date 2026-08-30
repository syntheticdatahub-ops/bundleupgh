import { fsQuery, fsGet } from "./firestore-rest";
import type { Network } from "@/types/domain";

export async function getNetworks(): Promise<Network[]> {
  const docs = await fsQuery("networks", [{ field: "active", op: "EQUAL", value: true }]);
  return docs as Network[];
}

export async function getNetworkById(id: string): Promise<Network | null> {
  const doc = await fsGet("networks", id);
  return doc as Network | null;
}
