import { useQuery } from "@tanstack/react-query";
import { RITUAL_CONTRACT_ID, RITUAL_REFRESH_MS, ritualQueryKey } from "@/constants/ritual";
import { ritualService } from "@/services/ritual-service";

export function useRitualData(accountId: string | null | undefined, historyLimit: number) {
  const enabled = Boolean(RITUAL_CONTRACT_ID);
  const shared = { enabled, refetchInterval: RITUAL_REFRESH_MS, staleTime: 5_000 };
  const rules = useQuery({ queryKey: [...ritualQueryKey, "rules"], queryFn: ritualService.rules, ...shared });
  const global = useQuery({ queryKey: [...ritualQueryKey, "global"], queryFn: ritualService.global, ...shared });
  const dayId = global.data?.current_day_id;
  const today = useQuery({ queryKey: [...ritualQueryKey, "epoch", dayId], queryFn: () => ritualService.epoch(dayId!), ...shared, enabled: enabled && dayId !== undefined });
  const account = useQuery({ queryKey: [...ritualQueryKey, "account", accountId, dayId], queryFn: () => ritualService.account(accountId!, dayId!), ...shared, enabled: enabled && Boolean(accountId) && dayId !== undefined });
  const balance = useQuery({ queryKey: [...ritualQueryKey, "balance", accountId], queryFn: () => ritualService.balance(accountId!), ...shared, enabled: enabled && Boolean(accountId) });
  const storageBalance = useQuery({ queryKey: [...ritualQueryKey, "storage", accountId], queryFn: () => ritualService.storageBalance(accountId!), ...shared, enabled: enabled && Boolean(accountId) });
  const storageBounds = useQuery({ queryKey: [...ritualQueryKey, "storage-bounds"], queryFn: ritualService.storageBounds, ...shared });
  const history = useQuery({ queryKey: [...ritualQueryKey, "history", global.data?.last_finalized_day, historyLimit, accountId], queryFn: () => ritualService.history(global.data?.last_finalized_day ?? null, historyLimit, accountId || undefined), ...shared, enabled: enabled && global.data !== undefined });
  const queries = [rules, global, today, account, balance, storageBalance, storageBounds, history];
  return {
    rules: rules.data, global: global.data, today: today.data, account: account.data,
    balance: balance.data, registered: storageBalance.data === undefined ? null : storageBalance.data !== null,
    storageMin: storageBounds.data?.min, history: history.data ?? [],
    isLoading: queries.some((query) => query.isPending && query.fetchStatus === "fetching"),
    error: queries.find((query) => query.error)?.error?.message ?? null,
  };
}
