import { List } from "@vicinae/api";
import { useMemo, useState } from "react";
import {
  mergeFilters,
  projectFilter,
  statusFilter,
  subjectOrIdFilter,
} from "../api/filters";
import { useClient, useWorkPackages } from "../hooks/use-openproject";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { usePersistedValue } from "../hooks/use-persisted-value";
import type { Project, StatusFilter } from "../types";
import { withQuery } from "../with-query";
import { ErrorEmptyView } from "./ErrorEmptyView";
import { WorkPackageSections } from "./WorkPackageSections";

function ProjectWorkPackages({ project }: { project: Project }) {
  const { client } = useClient();
  const [searchText, setSearchText] = useState("");
  const [status, setStatus] = usePersistedValue<StatusFilter>(
    `project-wp-status:${client.instanceUrl}`,
    "open",
  );
  const debounced = useDebouncedValue(searchText, 300);

  const filters = useMemo(
    () =>
      mergeFilters(
        projectFilter(String(project.id)),
        statusFilter(status),
        debounced.trim() ? subjectOrIdFilter(debounced.trim()) : null,
      ),
    [project.id, status, debounced],
  );

  const {
    items,
    total,
    isLoading,
    isFetchingNextPage,
    error,
    refetch,
    hasMore,
    loadMore,
  } = useWorkPackages(
    filters,
    `project:${project.id}:${status}:${debounced}`,
  );

  return (
    <List
      isLoading={isLoading || isFetchingNextPage}
      navigationTitle={project.name}
      searchText={searchText}
      onSearchTextChange={setSearchText}
      throttle
      searchBarPlaceholder="Filter work packages…"
      searchBarAccessory={
        <List.Dropdown
          tooltip="Status"
          value={status}
          onChange={(value) => setStatus(value as StatusFilter)}
          storeValue={false}
        >
          <List.Dropdown.Item title="Open" value="open" />
          <List.Dropdown.Item title="Closed" value="closed" />
          <List.Dropdown.Item title="All" value="all" />
        </List.Dropdown>
      }
      pagination={{ hasMore, onLoadMore: loadMore }}
    >
      {error ? (
        <ErrorEmptyView
          title="Failed to load work packages"
          description={error.message}
          onRetry={() => refetch()}
        />
      ) : items.length === 0 && !isLoading ? (
        <ErrorEmptyView title="No work packages in this project" />
      ) : (
        <WorkPackageSections
          items={items}
          instanceUrl={client.instanceUrl}
          total={total}
        />
      )}
    </List>
  );
}

export const ProjectWorkPackagesView = withQuery(ProjectWorkPackages);
