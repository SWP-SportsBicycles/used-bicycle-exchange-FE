import { BuyerAutoExpiry } from './BuyerAutoExpiry'

/**
 * Buyer layout — wraps tất cả trang /buyer/*.
 * BuyerAutoExpiry mount hook auto-cancel đơn hàng hết hạn.
 */
export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  return <BuyerAutoExpiry>{children}</BuyerAutoExpiry>
}
