import { List } from "@vicinae/api";
import { useMemo, useState } from "react";
import {
  globalProjectFilter,
  mergeFilters,
  projectFilter,
} from "./api/filters";
import { ErrorEmptyView } from "./components/ErrorEmptyView";
import { SavedQueryListItem } from "./components/SavedQueryListItem";
import { usePersistedValue } from "./hooks/use-persisted-value";
import { usePinnedQueries } from "./hooks/use-pinned-queries";
import { useProjectOptions } from "./hooks/use-project-options";
import { useClient, useQueries } from "./hooks/use-openproject";
import { useDebouncedValue } from "./hooks/useDebouncedValue";
import type { FilterObject, Query } from "./types";
import { withQuery } from "./with-query";

function SavedQueries() {
  const { client, prefs } = useClient();
  const [searchText, setSearchText] = useState("");
  const [scope, setScope] = usePersistedValue<string>(
    `saved-queries-scope:${client.instanceUrl}`,
    prefs.defaultProjectId ? `project:${prefs.defaultProjectId}` : "all",
  );
  const debounced = useDebouncedValue(searchText, 200);
  const { pinnedIds, isPinned, togglePinned } = usePinnedQueries(
    client.instanceUrl,
  );
  const { data: projects = [], isLoading: projectsLoading } =
    useProjectOptions();

  const filters = useMemo((): FilterObject[] => {
    if (scope === "all") return [];
    if (scope === "global") return mergeFilters(globalProjectFilter());
    if (scope.startsWith("project:")) {
      const id = scope.slice("project:".length);
      return id ? mergeFilters(projectFilter(id)) : [];
    }
    return [];
  }, [scope]);

  const {
    items: allItems,
    total,
    isLoading,
    isFetchingNextPage,
    error,
    refetch,
    hasMore,
    loadMore,
  } = useQueries(filters, scope);

  const items = useMemo(() => {
    if (!debounced.trim()) return allItems;
    const q = debounced.trim().toLowerCase();
    return allItems.filter((item) => {
      const project = item._links.project?.title?.toLowerCase() ?? "";
      return (
        item.name.toLowerCase().includes(q) ||
        project.includes(q) ||
        String(item.id).includes(q) ||
        (project.length === 0 && "global".includes(q))
      );
    });
  }, [allItems, debounced]);

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

  return (
    <List
      isLoading={isLoading || isFetchingNextPage || projectsLoading}
      searchText={searchText}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Filter by name, project or id…"
      searchBarAccessory={
        <List.Dropdown tooltip="Scope" value={scope} onChange={setScope}>
          <List.Dropdown.Item title="All queries" value="all" />
          <List.Dropdown.Item title="Global only" value="global" />
          <List.Dropdown.Section title="Projects">
            {projects.map((project) => (
              <List.Dropdown.Item
                key={project.id}
                title={project.name}
                value={`project:${project.id}`}
                keywords={[project.identifier, String(project.id)]}
              />
            ))}
          </List.Dropdown.Section>
        </List.Dropdown>
      }
      pagination={{ hasMore, onLoadMore: loadMore }}
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
          {total > allItems.length ? (
            <List.Section title={`Showing ${allItems.length} of ${total}`} />
          ) : null}
          {pinned.length > 0 ? (
            <List.Section title="Pinned">
              {pinned.map((query) => (
                <SavedQueryListItem
                  key={query.id}
                  query={query}
                  instanceUrl={client.instanceUrl}
                  pinned
                  onTogglePinned={togglePinned}
                />
              ))}
            </List.Section>
          ) : null}
          <List.Section title={pinned.length > 0 ? "All queries" : "Queries"}>
            {unpinned.map((query) => (
              <SavedQueryListItem
                key={query.id}
                query={query}
                instanceUrl={client.instanceUrl}
                pinned={false}
                onTogglePinned={togglePinned}
              />
            ))}
          </List.Section>
        </>
      )}
    </List>
  );
}

export default withQuery(SavedQueries);
