'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export type Language = 'vi' | 'en'

// Translation dictionary
export const translations = {
  // Common
  'nav.marketplace': { vi: 'Sàn xe đạp', en: 'Marketplace' },
  'nav.howItWorks': { vi: 'Cách Hoạt Động', en: 'How It Works' },
  'nav.wishlist': { vi: 'Yêu Thích', en: 'Wishlist' },
  'nav.login': { vi: 'Đăng Nhập', en: 'Login' },
  'nav.register': { vi: 'Đăng Ký', en: 'Register' },
  'nav.postListing': { vi: 'Đăng Tin', en: 'Post Listing' },
  'nav.myOrders': { vi: 'Đơn Hàng Của Tôi', en: 'My Orders' },
  'nav.myListings': { vi: 'Tin Đăng Của Tôi', en: 'My Listings' },
  'nav.profile': { vi: 'Tài Khoản', en: 'Profile' },
  'nav.logout': { vi: 'Đăng Xuất', en: 'Logout' },
  'nav.dashboard': { vi: 'Bảng Điều Khiển', en: 'Dashboard' },
  
  // Search & Filter
  'search.placeholder': { vi: 'Tìm xe đạp theo tên, thương hiệu...', en: 'Search bikes by name, brand...' },
  'filter.title': { vi: 'Bộ Lọc', en: 'Filters' },
  'filter.veloSafeOnly': { vi: 'Chỉ VeloSafe Verified', en: 'VeloSafe Verified Only' },
  'filter.category': { vi: 'Loại Xe', en: 'Category' },
  'filter.brand': { vi: 'Thương Hiệu', en: 'Brand' },
  'filter.frameSize': { vi: 'Kích Cỡ Khung', en: 'Frame Size' },
  'filter.groupset': { vi: 'Bộ Truyền Động', en: 'Groupset' },
  'filter.condition': { vi: 'Tình Trạng', en: 'Condition' },
  'filter.city': { vi: 'Thành Phố', en: 'City' },
  'filter.priceRange': { vi: 'Khoảng Giá', en: 'Price Range' },
  'filter.clearAll': { vi: 'Xóa tất cả', en: 'Clear all' },
  
  // Listing
  'listing.verified': { vi: 'Đã Kiểm Định', en: 'Verified' },
  'listing.sales': { vi: 'đã bán', en: 'sold' },
  'listing.deposit': { vi: 'Đặt Cọc', en: 'Deposit' },
  'listing.contactSeller': { vi: 'Liên Hệ Người Bán', en: 'Contact Seller' },
  'listing.addToWishlist': { vi: 'Thêm Yêu Thích', en: 'Add to Wishlist' },
  'listing.specifications': { vi: 'Thông Số Kỹ Thuật', en: 'Specifications' },
  'listing.inspectionReport': { vi: 'Báo Cáo Kiểm Định', en: 'Inspection Report' },
  'listing.sellerInfo': { vi: 'Thông Tin Người Bán', en: 'Seller Information' },
  'listing.piiLocked': { vi: 'Hiển thị sau khi đặt cọc', en: 'Available after deposit' },
  
  // Conditions
  'condition.like_new': { vi: 'Như Mới', en: 'Like New' },
  'condition.excellent': { vi: 'Xuất Sắc', en: 'Excellent' },
  'condition.good': { vi: 'Tốt', en: 'Good' },
  'condition.fair': { vi: 'Khá', en: 'Fair' },
  
  // Cities
  'city.hanoi': { vi: 'Hà Nội', en: 'Hanoi' },
  'city.hcm': { vi: 'TP. Hồ Chí Minh', en: 'Ho Chi Minh City' },
  'city.danang': { vi: 'Đà Nẵng', en: 'Da Nang' },
  
  // Categories
  'category.road': { vi: 'Xe Đường Trường', en: 'Road Bike' },
  'category.mtb': { vi: 'Xe Địa Hình', en: 'Mountain Bike' },
  'category.gravel': { vi: 'Xe Gravel', en: 'Gravel Bike' },
  'category.urban': { vi: 'Xe Đô Thị', en: 'Urban/Commuter' },
  
  // Deposit Flow
  'deposit.title': { vi: 'Đặt Cọc Xe', en: 'Deposit for Bike' },
  'deposit.amount': { vi: 'Số Tiền Đặt Cọc', en: 'Deposit Amount' },
  'deposit.calculation': { vi: '10% giá xe (tối đa 2,000,000₫)', en: '10% of price (max 2,000,000₫)' },
  'deposit.paymentMethod': { vi: 'Phương Thức Thanh Toán', en: 'Payment Method' },
  'deposit.bankTransfer': { vi: 'Chuyển Khoản Ngân Hàng', en: 'Bank Transfer' },
  'deposit.card': { vi: 'Thẻ Tín Dụng/Ghi Nợ', en: 'Credit/Debit Card' },
  'deposit.ewallet': { vi: 'Ví Điện Tử', en: 'E-Wallet' },
  'deposit.confirm': { vi: 'Xác Nhận Đặt Cọc', en: 'Confirm Deposit' },
  'deposit.success': { vi: 'Đặt Cọc Thành Công!', en: 'Deposit Successful!' },
  'deposit.inspectionScheduled': { vi: 'Dịch vụ kiểm định đã được kích hoạt', en: 'Inspection service has been activated' },
  
  // Seller Dashboard
  'seller.dashboard': { vi: 'Bảng Điều Khiển Người Bán', en: 'Seller Dashboard' },
  'seller.myListings': { vi: 'Tin Đăng Của Tôi', en: 'My Listings' },
  'seller.orders': { vi: 'Đơn Hàng', en: 'Orders' },
  'seller.wallet': { vi: 'Ví Tiền', en: 'Wallet' },
  'seller.createListing': { vi: 'Tạo Tin Đăng', en: 'Create Listing' },
  'seller.earnings': { vi: 'Thu Nhập', en: 'Earnings' },
  'seller.pendingPayout': { vi: 'Chờ Thanh Toán', en: 'Pending Payout' },
  
  // Inspector Portal
  'inspector.portal': { vi: 'Cổng Kiểm Định Viên', en: 'Inspector Portal' },
  'inspector.assigned': { vi: 'Xe Được Giao', en: 'Assigned Bikes' },
  'inspector.completed': { vi: 'Đã Hoàn Thành', en: 'Completed' },
  'inspector.startInspection': { vi: 'Bắt Đầu Kiểm Định', en: 'Start Inspection' },
  'inspector.submitReport': { vi: 'Gửi Báo Cáo', en: 'Submit Report' },
  
  // Admin Panel
  'admin.panel': { vi: 'Quản Trị Hệ Thống', en: 'Admin Panel' },
  'admin.overview': { vi: 'Tổng Quan', en: 'Overview' },
  'admin.listingApproval': { vi: 'Duyệt Tin Đăng', en: 'Listing Approval' },
  'admin.disputes': { vi: 'Tranh Chấp', en: 'Disputes' },
  'admin.users': { vi: 'Người Dùng', en: 'Users' },
  'admin.analytics': { vi: 'Thống Kê', en: 'Analytics' },
  
  // Inspection Checklist
  'inspection.frame': { vi: 'Khung Xe', en: 'Frame' },
  'inspection.brakes': { vi: 'Hệ Thống Phanh', en: 'Brake System' },
  'inspection.drivetrain': { vi: 'Bộ Truyền Động', en: 'Drivetrain' },
  'inspection.wheels': { vi: 'Bánh Xe', en: 'Wheels' },
  'inspection.suspension': { vi: 'Giảm Xóc', en: 'Suspension' },
  'inspection.pass': { vi: 'Đạt', en: 'Pass' },
  'inspection.warning': { vi: 'Cảnh Báo', en: 'Warning' },
  'inspection.fail': { vi: 'Không Đạt', en: 'Fail' },
  
  // General
  'general.save': { vi: 'Lưu', en: 'Save' },
  'general.cancel': { vi: 'Hủy', en: 'Cancel' },
  'general.edit': { vi: 'Sửa', en: 'Edit' },
  'general.delete': { vi: 'Xóa', en: 'Delete' },
  'general.view': { vi: 'Xem', en: 'View' },
  'general.loading': { vi: 'Đang tải...', en: 'Loading...' },
  'general.noResults': { vi: 'Không có kết quả', en: 'No results' },
  'general.seeAll': { vi: 'Xem tất cả', en: 'See all' },
} as const

export type TranslationKey = keyof typeof translations

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('vi')

  const t = useCallback((key: TranslationKey): string => {
    return translations[key]?.[language] || key
  }, [language])

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
