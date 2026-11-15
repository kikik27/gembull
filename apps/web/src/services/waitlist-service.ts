import { httpClient } from "@/services/http-client";
import {
  waitlistResponseSchema,
  type WaitlistRequest,
} from "@/schemas/waitlist";

export async function getWaitlistStatus(accountId?: string) {
  const response = await httpClient.get("/waitlist", {
    params: accountId ? { accountId } : undefined,
  });
  return waitlistResponseSchema.parse(response.data);
}

export async function joinWaitlist(input: WaitlistRequest) {
  const response = await httpClient.post("/waitlist", input);
  return waitlistResponseSchema.parse(response.data);
}
