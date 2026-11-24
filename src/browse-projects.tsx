import { Action, ActionPanel, Color, Icon, List } from "@vicinae/api";
import { useMemo, useState } from "react";
import { mergeFilters, nameAndIdentifierFilter } from "./api/filters";
import { projectUrl } from "./api/urls";
import { ErrorEmptyView } from "./components/ErrorEmptyView";
import { useClient, useProjects } from "./hooks/use-openproject";
import { useDebouncedValue } from "./hooks/useDebouncedValue";
import { withQuery } from "./with-query";

function BrowseProjects() {
  const { client } = useClient();
  const [searchText, setSearchText] = useState("");
  const debounced = useDebouncedValue(searchText, 300);

  const filters = useMemo(
    () =>
      mergeFilters(
        debounced.trim() ? nameAndIdentifierFilter(debounced.trim()) : null,
      ),
    [debounced],
  );

  const { data, isLoading, isFetching, error, refetch } = useProjects(
    filters,
    debounced,
  );

  const items = data?._embedded.elements ?? [];

  return (
    <List
      isLoading={isLoading || isFetching}
      searchText={searchText}
      onSearchTextChange={setSearchText}
      throttle
      searchBarPlaceholder="Search projects…"
    >
      {error ? (
        <ErrorEmptyView
          title="Failed to load projects"
          description={error.message}
          onRetry={() => refetch()}
        />
      ) : items.length === 0 && !isLoading ? (
        <ErrorEmptyView title="No projects found" />
      ) : (
        items.map((project) => {
          const url = projectUrl(client.instanceUrl, project);
          const archived = project.active === false;
          return (
            <List.Item
              key={project.id}
              id={String(project.id)}
              title={project.name}
              subtitle={project.identifier}
              icon={Icon.Folder}
              keywords={[project.identifier, String(project.id)]}
              accessories={[
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
        })
      )}
    </List>
  );
}

export default withQuery(BrowseProjects);
