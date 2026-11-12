import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNearWallet } from "near-connect-hooks";
import {
  RITUAL_CONTRACT_ID,
  RITUAL_GAS,
  RITUAL_STORAGE_DEPOSIT,
  ritualQueryKey,
} from "@/constants/ritual";
import { errorMessage } from "@/lib/ritual-format";
import { verifyRitualTransaction } from "@/services/near-rpc";
import { useRitualUiStore } from "@/stores/ritual-ui-store";

export type RitualAction = {
  label: string;
  method: string;
  args?: Record<string, unknown>;
  deposit?: string;
};

export function useRitualActions() {
  const wallet = useNearWallet();
  const queryClient = useQueryClient();
  const { setBusyAction, setActionError, setNotice, popToast } =
    useRitualUiStore();

  const mutation = useMutation({
    mutationFn: async ({
      label,
      method,
      args = {},
      deposit = RITUAL_STORAGE_DEPOSIT,
    }: RitualAction) => {
      if (
        !RITUAL_CONTRACT_ID ||
        !wallet.signedAccountId ||
        wallet.network !== "testnet"
      ) {
        throw new Error(
          "Connect a Testnet wallet to a configured GEMBULL contract"
        );
      }
      setBusyAction(label);
      setActionError(null);
      setNotice(null);

      const result = await wallet.callFunctionRaw({
        contractId: RITUAL_CONTRACT_ID,
        method,
        args,
        gas: RITUAL_GAS,
        deposit,
      });

      if (typeof result.status === "object" && "Failure" in result.status) {
        throw new Error(JSON.stringify(result.status.Failure));
      }
      const hash = result.transaction?.hash;
      if (!hash) throw new Error("Wallet did not return a transaction hash to verify");
      const verified = await verifyRitualTransaction(hash, wallet.signedAccountId);
      if (!verified.success) throw new Error(verified.reason || "GemBull transaction failed at finality");
      return { label, hash };
    },
    onSuccess: async ({ label, hash }) => {
      popToast({
        type: "success",
        title: `${label} Confirmed`,
        message: "Your on-chain action completed successfully.",
        txHash: hash,
        durationMs: 7000,
      });

      // Immediate invalidation & refetch
      await queryClient.invalidateQueries({ queryKey: ritualQueryKey });
      await queryClient.refetchQueries({ queryKey: ritualQueryKey });

      // Staggered follow-ups to account for NEAR block indexing
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ritualQueryKey });
        queryClient.refetchQueries({ queryKey: ritualQueryKey });
      }, 1500);

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ritualQueryKey });
        queryClient.refetchQueries({ queryKey: ritualQueryKey });
      }, 3500);
    },
    onError: (cause) => setActionError(errorMessage(cause)),
    onSettled: () => setBusyAction(null),
  });

  return {
    ...wallet,
    act: mutation.mutate,
    isActionPending: mutation.isPending,
  };
}
