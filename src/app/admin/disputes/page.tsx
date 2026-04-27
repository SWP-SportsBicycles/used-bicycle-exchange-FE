"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Calendar, Eye, FileWarning, User, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  const [page] = useState(1);

  const reportsQuery = useQuery({
    queryKey: ["admin-reports", page],
    queryFn: () =>
      adminApi.getReports({
        page,
        size: 10,
      }),
    refetchInterval: 30000,
    refetchOnMount: "always",
  });

  const reportData = reportsQuery.data;
  const reports = reportData?.items ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {language === "vi" ? "Quản Lý Khiếu Nại" : "Complaint Management"}
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
        </CardHeader>
        <CardContent className="space-y-4">
          {reportsQuery.isLoading ? (
            <div className="py-10 text-center text-muted-foreground">
              {language === "vi" ? "Đang tải dữ liệu..." : "Loading reports..."}
            </div>
          ) : reports.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              {language === "vi"
                ? "Không có báo cáo phù hợp."
                : "No matching reports found."}
            </div>
          ) : (
            reports.map((report, index) => {
              const badgeTone =
                STATUS_BADGE_TONE[report.status] ??
                "bg-muted text-muted-foreground border-border";

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
                        <Badge
                          variant="outline"
                          className={cn("text-xs", badgeTone)}
                        >
                          {report.status || "-"}
                        </Badge>
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(report.createdAt).toLocaleString("vi-VN")}
                        </span>
                      </div>

                      <div className="grid gap-2 text-sm">
                        <p className="inline-flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {language === "vi" ? "Người mua:" : "Buyer:"}
                          </span>
                          <span className="font-medium">{report.buyerName || "-"}</span>
                        </p>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="rounded-xl border border-border/60 bg-background/70 p-3">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            {language === "vi" ? "Lý do" : "Reason"}
                          </p>
                          <p className="mt-1 text-sm font-medium">
                            {report.reason || "-"}
                          </p>
                        </div>
                        <div className="rounded-xl border border-border/60 bg-background/70 p-3">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            {language === "vi" ? "Mô tả" : "Description"}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {report.description || "-"}
                          </p>
                        </div>
                      </div>

                      {report.videoUrl ? (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">
                            {language === "vi"
                              ? "Video bằng chứng"
                              : "Evidence video"}
                          </p>
                          <video
                            controls
                            className="max-h-72 w-full rounded-lg border border-border/60 bg-black/80"
                          >
                            <source src={report.videoUrl} />
                            {language === "vi"
                              ? "Trình duyệt không hỗ trợ video."
                              : "Your browser does not support video."}
                          </video>
                        </div>
                      ) : null}
                    </div>

                    <div className="flex flex-col-reverse gap-2 border-t border-border/60 pt-3 sm:flex-row sm:justify-end">
                      <Button asChild>
                        <Link href={`/admin/disputes/${report.reportId}`}>
                          <Eye className="mr-1 h-4 w-4" />
                          {language === "vi" ? "Chi tiết" : "Detail"}
                        </Link>
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
