import { Action, ActionPanel, Color, Icon, List, useNavigation } from "@vicinae/api";
import { workPackageMarkdownLink } from "../api/markdown";
import { workPackageUrl } from "../api/urls";
import type { WorkPackage } from "../types";
import { statusColor } from "../utils/status-color";
import {
  priorityIcon,
  relativeUpdated,
  typeIcon,
} from "../utils/work-package-ui";
import { WorkPackageDetail } from "./WorkPackageDetail";

type Props = {
  wp: WorkPackage;
  instanceUrl: string;
  hideAssignee?: boolean;
};

export function WorkPackageListItem({
  wp,
  instanceUrl,
  hideAssignee = false,
}: Props) {
  const { push } = useNavigation();
  const url = workPackageUrl(instanceUrl, wp);
  const markdownLink = workPackageMarkdownLink(instanceUrl, wp);
  const status = wp._links.status?.title;
  const type = wp._links.type?.title;
  const project = wp._links.project?.title;
  const assignee = wp._links.assignee?.title;
  const priority = wp._links.priority?.title;
  const typeVisual = typeIcon(type);
  const priorityVisual = priorityIcon(priority);
  const updated = relativeUpdated(wp.updatedAt);

  return (
    <List.Item
      id={String(wp.id)}
      title={wp.subject}
      subtitle={`#${wp.id}`}
      icon={{
        value: {
          source: typeVisual.source,
          tintColor: typeVisual.tintColor,
        },
        tooltip: type ? `Type: ${type}` : "Type",
      }}
      keywords={[
        String(wp.id),
        type ?? "",
        status ?? "",
        project ?? "",
        assignee ?? "",
        priority ?? "",
      ].filter(Boolean)}
      accessories={[
        ...(status
          ? [
              {
                text: {
                  value: status,
                  color: statusColor(status),
                },
                tooltip: `Status: ${status}`,
              },
            ]
          : []),
        ...(!hideAssignee
          ? [
              {
                icon: Icon.Person,
                tooltip: assignee
                  ? `Assignee: ${assignee}`
                  : "Assignee: Unassigned",
              },
            ]
          : []),
        ...(updated
          ? [
              {
                text: { value: updated, color: Color.SecondaryText },
                tooltip: wp.updatedAt
                  ? `Updated ${new Date(wp.updatedAt).toLocaleString()}`
                  : "Updated",
              },
            ]
          : []),
        ...(priorityVisual
          ? [
              {
                icon: {
                  source: priorityVisual.source,
                  tintColor: priorityVisual.tintColor,
                },
                tooltip: priority ? `Priority: ${priority}` : "Priority",
              },
            ]
          : []),
      ]}
      actions={
        <ActionPanel>
          <Action
            title="Show Detail"
            icon={Icon.Eye}
            onAction={() =>
              push(<WorkPackageDetail wp={wp} instanceUrl={instanceUrl} />)
            }
          />
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
