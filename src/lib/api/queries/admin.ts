import { useQuery } from "@tanstack/react-query";

import { apiListAdminDisputes } from "@/mocks/mockApi";

export const adminKeys = {
  disputes: ["admin", "disputes"] as const,
};

export function useAdminDisputesQuery() {
  return useQuery({
    queryKey: adminKeys.disputes,
    queryFn: () => apiListAdminDisputes(),
  });
}

