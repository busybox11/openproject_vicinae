import { LocalStorage } from "@vicinae/api";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "pinned-project-ids";

async function readIds(instanceUrl: string): Promise<number[]> {
  const raw = await LocalStorage.getItem<string>(
    `${STORAGE_KEY}:${instanceUrl}`,
  );
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((id) => Number(id))
      .filter((id) => Number.isFinite(id) && id > 0);
  } catch {
    return [];
  }
}

async function writeIds(instanceUrl: string, ids: number[]): Promise<void> {
  await LocalStorage.setItem(
    `${STORAGE_KEY}:${instanceUrl}`,
    JSON.stringify(ids),
  );
}

export function usePinnedProjects(instanceUrl: string) {
  const [pinnedIds, setPinnedIds] = useState<number[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    readIds(instanceUrl).then((ids) => {
      if (cancelled) return;
      setPinnedIds(ids);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [instanceUrl]);

  const isPinned = useCallback(
    (id: number) => pinnedIds.includes(id),
    [pinnedIds],
  );

  const togglePinned = useCallback(
    async (id: number) => {
      const next = pinnedIds.includes(id)
        ? pinnedIds.filter((value) => value !== id)
        : [...pinnedIds, id];
      setPinnedIds(next);
      await writeIds(instanceUrl, next);
    },
    [instanceUrl, pinnedIds],
  );

  return { pinnedIds, isPinned, togglePinned, ready };
}
