import { Action, ActionPanel, Color, Detail, Icon } from "@vicinae/api";
import { workPackageDetailMarkdown, workPackageMarkdownLink } from "../api/markdown";
import { workPackageUrl } from "../api/urls";
import type { WorkPackage } from "../types";
import { statusColor } from "../utils/status-color";

type Props = {
  wp: WorkPackage;
  instanceUrl: string;
  isLoading?: boolean;
};

export function WorkPackageDetail({ wp, instanceUrl, isLoading }: Props) {
  const url = workPackageUrl(instanceUrl, wp);
  const markdownLink = workPackageMarkdownLink(instanceUrl, wp);
  const status = wp._links.status?.title;
  const type = wp._links.type?.title;
  const project = wp._links.project?.title;
  const assignee = wp._links.assignee?.title;
  const priority = wp._links.priority?.title;

  return (
    <Detail
      isLoading={isLoading}
      navigationTitle={`#${wp.id}`}
      markdown={workPackageDetailMarkdown(wp)}
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Label title="ID" text={`#${wp.id}`} />
          {project ? (
            <Detail.Metadata.Label title="Project" text={project} />
          ) : null}
          {type ? (
            <Detail.Metadata.Label
              title="Type"
              text={{ value: type, color: Color.Blue }}
            />
          ) : null}
          {status ? (
            <Detail.Metadata.Label
              title="Status"
              text={{ value: status, color: statusColor(status) }}
            />
          ) : null}
          {priority ? (
            <Detail.Metadata.Label
              title="Priority"
              text={{ value: priority, color: Color.Orange }}
            />
          ) : null}
          <Detail.Metadata.Separator />
          <Detail.Metadata.Label
            title="Assignee"
            text={assignee ?? "Unassigned"}
            icon={Icon.Person}
          />
          {wp._links.author?.title ? (
            <Detail.Metadata.Label
              title="Author"
              text={wp._links.author.title}
            />
          ) : null}
          <Detail.Metadata.Separator />
          <Detail.Metadata.Link
            title="OpenProject"
            target={url}
            text="Open in browser"
          />
        </Detail.Metadata>
      }
      actions={
        <ActionPanel>
          <Action.OpenInBrowser title="Open in Browser" url={url} />
          <Action.CopyToClipboard title="Copy URL" content={url} />
          <Action.CopyToClipboard
            title="Copy Markdown Link"
            content={markdownLink}
            shortcut={{ modifiers: ["ctrl", "shift"], key: "c" }}
          />
          <Action.CopyToClipboard
            title="Copy ID"
            content={String(wp.id)}
            shortcut={{ modifiers: ["ctrl"], key: "c" }}
          />
          <Action.CopyToClipboard title="Copy Subject" content={wp.subject} />
        </ActionPanel>
      }
    />
  );
}
