"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FileWarning, User, Package, CreditCard, Calendar, Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";
import { inspectorApi, type InspectorReportItem } from "@/lib/api/inspector-api";
import { cn } from "@/lib/utils";

type ReportFilter = "all" | "approved" | "rejected";

const statusColors: Record<string, string> = {
  Pending: "bg-amber-500/15 text-amber-700 border-amber-500/25",
  Reviewing: "bg-blue-500/15 text-blue-700 border-blue-500/25",
  Resolved: "bg-emerald-500/15 text-emerald-700 border-emerald-500/25",
  Rejected: "bg-rose-500/15 text-rose-700 border-rose-500/25",
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

const approvedStatuses = new Set(["Resolved", "Approved", "Confirmed", "Accepted"]);
const rejectedStatuses = new Set(["Rejected", "Declined"]);

function formatDate(dateString: string, language: "vi" | "en"): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(language === "vi" ? "vi-VN" : "en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function InspectorReportPage() {
  const { language } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<ReportFilter>("all");

  const reportsQuery = useQuery({
    queryKey: ["inspector-reports"],
    queryFn: inspectorApi.getReports,
    refetchInterval: 30000,
    refetchOnMount: "always",
  });

  const reports = reportsQuery.data ?? [];
  const filteredReports = useMemo(() => {
    if (activeFilter === "approved") {
      return reports.filter((report) => approvedStatuses.has(report.status));
    }

    if (activeFilter === "rejected") {
      return reports.filter((report) => rejectedStatuses.has(report.status));
    }

    return reports;
  }, [activeFilter, reports]);

  const countByFilter = useMemo(() => {
    const approved = reports.filter((report) => approvedStatuses.has(report.status)).length;
    const rejected = reports.filter((report) => rejectedStatuses.has(report.status)).length;
    return {
      all: reports.length,
      approved,
      rejected,
    };
  }, [reports]);

  const filterLabel: Record<ReportFilter, { vi: string; en: string }> = {
    all: { vi: "Tất cả", en: "All" },
    approved: { vi: "Chấp thuận", en: "Approved" },
    rejected: { vi: "Bác bỏ", en: "Rejected" },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-archivo)" }}>
          {language === "vi" ? "Báo Cáo Kiểm Định" : "Inspection Reports"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {language === "vi"
            ? "Xem các báo cáo khiếu nại từ người mua cần kiểm định"
            : "View buyer complaint reports requiring inspection"}
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <CardTitle>{language === "vi" ? "Danh sách báo cáo" : "Report List"}</CardTitle>
            <CardDescription>
              {language === "vi"
                ? "Các báo cáo khiếu nại giao dịch cần xử lý"
                : "Transaction complaint reports to process"}
            </CardDescription>
          </div>
          <Badge variant="outline" className="w-fit">
            <FileWarning className="h-3.5 w-3.5 mr-1" />
            {filteredReports.length} {language === "vi" ? "báo cáo" : "reports"}
          </Badge>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            {(["all", "approved", "rejected"] as const).map((filter) => {
              const isActive = activeFilter === filter;

              return (
                <Button
                  key={filter}
                  type="button"
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter(filter)}
                  className={cn(!isActive && "bg-background")}
                >
                  {filterLabel[filter][language]} ({countByFilter[filter]})
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {reportsQuery.isLoading ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              {language === "vi" ? "Đang tải dữ liệu..." : "Loading..."}
            </CardContent>
          </Card>
        ) : filteredReports.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              {language === "vi" ? "Không có báo cáo nào phù hợp bộ lọc." : "No reports matched the selected filter."}
            </CardContent>
          </Card>
        ) : (
          filteredReports.map((report: InspectorReportItem, index) => {
            return (
            <motion.div
              key={report.reportId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
            >
              <Card className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={cn("text-xs", statusColors[report.status] ?? "bg-muted text-muted-foreground border-border")}>
                      {statusLabels[report.status]?.[language] ?? report.status}
                    </Badge>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(report.createdAt, language)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{language === "vi" ? "Người mua:" : "Buyer:"}</span>
                        <span className="text-sm font-medium">{report.buyerName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{language === "vi" ? "Giao hàng:" : "Delivery:"}</span>
                        <Badge variant="outline" className={cn("text-xs", orderStatusColors[report.orderStatus] ?? "bg-muted text-muted-foreground border-border")}>
                          {orderStatusLabels[report.orderStatus] ?? report.orderStatus}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{language === "vi" ? "Giao dịch:" : "Transaction:"}</span>
                        <Badge variant="outline" className={cn("text-xs", transactionStatusColors[report.transactionStatus] ?? "bg-muted text-muted-foreground border-border")}>
                          {transactionStatusLabels[report.transactionStatus] ?? report.transactionStatus}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="rounded-xl border border-border/60 bg-background/70 p-3">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          {language === "vi" ? "Lý do" : "Reason"}
                        </p>
                        <p className="mt-1 text-sm font-medium">{report.reason}</p>
                      </div>
                      <div className="rounded-xl border border-border/60 bg-background/70 p-3">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          {language === "vi" ? "Mô tả" : "Description"}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">{report.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col-reverse gap-2 border-t border-border/60 pt-3 sm:flex-row sm:justify-end">
                    <Button asChild>
                      <Link href={`/inspector/report/${report.reportId}`}>
                        <Eye className="mr-1 h-4 w-4" />
                        {language === "vi" ? "Chi tiết" : "Detail"}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );})
        )}
      </div>
    </div>
  );
}
