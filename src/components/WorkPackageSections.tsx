import { List } from "@vicinae/api";
import type { WorkPackage } from "../types";
import { groupByStatus } from "../utils/work-package-ui";
import { WorkPackageListItem } from "./WorkPackageListItem";

type Props = {
  items: WorkPackage[];
  instanceUrl: string;
  hideAssignee?: boolean;
};

export function WorkPackageSections({
  items,
  instanceUrl,
  hideAssignee,
}: Props) {
  const sections = groupByStatus(items);

  return (
    <>
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
