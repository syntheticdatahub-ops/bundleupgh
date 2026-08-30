/**
 * src/lib/datamart-catalog.ts
 *
 * Server-side DataMart catalog sync service.
 *
 * Responsibilities:
 *  - Fetch live package catalog from DataMart's GET /data-packages endpoint
 *  - Validate and normalize response
 *  - Upsert into Firestore `bundles` collection using deterministic IDs
 *  - NEVER overwrite the admin's sellingPrice on existing bundles
 *  - NEVER expose DATAMART_API_KEY or providerCost outside server context
 */

import { Bundle, Network } from "@/types/domain";
import { fsQuery, fsSet, fsUpdate } from "./firestore-rest";
import https from "node:https";

const DATAMART_API_KEY = process.env.DATAMART_API_KEY;
const DATAMART_BASE_URL = "api.datamartgh.shop";

// ─── DataMart API types ───────────────────────────────────────────────────────

interface DataMartPackage {
  // DataMart returns these as strings in the actual API response — we coerce below
  capacity: number | string;
  mb: number | string;
  network: string;
  price: number | string;
  inStock?: boolean;
}

interface DataMartCatalogResponse {
  status: string;
  pricingTier?: string;
  data: {
    YELLO?: DataMartPackage[];
    TELECEL?: DataMartPackage[];
    AT_PREMIUM?: DataMartPackage[];
  };
}

export interface SyncResult {
  imported: number; // packages returned by DataMart
  created: number;  // new bundles created in Firestore
  updated: number;  // existing bundles updated (cost changed)
  unchanged: number;// existing bundles unchanged
  deactivated: number; // existing bundles marked unavailable because DataMart stopped returning them
  reactivated: number; // existing bundles marked available again
  failed: number;   // packages that failed validation/upsert
  syncedAt: string;
}

// ─── Network mapping ──────────────────────────────────────────────────────────

/** Maps DataMart network codes to BundleUp network codes (lowercase) */
const DM_NETWORK_TO_CODE: Record<string, string> = {
  YELLO:      "mtn",
  TELECEL:    "telecel",
  AT_PREMIUM: "airteltigo",
};

/** Maps DataMart network codes to human-readable names */
const DM_NETWORK_TO_NAME: Record<string, string> = {
  YELLO:      "MTN",
  TELECEL:    "Telecel",
  AT_PREMIUM: "AirtelTigo",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Convert DataMart's capacity (float GB) and mb fields into a human-readable
 * dataSize string that matches what BundleUp and the fulfillment layer use.
 *
 * Rules:
 *   capacity >= 1  →  "<n>GB"  (e.g. 5 → "5GB")
 *   capacity < 1   →  "<mb>MB" (e.g. 0.5, mb=512 → "512MB")
 *
 * We intentionally DO NOT use parseFloat() on a raw string like "500MB"
 * because that silently drops the unit.
 */
function toDataSize(capacity: number, mb: number): string {
  if (capacity >= 1) {
    // Use integer if it's a whole number, otherwise keep decimals
    return Number.isInteger(capacity) ? `${capacity}GB` : `${capacity}GB`;
  }
  return `${mb}MB`;
}

/**
 * Deterministic Firestore document ID.
 * Produces IDs like "mtn-5gb", "telecel-500mb".
 * Safe to use as a Firestore document ID — no special chars.
 */
function makeBundleId(networkId: string, dataSize: string): string {
  return `${networkId.toLowerCase()}-${dataSize.toLowerCase().replace(/\s+/g, "")}`;
}

/** Default markup for newly imported bundles (GHS) */
const DEFAULT_MARKUP_GHS = 2;

// ─── DataMart API fetch ───────────────────────────────────────────────────────

async function fetchDataMartCatalog(): Promise<DataMartCatalogResponse> {
  if (!DATAMART_API_KEY) {
    throw new Error("DATAMART_API_KEY is not configured on the server.");
  }

  return new Promise((resolve, reject) => {
    const options: any = {
      hostname: DATAMART_BASE_URL,
      path: "/api/developer/data-packages",
      method: "GET",
      headers: {
        "X-API-Key": DATAMART_API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      family: 4,             // Force IPv4 to avoid Windows IPv6 timeout
      rejectUnauthorized: false, // Bypass host SSL cert issue
    };

    const req = https.request(options, (res) => {
      let raw = "";
      res.on("data", (chunk) => (raw += chunk));
      res.on("end", () => {
        if (res.statusCode !== 200) {
          reject(new Error(`DataMart returned HTTP ${res.statusCode}: ${raw.slice(0, 300)}`));
          return;
        }
        try {
          const json = JSON.parse(raw) as DataMartCatalogResponse;
          resolve(json);
        } catch {
          reject(new Error(`Invalid JSON from DataMart: ${raw.slice(0, 300)}`));
        }
      });
    });

    req.on("error", (e) => reject(e));
    req.end();
  });
}

// ─── Sync orchestrator ────────────────────────────────────────────────────────

export async function syncDataMartCatalog(): Promise<SyncResult> {
  // 1. Fetch catalog — throws if DataMart is unavailable (no catalog wipe)
  const response = await fetchDataMartCatalog();

  if (response.status !== "success" || !response.data || typeof response.data !== "object") {
    throw new Error("DataMart returned an invalid or unsuccessful catalog response.");
  }

  const NETWORK_KEYS = ["YELLO", "TELECEL", "AT_PREMIUM"] as const;
  const totalPackages = NETWORK_KEYS.reduce((acc, key) => {
    return acc + (Array.isArray(response.data[key]) ? response.data[key].length : 0);
  }, 0);

  if (totalPackages === 0) {
    throw new Error("DataMart returned a 0-package catalog. Aborting sync to prevent accidental mass-deactivation.");
  }

  // 2. Load existing Firestore networks to resolve codes → IDs
  const networkDocs = (await fsQuery("networks")) as Network[];
  const codeToNetworkId = new Map<string, string>();
  for (const net of networkDocs) {
    codeToNetworkId.set(net.code.toLowerCase(), net.id);
  }

  // 3. Load existing Firestore bundles indexed by deterministic ID
  const existingDocs = (await fsQuery("bundles")) as Bundle[];
  const existingById = new Map<string, Bundle>();
  for (const b of existingDocs) {
    existingById.set(b.id, b);
    // Also index by the key we would produce, in case documents were created before
    // the deterministic ID scheme was enforced.
    const key = makeBundleId(b.networkId, b.dataSize);
    if (!existingById.has(key)) existingById.set(key, b);
  }

  const result = {
    imported: 0,
    created: 0,
    updated: 0,
    unchanged: 0,
    deactivated: 0,
    reactivated: 0,
    failed: 0,
    syncedAt: new Date().toISOString(),
  };


  // Track all bundles that are STILL present in the DataMart API
  const processedBundleIds = new Set<string>();

  for (const dmKey of NETWORK_KEYS) {
    const packages = response.data[dmKey];
    if (!packages || !Array.isArray(packages)) continue;

    const code = DM_NETWORK_TO_CODE[dmKey];
    const networkId = codeToNetworkId.get(code);

    if (!networkId) {
      console.warn(`[DataMart Sync] Network code "${code}" not found in Firestore. Skipping ${dmKey} packages.`);
      result.failed += packages.length;
      continue;
    }

    for (const pkg of packages) {
      result.imported++;

      try {
        // DataMart returns numeric fields as strings — coerce to numbers first
        const price    = Number(pkg.price);
        const capacity = Number(pkg.capacity);
        const mb       = Number(pkg.mb);

        // Validate coerced values
        if (!Number.isFinite(price) || price < 0) {
          console.warn(`[DataMart Sync] Invalid price for ${dmKey} package:`, pkg);
          result.failed++;
          continue;
        }
        if (!Number.isFinite(capacity) || !Number.isFinite(mb) || capacity < 0 || mb < 0) {
          console.warn(`[DataMart Sync] Invalid capacity fields for ${dmKey} package:`, pkg);
          result.failed++;
          continue;
        }

        const dataSize = toDataSize(capacity, mb);
        const bundleId = makeBundleId(networkId, dataSize);
        const now = new Date().toISOString();
        const existing = existingById.get(bundleId);
        
        processedBundleIds.add(bundleId);

        if (existing) {
          // UPSERT: only update provider-related fields, NEVER touch sellingPrice
          const costChanged = existing.providerCost !== price;
          const wasUnavailable = existing.providerAvailable === false;
          
          if (wasUnavailable) {
            result.reactivated++;
          }

          if (costChanged || wasUnavailable) {
            await fsUpdate("bundles", existing.id, {
              providerCost:     price,
              dataMartNetwork:  dmKey,
              dataMartCapacity: capacity,
              providerAvailable: true,
              lastSyncedAt:     now,
              updatedAt:        now,
            });
            if (costChanged) result.updated++;
          } else {
            // Still stamp lastSyncedAt so admin can see when data was last verified
            await fsUpdate("bundles", existing.id, {
              dataMartNetwork:  dmKey,
              dataMartCapacity: capacity,
              providerAvailable: true,
              lastSyncedAt:     now,
              updatedAt:        now,
            });
            result.unchanged++;
          }
        } else {
          // CREATE: new bundle with default markup, inactive by default
          const sellingPrice = price + DEFAULT_MARKUP_GHS;

          await fsSet("bundles", bundleId, {
            networkId,
            name:             `${DM_NETWORK_TO_NAME[dmKey]} ${dataSize}`,
            dataSize,
            providerCost:     price,
            sellingPrice,
            active:           false, // admin must explicitly activate
            providerAvailable: true,
            dataMartNetwork:  dmKey,
            dataMartCapacity: capacity,
            lastSyncedAt:     now,
            createdAt:        now,
            updatedAt:        now,
          }, false);

          result.created++;
        }
      } catch (err) {
        console.error(`[DataMart Sync] Failed to process ${dmKey} package:`, pkg, err);
        result.failed++;
      }
    }
  }

  // 4. Deactivate any existing provider bundles that were NOT in the API response
  for (const existing of existingDocs) {
    // We do NOT skip non-datamart bundles here because we want old seed bundles
    // to be gracefully deactivated since DataMart is the sole source of truth.
    
    // Only retire bundles that were available but are now missing
    if (!processedBundleIds.has(existing.id) && existing.providerAvailable !== false) {
      await fsUpdate("bundles", existing.id, {
        providerAvailable: false,
        active: false, // Explicitly disable retail state when provider drops it
        updatedAt: new Date().toISOString(),
      });
      result.deactivated++;
    }
  }

  return result;
}
