'use client'

import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface ViewReviewDialogProps {
  rating: number
  comment: string | null
  reviewedAt: string | null
  listingTitle: string
  children: React.ReactNode
}

const ratingLabels = ['', 'Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Tuyệt vời']

export function ViewReviewDialog({ rating, comment, reviewedAt, listingTitle, children }: ViewReviewDialogProps) {
  const formattedDate = reviewedAt
    ? new Date(reviewedAt).toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : null

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Đánh giá của bạn</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <p className="text-sm text-muted-foreground">
            Đơn hàng: <span className="font-medium text-foreground">{listingTitle}</span>
          </p>

          {/* Star rating display */}
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-8 w-8 ${rating >= star ? 'fill-amber-400 text-amber-400' : 'fill-none text-muted-foreground/30'}`}
                />
              ))}
              <span className="ml-3 text-base font-semibold text-amber-600">
                {ratingLabels[rating] || `${rating}/5`}
              </span>
            </div>
          </div>

          {/* Comment */}
          {comment ? (
            <div className="bg-muted/40 rounded-xl p-4 border">
              <p className="text-sm text-foreground italic">&ldquo;{comment}&rdquo;</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">Bạn không để lại nhận xét.</p>
          )}

          {formattedDate && (
            <p className="text-xs text-muted-foreground">Đánh giá lúc: {formattedDate}</p>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <DialogTrigger asChild>
            <Button variant="outline">Đóng</Button>
          </DialogTrigger>
        </div>
      </DialogContent>
    </Dialog>
  )
}
