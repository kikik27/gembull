"use client";

import { useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ritualQueryKey } from "@/constants/ritual";
import { useRitualUiStore } from "@/stores/ritual-ui-store";

/**
 * Automatically syncs on-chain data and handles wallet return URLs.
 * Refetches contract queries immediately and with staggered intervals to accommodate
 * NEAR block indexing latency, ensuring users never need to manually reload the page.
 */
export function useTransactionSync() {
  const queryClient = useQueryClient();
  const { popToast } = useRitualUiStore();

  const syncOnChainData = useCallback(async () => {
    // Immediate query invalidation & refetch
    await queryClient.invalidateQueries({ queryKey: ritualQueryKey });
    await queryClient.refetchQueries({ queryKey: ritualQueryKey });

    // Staggered follow-ups at 1.5s and 3.5s to capture the indexed block
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ritualQueryKey });
      queryClient.refetchQueries({ queryKey: ritualQueryKey });
    }, 1500);

    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ritualQueryKey });
      queryClient.refetchQueries({ queryKey: ritualQueryKey });
    }, 3500);
  }, [queryClient]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const txHashes = params.get("transactionHashes");
    const errorCode = params.get("errorCode");
    const errorMessage = params.get("errorMessage");

    if (txHashes) {
      const firstHash = txHashes.split(",")[0];
      popToast({
        type: "success",
        title: "Transaction Confirmed",
        message: "Your on-chain action was verified and completed on NEAR Testnet.",
        txHash: firstHash,
        durationMs: 7000,
      });

      syncOnChainData();

      // Clean URL params so it does not re-trigger on subsequent navigation
      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete("transactionHashes");
      window.history.replaceState({}, "", cleanUrl.pathname + cleanUrl.hash);
    } else if (errorCode) {
      popToast({
        type: "error",
        title: "Transaction Cancelled",
        message: errorMessage
          ? decodeURIComponent(errorMessage)
          : `Wallet returned error code: ${errorCode}`,
        durationMs: 6000,
      });

      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete("errorCode");
      cleanUrl.searchParams.delete("errorMessage");
      window.history.replaceState({}, "", cleanUrl.pathname + cleanUrl.hash);
    }
  }, [popToast, syncOnChainData]);

  return { syncOnChainData };
}
