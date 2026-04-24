/**
 * Persistent order expiry utility.
 *
 * Khi buyer tạo đơn hàng và nhận PayOS link, ta lưu { orderId → expiresAt }
 * vào localStorage. Hook useOrderAutoExpiry đọc lại khi mount và tự cancel
 * những đơn đã hết hạn — kể cả khi user đã tắt tab / navigate khỏi checkout.
 */

const STORAGE_KEY = 'velotrust_expiring_orders'

/** Lưu một đơn hàng đang chờ thanh toán vào localStorage */
export function saveExpiringOrder(orderId: string, expiresAt: string): void {
  try {
    const existing = getExpiringOrders()
    existing[orderId] = expiresAt
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
  } catch {
    // localStorage unavailable (SSR / private mode) — ignore
  }
}

/** Xoá một đơn hàng khỏi danh sách tracking (đã thanh toán hoặc đã hủy) */
export function removeExpiringOrder(orderId: string): void {
  try {
    const existing = getExpiringOrders()
    delete existing[orderId]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
  } catch {
    // ignore
  }
}

/** Đọc toàn bộ danh sách đơn đang chờ expiry */
export function getExpiringOrders(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Record<string, string>
  } catch {
    return {}
  }
}
