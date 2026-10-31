import { useQuery } from "@tanstack/react-query";
import { ProjectAPIs } from "../networks/project.api";

const TEN_MIN_MS = 10 * 60 * 1000;

export const projectByIdKey = (id: string | number | undefined) =>
  ["project", id] as const;

/**
 * แคชข้อมูลโครงการเดียว (เช่น ใช้ใน sidebar) เพื่อไม่เรียก getOne ซ้ำทุกครั้ง
 */
export function useProjectById(
  id: string | number | undefined,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: projectByIdKey(id),
    queryFn: async () => {
      const res = await ProjectAPIs.getOne(id);
      return res?.data?.body ?? null;
    },
    enabled: options?.enabled !== false && id != null && id !== "",
    staleTime: TEN_MIN_MS,
    gcTime: 30 * 60 * 1000,
  });
}
