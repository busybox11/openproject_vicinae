import type { FilterObject, StatusFilter } from "../types";

export function statusFilter(status: StatusFilter): FilterObject | null {
  switch (status) {
    case "open":
      return { status: { operator: "o", values: [] } };
    case "closed":
      return { status: { operator: "c", values: [] } };
    case "all":
      return null;
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

export function assigneeMeFilter(): FilterObject {
  return { assignee: { operator: "=", values: ["me"] } };
}

export function projectFilter(projectId: string): FilterObject {
  return { project: { operator: "=", values: [projectId] } };
}

export function globalProjectFilter(): FilterObject {
  return { project: { operator: "!*", values: [] } };
}

export function subjectOrIdFilter(query: string): FilterObject {
  return { subjectOrId: { operator: "**", values: [query] } };
}

export function nameAndIdentifierFilter(query: string): FilterObject {
  return { name_and_identifier: { operator: "**", values: [query] } };
}

export function mergeFilters(
  ...parts: Array<FilterObject | null | undefined>
): FilterObject[] {
  const out: FilterObject[] = [];
  for (const part of parts) {
    if (!part) continue;
    for (const [name, value] of Object.entries(part)) {
      out.push({ [name]: value });
    }
  }
  return out;
}
