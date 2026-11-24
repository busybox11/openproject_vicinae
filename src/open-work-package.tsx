import { Clipboard, Detail, LaunchProps, List } from "@vicinae/api";
import { useEffect, useState } from "react";
import { ErrorEmptyView } from "./components/ErrorEmptyView";
import { WorkPackageDetail } from "./components/WorkPackageDetail";
import { useClient, useWorkPackage } from "./hooks/use-openproject";
import { parseWorkPackageId } from "./utils/parse-work-package-id";
import { withQuery } from "./with-query";

type Args = { id?: string };

function OpenWorkPackage(props: LaunchProps<{ arguments: Args }>) {
  const { client } = useClient();
  const [resolvedId, setResolvedId] = useState<number | undefined>(() =>
    parseWorkPackageId(props.arguments?.id),
  );
  const [resolving, setResolving] = useState(resolvedId === undefined);

  useEffect(() => {
    if (resolvedId !== undefined) {
      setResolving(false);
      return;
    }

    let cancelled = false;
    Clipboard.readText()
      .then((text) => {
        if (cancelled) return;
        setResolvedId(parseWorkPackageId(text));
        setResolving(false);
      })
      .catch(() => {
        if (cancelled) return;
        setResolving(false);
      });

    return () => {
      cancelled = true;
    };
  }, [resolvedId]);

  const { data, isLoading, error, refetch } = useWorkPackage(resolvedId);

  if (resolving) {
    return <Detail isLoading markdown="Reading clipboard…" />;
  }

  if (resolvedId === undefined) {
    return (
      <List>
        <ErrorEmptyView
          title="No work package ID"
          description="Pass an ID as an argument, or copy an ID / work package URL to the clipboard."
        />
      </List>
    );
  }

  if (error) {
    return (
      <List>
        <ErrorEmptyView
          title={`Could not load #${resolvedId}`}
          description={error.message}
          onRetry={() => refetch()}
        />
      </List>
    );
  }

  if (!data) {
    return <Detail isLoading={isLoading} markdown={`Loading #${resolvedId}…`} />;
  }

  return (
    <WorkPackageDetail
      wp={data}
      instanceUrl={client.instanceUrl}
      isLoading={isLoading}
    />
  );
}

export default withQuery(OpenWorkPackage);
