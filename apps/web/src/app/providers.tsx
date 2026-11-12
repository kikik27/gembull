"use client";

import { NearProvider } from "near-connect-hooks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: true } } }));
  return <QueryClientProvider client={queryClient}><NearProvider config={{ network: "testnet" }}>{children}</NearProvider></QueryClientProvider>;
}
