import { useQuery } from "@tanstack/react-query";
import { useClient } from "./use-openproject";

export function useProjectOptions() {
  const { client } = useClient();
  return useQuery({
    queryKey: ["project-options"],
    queryFn: async () => {
      const first = await client.listProjects({ pageSize: 100, offset: 1 });
      const items = [...first._embedded.elements];
      let offset = 1;
      let total = first.total;
      while (items.length < total && offset < 10) {
        offset += 1;
        const page = await client.listProjects({ pageSize: 100, offset });
        items.push(...page._embedded.elements);
        total = page.total;
        if (page.count === 0) break;
      }
      return items;
    },
    staleTime: 5 * 60_000,
  });
}
