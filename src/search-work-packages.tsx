import { List } from "@vicinae/api";
import { useMemo, useState } from "react";
import {
  mergeFilters,
  projectFilter,
  statusFilter,
  subjectOrIdFilter,
} from "./api/filters";
import { ErrorEmptyView } from "./components/ErrorEmptyView";
import { WorkPackageSections } from "./components/WorkPackageSections";
import { useClient, useWorkPackages } from "./hooks/use-openproject";
import { useDebouncedValue } from "./hooks/useDebouncedValue";
import type { StatusFilter } from "./types";
import { withQuery } from "./with-query";

function SearchWorkPackages() {
  const { client, prefs } = useClient();
  const [searchText, setSearchText] = useState("");
  const [status, setStatus] = useState<StatusFilter>(prefs.defaultStatusFilter);
  const debounced = useDebouncedValue(searchText, 300);

  const filters = useMemo(
    () =>
      mergeFilters(
        statusFilter(status),
        prefs.defaultProjectId
          ? projectFilter(prefs.defaultProjectId)
          : null,
        debounced.trim() ? subjectOrIdFilter(debounced.trim()) : null,
      ),
    [status, prefs.defaultProjectId, debounced],
  );

  const { data, isLoading, isFetching, error, refetch } = useWorkPackages(
    filters,
    `search:${status}:${prefs.defaultProjectId ?? ""}:${debounced}`,
  );

  const items = data?._embedded.elements ?? [];

  return (
    <List
      isLoading={isLoading || isFetching}
      searchText={searchText}
      onSearchTextChange={setSearchText}
      throttle
      searchBarPlaceholder="Filter by id, subject, status, type, assignee or priority…"
      searchBarAccessory={
        <List.Dropdown
          tooltip="Status"
          value={status}
          onChange={(value) => setStatus(value as StatusFilter)}
        >
          <List.Dropdown.Item title="Open" value="open" />
          <List.Dropdown.Item title="Closed" value="closed" />
          <List.Dropdown.Item title="All" value="all" />
        </List.Dropdown>
      }
    >
      {error ? (
        <ErrorEmptyView
          title="Failed to load work packages"
          description={error.message}
          onRetry={() => refetch()}
        />
      ) : items.length === 0 && !isLoading ? (
        <ErrorEmptyView
          title="No work packages found"
          description={
            prefs.defaultProjectId
              ? `No matches (project filter: ${prefs.defaultProjectId}).`
              : "Try a different search or status filter."
          }
        />
      ) : (
        <WorkPackageSections
          items={items}
          instanceUrl={client.instanceUrl}
        />
      )}
    </List>
  );
}

export default withQuery(SearchWorkPackages);
