import { Action, ActionPanel, Icon, List, useNavigation } from "@vicinae/api";
import { useMemo, useState } from "react";
import {
  globalProjectFilter,
  mergeFilters,
  projectFilter,
} from "./api/filters";
import { queryUrl } from "./api/urls";
import { ErrorEmptyView } from "./components/ErrorEmptyView";
import { WorkPackageSections } from "./components/WorkPackageSections";
import { usePinnedQueries } from "./hooks/use-pinned-queries";
import {
  useClient,
  useQueries,
  useQueryResults,
} from "./hooks/use-openproject";
import { useDebouncedValue } from "./hooks/useDebouncedValue";
import type { FilterObject, Query } from "./types";
import { withQuery } from "./with-query";

type Scope = "all" | "global" | "default";

function QueryResults({ query }: { query: Query }) {
  const { client } = useClient();
  const { data, isLoading, isFetching, error, refetch } = useQueryResults(
    query.id,
  );

  const items = data?._embedded?.results?._embedded.elements ?? [];

  return (
    <List
      isLoading={isLoading || isFetching}
      navigationTitle={query.name}
      searchBarPlaceholder="Filter results locally…"
    >
      {error ? (
        <ErrorEmptyView
          title="Failed to run query"
          description={error.message}
          onRetry={() => refetch()}
        />
      ) : items.length === 0 && !isLoading ? (
        <ErrorEmptyView title="Query returned no work packages" />
      ) : (
        <WorkPackageSections items={items} instanceUrl={client.instanceUrl} />
      )}
    </List>
  );
}

const QueryResultsView = withQuery(QueryResults);

function SavedQueries() {
  const { client, prefs } = useClient();
  const { push } = useNavigation();
  const [searchText, setSearchText] = useState("");
  const [scope, setScope] = useState<Scope>("all");
  const debounced = useDebouncedValue(searchText, 200);
  const { pinnedIds, isPinned, togglePinned } = usePinnedQueries(
    client.instanceUrl,
  );

  const filters = useMemo((): FilterObject[] => {
    switch (scope) {
      case "global":
        return mergeFilters(globalProjectFilter());
      case "default":
        return prefs.defaultProjectId
          ? mergeFilters(projectFilter(prefs.defaultProjectId))
          : [];
      case "all":
        return [];
      default: {
        const _exhaustive: never = scope;
        return _exhaustive;
      }
    }
  }, [scope, prefs.defaultProjectId]);

  const { data, isLoading, isFetching, error, refetch } = useQueries(
    filters,
    scope,
  );

  const items = useMemo(() => {
    const all = data?._embedded.elements ?? [];
    if (!debounced.trim()) return all;
    const q = debounced.trim().toLowerCase();
    return all.filter((item) => {
      const project = item._links.project?.title?.toLowerCase() ?? "";
      return (
        item.name.toLowerCase().includes(q) ||
        project.includes(q) ||
        String(item.id).includes(q) ||
        (project.length === 0 && "global".includes(q))
      );
    });
  }, [data, debounced]);

  const pinned = useMemo(() => {
    const byId = new Map(items.map((q) => [q.id, q]));
    return pinnedIds
      .map((id) => byId.get(id))
      .filter((q): q is Query => q !== undefined);
  }, [items, pinnedIds]);

  const unpinned = useMemo(
    () => items.filter((q) => !isPinned(q.id)),
    [items, isPinned],
  );

  const renderQuery = (query: Query) => {
    const url = queryUrl(client.instanceUrl, query.id);
    const project = query._links.project?.title;
    const pinnedQuery = isPinned(query.id);
    return (
      <List.Item
        key={query.id}
        id={String(query.id)}
        title={query.name}
        subtitle={project ?? "Global"}
        icon={pinnedQuery ? Icon.Star : Icon.AppWindowList}
        keywords={[String(query.id), project ?? "global"]}
        accessories={[
          ...(pinnedQuery ? [{ tag: { value: "Pinned" } }] : []),
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
              title={pinnedQuery ? "Unpin Query" : "Pin Query"}
              icon={pinnedQuery ? Icon.StarDisabled : Icon.Star}
              shortcut={{ modifiers: ["ctrl", "shift"], key: "p" }}
              onAction={() => togglePinned(query.id)}
            />
            <Action.OpenInBrowser title="Open in Browser" url={url} />
            <Action.CopyToClipboard title="Copy URL" content={url} />
          </ActionPanel>
        }
      />
    );
  };

  return (
    <List
      isLoading={isLoading || isFetching}
      searchText={searchText}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Filter by name, project or id…"
      searchBarAccessory={
        <List.Dropdown
          tooltip="Scope"
          value={scope}
          onChange={(value) => setScope(value as Scope)}
        >
          <List.Dropdown.Item title="All queries" value="all" />
          <List.Dropdown.Item title="Global only" value="global" />
          {prefs.defaultProjectId ? (
            <List.Dropdown.Item
              title={`Project ${prefs.defaultProjectId}`}
              value="default"
            />
          ) : null}
        </List.Dropdown>
      }
    >
      {error ? (
        <ErrorEmptyView
          title="Failed to load queries"
          description={error.message}
          onRetry={() => refetch()}
        />
      ) : items.length === 0 && !isLoading ? (
        <ErrorEmptyView
          title="No saved queries"
          description="Create a public or private query in OpenProject, then reopen this command."
        />
      ) : (
        <>
          {pinned.length > 0 ? (
            <List.Section title="Pinned">{pinned.map(renderQuery)}</List.Section>
          ) : null}
          <List.Section title={pinned.length > 0 ? "All queries" : "Queries"}>
            {unpinned.map(renderQuery)}
          </List.Section>
        </>
      )}
    </List>
  );
}

export default withQuery(SavedQueries);
