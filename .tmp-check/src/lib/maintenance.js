import { fsGet, fsSet } from "./firestore-rest";
export const DEFAULT_MAINTENANCE_MESSAGE = "Oops, sorry…We are making a few changes for a better experience. Sorry for any inconvenience.";
const MAINTENANCE_CACHE_TTL_MS = 15000;
let maintenanceCache = null;
function normalizeMaintenanceState(raw) {
    const message = typeof (raw === null || raw === void 0 ? void 0 : raw.message) === "string" && raw.message.trim().length > 0
        ? raw.message.trim()
        : DEFAULT_MAINTENANCE_MESSAGE;
    return {
        enabled: (raw === null || raw === void 0 ? void 0 : raw.enabled) === true,
        message,
        updatedAt: typeof (raw === null || raw === void 0 ? void 0 : raw.updatedAt) === "string" ? raw.updatedAt : new Date().toISOString(),
        source: "firestore",
    };
}
function readEnvOverride() {
    var _a;
    const envValue = (_a = process.env.MAINTENANCE_MODE) === null || _a === void 0 ? void 0 : _a.trim().toLowerCase();
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
export async function getMaintenanceState(forceRefresh = false) {
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
        const state = normalizeMaintenanceState(doc !== null && doc !== void 0 ? doc : null);
        maintenanceCache = { state, expiresAt: now + MAINTENANCE_CACHE_TTL_MS };
        return state;
    }
    catch (_a) {
        const fallback = {
            enabled: false,
            message: DEFAULT_MAINTENANCE_MESSAGE,
            updatedAt: new Date().toISOString(),
            source: "default",
        };
        maintenanceCache = { state: fallback, expiresAt: now + MAINTENANCE_CACHE_TTL_MS };
        return fallback;
    }
}
export async function isMaintenanceModeEnabled() {
    return (await getMaintenanceState()).enabled;
}
export async function setMaintenanceState(input) {
    const current = await getMaintenanceState(true);
    const nextState = {
        enabled: typeof input.enabled === "boolean" ? input.enabled : current.enabled,
        message: typeof input.message === "string" && input.message.trim().length > 0
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
export function parseMaintenanceCookie(_rawValue) {
    return null;
}
export function makeMaintenanceCookieValue(state) {
    return JSON.stringify({
        enabled: Boolean(state.enabled),
        message: state.message || DEFAULT_MAINTENANCE_MESSAGE,
        updatedAt: state.updatedAt || new Date().toISOString(),
    });
}
export function readMaintenanceStateFromCookie(_rawValue) {
    return {
        enabled: true,
        message: DEFAULT_MAINTENANCE_MESSAGE,
        updatedAt: new Date().toISOString(),
        source: "default",
    };
}
