import { fsGet, fsSet } from "./firestore-rest";

export const DEFAULT_MAINTENANCE_MESSAGE =
  "Oops, sorry…We are making a few changes for a better experience. Sorry for any inconvenience.";

export type MaintenanceState = {
  enabled: boolean;
  message: string;
  updatedAt: string;
  source: "firestore" | "env" | "default";
};

const MAINTENANCE_CACHE_TTL_MS = 15_000;
let maintenanceCache: { state: MaintenanceState; expiresAt: number } | null = null;

function normalizeMaintenanceState(raw: Partial<MaintenanceState> | null | undefined): MaintenanceState {
  const message =
    typeof raw?.message === "string" && raw.message.trim().length > 0
      ? raw.message.trim()
      : DEFAULT_MAINTENANCE_MESSAGE;

  return {
    enabled: raw?.enabled === true,
    message,
    updatedAt: typeof raw?.updatedAt === "string" ? raw.updatedAt : new Date().toISOString(),
    source: "firestore",
  };
}

function readEnvOverride(): MaintenanceState | null {
  const envValue = process.env.MAINTENANCE_MODE?.trim().toLowerCase();
  if (!envValue || (envValue !== "on" && envValue !== "off")) {
    return null;
  }

  const message = (process.env.MAINTENANCE_MESSAGE || DEFAULT_MAINTENANCE_MESSAGE).trim();

  return {
    enabled: envValue === "on",
    message: message || DEFAULT_MAINTENANCE_MESSAGE,
    updatedAt: new Date().toISOString(),
    source: "env",
  };
}

export async function getMaintenanceState(forceRefresh = false): Promise<MaintenanceState> {
  const envOverride = readEnvOverride();
  if (envOverride) {
    return envOverride;
  }

  const now = Date.now();
  if (!forceRefresh && maintenanceCache && maintenanceCache.expiresAt > now) {
    return maintenanceCache.state;
  }

  try {
    const doc = await fsGet("settings", "maintenance");
    const state = normalizeMaintenanceState(doc ?? null);
    maintenanceCache = { state, expiresAt: now + MAINTENANCE_CACHE_TTL_MS };
    return state;
  } catch {
    const fallback: MaintenanceState = {
      enabled: false,
      message: DEFAULT_MAINTENANCE_MESSAGE,
      updatedAt: new Date().toISOString(),
      source: "default",
    };
    maintenanceCache = { state: fallback, expiresAt: now + MAINTENANCE_CACHE_TTL_MS };
    return fallback;
  }
}

export async function isMaintenanceModeEnabled(): Promise<boolean> {
  return (await getMaintenanceState()).enabled;
}

export async function setMaintenanceState(input: { enabled?: boolean; message?: string }): Promise<MaintenanceState> {
  const current = await getMaintenanceState(true);
  const nextState: MaintenanceState = {
    enabled: typeof input.enabled === "boolean" ? input.enabled : current.enabled,
    message:
      typeof input.message === "string" && input.message.trim().length > 0
        ? input.message.trim()
        : current.message,
    updatedAt: new Date().toISOString(),
    source: "firestore",
  };

  await fsSet("settings", "maintenance", nextState, true);
  maintenanceCache = { state: nextState, expiresAt: Date.now() + MAINTENANCE_CACHE_TTL_MS };
  return nextState;
}

export function clearMaintenanceCache() {
  maintenanceCache = null;
}

export function parseMaintenanceCookie(_rawValue: string | null | undefined): MaintenanceState | null {
  return null;
}

export function makeMaintenanceCookieValue(state: MaintenanceState) {
  return JSON.stringify({
    enabled: Boolean(state.enabled),
    message: state.message || DEFAULT_MAINTENANCE_MESSAGE,
    updatedAt: state.updatedAt || new Date().toISOString(),
  });
}

export function readMaintenanceStateFromCookie(_rawValue: string | null | undefined): MaintenanceState {
  return {
    enabled: true,
    message: DEFAULT_MAINTENANCE_MESSAGE,
    updatedAt: new Date().toISOString(),
    source: "default",
  };
}
