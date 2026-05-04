"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Check, Clock, Eye, Loader2, X } from "lucide-react";
import { adminApi } from "@/lib/api/admin-api";
import { useLanguage } from "@/lib/language-context";
import { formatVND } from "@/lib/mock-data";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
type ListingFilter = "all" | "pending" | "approved" | "rejected";

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

  const filterLabel = {
    all: language === "vi" ? "Tất cả" : "All",
    pending: language === "vi" ? "Chờ duyệt" : "Pending",
    approved: language === "vi" ? "Đã duyệt" : "Approved",
    rejected: language === "vi" ? "Từ chối" : "Rejected",
  } as const;

  const listTitle =
    activeStatus === "all"
      ? language === "vi"
        ? "Tất Cả Tin Đăng"
        : "All Listings"
      : activeStatus === "pending"
      ? language === "vi"
        ? "Tin Đăng Chờ Duyệt"
        : "Pending Listings"
      : activeStatus === "approved"
      ? language === "vi"
        ? "Tin Đăng Đã Duyệt"
        : "Approved Listings"
      : language === "vi"
      ? "Tin Đăng Bị Từ Chối"
      : "Rejected Listings";

  const listDescription =
    activeStatus === "pending"
      ? language === "vi"
        ? "Xác minh số serial và thông tin trước khi duyệt"
        : "Verify serial number and information before approval"
      : language === "vi"
      ? "Danh sách được lọc theo trạng thái"
      : "List filtered by status";

  const emptyText =
    activeStatus === "all"
      ? language === "vi"
        ? "Không có tin đăng"
        : "No listings"
      : activeStatus === "pending"
      ? language === "vi"
        ? "Không có tin nào chờ duyệt"
        : "No pending listings"
      : activeStatus === "approved"
      ? language === "vi"
        ? "Không có tin nào đã duyệt"
        : "No approved listings"
      : language === "vi"
      ? "Không có tin nào bị từ chối"
      : "No rejected listings";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {language === "vi" ? "Duyệt Tin Đăng" : "Listing Approval"}
        </h1>
        <p className="text-muted-foreground">
          {language === "vi"
            ? "Xét duyệt tin đăng mới và xác minh số serial"
            : "Review new listings and verify serial numbers"}
        </p>
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

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={activeStatus === "all" ? "default" : "outline"}
              onClick={() => {
                setActiveStatus("all");
                setAllPage(1);
                void allListingsQuery.refetch();
              }}
            >
              {filterLabel.all} ({allListingsTotalItems})
            </Button>
            <Button
              type="button"
              size="sm"
              variant={activeStatus === "pending" ? "default" : "outline"}
              onClick={() => setActiveStatus("pending")}
            >
              {filterLabel.pending} ({pendingApprovals.length})
            </Button>
            <Button
              type="button"
              size="sm"
              variant={activeStatus === "approved" ? "default" : "outline"}
              onClick={() => setActiveStatus("approved")}
            >
              {filterLabel.approved} ({approvedApprovals.length})
            </Button>
            <Button
              type="button"
              size="sm"
              variant={activeStatus === "rejected" ? "default" : "outline"}
              onClick={() => setActiveStatus("rejected")}
            >
              {filterLabel.rejected} ({rejectedApprovals.length})
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{listTitle}</CardTitle>
          <CardDescription>{listDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          {isCurrentListLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {language === "vi" ? "Đang tải danh sách..." : "Loading listings..."}
            </div>
          ) : filteredApprovals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {activeStatus === "pending" && <Clock className="h-12 w-12 mx-auto mb-4 text-amber-500" />}
              {activeStatus === "approved" && <Check className="h-12 w-12 mx-auto mb-4 text-success" />}
              {activeStatus === "rejected" && <X className="h-12 w-12 mx-auto mb-4 text-destructive" />}
              {activeStatus === "all" && <Eye className="h-12 w-12 mx-auto mb-4" />}
              <p>{emptyText}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApprovals.map((listing) => (
                <div key={listing.id} className="rounded-lg border border-border p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                    <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted shrink-0">
                      {listing.images[0] ? (
                        <Image src={listing.images[0]} alt={listing.title} width={64} height={64} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">No image</div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{listing.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {listing.brand || "-"} {listing.model || ""}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {listing.city || (language === "vi" ? "Chưa cập nhật" : "N/A")}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={
                            listing.status === "pending"
                              ? "text-amber-600 border-amber-400/50"
                              : listing.status === "approved"
                              ? "text-emerald-600 border-emerald-400/50"
                              : "text-destructive border-destructive/40"
                          }
                        >
                          {filterLabel[listing.status]}
                        </Badge>
                        <span className="text-sm font-semibold text-primary">{formatVND(listing.price)}</span>
                        {listing.submittedAt && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(listing.submittedAt).toLocaleDateString("vi-VN")}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/admin/approvals/details/${listing.id}`}>
                        <Eye className="mr-1 h-4 w-4" />
                        {language === "vi" ? "Chi tiết" : "Detail"}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeStatus === "all" && allListingsTotalPages > 1 && (
            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
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
