import { useQuery, QueryClient } from "@tanstack/react-query";
import { AuthAPIs } from "../networks/auth.api";

export const meQueryKey = ["me"] as const;

const STALE_TIME_MS = 5 * 60 * 1000;
const GC_TIME_MS = 30 * 60 * 1000;

export function getMeQueryOptions() {
  return {
    queryKey: meQueryKey,
    queryFn: async () => {
      const res = await AuthAPIs.getMe();
      return res?.data?.body ?? null;
    },
    staleTime: STALE_TIME_MS,
    gcTime: GC_TIME_MS,
  };
}

export function useMe() {
  return useQuery(getMeQueryOptions());
}

/** ดึงข้อมูลผู้ใช้จากแคช หรือ fetch หนึ่งครั้ง (สำหรับ handler / modal) */
export async function ensureMe(client: QueryClient) {
  return client.ensureQueryData(getMeQueryOptions());
}

