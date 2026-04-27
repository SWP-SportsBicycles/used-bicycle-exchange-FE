"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CreditCard, Landmark, Loader2, Mail, Wallet } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { adminApi } from "@/lib/api/admin-api";
import { useLanguage } from "@/lib/language-context";

function formatVND(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function AdminDisputeDetailPage() {
  const { language } = useLanguage();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const reportId = params.id;

  const [actionError, setActionError] = useState<string | null>(null);
  const [resultModal, setResultModal] = useState<{
    open: boolean;
    title: string;
    description: string;
  }>({
    open: false,
    title: "",
    description: "",
  });

  useEffect(() => {
    if (!resultModal.open) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      router.push("/admin/disputes");
    }, 2000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [resultModal.open, router]);

  const reportQuery = useQuery({
    queryKey: ["admin-report-detail", reportId],
    queryFn: () => adminApi.getReportDetail(reportId),
    enabled: Boolean(reportId),
  });

  const refundMutation = useMutation({
    mutationFn: adminApi.refundReport,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-reports"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-report-detail", reportId] }),
      ]);
      await queryClient.fetchQuery({
        queryKey: ["admin-reports", 1],
        queryFn: () => adminApi.getReports({ page: 1, size: 10 }),
      });
      setActionError(null);
      setResultModal({
        open: true,
        title: language === "vi" ? "Hoàn tiền thành công" : "Refund successful",
        description:
          language === "vi"
            ? "Hệ thống đã hoàn tiền thành công và sẽ quay về danh sách báo cáo sau 2 giây."
            : "Refund completed successfully. Redirecting to disputes list in 2 seconds.",
      });
    },
    onError: (error) => {
      setActionError(
        error instanceof Error
          ? error.message
          : language === "vi"
          ? "Không thể hoàn tiền cho báo cáo này."
          : "Unable to refund this report.",
      );
    },
  });

  const report = reportQuery.data;
  const isRefunding = refundMutation.isPending || resultModal.open;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-archivo)" }}>
            {language === "vi" ? "Chi tiết khiếu nại" : "Complaint detail"}
          </h1>
        </div>

        <Button variant="outline" asChild>
          <Link href="/admin/disputes">
            <ArrowLeft className="mr-1 h-4 w-4" />
            {language === "vi" ? "Quay lại" : "Back"}
          </Link>
        </Button>
      </div>

      {reportQuery.isLoading ? (
        <Card>
          <CardContent className="py-14 text-center text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {language === "vi" ? "Đang tải chi tiết báo cáo..." : "Loading report detail..."}
            </span>
          </CardContent>
        </Card>
      ) : reportQuery.error || !report ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-destructive">
            {reportQuery.error instanceof Error
              ? reportQuery.error.message
              : language === "vi"
              ? "Không thể tải dữ liệu chi tiết báo cáo."
              : "Unable to load report detail."}
          </CardContent>
        </Card>
      ) : (
        <>
          {actionError ? (
            <Alert variant="destructive">
              <AlertTitle>{language === "vi" ? "Thao tác thất bại" : "Action failed"}</AlertTitle>
              <AlertDescription>{actionError}</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle>{language === "vi" ? "Tóm tắt nhanh" : "Quick summary"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-border/70 bg-background/70 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{language === "vi" ? "Người mua" : "Buyer"}</p>
                    <p className="mt-1 font-semibold">{report.buyerName || "-"}</p>
                    <p className="mt-2 text-sm text-muted-foreground inline-flex items-center gap-1 break-all">
                      <Mail className="h-3.5 w-3.5" />
                      {report.buyerEmail || "-"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-emerald-300/60 bg-emerald-50/60 p-4">
                    <p className="text-xs uppercase tracking-wide text-emerald-700/90 inline-flex items-center gap-1">
                      <Wallet className="h-3.5 w-3.5" />
                      {language === "vi" ? "Số tiền hoàn" : "Refund amount"}
                    </p>
                    <p className="mt-1 text-2xl font-bold text-emerald-700">{formatVND(report.refundAmount)}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    className={
                      report.orderStatus === "Completed"
                        ? "border-emerald-700/30 bg-emerald-500/10 text-emerald-800"
                        : "border-primary/30 text-primary"
                    }
                  >
                    {language === "vi" ? "Đơn hàng" : "Order"}: {report.orderStatus || "-"}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={
                      report.transactionStatus === "Paid"
                        ? "border-emerald-700/30 bg-emerald-500/10 text-emerald-800"
                        : "border-primary/30 text-primary"
                    }
                  >
                    <CreditCard className="mr-1 h-3.5 w-3.5" />
                    {language === "vi" ? "Giao dịch" : "Transaction"}: {report.transactionStatus || "-"}
                  </Badge>
                </div>

                {report.inspectorMessage ? (
                  <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {language === "vi" ? "Ghi chú inspector" : "Inspector note"}
                    </p>
                    <p className="mt-1 text-sm">{report.inspectorMessage}</p>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle>{language === "vi" ? "Hành động" : "Action"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
                  onClick={() => refundMutation.mutate(report.reportId)}
                  disabled={isRefunding}
                >
                  {isRefunding ? (
                    <>
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                      {language === "vi" ? "Đang xử lý" : "Processing"}
                    </>
                  ) : language === "vi" ? (
                    "Hoàn tiền"
                  ) : (
                    "Refund"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>{language === "vi" ? "Tài khoản nhận hoàn" : "Refund account"}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-border/70 bg-background/70 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground inline-flex items-center gap-1">
                  <Landmark className="h-3.5 w-3.5" />
                  {language === "vi" ? "Ngân hàng" : "Bank"}
                </p>
                <p className="mt-1 font-medium">{report.bankName || "-"}</p>
              </div>
              <div className="rounded-xl border border-border/70 bg-background/70 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{language === "vi" ? "Số tài khoản" : "Account number"}</p>
                <p className="mt-1 font-medium">{report.bankAccountNumber || "-"}</p>
              </div>
              <div className="rounded-xl border border-border/70 bg-background/70 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{language === "vi" ? "Tên tài khoản" : "Account name"}</p>
                <p className="mt-1 font-medium">{report.bankAccountName || "-"}</p>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <Dialog open={resultModal.open}>
        <DialogContent className="sm:max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{resultModal.title}</DialogTitle>
            <DialogDescription>{resultModal.description}</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {language === "vi" ? "Đang quay lại danh sách..." : "Redirecting to list..."}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
