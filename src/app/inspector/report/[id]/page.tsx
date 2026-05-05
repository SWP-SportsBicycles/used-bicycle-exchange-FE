"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  CreditCard,
  FileWarning,
  Loader2,
  Package,
  User,
  Video,
  XCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { inspectorApi } from "@/lib/api/inspector-api";
import { useLanguage } from "@/lib/language-context";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  Pending: "bg-amber-500/15 text-amber-700 border-amber-500/25",
  Reviewing: "bg-blue-500/15 text-blue-700 border-blue-500/25",
  Resolved: "bg-emerald-500/15 text-emerald-700 border-emerald-500/25",
  Rejected: "bg-rose-500/15 text-rose-700 border-rose-500/25",
  Approved: "bg-emerald-500/15 text-emerald-700 border-emerald-500/25",
  Confirmed: "bg-emerald-500/15 text-emerald-700 border-emerald-500/25",
};

const orderStatusColors: Record<string, string> = {
  Completed: "bg-emerald-500/15 text-emerald-700 border-emerald-500/25",
  Delivered: "bg-emerald-500/15 text-emerald-700 border-emerald-500/25",
};

const transactionStatusColors: Record<string, string> = {
  Paid: "bg-emerald-500/15 text-emerald-700 border-emerald-500/25",
  Refunded: "bg-blue-500/15 text-blue-700 border-blue-500/25",
  RefundPending: "bg-amber-500/15 text-amber-700 border-amber-500/25",
};

const orderStatusLabels: Record<string, string> = {
  Completed: "Hoàn thành",
  Delivered: "Đã giao",
  Pending: "Đang chờ",
  Processing: "Đang xử lý",
};

const transactionStatusLabels: Record<string, string> = {
  Paid: "Đã thanh toán",
  Refunded: "Đã hoàn tiền",
  RefundPending: "Chờ hoàn tiền",
};

const statusLabels: Record<string, { vi: string; en: string }> = {
  Pending: { vi: "Đang chờ xử lý", en: "Pending" },
  Reviewing: { vi: "Đang xem xét", en: "Reviewing" },
  Resolved: { vi: "Đã giải quyết", en: "Resolved" },
  Rejected: { vi: "Đã từ chối", en: "Rejected" },
  Approved: { vi: "Đã chấp thuận", en: "Approved" },
  Confirmed: { vi: "Đã chấp thuận", en: "Confirmed" },
  Accepted: { vi: "Đã chấp thuận", en: "Accepted" },
};

function formatDate(dateString: string, language: "vi" | "en"): string {
  if (!dateString) {
    return language === "vi" ? "Không có dữ liệu" : "No data";
  }

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString(language === "vi" ? "vi-VN" : "en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function InspectorReportDetailPage() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const reportId = params.id;
  const queryClient = useQueryClient();
  const [actionStatus, setActionStatus] = useState<"confirmed" | "rejected" | null>(null);
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
      router.push("/inspector/report");
    }, 2000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [resultModal.open, router]);

  const reportQuery = useQuery({
    queryKey: ["inspector-report-detail", reportId],
    queryFn: () => inspectorApi.getReportDetail(reportId),
    enabled: Boolean(reportId),
  });

  const confirmMutation = useMutation({
    mutationFn: inspectorApi.confirmReport,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["inspector-reports"] }),
        queryClient.invalidateQueries({ queryKey: ["inspector-report-detail", reportId] }),
      ]);
      await queryClient.fetchQuery({
        queryKey: ["inspector-reports"],
        queryFn: inspectorApi.getReports,
      });
      setActionStatus("confirmed");
      toast({
        title: language === "vi" ? "Đã chấp nhận" : "Confirmed",
        description:
          language === "vi"
            ? "Báo cáo này đã được duyệt thành công."
            : "This report has been approved successfully.",
      });
      setResultModal({
        open: true,
        title: language === "vi" ? "Chấp thuận thành công" : "Confirmed successfully",
        description:
          language === "vi"
            ? "Báo cáo đã được chấp thuận. Hệ thống sẽ quay về danh sách sau 2 giây."
            : "The report was confirmed. Redirecting to the report list in 2 seconds.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: language === "vi" ? "Không thể chấp nhận" : "Confirm failed",
        description:
          language === "vi"
            ? "Không thể chấp nhận báo cáo này. Vui lòng thử lại."
            : "Unable to confirm this report. Please try again.",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: inspectorApi.rejectReport,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["inspector-reports"] }),
        queryClient.invalidateQueries({ queryKey: ["inspector-report-detail", reportId] }),
      ]);
      await queryClient.fetchQuery({
        queryKey: ["inspector-reports"],
        queryFn: inspectorApi.getReports,
      });
      setActionStatus("rejected");
      toast({
        variant: "destructive",
        title: language === "vi" ? "Đã từ chối" : "Rejected",
        description:
          language === "vi"
            ? "Báo cáo này đã bị từ chối."
            : "This report has been rejected.",
      });
      setResultModal({
        open: true,
        title: language === "vi" ? "Bác bỏ thành công" : "Rejected successfully",
        description:
          language === "vi"
            ? "Báo cáo đã được bác bỏ. Hệ thống sẽ quay về danh sách sau 2 giây."
            : "The report was rejected. Redirecting to the report list in 2 seconds.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: language === "vi" ? "Không thể từ chối" : "Reject failed",
        description:
          language === "vi"
            ? "Không thể từ chối báo cáo này. Vui lòng thử lại."
            : "Unable to reject this report. Please try again.",
      });
    },
  });

  const report = reportQuery.data;
  const isActionLoading = confirmMutation.isPending || rejectMutation.isPending || resultModal.open;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-archivo)" }}>
            {language === "vi" ? "Chi tiết báo cáo kiểm định" : "Inspection report detail"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {language === "vi"
              ? "Xem đầy đủ nội dung báo cáo và xác nhận xử lý."
              : "Review full report information and process actions."}
          </p>
        </div>

        <Button variant="outline" asChild>
          <Link href="/inspector/report">
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
              ? "Không thể tải chi tiết báo cáo."
              : "Unable to load report detail."}
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={cn("text-xs", statusColors[report.status] ?? "bg-muted text-muted-foreground border-border")}>
                  {statusLabels[report.status]?.[language] ?? report.status}
                </Badge>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(report.createdAt, language)}
                </span>
              </div>
              <Badge variant="outline" className="w-fit">
                <FileWarning className="mr-1 h-3.5 w-3.5" />
                #{report.reportId}
              </Badge>
            </div>
            <CardTitle className="pt-2 text-base">{language === "vi" ? "Thông tin báo cáo" : "Report information"}</CardTitle>
            <CardDescription>
              {language === "vi"
                ? "Dữ liệu chi tiết tương tự màn danh sách và bổ sung video bằng chứng."
                : "The same report information as list view plus evidence video."}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {actionStatus === "confirmed" && (
              <Alert className="border-success/40 bg-success/10">
                <AlertDescription className="text-success">
                  {language === "vi"
                    ? "Đơn này đã được duyệt thành công."
                    : "This report has been approved successfully."}
                </AlertDescription>
              </Alert>
            )}
            {actionStatus === "rejected" && (
              <Alert variant="destructive">
                <AlertDescription>
                  {language === "vi"
                    ? "Đơn này đã bị từ chối."
                    : "This report has been rejected."}
                </AlertDescription>
              </Alert>
            )}
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{language === "vi" ? "Người mua:" : "Buyer:"}</span>
                  <span className="text-sm font-medium">{report.buyerName || "-"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{language === "vi" ? "Giao hàng:" : "Delivery:"}</span>
                  <Badge variant="outline" className={cn("text-xs", orderStatusColors[report.orderStatus] ?? "bg-muted text-muted-foreground border-border")}>
                    {orderStatusLabels[report.orderStatus] ?? report.orderStatus ?? "-"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{language === "vi" ? "Giao dịch:" : "Transaction:"}</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      transactionStatusColors[report.transactionStatus] ?? "bg-muted text-muted-foreground border-border",
                    )}
                  >
                    {transactionStatusLabels[report.transactionStatus] ?? report.transactionStatus ?? "-"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-xl border border-border/60 bg-background/70 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{language === "vi" ? "Lý do" : "Reason"}</p>
                  <p className="mt-1 text-sm font-medium">{report.reason || "-"}</p>
                </div>
                <div className="rounded-xl border border-border/60 bg-background/70 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {language === "vi" ? "Mô tả" : "Description"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{report.description || "-"}</p>
                </div>
              </div>
            </div>

            {report.videoUrl ? (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Video className="h-3.5 w-3.5" />
                  {language === "vi" ? "Video bằng chứng" : "Evidence Video"}
                </p>
                <video controls className="max-h-96 w-full rounded-lg border border-border/60 bg-black/80">
                  <source src={report.videoUrl} />
                  {language === "vi" ? "Trình duyệt không hỗ trợ video." : "Your browser does not support video."}
                </video>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border/80 p-4 text-sm text-muted-foreground">
                {language === "vi" ? "Báo cáo này không có video bằng chứng." : "This report does not include an evidence video."}
              </div>
            )}

            <div className="flex flex-col-reverse gap-2 border-t border-border/60 pt-3 sm:flex-row sm:justify-end">
              <Button
                className="bg-rose-600 text-white hover:bg-rose-700"
                onClick={() => rejectMutation.mutate(report.reportId)}
                disabled={isActionLoading}
              >
                <XCircle className="mr-1 h-4 w-4" />
                {language === "vi" ? "Từ chối" : "Reject"}
              </Button>
              <Button
                className="bg-emerald-600 text-white hover:bg-emerald-700"
                onClick={() => confirmMutation.mutate(report.reportId)}
                disabled={isActionLoading}
              >
                <CheckCircle2 className="mr-1 h-4 w-4" />
                {language === "vi" ? "Chấp nhận" : "Confirm"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      <Dialog open={resultModal.open}>
        <DialogContent className="sm:max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{resultModal.title}</DialogTitle>
            <DialogDescription>{resultModal.description}</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {language === "vi" ? "Đang chuyển trang..." : "Redirecting..."}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
