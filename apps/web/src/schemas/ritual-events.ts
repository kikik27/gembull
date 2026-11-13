import { z } from "zod";

const amount = z.string().regex(/^\d+$/);

export const ritualEventSchema = z.object({
  id: z.string(),
  transactionHash: z.string(),
  receiptId: z.string(),
  blockHeight: amount,
  blockTimestampNs: amount,
  standard: z.enum(["gembull", "nep141"]),
  event: z.enum([
    "ritual_check_in",
    "ritual_day_finalized",
    "ritual_reward_claimed",
    "ritual_ended",
    "ft_mint",
    "ft_burn",
  ]),
  accountId: z.string().nullable(),
  amount: amount.nullable(),
  dayId: z.number().int().nonnegative().nullable(),
  outcome: z.string().nullable(),
});

export const ritualEventPageSchema = z.object({
  events: z.array(ritualEventSchema),
  nextPage: z.string().nullable(),
  source: z.literal("NEAR Testnet · NearBlocks receipts"),
});

export type RitualEvent = z.infer<typeof ritualEventSchema>;
export type RitualEventPage = z.infer<typeof ritualEventPageSchema>;
