import { viewContract } from "./near-rpc";
import { accountStatusSchema, amountSchema, epochSchema, globalSchema, rulesSchema, storageBalanceSchema, storageBoundsSchema, type HistoryRow } from "@/schemas/ritual";

export const ritualService = {
  rules: () => viewContract("get_rules", {}, rulesSchema),
  global: () => viewContract("get_global_state", {}, globalSchema),
  epoch: (dayId: number) => viewContract("get_epoch", { day_id: dayId }, epochSchema),
  account: (accountId: string, dayId: number) => viewContract("get_account_epoch_status", { account_id: accountId, day_id: dayId }, accountStatusSchema),
  balance: (accountId: string) => viewContract("ft_balance_of", { account_id: accountId }, amountSchema),
  storageBalance: (accountId: string) => viewContract("storage_balance_of", { account_id: accountId }, storageBalanceSchema),
  storageBounds: () => viewContract("storage_balance_bounds", {}, storageBoundsSchema),
  async history(lastDay: number | null, limit: number, accountId?: string): Promise<HistoryRow[]> {
    if (lastDay == null) return [];
    const first = Math.max(0, lastDay - limit + 1);
    const days = Array.from({ length: lastDay - first + 1 }, (_, index) => lastDay - index);
    return Promise.all(days.map(async (dayId) => {
      const [epoch, account] = await Promise.all([
        this.epoch(dayId), accountId ? this.account(accountId, dayId) : Promise.resolve(undefined),
      ]);
      return { ...epoch, account };
    }));
  },
};
