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

const STATUS_RANK: Array<{ match: RegExp; rank: number }> = [
  { match: /^(new|to\s*do|open|created|backlog)$/i, rank: 10 },
  { match: /spec|clarif|ready/i, rank: 20 },
  { match: /progress|develop|doing|wip/i, rank: 30 },
  { match: /review|feedback/i, rank: 40 },
  { match: /^test(ing)?$/i, rank: 50 },
  { match: /tested|qa\s*pass|verified/i, rank: 60 },
  { match: /deploy|release|staging/i, rank: 70 },
  { match: /blocked|on\s*hold|paused|waiting/i, rank: 80 },
  { match: /closed|done|resolved|rejected|cancelled|canceled/i, rank: 90 },
];

function statusRank(title: string): number {
  for (const entry of STATUS_RANK) {
    if (entry.match.test(title)) return entry.rank;
  }
  return 55;
}

export function groupByStatus(items: WorkPackage[]): Array<{
  title: string;
  subtitle: string;
  items: WorkPackage[];
}> {
  const map = new Map<string, WorkPackage[]>();

  for (const wp of items) {
    const key = wp._links.status?.title ?? "Unknown";
    const group = map.get(key);
    if (group) group.push(wp);
    else map.set(key, [wp]);
  }

  return [...map.entries()]
    .sort(([a], [b]) => {
      const rankDiff = statusRank(a) - statusRank(b);
      return rankDiff !== 0 ? rankDiff : a.localeCompare(b);
    })
    .map(([title, group]) => ({
      title,
      subtitle:
        group.length === 1 ? "1 work package" : `${group.length} work packages`,
      items: group,
    }));
}
