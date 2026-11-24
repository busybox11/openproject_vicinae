import { LocalStorage } from "@vicinae/api";
import { useCallback, useEffect, useState } from "react";

export function usePersistedValue<T extends string>(
  key: string,
  fallback: T,
): [T, (value: T) => void, boolean] {
  const [value, setValue] = useState<T>(fallback);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    LocalStorage.getItem<string>(key).then((stored) => {
      if (cancelled) return;
      if (typeof stored === "string" && stored.length > 0) {
        setValue(stored as T);
      } else {
        setValue(fallback);
      }
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [key, fallback]);

  const update = useCallback(
    (next: T) => {
      setValue(next);
      void LocalStorage.setItem(key, next);
    },
    [key],
  );

  return [value, update, ready];
}
