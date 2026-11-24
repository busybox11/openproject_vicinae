import { Action, ActionPanel, Icon, List } from "@vicinae/api";

type Props = {
  title: string;
  description?: string;
  onRetry?: () => void;
};

export function ErrorEmptyView({ title, description, onRetry }: Props) {
  return (
    <List.EmptyView
      icon={Icon.Warning}
      title={title}
      description={description}
      actions={
        onRetry ? (
          <ActionPanel>
            <Action title="Retry" icon={Icon.ArrowClockwise} onAction={onRetry} />
          </ActionPanel>
        ) : undefined
      }
    />
  );
}
