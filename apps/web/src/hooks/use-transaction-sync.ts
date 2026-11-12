"use client";

import { useEffect, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNearWallet } from "near-connect-hooks";
import { ritualQueryKey } from "@/constants/ritual";
import { verifyRitualTransaction } from "@/services/near-rpc";
import { useRitualUiStore } from "@/stores/ritual-ui-store";

/**
 * Automatically syncs on-chain data and handles wallet return URLs.
 * Refetches contract queries immediately and with staggered intervals to accommodate
 * NEAR block indexing latency, ensuring users never need to manually reload the page.
 */
export function useTransactionSync() {
  const queryClient = useQueryClient();
  const { popToast } = useRitualUiStore();
  const { signedAccountId, loading } = useNearWallet();
  const processingHashes = useRef<string | null>(null);

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
      if (loading || !signedAccountId || processingHashes.current === txHashes) return;
      processingHashes.current = txHashes;
      const hashes = txHashes.split(",").filter(Boolean);
      void (async () => {
        try {
          if (hashes.length === 0 || hashes.length > 5) throw new Error("Invalid wallet transaction list");
          const results = await Promise.all(hashes.map((hash) => verifyRitualTransaction(hash, signedAccountId)));
          const failure = results.find((result) => !result.success);
          popToast(failure ? {
            type: "error",
            title: "Transaction Failed",
            message: failure.reason || "A GemBull transaction failed on NEAR Testnet.",
            txHash: hashes[0],
            durationMs: 7000,
          } : {
            type: "success",
            title: "Transaction Confirmed",
            message: "The GemBull action completed at finality on NEAR Testnet.",
            txHash: hashes[0],
            durationMs: 7000,
          });
          void syncOnChainData().catch(() => {
            popToast({
              type: "info",
              title: "Refreshing contract data",
              message: "Transaction status is final. The latest contract view will retry automatically.",
              durationMs: 5000,
            });
          });
          const cleanUrl = new URL(window.location.href);
          cleanUrl.searchParams.delete("transactionHashes");
          window.history.replaceState({}, "", cleanUrl.pathname + cleanUrl.search + cleanUrl.hash);
        } catch (cause) {
          popToast({
            type: "info",
            title: "Verification pending",
            message: cause instanceof Error ? cause.message : "Could not verify the transaction. Reload to try again.",
            txHash: hashes[0],
            durationMs: 7000,
          });
          processingHashes.current = null;
        }
      })();
    } else if (errorCode) {
      popToast({
        type: "error",
        title: "Transaction Cancelled",
        message: errorMessage || `Wallet returned error code: ${errorCode}`,
        durationMs: 6000,
      });

      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete("errorCode");
      cleanUrl.searchParams.delete("errorMessage");
      window.history.replaceState({}, "", cleanUrl.pathname + cleanUrl.search + cleanUrl.hash);
    }
  }, [popToast, syncOnChainData, signedAccountId, loading]);

  return { syncOnChainData };
}
