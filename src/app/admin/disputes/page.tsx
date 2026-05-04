"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Calendar, Eye, FileWarning, User, Loader2, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
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

type DisputeFilter = "all" | "pending" | "resolved" | "rejected";

const STATUS_CONFIG: Record<string, { badge: string; border: string; label: { vi: string; en: string } }> = {
  Pending: {
    badge: "bg-amber-100 text-amber-700 border-amber-300/60 dark:bg-amber-900/30 dark:text-amber-400",
    border: "border-l-amber-400",
    label: { vi: "Đang chờ xử lý", en: "Pending" },
  },
  Resolved: {
    badge: "bg-emerald-100 text-emerald-700 border-emerald-300/60 dark:bg-emerald-900/30 dark:text-emerald-400",
    border: "border-l-emerald-400",
    label: { vi: "Đã giải quyết", en: "Resolved" },
  },
  Rejected: {
    badge: "bg-rose-100 text-rose-700 border-rose-300/60 dark:bg-rose-900/30 dark:text-rose-400",
    border: "border-l-rose-400",
    label: { vi: "Đã từ chối", en: "Rejected" },
  },
};

export default function DisputesPage() {
  const { language } = useLanguage();
  const [page] = useState(1);
  const [activeFilter, setActiveFilter] = useState<DisputeFilter>("all");

  const reportsQuery = useQuery({
    queryKey: ["admin-reports", page],
    queryFn: () =>
      adminApi.getReports({
        page,
        size: 20,
      }),
    refetchInterval: 30000,
    refetchOnMount: "always",
  });

  const reportData = reportsQuery.data;
  const reports = useMemo(() => reportData?.items ?? [], [reportData]);

  const filteredReports = useMemo(() => {
    if (activeFilter === "pending") return reports.filter((r) => r.status === "Pending");
    if (activeFilter === "resolved") return reports.filter((r) => r.status === "Resolved");
    if (activeFilter === "rejected") return reports.filter((r) => r.status === "Rejected");
    return reports;
  }, [activeFilter, reports]);

  const counts = useMemo(() => ({
    all: reports.length,
    pending: reports.filter((r) => r.status === "Pending").length,
    resolved: reports.filter((r) => r.status === "Resolved").length,
    rejected: reports.filter((r) => r.status === "Rejected").length,
  }), [reports]);

  const filterTabs: { key: DisputeFilter; label: { vi: string; en: string }; tone?: string }[] = [
    { key: "all", label: { vi: "Tất cả", en: "All" } },
    { key: "pending", label: { vi: "Chờ xử lý", en: "Pending" }, tone: "amber" },
    { key: "resolved", label: { vi: "Đã giải quyết", en: "Resolved" } },
    { key: "rejected", label: { vi: "Đã từ chối", en: "Rejected" } },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-archivo)" }}>
            {language === "vi" ? "Quản Lý Khiếu Nại" : "Complaint Management"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === "vi"
              ? "Xử lý khiếu nại giao dịch, ưu tiên thông tin quan trọng và bằng chứng video"
              : "Review transaction reports with key context and video evidence"}
          </p>
        </div>
        <Badge variant="outline" className="text-xs px-3 py-1.5">
          <FileWarning className="h-3.5 w-3.5 mr-1.5" />
          {filteredReports.length} {language === "vi" ? "báo cáo" : "reports"}
        </Badge>
      </div>

      {/* Filter Tabs */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-2">
            {filterTabs.map((tab) => {
              const isActive = activeFilter === tab.key;
              const count = counts[tab.key];
              return (
                <Button
                  key={tab.key}
                  type="button"
                  size="sm"
                  variant={isActive ? "default" : "outline"}
                  onClick={() => setActiveFilter(tab.key)}
                  className={cn(
                    !isActive && "bg-background",
                    isActive && tab.tone === "amber" && "bg-amber-600 hover:bg-amber-700"
                  )}
                >
                  {tab.label[language]} ({count})
                  {tab.key === "pending" && count > 0 && !isActive && (
                    <span className="relative flex h-2 w-2 ml-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                    </span>
                  )}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Report List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileWarning className="h-5 w-5 text-primary" />
            {language === "vi" ? "Danh sách báo cáo" : "Report List"}
          </CardTitle>
          <CardDescription>
            {language === "vi"
              ? "Xem chi tiết và xử lý từng khiếu nại"
              : "View details and process each complaint"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {reportsQuery.isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {language === "vi" ? "Đang tải dữ liệu..." : "Loading reports..."}
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              {activeFilter === "pending" && <AlertTriangle className="h-12 w-12 mb-3 text-amber-400" />}
              {activeFilter === "resolved" && <CheckCircle2 className="h-12 w-12 mb-3 text-emerald-400" />}
              {activeFilter === "rejected" && <XCircle className="h-12 w-12 mb-3 text-rose-400" />}
              {activeFilter === "all" && <FileWarning className="h-12 w-12 mb-3 opacity-30" />}
              <p className="font-medium">{language === "vi" ? "Không có báo cáo phù hợp." : "No matching reports found."}</p>
            </div>
          ) : (
            filteredReports.map((report, index) => {
              const config = STATUS_CONFIG[report.status] ?? STATUS_CONFIG.Pending;
              return (
                <motion.div
                  key={report.reportId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className={cn(
                    "rounded-xl border border-border/60 bg-gradient-to-br from-card to-muted/10 p-4 hover:shadow-md hover:border-primary/30 transition-all duration-200 border-l-4",
                    config.border
                  )}
                >
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className={cn("text-xs", config.badge)}>
                        {config.label[language]}
                      </Badge>
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(report.createdAt).toLocaleString("vi-VN")}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {language === "vi" ? "Người mua:" : "Buyer:"}
                      </span>
                      <span className="font-medium">{report.buyerName || "-"}</span>
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
                        <video
                          controls
                          className="max-h-56 w-full rounded-lg border border-border/60 bg-black/80"
                        >
                          <source src={report.videoUrl} />
                          {language === "vi" ? "Trình duyệt không hỗ trợ video." : "Your browser does not support video."}
                        </video>
                      </div>
                    ) : null}

                    <div className="flex justify-end border-t border-border/60 pt-3">
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
