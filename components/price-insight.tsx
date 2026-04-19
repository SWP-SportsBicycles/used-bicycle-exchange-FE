import { TrendingDown, Info } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface PriceInsightProps {
  currentPrice: number
  marketPrice: number
}

export function PriceInsight({ currentPrice, marketPrice }: PriceInsightProps) {
  const saving = marketPrice - currentPrice
  const savingPct = Math.round((saving / marketPrice) * 100)

  if (saving <= 0) return null

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            Phân tích giá thị trường
            <Info className="h-3.5 w-3.5 text-muted-foreground" />
          </h4>
          <p className="mt-1 text-xs text-muted-foreground">
            So sánh dựa trên 50+ mẫu xe tương tự gần đây
          </p>
        </div>
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 gap-1 rounded-full px-2 py-0.5">
          <TrendingDown className="h-3 w-3" />
          Tốt
        </Badge>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
        <div>
          <p className="text-xs text-muted-foreground">Giá tham chiếu</p>
          <p className="text-sm font-medium line-through decoration-muted-foreground/50 text-foreground">
            {(marketPrice).toLocaleString('vi-VN')} ₫
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Tiết kiệm</p>
          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
            {(saving).toLocaleString('vi-VN')} ₫ ({savingPct}%)
          </p>
        </div>
      </div>
    </div>
  )
}
