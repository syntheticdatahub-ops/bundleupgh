/**
 * src/lib/phone.ts
 *
 * Dedicated service for Ghanaian phone-number validation and network determination.
 * In Phase 4, this is a clearly isolated development implementation.
 * It is designed so that a more reliable network lookup (e.g. HLR lookup)
 * can replace it later.
 */

export interface NetworkPrefix {
  code: string; // The network ID/code (e.g., 'mtn', 'telecel', 'airteltigo')
  prefixes: string[];
}

// Development implementation of prefixes
const NETWORK_PREFIXES: NetworkPrefix[] = [
  {
    code: "mtn",
    prefixes: ["024", "054", "055", "059", "025", "24", "54", "55", "59", "25"],
  },
  {
    code: "telecel",
    prefixes: ["020", "050", "20", "50"],
  },
  {
    code: "airteltigo",
    prefixes: ["026", "056", "027", "057", "26", "56", "27", "57"],
  },
];

/**
 * Validates if the given phone number looks like a valid Ghanaian number.
 * Note: Only checks basic length and numeric characters for now.
 */
export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  // Ghanaian numbers are typically 10 digits (e.g. 024...) or 9 if starting without 0.
  return digits.length === 10 || digits.length === 9 || (digits.startsWith("233") && digits.length === 12);
}

/**
 * Determines the network code from a phone number based on its prefix.
 * Returns null if the network is unknown.
 */
export function detectNetworkCode(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  let normalized = digits;
  
  if (normalized.startsWith("233")) {
    normalized = "0" + normalized.slice(3); // 23324... -> 024...
  } else if (normalized.length === 9) {
    normalized = "0" + normalized; // 24... -> 024...
  }

  const prefix = normalized.slice(0, 3);
  
  for (const net of NETWORK_PREFIXES) {
    if (net.prefixes.includes(prefix)) {
      return net.code;
    }
  }

  return null;
}

/**
 * Normalizes a Ghanaian phone number to the local 10-digit format (e.g. "0241234567").
 * Returns null if the input is not a recognizable Ghanaian number.
 */
export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");

  let local: string;

  if (digits.startsWith("233") && digits.length === 12) {
    // 233241234567 -> 0241234567
    local = "0" + digits.slice(3);
  } else if (digits.length === 10 && digits.startsWith("0")) {
    // Already local format: 0241234567
    local = digits;
  } else if (digits.length === 9) {
    // 241234567 -> 0241234567
    local = "0" + digits;
  } else {
    return null;
  }

  // Sanity check: must be 10 digits
  if (local.length !== 10) return null;
  return local;
}

/**
 * Returns all phone number representations of a number
 * that may be stored in Firestore (local, E.164, +233 prefix).
 * Used to match orders regardless of how the number was stored.
 */
export function generatePhoneVariants(raw: string): string[] {
  const local = normalizePhone(raw);
  if (!local) return [];

  const digits9 = local.slice(1); // 9-digit without leading 0
  const e164 = "+233" + digits9;  // +233241234567
  const intl  = "233" + digits9;  // 233241234567

  // Return all plausible representations
  return Array.from(new Set([local, e164, intl, digits9]));
}
