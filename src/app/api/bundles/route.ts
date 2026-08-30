/**
 * GET /api/bundles
 *
 * Returns active data bundles from Firestore, optionally filtered by networkId.
 *
 * Query params:
 *   ?networkId=<firestoreNetworkId>
 *
 * The DataMart API key is NEVER exposed here.
 * Only BundleUp retail prices and public bundle fields are returned.
 */

import { NextRequest, NextResponse } from "next/server";
import { getBundles, getBundlesByNetwork } from "@/lib/bundles";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const networkId = searchParams.get("networkId");

  const bundles = networkId
    ? await getBundlesByNetwork(networkId)
    : await getBundles();

  // Strip internal fields from the response — never expose providerCost to browser
  const publicBundles = bundles.map(({ id, networkId, name, dataSize, validity, sellingPrice, active, tag }) => ({
    id,
    networkId,
    name,
    dataSize,
    validity,
    sellingPrice,
    active,
    tag,
  }));

  return NextResponse.json({ bundles: publicBundles });
}
