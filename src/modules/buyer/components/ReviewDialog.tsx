'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useCreateReviewMutation } from '../hooks/useReview'
import { cn } from '@/lib/utils'

interface ReviewDialogProps {
  orderId: string
  listingTitle: string
  /** Controlled from parent if needed */
  disabled?: boolean
  children: React.ReactNode
}

export function ReviewDialog({ orderId, listingTitle, disabled, children }: ReviewDialogProps) {
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const createReview = useCreateReviewMutation()

  const ratingLabels = ['', 'Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Tuyệt vời']

  const handleSubmit = async () => {
    if (rating === 0) return
    await createReview.mutateAsync({
      orderId,
      rating,
      comment: comment.trim() || undefined,
    })
    setOpen(false)
    // Reset form
    setRating(0)
    setComment('')
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!disabled) setOpen(v) }}>
      <DialogTrigger asChild disabled={disabled}>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Đánh giá đơn hàng</DialogTitle>
          <DialogDescription>
            Chia sẻ trải nghiệm của bạn về <strong className="text-foreground">{listingTitle}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Star Rating */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Đánh giá sao</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="group relative p-1 transition-transform hover:scale-110 focus:outline-none"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={cn(
                      "h-8 w-8 transition-colors",
                      (hoveredRating || rating) >= star
                        ? "fill-amber-400 text-amber-400"
                        : "fill-none text-muted-foreground/40"
                    )}
                  />
                </button>
              ))}
              {(hoveredRating || rating) > 0 && (
                <span className="ml-3 text-sm font-medium text-muted-foreground">
                  {ratingLabels[hoveredRating || rating]}
                </span>
              )}
            </div>
            {rating === 0 && (
              <p className="text-xs text-muted-foreground">Chọn từ 1 đến 5 sao</p>
            )}
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="review-comment" className="text-base font-semibold">
              Nhận xét <span className="text-muted-foreground font-normal">(tùy chọn)</span>
            </Label>
            <Textarea
              id="review-comment"
              placeholder="Chia sẻ thêm về chất lượng xe, trải nghiệm mua hàng..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={500}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">{comment.length}/500</p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || createReview.isPending}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            {createReview.isPending ? 'Đang gửi...' : 'Gửi đánh giá'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
