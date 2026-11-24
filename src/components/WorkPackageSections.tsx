import { List } from "@vicinae/api";
import type { WorkPackage } from "../types";
import { groupByStatus } from "../utils/work-package-ui";
import { WorkPackageListItem } from "./WorkPackageListItem";

type Props = {
  items: WorkPackage[];
  instanceUrl: string;
  hideAssignee?: boolean;
  total?: number;
};

export function WorkPackageSections({
  items,
  instanceUrl,
  hideAssignee,
  total,
}: Props) {
  const sections = groupByStatus(items);
  const loadedLabel =
    total !== undefined && total > items.length
      ? `Showing ${items.length} of ${total}`
      : undefined;

  return (
    <>
      {loadedLabel ? (
        <List.Section title={loadedLabel} />
      ) : null}
      {sections.map((section) => (
        <List.Section
          key={section.title}
          title={section.title}
          subtitle={section.subtitle}
        >
          {section.items.map((wp) => (
            <WorkPackageListItem
              key={wp.id}
              wp={wp}
              instanceUrl={instanceUrl}
              hideAssignee={hideAssignee}
            />
          ))}
        </List.Section>
      ))}
    </>
  );
}
