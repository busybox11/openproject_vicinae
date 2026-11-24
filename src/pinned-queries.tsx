import { List } from "@vicinae/api";
import { useQuery } from "@tanstack/react-query";
import { ErrorEmptyView } from "./components/ErrorEmptyView";
import { SavedQueryListItem } from "./components/SavedQueryListItem";
import { useClient } from "./hooks/use-openproject";
import { usePinnedQueries } from "./hooks/use-pinned-queries";
import type { Query } from "./types";
import { withQuery } from "./with-query";

function PinnedQueries() {
  const { client } = useClient();
  const { pinnedIds, isPinned, togglePinned, ready } = usePinnedQueries(
    client.instanceUrl,
  );

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["pinned-query-details", client.instanceUrl, pinnedIds],
    enabled: ready && pinnedIds.length > 0,
    queryFn: async () => {
      const pages = await Promise.all(
        pinnedIds.map((id) => client.getQuery(id, { pageSize: 1 })),
      );
      return pages as Query[];
    },
  });

  const items = data ?? [];

  return (
    <List
      isLoading={!ready || isLoading}
      searchBarPlaceholder="Filter pinned queries…"
    >
      {!ready ? null : pinnedIds.length === 0 ? (
        <ErrorEmptyView
          title="No pinned queries"
          description="Pin queries from Saved Queries (Ctrl+Shift+P), then reopen this command."
        />
      ) : error ? (
        <ErrorEmptyView
          title="Failed to load pinned queries"
          description={error.message}
          onRetry={() => refetch()}
        />
      ) : items.length === 0 && !isLoading ? (
        <ErrorEmptyView
          title="Pinned queries unavailable"
          description="Those pins may have been deleted in OpenProject."
        />
      ) : (
        <List.Section title={`${items.length} pinned`}>
          {items.map((query) => (
            <SavedQueryListItem
              key={query.id}
              query={query}
              instanceUrl={client.instanceUrl}
              pinned={isPinned(query.id)}
              onTogglePinned={togglePinned}
            />
          ))}
        </List.Section>
      )}
    </List>
  );
}

export default withQuery(PinnedQueries);
