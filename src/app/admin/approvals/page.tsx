"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Check, Clock, Eye, Loader2, X, Package, ChevronRight, Calendar } from "lucide-react";
import { adminApi } from "@/lib/api/admin-api";
import { useLanguage } from "@/lib/language-context";
import { formatVND } from "@/lib/mock-data";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ListingFilter = "all" | "pending" | "approved" | "rejected";

const statusStyles: Record<string, { badge: string; border: string; label: { vi: string; en: string } }> = {
  pending: {
    badge: "bg-amber-100 text-amber-700 border-amber-300/60 dark:bg-amber-900/30 dark:text-amber-400",
    border: "border-l-amber-400",
    label: { vi: "Chờ duyệt", en: "Pending" },
  },
  approved: {
    badge: "bg-emerald-100 text-emerald-700 border-emerald-300/60 dark:bg-emerald-900/30 dark:text-emerald-400",
    border: "border-l-emerald-400",
    label: { vi: "Đã duyệt", en: "Approved" },
  },
  rejected: {
    badge: "bg-rose-100 text-rose-700 border-rose-300/60 dark:bg-rose-900/30 dark:text-rose-400",
    border: "border-l-rose-400",
    label: { vi: "Từ chối", en: "Rejected" },
  },
};

export default function ApprovalsPage() {
  const { language } = useLanguage();
  const [activeStatus, setActiveStatus] = useState<ListingFilter>("pending");
  const [allPage, setAllPage] = useState(1);

  const allListingsQuery = useQuery({
    queryKey: ["admin-listings", "all", allPage],
    queryFn: () => adminApi.getAllListingsPaged({ page: allPage, size: 10 }),
  });

  const pendingListingsQuery = useQuery({
    queryKey: ["admin-listings", "pending"],
    queryFn: adminApi.getListings,
  });

  const allListings = allListingsQuery.data?.items ?? [];
  const allListingsTotalItems = allListingsQuery.data?.totalItems ?? allListings.length;
  const allListingsTotalPages = Math.max(allListingsQuery.data?.totalPages ?? 1, 1);
  const pendingListings = pendingListingsQuery.data ?? [];
  const pendingApprovals = pendingListings.filter((item) => item.status === "pending");
  const approvedApprovals = allListings.filter((item) => item.status === "approved");
  const rejectedApprovals = allListings.filter((item) => item.status === "rejected");

  const filteredApprovals =
    activeStatus === "all"
      ? allListings
      : activeStatus === "pending"
      ? pendingApprovals
      : activeStatus === "approved"
      ? approvedApprovals
      : rejectedApprovals;

  const isCurrentListLoading = activeStatus === "pending" ? pendingListingsQuery.isLoading : allListingsQuery.isLoading;

  const filterTabs: { key: ListingFilter; label: { vi: string; en: string }; count: number; tone?: string }[] = [
    { key: "all", label: { vi: "Tất cả", en: "All" }, count: allListingsTotalItems },
    { key: "pending", label: { vi: "Chờ duyệt", en: "Pending" }, count: pendingApprovals.length, tone: "amber" },
    { key: "approved", label: { vi: "Đã duyệt", en: "Approved" }, count: approvedApprovals.length },
    { key: "rejected", label: { vi: "Từ chối", en: "Rejected" }, count: rejectedApprovals.length },
  ];

  const listTitle =
    activeStatus === "all"
      ? language === "vi" ? "Tất Cả Tin Đăng" : "All Listings"
      : activeStatus === "pending"
      ? language === "vi" ? "Tin Đăng Chờ Duyệt" : "Pending Listings"
      : activeStatus === "approved"
      ? language === "vi" ? "Tin Đăng Đã Duyệt" : "Approved Listings"
      : language === "vi" ? "Tin Đăng Bị Từ Chối" : "Rejected Listings";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-archivo)" }}>
            {language === "vi" ? "Duyệt Tin Đăng" : "Listing Approval"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === "vi"
              ? "Xét duyệt tin đăng mới và xác minh số serial"
              : "Review new listings and verify serial numbers"}
          </p>
        </div>
        <Badge variant="outline" className="text-xs px-3 py-1.5">
          <Package className="h-3.5 w-3.5 mr-1.5" />
          {filteredApprovals.length} {language === "vi" ? "tin đăng" : "listings"}
        </Badge>
      </div>

      {(allListingsQuery.error || pendingListingsQuery.error) && (
        <Alert variant="destructive">
          <AlertDescription>
            {allListingsQuery.error instanceof Error
              ? allListingsQuery.error.message
              : pendingListingsQuery.error instanceof Error
              ? pendingListingsQuery.error.message
              : language === "vi"
              ? "Không thể tải danh sách tin đăng."
              : "Unable to load listings."}
          </AlertDescription>
        </Alert>
      )}

      {/* Filter Tabs */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-2">
            {filterTabs.map((tab) => {
              const isActive = activeStatus === tab.key;
              return (
                <Button
                  key={tab.key}
                  type="button"
                  size="sm"
                  variant={isActive ? "default" : "outline"}
                  onClick={() => {
                    setActiveStatus(tab.key);
                    if (tab.key === "all") {
                      setAllPage(1);
                      void allListingsQuery.refetch();
                    }
                  }}
                  className={cn(
                    !isActive && "bg-background",
                    isActive && tab.tone === "amber" && "bg-amber-600 hover:bg-amber-700"
                  )}
                >
                  {tab.label[language]} ({tab.count})
                  {tab.key === "pending" && tab.count > 0 && !isActive && (
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

      {/* Listing Cards */}
      <Card>
        <CardHeader>
          <CardTitle>{listTitle}</CardTitle>
          <CardDescription>
            {activeStatus === "pending"
              ? language === "vi" ? "Xác minh số serial và thông tin trước khi duyệt" : "Verify serial number and information before approval"
              : language === "vi" ? "Danh sách được lọc theo trạng thái" : "List filtered by status"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isCurrentListLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {language === "vi" ? "Đang tải danh sách..." : "Loading listings..."}
            </div>
          ) : filteredApprovals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              {activeStatus === "pending" && <Clock className="h-12 w-12 mb-3 text-amber-400" />}
              {activeStatus === "approved" && <Check className="h-12 w-12 mb-3 text-emerald-400" />}
              {activeStatus === "rejected" && <X className="h-12 w-12 mb-3 text-rose-400" />}
              {activeStatus === "all" && <Package className="h-12 w-12 mb-3 opacity-30" />}
              <p className="font-medium">
                {activeStatus === "all"
                  ? language === "vi" ? "Không có tin đăng" : "No listings"
                  : activeStatus === "pending"
                  ? language === "vi" ? "Không có tin nào chờ duyệt" : "No pending listings"
                  : activeStatus === "approved"
                  ? language === "vi" ? "Không có tin nào đã duyệt" : "No approved listings"
                  : language === "vi" ? "Không có tin nào bị từ chối" : "No rejected listings"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredApprovals.map((listing, index) => {
                const style = statusStyles[listing.status] ?? statusStyles.pending;
                return (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                  >
                    <div className={cn(
                      "rounded-xl border border-border/60 p-4 hover:shadow-md hover:border-primary/30 transition-all duration-200 border-l-4",
                      style.border
                    )}>
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                        <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted shrink-0">
                          {listing.images[0] ? (
                            <Image src={listing.images[0]} alt={listing.title} width={64} height={64} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">No img</div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="font-semibold truncate">{listing.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {listing.brand || "-"} {listing.model || ""}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className={cn("text-xs", style.badge)}>
                              {style.label[language]}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {listing.city || (language === "vi" ? "Chưa cập nhật" : "N/A")}
                            </Badge>
                            <span className="text-sm font-semibold text-primary">{formatVND(listing.price)}</span>
                            {listing.submittedAt && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(listing.submittedAt).toLocaleDateString("vi-VN")}
                              </span>
                            )}
                          </div>
                        </div>

                        <Button size="sm" asChild className="shrink-0 transition-all hover:-translate-y-0.5 hover:shadow-md">
                          <Link href={`/admin/approvals/details/${listing.id}`}>
                            <Eye className="mr-1 h-4 w-4" />
                            {language === "vi" ? "Chi tiết" : "Detail"}
                            <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {activeStatus === "all" && allListingsTotalPages > 1 && (
            <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-4">
              <p className="text-sm text-muted-foreground">
                {language === "vi" ? "Trang" : "Page"} {allPage}/{allListingsTotalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={allPage <= 1 || allListingsQuery.isFetching}
                  onClick={() => setAllPage((prev) => Math.max(1, prev - 1))}
                >
                  {language === "vi" ? "Trước" : "Prev"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={allPage >= allListingsTotalPages || allListingsQuery.isFetching}
                  onClick={() => setAllPage((prev) => Math.min(allListingsTotalPages, prev + 1))}
                >
                  {language === "vi" ? "Sau" : "Next"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
