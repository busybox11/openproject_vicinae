import { List } from "@vicinae/api";
import { useMemo, useState } from "react";
import { mergeFilters, projectFilter } from "../api/filters";
import { useClient, useQueries } from "../hooks/use-openproject";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { usePinnedQueries } from "../hooks/use-pinned-queries";
import type { Project, Query } from "../types";
import { withQuery } from "../with-query";
import { ErrorEmptyView } from "./ErrorEmptyView";
import { SavedQueryListItem } from "./SavedQueryListItem";

function ProjectQueries({ project }: { project: Project }) {
  const { client } = useClient();
  const [searchText, setSearchText] = useState("");
  const debounced = useDebouncedValue(searchText, 200);
  const { pinnedIds, isPinned, togglePinned } = usePinnedQueries(
    client.instanceUrl,
  );

  const filters = useMemo(
    () => mergeFilters(projectFilter(String(project.id))),
    [project.id],
  );

  const {
    items: allItems,
    total,
    isLoading,
    isFetchingNextPage,
    error,
    refetch,
    hasMore,
    loadMore,
  } = useQueries(filters, `project-queries:${project.id}`);

  const items = useMemo(() => {
    if (!debounced.trim()) return allItems;
    const q = debounced.trim().toLowerCase();
    return allItems.filter((item) => item.name.toLowerCase().includes(q));
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
      isLoading={isLoading || isFetchingNextPage}
      navigationTitle={`${project.name} queries`}
      searchText={searchText}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Filter queries…"
      pagination={{ hasMore, onLoadMore: loadMore }}
    >
      {error ? (
        <ErrorEmptyView
          title="Failed to load queries"
          description={error.message}
          onRetry={() => refetch()}
        />
      ) : items.length === 0 && !isLoading ? (
        <ErrorEmptyView title="No saved queries for this project" />
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

export const ProjectQueriesView = withQuery(ProjectQueries);
