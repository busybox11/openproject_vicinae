import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { OpenProjectClient } from "../api/client";
import type { FilterObject } from "../types";
import { getPrefs } from "../preferences";

export function useClient() {
  const prefs = useMemo(() => getPrefs(), []);
  const client = useMemo(() => new OpenProjectClient(prefs), [prefs]);
  return { client, prefs };
}

export function useWorkPackages(filters: FilterObject[], key: string) {
  const { client } = useClient();
  return useQuery({
    queryKey: ["work-packages", key, filters],
    queryFn: () => client.listWorkPackages({ filters }),
  });
}

export function useProjects(filters: FilterObject[], key: string) {
  const { client } = useClient();
  return useQuery({
    queryKey: ["projects", key, filters],
    queryFn: () => client.listProjects({ filters }),
  });
}

export function useQueries(filters: FilterObject[] = [], key = "all") {
  const { client } = useClient();
  return useQuery({
    queryKey: ["queries", key, filters],
    queryFn: () => client.listQueries({ filters }),
  });
}

export function useQueryResults(queryId: number) {
  const { client } = useClient();
  return useQuery({
    queryKey: ["query", queryId],
    queryFn: () => client.getQuery(queryId),
  });
}

export function useWorkPackage(id: number | undefined) {
  const { client } = useClient();
  return useQuery({
    queryKey: ["work-package", id],
    queryFn: () => client.getWorkPackage(id!),
    enabled: id !== undefined && Number.isFinite(id) && id > 0,
  });
}
