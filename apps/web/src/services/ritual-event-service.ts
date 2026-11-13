import { ritualEventPageSchema } from "@/schemas/ritual-events";
import { httpClient } from "./http-client";

export async function readRitualEventPage(next: string | null) {
  const response = await httpClient.get("/ritual/events", { params: next ? { next } : undefined });
  return ritualEventPageSchema.parse(response.data);
}
