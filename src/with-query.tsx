import { QueryClientProvider } from "@tanstack/react-query";
import type { ComponentType, ReactNode } from "react";
import { queryClient } from "./query-client";

function QueryRoot({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

export function withQuery<P extends object>(Command: ComponentType<P>) {
  return function Wrapped(props: P) {
    return (
      <QueryRoot>
        <Command {...props} />
      </QueryRoot>
    );
  };
}
