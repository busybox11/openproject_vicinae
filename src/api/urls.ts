import type { Project, WorkPackage } from "../types";

export function workPackageUrl(
  instanceUrl: string,
  wp: WorkPackage,
): string {
  return `${instanceUrl}/work_packages/${wp.id}`;
}

export function projectUrl(instanceUrl: string, project: Project): string {
  return `${instanceUrl}/projects/${project.identifier}`;
}

export function queryUrl(instanceUrl: string, queryId: number): string {
  return `${instanceUrl}/work_packages?query_id=${queryId}`;
}
