import { httpClient } from "@/services/http-client";
import {
  waitlistResponseSchema,
  type WaitlistRequest,
} from "@/schemas/waitlist";

export async function getWaitlistStatus(accountId?: string) {
  try {
    const response = await httpClient.get("/waitlist", {
      params: accountId ? { accountId } : undefined,
    });
    const parsed = waitlistResponseSchema.parse(response.data);
    if (!parsed.joined && typeof window !== "undefined" && accountId) {
      const stored = localStorage.getItem(`gembull:waitlist:${accountId}`);
      if (stored) {
        try {
          const localData = JSON.parse(stored);
          if (localData?.joined) {
            return {
              available: true,
              joined: true,
              joinedAt: localData.joinedAt || new Date().toISOString(),
              status: localData.status || "pending",
              telegram: localData.telegram || null,
            };
          }
        } catch {}
      }
    }
    return parsed;
  } catch {
    if (typeof window !== "undefined" && accountId) {
      const stored = localStorage.getItem(`gembull:waitlist:${accountId}`);
      if (stored) {
        try {
          const localData = JSON.parse(stored);
          if (localData?.joined) {
            return {
              available: true,
              joined: true,
              joinedAt: localData.joinedAt || new Date().toISOString(),
              status: "pending",
              telegram: localData.telegram || null,
            };
          }
        } catch {}
      }
    }
    return { available: true, joined: false, joinedAt: null };
  }
}

export async function joinWaitlist(input: WaitlistRequest) {
  const response = await httpClient.post("/waitlist", input);
  const result = waitlistResponseSchema.parse(response.data);
  if (typeof window !== "undefined" && input.accountId) {
    try {
      localStorage.setItem(
        `gembull:waitlist:${input.accountId}`,
        JSON.stringify({
          joined: true,
          joinedAt: result.joinedAt || new Date().toISOString(),
          telegram: input.telegram,
          status: "pending",
        }),
      );
    } catch {}
  }
  return result;
}
