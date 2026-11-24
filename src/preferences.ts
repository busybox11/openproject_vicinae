import { getPreferenceValues } from "@vicinae/api";
import type { Preferences, StatusFilter } from "./types";

function sanitize(value?: string): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeInstanceUrl(raw: string): string {
  const trimmed = raw.trim().replace(/\/+$/, "");
  if (!trimmed) {
    throw new Error("Instance URL is required");
  }
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

function parsePageSize(raw: string | undefined, fallback: number): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(100, Math.floor(n));
}

function parseStatusFilter(raw: string | undefined): StatusFilter {
  switch (raw) {
    case "closed":
    case "all":
    case "open":
      return raw;
    default:
      return "open";
  }
}

export type ResolvedPreferences = {
  instanceUrl: string;
  apiToken: string;
  defaultProjectId?: string;
  defaultStatusFilter: StatusFilter;
  pageSize: number;
};

export function getPrefs(): ResolvedPreferences {
  const raw = getPreferenceValues<Preferences>();
  const apiToken = sanitize(raw.apiToken);
  if (!apiToken) {
    throw new Error("API token is required");
  }

  return {
    instanceUrl: normalizeInstanceUrl(raw.instanceUrl),
    apiToken,
    defaultProjectId: sanitize(raw.defaultProjectId),
    defaultStatusFilter: parseStatusFilter(raw.defaultStatusFilter),
    pageSize: parsePageSize(raw.pageSize, 50),
  };
}
