import { RITUAL_DECIMALS } from "@/constants/ritual";

const unit = 10n ** BigInt(RITUAL_DECIMALS);

export function formatRitl(value?: string | null, places = 2): string {
  if (value == null) return "—";
  const amount = BigInt(value);
  const whole = amount / unit;
  const fraction = (amount % unit).toString().padStart(RITUAL_DECIMALS, "0").slice(0, places).replace(/0+$/, "");
  return `${new Intl.NumberFormat("en-US").format(whole)}${fraction ? `.${fraction}` : ""}`;
}

export function shortAccount(value: string): string {
  return value.length > 27 ? `${value.slice(0, 12)}…${value.slice(-10)}` : value;
}

export function epochCountdown(launch: string, duration: string, day: number, nowMs: number): string {
  const endNs = BigInt(launch) + BigInt(duration) * BigInt(day + 1);
  const secondsLeft = Number((endNs / 1_000_000n - BigInt(nowMs)) / 1_000n);
  if (secondsLeft <= 0) return "Awaiting settlement";
  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function errorMessage(cause: unknown): string {
  return cause instanceof Error ? cause.message : String(cause);
}
