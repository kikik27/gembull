import { z } from "zod";

export const amountSchema = z.string().regex(/^\d+$/, "Expected an unsigned integer string");
export const rulesSchema = z.object({
  epoch_duration_ns: amountSchema, daily_target: z.number().int().nonnegative(),
  min_holding: amountSchema, max_participants: z.number().int().nonnegative(),
  reward_per_checkin: amountSchema, treasury_burn_bps: z.number().int().nonnegative(),
  initial_supply: amountSchema, max_supply: amountSchema, max_mint_per_epoch: amountSchema,
  name: z.string(), symbol: z.string(), decimals: z.number().int().nonnegative(),
});
export const globalSchema = z.object({
  launch_timestamp_ns: amountSchema, current_day_id: z.number().int().nonnegative(),
  last_finalized_day: z.number().int().nonnegative().nullable(), current_streak: z.number().int().nonnegative(),
  longest_streak: z.number().int().nonnegative(), total_supply: amountSchema, max_supply: amountSchema,
  reserved_mint_capacity: amountSchema, remaining_mint_capacity: amountSchema,
  ritual_treasury_balance: amountSchema, cumulative_rewards_minted: amountSchema,
  cumulative_treasury_burned: amountSchema, successful_epochs: z.number().int().nonnegative(),
  missed_epochs: z.number().int().nonnegative(), ritual_ended: z.boolean(),
});
export const epochSchema = z.object({
  day_id: z.number().int().nonnegative(), checkin_count: z.number().int().nonnegative(),
  status: z.enum(["ACTIVE", "SUCCESS", "MISSED"]), target: z.number().int().nonnegative(),
  reward_reserved: amountSchema, reward_claimed: amountSchema, treasury_burned: amountSchema,
  finalized_at_ns: amountSchema.nullable(),
});
export const accountStatusSchema = z.object({ checked_in: z.boolean(), reward_claimable: z.boolean(), claimed: z.boolean() });
export const storageBalanceSchema = z.object({ total: amountSchema, available: amountSchema }).nullable();
export const storageBoundsSchema = z.object({ min: amountSchema, max: amountSchema.nullable().optional() });
export const epochJumpSchema = z.object({ day: z.coerce.number<number>().int().nonnegative() });

export type Rules = z.infer<typeof rulesSchema>;
export type GlobalState = z.infer<typeof globalSchema>;
export type Epoch = z.infer<typeof epochSchema>;
export type AccountStatus = z.infer<typeof accountStatusSchema>;
export type HistoryRow = Epoch & { account?: AccountStatus };
