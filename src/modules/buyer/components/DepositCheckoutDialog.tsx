"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCreateDepositOrderMutation } from "@/lib/api/mutations/orders";
import { calcDepositAmountVnd } from "@/lib/domain/money";
import { formatVnd } from "@/lib/utils/format";
import { useAuth } from "@/lib/auth/authContext";
import type { Id } from "@/types/domain";

export function DepositCheckoutDialog({
  listingId,
  listingPrice,
}: {
  listingId: Id;
  listingPrice: number;
}) {
  const [open, setOpen] = React.useState(false);
  const { user } = useAuth();
  const { mutateAsync, isPending } = useCreateDepositOrderMutation();
  const deposit = calcDepositAmountVnd(listingPrice);

  async function onConfirmDeposit() {
    if (!user) {
      toast.error("Vui lòng mock sign-in role buyer trước khi đặt cọc.");
      return;
    }
    const created = await mutateAsync({ listingId, buyerId: user.id });
    toast.success(`Đã tạo order ${created.id} với cọc ${formatVnd(created.depositAmount)}.`);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Đặt cọc ngay</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Checkout đặt cọc</DialogTitle>
          <DialogDescription>
            Số tiền cọc = min(10% giá niêm yết, 2.000.000đ). Sau khi xác nhận cọc, hệ thống
            chuyển listing sang reserved và mới hiển thị PII Seller.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-lg border p-4 text-sm">
          <p>Giá niêm yết: {formatVnd(listingPrice)}</p>
          <p className="font-semibold">Số tiền cọc: {formatVnd(deposit)}</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Huỷ
          </Button>
          <Button onClick={onConfirmDeposit} disabled={isPending}>
            {isPending ? "Đang tạo..." : "Xác nhận đặt cọc"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

