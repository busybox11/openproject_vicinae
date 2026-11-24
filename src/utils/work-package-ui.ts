import { Color, Icon } from "@vicinae/api";
import type { WorkPackage } from "../types";

export function typeIcon(type?: string): {
  source: Icon;
  tintColor: Color;
} {
  const lower = (type ?? "").toLowerCase();
  if (lower.includes("bug") || lower.includes("defect")) {
    return { source: Icon.Bug, tintColor: Color.Red };
  }
  if (lower.includes("feature") || lower.includes("epic")) {
    return { source: Icon.LightBulb, tintColor: Color.Orange };
  }
  if (lower.includes("story") || lower.includes("user story")) {
    return { source: Icon.Bookmark, tintColor: Color.Green };
  }
  if (lower.includes("milestone")) {
    return { source: Icon.Flag, tintColor: Color.Purple };
  }
  if (lower.includes("phase")) {
    return { source: Icon.Bolt, tintColor: Color.Purple };
  }
  if (lower.includes("task")) {
    return { source: Icon.Ticket, tintColor: Color.Blue };
  }
  return { source: Icon.BulletPoints, tintColor: Color.Blue };
}

export function priorityIcon(priority?: string): {
  source: Icon;
  tintColor: Color;
} | null {
  if (!priority) return null;
  const lower = priority.toLowerCase();
  if (
    lower.includes("immediate") ||
    lower.includes("urgent") ||
    lower.includes("high") ||
    lower.includes("critical")
  ) {
    return { source: Icon.ArrowUp, tintColor: Color.Orange };
  }
  if (lower.includes("low")) {
    return { source: Icon.ArrowDown, tintColor: Color.Blue };
  }
  return { source: Icon.Minus, tintColor: Color.Yellow };
}

export function relativeUpdated(updatedAt?: string): string | undefined {
  if (!updatedAt) return undefined;
  const then = new Date(updatedAt).getTime();
  if (!Number.isFinite(then)) return undefined;
  const seconds = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo`;
  return `${Math.floor(months / 12)}y`;
}

export function groupByStatus(items: WorkPackage[]): Array<{
  title: string;
  subtitle: string;
  items: WorkPackage[];
}> {
  const order: string[] = [];
  const map = new Map<string, WorkPackage[]>();

  for (const wp of items) {
    const key = wp._links.status?.title ?? "Unknown";
    if (!map.has(key)) {
      map.set(key, []);
      order.push(key);
    }
    map.get(key)!.push(wp);
  }

  return order.map((title) => {
    const group = map.get(title)!;
    return {
      title,
      subtitle:
        group.length === 1 ? "1 work package" : `${group.length} work packages`,
      items: group,
    };
  });
}
