import { Color } from "@vicinae/api";

export function statusColor(title?: string): Color {
  if (!title) return Color.SecondaryText;
  const lower = title.toLowerCase();
  if (lower.includes("new") || lower.includes("to do")) return Color.Blue;
  if (lower.includes("progress") || lower.includes("develop"))
    return Color.Orange;
  if (lower.includes("review") || lower.includes("test")) return Color.Purple;
  if (
    lower.includes("closed") ||
    lower.includes("done") ||
    lower.includes("rejected")
  )
    return Color.Green;
  return Color.SecondaryText;
}
