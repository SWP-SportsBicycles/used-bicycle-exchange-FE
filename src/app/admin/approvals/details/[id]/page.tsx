"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft, Check, ImageIcon, Loader2, MapPin, PlayCircle, Tag, X } from "lucide-react";
import { adminApi } from "@/lib/api/admin-api";
import { useLanguage } from "@/lib/language-context";
import { formatVND } from "@/lib/mock-data";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

const rejectSchema = z.object({
  reason: z.string().trim().min(5, "Lý do từ chối tối thiểu 5 ký tự"),
});

type RejectValues = z.infer<typeof rejectSchema>;

export default function ApprovalDetailPage() {
  const { language } = useLanguage();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const listingId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const rejectForm = useForm<RejectValues>({
    resolver: zodResolver(rejectSchema),
    defaultValues: {
      reason: "",
    },
  });

  const detailQuery = useQuery({
    queryKey: ["admin-listing-detail-page", listingId],
    queryFn: () => adminApi.getListingDetail(listingId as string),
    enabled: Boolean(listingId),
  });

  const approveMutation = useMutation({
    mutationFn: () => adminApi.approveListing(listingId as string),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-listings"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-listings-sidebar"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-listing-detail-page", listingId] }),
      ]);
      setFeedback(language === "vi" ? "Duyệt tin thành công." : "Listing approved.");
      setErrorMessage(null);
      router.push("/admin/approvals");
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : "Approve listing failed.");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (reason: string) => adminApi.rejectListing(listingId as string, reason),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-listings"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-listings-sidebar"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-listing-detail-page", listingId] }),
      ]);
      setFeedback(language === "vi" ? "Từ chối tin thành công." : "Listing rejected.");
      setErrorMessage(null);
      setRejectOpen(false);
      rejectForm.reset();
      router.push("/admin/approvals");
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : "Reject listing failed.");
    },
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

  const inspectionScore =
    typeof detail?.bike?.inspectionScore === "number" ? detail.bike.inspectionScore : undefined;
  const inspectionComment = detail?.bike?.inspectionComment?.trim();
  const inspectionScoreTone = (() => {
    if (typeof inspectionScore !== "number") return "border-slate-200 bg-slate-50 text-slate-600";
    if (inspectionScore <= 49) return "border-rose-200 bg-rose-50 text-rose-700";
    if (inspectionScore <= 70) return "border-amber-200 bg-amber-50 text-amber-700";
    if (inspectionScore >= 75 && inspectionScore <= 100) return "border-emerald-200 bg-emerald-50 text-emerald-700";
    return "border-slate-200 bg-slate-50 text-slate-600";
  })();

  const imageUrls = detail?.images ?? [];
  const videoUrls = (detail?.medias ?? [])
    .map((item) => item.videoUrl)
    .filter((url): url is string => Boolean(url));
  const canReview = detail?.status === "pending";

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

      {feedback && (
        <Alert>
          <AlertDescription>{feedback}</AlertDescription>
        </Alert>
      )}
      {errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

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
                  {language === "vi" ? "Kết quả kiểm định" : "Inspection result"}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${inspectionScoreTone}`}
                  >
                    {language === "vi" ? "Điểm" : "Score"}: {typeof inspectionScore === "number" ? inspectionScore : "--"}
                  </span>
                  <span className="text-xs font-semibold text-foreground">
                    {language === "vi" ? "Thang điểm 0-100" : "Scale 0-100"}
                  </span>
                </div>
                <p className="mt-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
                  {inspectionComment ||
                    (language === "vi" ? "Chưa có ghi chú kiểm định." : "No inspection notes yet.")}
                </p>
              </div>

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
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() => setSelectedImage(image)}
                      className="group relative overflow-hidden rounded-xl border bg-muted/20 transition-transform hover:-translate-y-0.5"
                    >
                      <Image
                        src={image}
                        alt={`${detail.title} image ${index + 1}`}
                        width={900}
                        height={640}
                        className="h-56 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        unoptimized
                      />
                      <span className="sr-only">Open image</span>
                    </button>
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
                <p className="text-sm font-medium text-foreground">
                  {language === "vi" ? "Thành phố" : "City"}
                </p>
                <p className="mt-1 flex items-center gap-2 font-medium">
                  <MapPin className="h-4 w-4 text-primary" />
                  {detail.city || (language === "vi" ? "Chưa cập nhật" : "N/A")}
                </p>
              </div>

              <div className="rounded-lg border p-3">
                <p className="text-sm font-medium text-foreground">
                  {language === "vi" ? "Giá đăng" : "Listing price"}
                </p>
                <p className="mt-1 text-lg font-semibold text-primary">{formatVND(detail.price)}</p>
              </div>

              <div className="rounded-lg border p-3">
                <p className="text-sm font-medium text-foreground">
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
                 <p className="text-sm font-medium text-foreground">
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

              {canReview && (
                <div className="rounded-lg border p-3">
                  <p className="text-sm font-medium text-foreground">
                    {language === "vi" ? "Thực hiện thao tác" : "Actions"}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
                      onClick={() => approveMutation.mutate()}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      {language === "vi" ? "Duyệt" : "Approve"}
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      className="flex-1"
                      onClick={() => setRejectOpen(true)}
                      disabled={rejectMutation.isPending || approveMutation.isPending}
                    >
                      <X className="mr-2 h-4 w-4" />
                      {language === "vi" ? "Từ chối" : "Reject"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <Dialog open={Boolean(selectedImage)} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent
          showCloseButton={false}
          className="w-[92vw] max-w-4xl border-border/60 bg-white p-4 sm:p-5"
        >
          <DialogTitle className="sr-only">{language === "vi" ? "Xem ảnh" : "Image preview"}</DialogTitle>
          <DialogDescription className="sr-only">
            {language === "vi" ? "Phóng to ảnh tin đăng" : "Preview listing image"}
          </DialogDescription>
          <div className="relative flex max-h-[80vh] w-full items-center justify-center">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setSelectedImage(null)}
              className="absolute right-2 top-2 z-10 h-9 w-9 rounded-full bg-black/70 text-white hover:bg-black/85"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
            {selectedImage && (
              <Image
                src={selectedImage}
                alt={language === "vi" ? "Xem ảnh" : "Preview image"}
                width={2000}
                height={1500}
                className="max-h-[70vh] w-auto max-w-full object-contain"
                unoptimized
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectOpen} onOpenChange={(open) => setRejectOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{language === "vi" ? "Từ Chối Tin Đăng" : "Reject Listing"}</DialogTitle>
            <DialogDescription>
              {language === "vi"
                ? "Nhập lý do để gửi về seller."
                : "Provide a rejection reason for seller."}
            </DialogDescription>
          </DialogHeader>

          <Form {...rejectForm}>
            <form
              className="space-y-4"
              onSubmit={rejectForm.handleSubmit((values) => {
                rejectMutation.mutate(values.reason);
              })}
            >
              <FormField
                control={rejectForm.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === "vi" ? "Lý do từ chối" : "Reason"}</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder={
                          language === "vi"
                            ? "VD: Số serial không khớp với ảnh..."
                            : "E.g., Serial number does not match the photo..."
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setRejectOpen(false)}>
                  {language === "vi" ? "Hủy" : "Cancel"}
                </Button>
                <Button type="submit" variant="destructive" disabled={rejectMutation.isPending}>
                  {rejectMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {language === "vi" ? "Xác nhận từ chối" : "Confirm rejection"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
