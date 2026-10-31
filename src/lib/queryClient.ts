import { QueryClient } from "@tanstack/react-query";

const FIVE_MIN_MS = 5 * 60 * 1000;
const THIRTY_MIN_MS = 30 * 60 * 1000;

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
        // ค่าเริ่มต้น: ลด request ที่ไม่จำเป็นจาก refetch บ่อยเกินไป
        staleTime: FIVE_MIN_MS,
        gcTime: THIRTY_MIN_MS,
      },
    },
  });
}

