import fs from "node:fs";
import path from "node:path";

export const DEFAULT_MAINTENANCE_MESSAGE =
  "Oops, sorry… Play Ato is making a few changes for a better experience. Sorry for any inconvenience.";

export type MaintenanceState = {
  enabled: boolean;
  message: string;
  updatedAt: string;
  source: "file" | "env" | "default";
};

const CACHE_TTL_MS = 10_000;

let maintenanceCache: { state: MaintenanceState; expiresAt: number } | null = null;

function getMaintenancePath() {
  return path.join(process.cwd(), "data", "maintenance-state.json");
}

function makeDefaultState(source: MaintenanceState["source"] = "default"): MaintenanceState {
  return {
    enabled: true,
    message: DEFAULT_MAINTENANCE_MESSAGE,
    updatedAt: new Date().toISOString(),
    source,
  };
}

function ensureStateFile() {
  const filePath = getMaintenancePath();
  const directory = path.dirname(filePath);

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(makeDefaultState("file"), null, 2), "utf8");
  }
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

export function readMaintenanceState(forceRefresh = false): MaintenanceState {
  const envOverride = readEnvOverride();
  if (envOverride) {
    return envOverride;
  }

  const now = Date.now();
  if (!forceRefresh && maintenanceCache && maintenanceCache.expiresAt > now) {
    return maintenanceCache.state;
  }

  try {
    ensureStateFile();
    const filePath = getMaintenancePath();
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<MaintenanceState>;

    const state: MaintenanceState = {
      enabled: parsed.enabled === true,
      message:
        typeof parsed.message === "string" && parsed.message.trim().length > 0
          ? parsed.message.trim()
          : DEFAULT_MAINTENANCE_MESSAGE,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date().toISOString(),
      source: "file",
    };

    maintenanceCache = { state, expiresAt: now + CACHE_TTL_MS };
    return state;
  } catch {
    const fallback = makeDefaultState("default");
    maintenanceCache = { state: fallback, expiresAt: now + CACHE_TTL_MS };
    return fallback;
  }
}

export function getMaintenanceState(): MaintenanceState {
  return readMaintenanceState();
}

export function isMaintenanceModeEnabled(): boolean {
  return readMaintenanceState().enabled;
}

export function setMaintenanceState(input: { enabled?: boolean; message?: string }): MaintenanceState {
  const current = readMaintenanceState(true);
  const nextState: MaintenanceState = {
    enabled: typeof input.enabled === "boolean" ? input.enabled : current.enabled,
    message:
      typeof input.message === "string" && input.message.trim().length > 0
        ? input.message.trim()
        : current.message,
    updatedAt: new Date().toISOString(),
    source: "file",
  };

  const filePath = getMaintenancePath();
  ensureStateFile();
  fs.writeFileSync(filePath, JSON.stringify(nextState, null, 2), "utf8");

  maintenanceCache = { state: nextState, expiresAt: Date.now() + CACHE_TTL_MS };
  return nextState;
}

export function clearMaintenanceCache() {
  maintenanceCache = null;
}
