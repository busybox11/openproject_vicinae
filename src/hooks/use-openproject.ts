import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  nextCollectionPage,
  OpenProjectClient,
} from "../api/client";
import type { Collection, FilterObject, QueryWithResults } from "../types";
import { getPrefs } from "../preferences";

export function useClient() {
  const prefs = useMemo(() => getPrefs(), []);
  const client = useMemo(() => new OpenProjectClient(prefs), [prefs]);
  return { client, prefs };
}

function flattenPages<T>(
  pages: Array<Collection<T>> | undefined,
): { items: T[]; total: number } {
  const items = pages?.flatMap((page) => page._embedded.elements) ?? [];
  const total = pages?.[0]?.total ?? items.length;
  return { items, total };
}

export function useWorkPackages(filters: FilterObject[], key: string) {
  const { client } = useClient();
  const query = useInfiniteQuery({
    queryKey: ["work-packages", key, filters],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      client.listWorkPackages({ filters, offset: pageParam }),
    getNextPageParam: (lastPage) => nextCollectionPage(lastPage),
  });

  const { items, total } = flattenPages(query.data?.pages);

  return {
    ...query,
    items,
    total,
    hasMore: query.hasNextPage ?? false,
    loadMore: async () => {
      if (query.hasNextPage) await query.fetchNextPage();
    },
  };
}

export function useProjects(filters: FilterObject[], key: string) {
  const { client } = useClient();
  const query = useInfiniteQuery({
    queryKey: ["projects", key, filters],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      client.listProjects({ filters, offset: pageParam }),
    getNextPageParam: (lastPage) => nextCollectionPage(lastPage),
  });

  const { items, total } = flattenPages(query.data?.pages);

  return {
    ...query,
    items,
    total,
    hasMore: query.hasNextPage ?? false,
    loadMore: async () => {
      if (query.hasNextPage) await query.fetchNextPage();
    },
  };
}

export function useQueries(filters: FilterObject[] = [], key = "all") {
  const { client } = useClient();
  const query = useInfiniteQuery({
    queryKey: ["queries", key, filters],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      client.listQueries({ filters, offset: pageParam }),
    getNextPageParam: (lastPage) => nextCollectionPage(lastPage),
  });

  const { items, total } = flattenPages(query.data?.pages);
  const sorted = useMemo(
    () =>
      [...items].sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
      ),
    [items],
  );

  return {
    ...query,
    items: sorted,
    total,
    hasMore: query.hasNextPage ?? false,
    loadMore: async () => {
      if (query.hasNextPage) await query.fetchNextPage();
    },
  };
}

export function useQueryResults(queryId: number) {
  const { client } = useClient();
  const query = useInfiniteQuery({
    queryKey: ["query", queryId],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      client.getQuery(queryId, { offset: pageParam }),
    getNextPageParam: (lastPage: QueryWithResults) => {
      const results = lastPage._embedded?.results;
      return results ? nextCollectionPage(results) : undefined;
    },
  });

  const items =
    query.data?.pages.flatMap(
      (page) => page._embedded?.results?._embedded.elements ?? [],
    ) ?? [];
  const total = query.data?.pages[0]?._embedded?.results?.total ?? items.length;

  return {
    ...query,
    items,
    total,
    hasMore: query.hasNextPage ?? false,
    loadMore: async () => {
      if (query.hasNextPage) await query.fetchNextPage();
    },
  };
}

export function useWorkPackage(id: number | undefined) {
  const { client } = useClient();
  return useQuery({
    queryKey: ["work-package", id],
    queryFn: () => client.getWorkPackage(id!),
    enabled: id !== undefined && Number.isFinite(id) && id > 0,
  });
}
