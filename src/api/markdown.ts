import type { WorkPackage } from "../types";
import { workPackageUrl } from "./urls";

export function workPackageMarkdownLink(
  instanceUrl: string,
  wp: WorkPackage,
): string {
  return `[#${wp.id} ${wp.subject}](${workPackageUrl(instanceUrl, wp)})`;
}

export function workPackageDetailMarkdown(wp: WorkPackage): string {
  const description =
    wp.description?.raw?.trim() ||
    "_No description._";
  return `# #${wp.id} ${wp.subject}\n\n${description}`;
}
