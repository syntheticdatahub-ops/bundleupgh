import { cookies } from "next/headers";

export const DEFAULT_MAINTENANCE_MESSAGE =
  "Oops, sorry…We are making a few changes for a better experience. Sorry for any inconvenience.";

export type MaintenanceState = {
  enabled: boolean;
  message: string;
  updatedAt: string;
  source: "cookie" | "env" | "default";
};

export function parseMaintenanceCookie(rawValue: string | null | undefined): MaintenanceState | null {
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<MaintenanceState>;
    const message =
      typeof parsed.message === "string" && parsed.message.trim().length > 0
        ? parsed.message.trim()
        : DEFAULT_MAINTENANCE_MESSAGE;

    return {
      enabled: parsed.enabled === true,
      message,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date().toISOString(),
      source: "cookie",
    };
  } catch {
    return null;
  }
}

export function makeMaintenanceCookieValue(state: MaintenanceState) {
  return JSON.stringify({
    enabled: Boolean(state.enabled),
    message: state.message || DEFAULT_MAINTENANCE_MESSAGE,
    updatedAt: state.updatedAt || new Date().toISOString(),
  });
}

export function readMaintenanceStateFromCookie(rawValue: string | null | undefined): MaintenanceState {
  const cookieState = parseMaintenanceCookie(rawValue);
  if (cookieState) {
    return cookieState;
  }

  return {
    enabled: true,
    message: DEFAULT_MAINTENANCE_MESSAGE,
    updatedAt: new Date().toISOString(),
    source: "default",
  };
}

export async function getMaintenanceState(): Promise<MaintenanceState> {
  const envValue = process.env.MAINTENANCE_MODE?.trim().toLowerCase();
  if (envValue === "on" || envValue === "off") {
    const message = (process.env.MAINTENANCE_MESSAGE || DEFAULT_MAINTENANCE_MESSAGE).trim();
    return {
      enabled: envValue === "on",
      message: message || DEFAULT_MAINTENANCE_MESSAGE,
      updatedAt: new Date().toISOString(),
      source: "env",
    };
  }

  try {
    const cookieStore = await cookies();
    return readMaintenanceStateFromCookie(cookieStore.get("maintenance_state")?.value ?? null);
  } catch {
    return {
      enabled: true,
      message: DEFAULT_MAINTENANCE_MESSAGE,
      updatedAt: new Date().toISOString(),
      source: "default",
    };
  }
}

export async function isMaintenanceModeEnabled(): Promise<boolean> {
  return (await getMaintenanceState()).enabled;
}

export function setMaintenanceState(input: { enabled?: boolean; message?: string }): MaintenanceState {
  const current = {
    enabled: true,
    message: DEFAULT_MAINTENANCE_MESSAGE,
    updatedAt: new Date().toISOString(),
    source: "default" as const,
  };

  return {
    enabled: typeof input.enabled === "boolean" ? input.enabled : current.enabled,
    message:
      typeof input.message === "string" && input.message.trim().length > 0
        ? input.message.trim()
        : current.message,
    updatedAt: new Date().toISOString(),
    source: "cookie",
  };
}

export function clearMaintenanceCache() {
  return;
}
