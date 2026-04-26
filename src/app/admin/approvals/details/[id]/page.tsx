"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ImageIcon, Loader2, MapPin, PlayCircle, Tag } from "lucide-react";
import { adminApi } from "@/lib/api/admin-api";
import { useLanguage } from "@/lib/language-context";
import { formatVND } from "@/lib/mock-data";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ApprovalDetailPage() {
  const { language } = useLanguage();
  const params = useParams<{ id: string }>();
  const listingId = Array.isArray(params.id) ? params.id[0] : params.id;

  const detailQuery = useQuery({
    queryKey: ["admin-listing-detail-page", listingId],
    queryFn: () => adminApi.getListingDetail(listingId as string),
    enabled: Boolean(listingId),
  });

  const detail = detailQuery.data;
  const statusLabel =
    detail?.status === "approved"
      ? language === "vi"
        ? "Đã duyệt"
        : "Approved"
      : detail?.status === "rejected"
      ? language === "vi"
        ? "Đã từ chối"
        : "Rejected"
      : language === "vi"
      ? "Chờ duyệt"
      : "Pending";

  const statusClassName =
    detail?.status === "approved"
      ? "border-emerald-300 text-emerald-700"
      : detail?.status === "rejected"
      ? "border-rose-300 text-rose-700"
      : "border-amber-300 text-amber-700";

  const imageUrls = detail?.images ?? [];
  const videoUrls = (detail?.medias ?? [])
    .map((item) => item.videoUrl)
    .filter((url): url is string => Boolean(url));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {language === "vi" ? "Chi Tiết Tin Đăng" : "Listing Detail"}
          </h1>
          <p className="text-muted-foreground">
            {language === "vi"
              ? "Xem đầy đủ thông tin listing và media để xét duyệt"
              : "Review full listing information and media before approval"}
          </p>
        </div>

        <Button variant="outline" asChild>
          <Link href="/admin/approvals">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {language === "vi" ? "Quay lại danh sách" : "Back to approvals"}
          </Link>
        </Button>
      </div>

      {detailQuery.isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {language === "vi" ? "Đang tải chi tiết tin đăng..." : "Loading listing detail..."}
          </CardContent>
        </Card>
      ) : detailQuery.isError ? (
        <Alert variant="destructive">
          <AlertDescription>
            {detailQuery.error instanceof Error
              ? detailQuery.error.message
              : language === "vi"
              ? "Không thể tải chi tiết tin đăng"
              : "Unable to load listing detail"}
          </AlertDescription>
        </Alert>
      ) : !detail ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {language === "vi" ? "Không tìm thấy dữ liệu tin đăng." : "Listing data not found."}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <Card className="overflow-hidden border-border/80">
            <CardHeader className="border-b bg-muted/30">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-xl">{detail.title}</CardTitle>
                  <CardDescription className="mt-1 break-all">ID: {detail.id}</CardDescription>
                </div>
                <Badge variant="outline" className={statusClassName}>
                  {statusLabel}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="rounded-xl border bg-card p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                  <Tag className="h-4 w-4" />
                  {language === "vi" ? "Mô tả" : "Description"}
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  {detail.description || (language === "vi" ? "Chưa có mô tả." : "No description provided.")}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {imageUrls.length > 0 ? (
                  imageUrls.map((image, index) => (
                    <div key={`${image}-${index}`} className="group relative overflow-hidden rounded-xl border bg-muted/20">
                      <Image
                        src={image}
                        alt={`${detail.title} image ${index + 1}`}
                        width={900}
                        height={640}
                        className="h-56 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        unoptimized
                      />
                    </div>
                  ))
                ) : (
                  <div className="col-span-full flex h-56 items-center justify-center rounded-xl border border-dashed text-muted-foreground">
                    <ImageIcon className="mr-2 h-4 w-4" />
                    {language === "vi" ? "Không có ảnh" : "No images"}
                  </div>
                )}
              </div>

              {videoUrls.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <PlayCircle className="h-4 w-4" />
                    {language === "vi" ? "Video" : "Videos"}
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {videoUrls.map((video, index) => (
                      <div key={`${video}-${index}`} className="overflow-hidden rounded-xl border bg-black/95">
                        <video className="h-56 w-full object-cover" controls src={video} preload="metadata" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="h-fit border-border/80">
            <CardHeader>
              <CardTitle>{language === "vi" ? "Thông Tin Tổng Quan" : "Overview"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="rounded-lg border p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {language === "vi" ? "Thành phố" : "City"}
                </p>
                <p className="mt-1 flex items-center gap-2 font-medium">
                  <MapPin className="h-4 w-4 text-primary" />
                  {detail.city || (language === "vi" ? "Chưa cập nhật" : "N/A")}
                </p>
              </div>

              <div className="rounded-lg border p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {language === "vi" ? "Giá đăng" : "Listing price"}
                </p>
                <p className="mt-1 text-lg font-semibold text-primary">{formatVND(detail.price)}</p>
              </div>

              <div className="rounded-lg border p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Serial</p>
                <p className="mt-1 font-medium">{detail.serial || "-"}</p>
              </div>

              <div className="rounded-lg border p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {language === "vi" ? "Thông số xe" : "Bike specs"}
                </p>
                <div className="mt-2 space-y-1.5 text-muted-foreground">
                  <p>
                    {language === "vi" ? "Thương hiệu" : "Brand"}: <span className="font-medium text-foreground">{detail.bike.brand || detail.brand || "-"}</span>
                  </p>
                  <p>
                    {language === "vi" ? "Danh mục" : "Category"}: <span className="font-medium text-foreground">{detail.bike.category || detail.model || "-"}</span>
                  </p>
                  <p>
                    {language === "vi" ? "Kích cỡ khung" : "Frame size"}: <span className="font-medium text-foreground">{detail.bike.frameSize || "-"}</span>
                  </p>
                  <p>
                    {language === "vi" ? "Giá trong bike" : "Bike price"}: <span className="font-medium text-foreground">{typeof detail.bike.price === "number" ? formatVND(detail.bike.price) : "-"}</span>
                  </p>
                </div>
              </div>

              <div className="rounded-lg border p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {language === "vi" ? "Media thống kê" : "Media stats"}
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-center">
                  <div className="rounded-md bg-muted/50 p-2">
                    <p className="text-lg font-bold">{imageUrls.length}</p>
                    <p className="text-xs text-muted-foreground">{language === "vi" ? "Ảnh" : "Images"}</p>
                  </div>
                  <div className="rounded-md bg-muted/50 p-2">
                    <p className="text-lg font-bold">{videoUrls.length}</p>
                    <p className="text-xs text-muted-foreground">{language === "vi" ? "Video" : "Videos"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
