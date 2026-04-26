"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CheckCircle2, Clock3, FileWarning, PlayCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { adminApi } from "@/lib/api/admin-api";
import { useLanguage } from "@/lib/language-context";
import { cn } from "@/lib/utils";

const STATUS_BADGE_TONE: Record<string, string> = {
  Resolved: "bg-emerald-500/15 text-emerald-700 border-emerald-500/25",
  Pending: "bg-amber-500/15 text-amber-700 border-amber-500/25",
  Rejected: "bg-rose-500/15 text-rose-700 border-rose-500/25",
};

export default function DisputesPage() {
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [processingReportId, setProcessingReportId] = useState<string | null>(null);

  const reportsQuery = useQuery({
    queryKey: ["admin-reports", page],
    queryFn: () =>
      adminApi.getReports({
        page,
        size: 10,
      }),
    refetchInterval: 30000,
  });

  const approveMutation = useMutation({
    mutationFn: adminApi.approveReport,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
    },
    onSettled: () => {
      setProcessingReportId(null);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: adminApi.rejectReport,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
    },
    onSettled: () => {
      setProcessingReportId(null);
    },
  });

  const reportData = reportsQuery.data;
  const reports = reportData?.items ?? [];
  const totalPages = Math.max(reportData?.totalPages ?? 1, 1);

  const handleApprove = (reportId: string) => {
    setProcessingReportId(reportId);
    approveMutation.mutate(reportId);
  };

  const handleReject = (reportId: string) => {
    setProcessingReportId(reportId);
    rejectMutation.mutate(reportId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {language === "vi" ? "Quản Lý Báo Cáo" : "Report Management"}
        </h1>
        <p className="text-muted-foreground">
          {language === "vi"
            ? "Xử lý khiếu nại giao dịch, ưu tiên thông tin quan trọng và bằng chứng video."
            : "Review transaction reports with key context and video evidence."}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileWarning className="h-5 w-5 text-primary" />
            {language === "vi" ? "Danh sách báo cáo" : "Report list"}
          </CardTitle>
          <CardDescription>{language === "vi" ? "Thiết kế tối ưu để xử lý nhanh và dễ đọc." : "Optimized for readability and fast decision making."}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {reportsQuery.isLoading ? (
            <div className="py-10 text-center text-muted-foreground">
              {language === "vi" ? "Đang tải dữ liệu..." : "Loading reports..."}
            </div>
          ) : reports.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              {language === "vi" ? "Không có báo cáo phù hợp." : "No matching reports found."}
            </div>
          ) : (
            reports.map((report, index) => {
              const actionLoading = processingReportId === report.reportId;
              const isActionDisabled =
                actionLoading || approveMutation.isPending || rejectMutation.isPending;
              const badgeTone = STATUS_BADGE_TONE[report.status] ?? "bg-muted text-muted-foreground border-border";

              return (
                <motion.div
                  key={report.reportId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="rounded-2xl border border-border/60 bg-linear-to-br from-card to-muted/20 p-4 shadow-athletic"
                >
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className={cn("text-xs", badgeTone)}>
                          {report.statusDisplay || report.status}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {report.type || (language === "vi" ? "Không rõ loại" : "Unknown type")}
                        </Badge>
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock3 className="h-3.5 w-3.5" />
                          {new Date(report.createdAt).toLocaleString("vi-VN")}
                        </span>
                        {report.videoUrl ? (
                          <Badge variant="outline" className="border-primary/30 text-primary">
                            <PlayCircle className="mr-1 h-3.5 w-3.5" />
                            {language === "vi" ? "Có video" : "Video attached"}
                          </Badge>
                        ) : null}
                      </div>

                      <div className="grid gap-2 text-sm sm:grid-cols-2">
                        <p>
                          <span className="text-muted-foreground">{language === "vi" ? "Người báo cáo: " : "Buyer: "}</span>
                          <span className="font-medium">{report.buyerName || "-"}</span>
                        </p>
                        <p>
                          <span className="text-muted-foreground">{language === "vi" ? "Trạng thái đơn: " : "Order status: "}</span>
                          <span className="font-medium">{report.orderStatus || "-"}</span>
                        </p>
                        <p>
                          <span className="text-muted-foreground">{language === "vi" ? "Giao dịch: " : "Transaction: "}</span>
                          <span className="font-medium">{report.transactionStatus || "-"}</span>
                        </p>
                        <p>
                          <span className="text-muted-foreground">{language === "vi" ? "Hành động tiếp theo: " : "Next action: "}</span>
                          <span className="font-medium">{report.nextAction || "-"}</span>
                        </p>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="rounded-xl border border-border/60 bg-background/70 p-3">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            {language === "vi" ? "Lý do" : "Reason"}
                          </p>
                          <p className="mt-1 text-sm font-medium">{report.reason || "-"}</p>
                        </div>
                        <div className="rounded-xl border border-border/60 bg-background/70 p-3">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            {language === "vi" ? "Mô tả" : "Description"}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">{report.description || "-"}</p>
                        </div>
                      </div>

                      {report.videoUrl ? (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">
                            {language === "vi" ? "Video bằng chứng" : "Evidence video"}
                          </p>
                          <video controls className="max-h-72 w-full rounded-lg border border-border/60 bg-black/80">
                            <source src={report.videoUrl} />
                            {language === "vi" ? "Trình duyệt không hỗ trợ video." : "Your browser does not support video."}
                          </video>
                        </div>
                      ) : null}
                    </div>

                    <div className="flex flex-col-reverse gap-2 border-t border-border/60 pt-3 sm:flex-row sm:justify-end">
                      <Button
                        className="bg-rose-600 text-white hover:bg-rose-700"
                        onClick={() => handleReject(report.reportId)}
                        disabled={isActionDisabled}
                      >
                        <XCircle className="mr-1 h-4 w-4" />
                        {language === "vi" ? "Từ chối" : "Reject"}
                      </Button>
                      <Button
                        className="bg-emerald-600 text-white hover:bg-emerald-700"
                        onClick={() => handleApprove(report.reportId)}
                        disabled={isActionDisabled}
                      >
                        <CheckCircle2 className="mr-1 h-4 w-4" />
                        {language === "vi" ? "Chấp nhận" : "Approve"}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}

        </CardContent>
      </Card>
    </div>
  );
}

