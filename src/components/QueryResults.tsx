import { List } from "@vicinae/api";
import { ErrorEmptyView } from "./ErrorEmptyView";
import { WorkPackageSections } from "./WorkPackageSections";
import { useClient, useQueryResults } from "../hooks/use-openproject";
import type { Query } from "../types";
import { withQuery } from "../with-query";

function QueryResults({ query }: { query: Query }) {
  const { client } = useClient();
  const {
    items,
    total,
    isLoading,
    isFetchingNextPage,
    error,
    refetch,
    hasMore,
    loadMore,
  } = useQueryResults(query.id);

  return (
    <List
      isLoading={isLoading || isFetchingNextPage}
      navigationTitle={query.name}
      searchBarPlaceholder="Filter results locally…"
      pagination={{ hasMore, onLoadMore: loadMore }}
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
        <WorkPackageSections
          items={items}
          instanceUrl={client.instanceUrl}
          total={total}
        />
      )}
    </List>
  );
}

export const QueryResultsView = withQuery(QueryResults);
