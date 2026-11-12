import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNearWallet } from "near-connect-hooks";
import { RITUAL_CONTRACT_ID, RITUAL_GAS, RITUAL_STORAGE_DEPOSIT, ritualQueryKey } from "@/constants/ritual";
import { errorMessage } from "@/lib/ritual-format";
import { useRitualUiStore } from "@/stores/ritual-ui-store";

export type RitualAction = { label: string; method: string; args?: Record<string, unknown>; deposit?: string };

export function useRitualActions() {
  const wallet = useNearWallet();
  const queryClient = useQueryClient();
  const { setBusyAction, setActionError, setNotice } = useRitualUiStore();
  const mutation = useMutation({
    mutationFn: async ({ label, method, args = {}, deposit = RITUAL_STORAGE_DEPOSIT }: RitualAction) => {
      if (!RITUAL_CONTRACT_ID || !wallet.signedAccountId || wallet.network !== "testnet") throw new Error("Connect a Testnet wallet to a configured RITL contract");
      setBusyAction(label); setActionError(null); setNotice(null);
      const result = await wallet.callFunctionRaw({ contractId: RITUAL_CONTRACT_ID, method, args, gas: RITUAL_GAS, deposit });
      if (typeof result.status === "object" && "Failure" in result.status) throw new Error(JSON.stringify(result.status.Failure));
      return { label, hash: result.transaction.hash };
    },
    onSuccess: async ({ label, hash }) => {
      setNotice(`${label} confirmed${hash ? ` · ${hash}` : ""}`);
      await queryClient.invalidateQueries({ queryKey: ritualQueryKey });
    },
    onError: (cause) => setActionError(errorMessage(cause)),
    onSettled: () => setBusyAction(null),
  });
  return { ...wallet, act: mutation.mutate, isActionPending: mutation.isPending };
}
