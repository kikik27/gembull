export const RITUAL_CONTRACT_ID = process.env.NEXT_PUBLIC_GEMBULL_CONTRACT_ID?.trim() ?? "";
export const NEAR_RPC_URL = process.env.NEXT_PUBLIC_NEAR_RPC_URL?.trim() || "https://test.rpc.fastnear.com";
export const RITUAL_GAS = "100000000000000";
export const RITUAL_STORAGE_DEPOSIT = "50000000000000000000000";
export const RITUAL_REFRESH_MS = 15_000;
export const RITUAL_DECIMALS = 18;
export const ritualQueryKey = ["ritual", RITUAL_CONTRACT_ID] as const;
