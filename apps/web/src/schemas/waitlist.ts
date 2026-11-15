import { z } from "zod";

export const waitlistRequestSchema = z.object({
  accountId: z.string().trim().min(2).max(64).regex(
    /^(?=.{2,64}$)(?:[a-z0-9]+(?:[-_.][a-z0-9]+)*)\.(?:testnet|[a-z0-9]+\.testnet)$/,
    "Enter a valid NEAR Testnet account, such as alice.testnet",
  ),
  telegram: z
    .string()
    .trim()
    .min(2, "Enter your Telegram username (e.g. @username)")
    .max(64)
    .regex(/^@?[a-zA-Z0-9_]{3,32}$/, "Enter a valid Telegram username (e.g. @username)"),
  twitter: z
    .string()
    .trim()
    .max(64)
    .optional()
    .or(z.literal("")),
  website: z.string().max(200).optional(),
});

export const waitlistResponseSchema = z.object({
  available: z.boolean(),
  joined: z.boolean(),
  joinedAt: z.string().datetime().nullable(),
  status: z.string().nullable().optional(),
  telegram: z.string().nullable().optional(),
});

export type WaitlistRequest = z.infer<typeof waitlistRequestSchema>;
export type WaitlistResponse = z.infer<typeof waitlistResponseSchema>;
