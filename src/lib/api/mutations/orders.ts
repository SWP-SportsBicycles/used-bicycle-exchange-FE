import { useMutation } from "@tanstack/react-query";

import type { Id } from "@/types/domain";
import { apiCreateDepositOrder } from "@/mocks/mockApi";

export function useCreateDepositOrderMutation() {
  return useMutation({
    mutationFn: (args: { listingId: Id; buyerId: Id }) => apiCreateDepositOrder(args),
  });
}

