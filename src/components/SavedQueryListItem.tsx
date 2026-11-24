import { Action, ActionPanel, Icon, List, useNavigation } from "@vicinae/api";
import { queryUrl } from "../api/urls";
import type { Query } from "../types";
import { QueryResultsView } from "./QueryResults";

type Props = {
  query: Query;
  instanceUrl: string;
  pinned: boolean;
  onTogglePinned: (id: number) => void;
};

export function SavedQueryListItem({
  query,
  instanceUrl,
  pinned,
  onTogglePinned,
}: Props) {
  const { push } = useNavigation();
  const url = queryUrl(instanceUrl, query.id);
  const project = query._links.project?.title;

  return (
    <List.Item
      id={String(query.id)}
      title={query.name}
      subtitle={project ?? "Global"}
      icon={pinned ? Icon.Star : Icon.AppWindowList}
      keywords={[String(query.id), project ?? "global"]}
      accessories={[
        ...(pinned ? [{ tag: { value: "Pinned" } }] : []),
        ...(query.public ? [{ tag: { value: "Public" } }] : []),
        { text: `#${query.id}` },
      ]}
      actions={
        <ActionPanel>
          <Action
            title="Open Query Results"
            icon={Icon.Eye}
            onAction={() => push(<QueryResultsView query={query} />)}
          />
          <Action
            title={pinned ? "Unpin Query" : "Pin Query"}
            icon={pinned ? Icon.StarDisabled : Icon.Star}
            shortcut={{ modifiers: ["ctrl", "shift"], key: "p" }}
            onAction={() => onTogglePinned(query.id)}
          />
          <Action.OpenInBrowser title="Open in Browser" url={url} />
          <Action.CopyToClipboard title="Copy URL" content={url} />
        </ActionPanel>
      }
    />
  );
}
