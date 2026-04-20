import { useQuery } from "@tanstack/react-query";

import type { Id } from "@/types/domain";
import { apiListInspectorAssignments } from "@/mocks/mockApi";

export const inspectorKeys = {
  assignments: (inspectorId: Id) => ["inspector", "assignments", inspectorId] as const,
};

export function useInspectorAssignmentsQuery(inspectorId: Id) {
  return useQuery({
    queryKey: inspectorKeys.assignments(inspectorId),
    queryFn: () => apiListInspectorAssignments(inspectorId),
    enabled: !!inspectorId,
  });
}

