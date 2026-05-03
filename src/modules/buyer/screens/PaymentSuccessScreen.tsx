"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { buyerApi } from "@/lib/api/buyer-api";

/**
 * PaymentSuccessScreen
 *
 * PayOS redirect về: /payment-success?code=00&id=...&cancel=false&status=PAID&orderCode=...
 *
 * Vấn đề: Backend phụ thuộc vào webhook từ PayOS để cập nhật order status.
 * Nếu webhook thất bại hoặc chậm, đơn hàng vẫn còn "Locked/pending" dù user đã thanh toán.
 *
 * Giải pháp 2 lớp:
 *   1. Poll GET /api/buyer-order → nếu thấy đơn "paid" → redirect ngay
 *   2. Nếu không thấy sau 1 lần poll → gọi POST /api/buyer-order/{id}/paid
 *      (manual confirm) trên mọi đơn "pending" gần nhất → poll lại
 */
export default function PaymentSuccessScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const hasStarted = useRef(false);

  const code = searchParams.get("code");
  const status = searchParams.get("status");
  const cancel = searchParams.get("cancel");
  const orderId = searchParams.get("orderId");
  const orderCode = searchParams.get("orderCode");

  const isSuccess = code === "00" && status === "PAID" && cancel === "false";
  const isCancelled = cancel === "true" || status === "CANCELLED";

  const [pollAttempt, setPollAttempt] = useState(0);
  const MAX_POLL = 6;
  const POLL_INTERVAL = 3000;

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    if (isCancelled) {
      toast.error("Thanh toán đã bị hủy.");
      queryClient.invalidateQueries({ queryKey: ["buyer-orders"] });
      if (orderId) {
        queryClient.invalidateQueries({
          queryKey: ["buyer-order-detail", orderId],
        });
        queryClient.invalidateQueries({
          queryKey: ["buyer-order-status", orderId],
        });
      }
      router.replace("/buyer/orders");
      return;
    }

    if (!isSuccess) {
      router.replace("/buyer/orders");
      return;
    }

    let attempt = 0;
    let cancelled = false;
    let hasTriedManualConfirm = false;

    const doRedirectSuccess = () => {
      queryClient.invalidateQueries({ queryKey: ["buyer-orders"] });
      queryClient.invalidateQueries({ queryKey: ["buyer-order-detail"] });
      if (orderId) {
        queryClient.invalidateQueries({
          queryKey: ["buyer-order-detail", orderId],
        });
        queryClient.invalidateQueries({
          queryKey: ["buyer-order-status", orderId],
        });
      }

      toast.success(
        "Thanh toán thành công! Đơn hàng của bạn đã được ghi nhận.",
      );
      router.replace("/buyer/orders?status=paid");
    };

    const poll = async () => {
      if (cancelled) return;

      try {
        const page = await buyerApi.getOrders(1, 20);

        // Tìm chính xác đơn hàng đang xử lý bằng orderId hoặc orderCode
        const targetOrder = page.items.find(
          (o) =>
            (orderId && o.id === orderId) ||
            (orderCode && o.orderCode && String(o.orderCode) === orderCode),
        );

        // 1. Nếu thấy đơn này đã paid -> success
        if (targetOrder?.status === "paid") {
          doRedirectSuccess();
          return;
        }

        // 2. Nếu đơn này vẫn pending -> thử manual confirm 1 lần (workaround webhook)
        if (targetOrder?.status === "pending" && !hasTriedManualConfirm) {
          hasTriedManualConfirm = true;
          try {
            await buyerApi.confirmPaid(targetOrder.id);
          } catch {
            // Ignore, poll tiếp để check
          }
        }

        // 3. Nếu KHÔNG tìm thấy đơn (targetOrder undefined),
        // nhưng có ít nhất 1 đơn "paid" bất kỳ và không có ID/Code để check -> giữ logic cũ làm fallback
        // (Chỉ áp dụng nếu URL không có cả orderId lẫn orderCode - trường hợp hiếm)
        if (!orderId && !orderCode) {
          const anyPaid = page.items.find((o) => o.status === "paid");
          if (anyPaid) {
            doRedirectSuccess();
            return;
          }
        }
      } catch {
        // Ignore fetch errors, keep polling
      }

      attempt += 1;
      setPollAttempt(attempt);

      if (attempt >= MAX_POLL) {
        // Đã thử đủ -> redirect dù sao, đơn sẽ cập nhật sau
        queryClient.invalidateQueries({ queryKey: ["buyer-orders"] });
        if (orderId) {
          queryClient.invalidateQueries({
            queryKey: ["buyer-order-detail", orderId],
          });
          queryClient.invalidateQueries({
            queryKey: ["buyer-order-status", orderId],
          });
        }

        toast.success(
          "Thanh toán thành công! Đơn hàng sẽ được cập nhật trạng thái trong giây lát.",
        );
        router.replace("/buyer/orders?status=paid");
        return;
      }

      setTimeout(poll, POLL_INTERVAL);
    };

    // Bắt đầu poll sau 1.5 giây
    const timer = setTimeout(poll, 1500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      {isSuccess ? (
        <>
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className="h-14 w-14 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="mb-2 text-3xl font-extrabold text-foreground">
            Thanh toán thành công!
          </h1>
          <p className="mb-1 text-muted-foreground">
            Đơn hàng của bạn đã được ghi nhận.
          </p>
          {orderCode && (
            <p className="mb-6 text-sm text-muted-foreground">
              Mã giao dịch PayOS:{" "}
              <span className="font-mono font-semibold text-foreground">
                {orderCode}
              </span>
            </p>
          )}
        </>
      ) : isCancelled ? (
        <>
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <XCircle className="h-14 w-14 text-red-500" />
          </div>
          <h1 className="mb-2 text-3xl font-extrabold text-foreground">
            Thanh toán bị hủy
          </h1>
          <p className="text-muted-foreground">
            Bạn đã hủy giao dịch. Đơn hàng vẫn đang chờ thanh toán.
          </p>
        </>
      ) : (
        <>
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-secondary">
            <Loader2 className="h-14 w-14 animate-spin text-muted-foreground" />
          </div>
          <h1 className="mb-2 text-3xl font-extrabold text-foreground">
            Đang xử lý...
          </h1>
          <p className="text-muted-foreground">Vui lòng chờ.</p>
        </>
      )}

      <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span>
          {isSuccess
            ? pollAttempt === 0
              ? "Đang xác nhận với hệ thống..."
              : `Đang chờ cập nhật... (${pollAttempt}/${MAX_POLL})`
            : "Đang chuyển hướng..."}
        </span>
      </div>
    </div>
  );
}
