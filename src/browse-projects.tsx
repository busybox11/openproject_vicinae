import {
  Action,
  ActionPanel,
  Color,
  Icon,
  List,
  useNavigation,
} from "@vicinae/api";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  mergeFilters,
  nameAndIdentifierFilter,
  projectActivityFilter,
  type ProjectActivityFilter,
} from "./api/filters";
import { projectUrl } from "./api/urls";
import { ErrorEmptyView } from "./components/ErrorEmptyView";
import { ProjectQueriesView } from "./components/ProjectQueries";
import { ProjectWorkPackagesView } from "./components/ProjectWorkPackages";
import { useClient, useProjects } from "./hooks/use-openproject";
import { useDebouncedValue } from "./hooks/useDebouncedValue";
import { usePersistedValue } from "./hooks/use-persisted-value";
import { usePinnedProjects } from "./hooks/use-pinned-projects";
import type { Project } from "./types";
import { withQuery } from "./with-query";

function BrowseProjects() {
  const { client } = useClient();
  const { push } = useNavigation();
  const [searchText, setSearchText] = useState("");
  const [activity, setActivity] = usePersistedValue<ProjectActivityFilter>(
    `browse-projects-activity:${client.instanceUrl}`,
    "active",
  );
  const debounced = useDebouncedValue(searchText, 300);
  const { pinnedIds, isPinned, togglePinned, ready } = usePinnedProjects(
    client.instanceUrl,
  );

  const filters = useMemo(
    () =>
      mergeFilters(
        projectActivityFilter(activity),
        debounced.trim() ? nameAndIdentifierFilter(debounced.trim()) : null,
      ),
    [activity, debounced],
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
  } = useProjects(filters, `${activity}:${debounced}`);

  const { data: pinnedProjects = [], isLoading: pinnedLoading } = useQuery({
    queryKey: ["pinned-projects", client.instanceUrl, pinnedIds],
    enabled: ready && pinnedIds.length > 0,
    queryFn: async () => {
      const results = await Promise.all(
        pinnedIds.map((id) => client.getProject(id)),
      );
      return results;
    },
  });

  const pinnedVisible = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    return pinnedProjects.filter((project) => {
      if (activity === "active" && project.active === false) return false;
      if (activity === "archived" && project.active !== false) return false;
      if (!q) return true;
      return (
        project.name.toLowerCase().includes(q) ||
        project.identifier.toLowerCase().includes(q) ||
        String(project.id).includes(q)
      );
    });
  }, [pinnedProjects, debounced, activity]);

  const unpinned = useMemo(
    () => items.filter((project) => !isPinned(project.id)),
    [items, isPinned],
  );

  const renderProject = (project: Project) => {
    const url = projectUrl(client.instanceUrl, project);
    const archived = project.active === false;
    const pinned = isPinned(project.id);
    return (
      <List.Item
        key={project.id}
        id={String(project.id)}
        title={project.name}
        subtitle={project.identifier}
        icon={pinned ? Icon.Star : Icon.Folder}
        keywords={[project.identifier, String(project.id)]}
        accessories={[
          ...(pinned ? [{ tag: { value: "Pinned" } }] : []),
          {
            text: {
              value: archived ? "Archived" : "Active",
              color: archived ? Color.SecondaryText : Color.Green,
            },
          },
          {
            text: {
              value: String(project.id),
              color: Color.SecondaryText,
            },
            tooltip: "Project ID",
          },
        ]}
        actions={
          <ActionPanel>
            <Action
              title="Show Work Packages"
              icon={Icon.BulletPoints}
              onAction={() =>
                push(<ProjectWorkPackagesView project={project} />)
              }
            />
            <Action
              title="Show Saved Queries"
              icon={Icon.AppWindowList}
              shortcut={{ modifiers: ["ctrl"], key: "q" }}
              onAction={() => push(<ProjectQueriesView project={project} />)}
            />
            <Action
              title={pinned ? "Unpin Project" : "Pin Project"}
              icon={pinned ? Icon.StarDisabled : Icon.Star}
              shortcut={{ modifiers: ["ctrl", "shift"], key: "p" }}
              onAction={() => togglePinned(project.id)}
            />
            <Action.OpenInBrowser title="Open in Browser" url={url} />
            <Action.CopyToClipboard title="Copy URL" content={url} />
            <Action.CopyToClipboard
              title="Copy Project ID"
              content={String(project.id)}
              shortcut={{ modifiers: ["ctrl"], key: "c" }}
            />
            <Action.CopyToClipboard
              title="Copy Identifier"
              content={project.identifier}
            />
          </ActionPanel>
        }
      />
    );
  };

  return (
    <List
      isLoading={isLoading || isFetchingNextPage || pinnedLoading}
      searchText={searchText}
      onSearchTextChange={setSearchText}
      throttle
      searchBarPlaceholder="Search projects…"
      searchBarAccessory={
        <List.Dropdown
          tooltip="Activity"
          value={activity}
          onChange={(value) => setActivity(value as ProjectActivityFilter)}
          storeValue={false}
        >
          <List.Dropdown.Item title="Active" value="active" />
          <List.Dropdown.Item title="Archived" value="archived" />
          <List.Dropdown.Item title="All" value="all" />
        </List.Dropdown>
      }
      pagination={{ hasMore, onLoadMore: loadMore }}
    >
      {error ? (
        <ErrorEmptyView
          title="Failed to load projects"
          description={error.message}
          onRetry={() => refetch()}
        />
      ) : items.length === 0 &&
        pinnedVisible.length === 0 &&
        !isLoading ? (
        <ErrorEmptyView title="No projects found" />
      ) : (
        <>
          {total > items.length ? (
            <List.Section title={`Showing ${items.length} of ${total}`} />
          ) : null}
          {pinnedVisible.length > 0 ? (
            <List.Section title="Pinned">
              {pinnedVisible.map(renderProject)}
            </List.Section>
          ) : null}
          <List.Section
            title={pinnedVisible.length > 0 ? "All projects" : "Projects"}
          >
            {unpinned.map(renderProject)}
          </List.Section>
        </>
      )}
    </List>
  );
}

export default withQuery(BrowseProjects);
