// Types based on SRS document
export interface Listing {
  id: string
  title: string
  price: number
  description: string
  category: 'road' | 'mtb' | 'gravel' | 'urban'
  brand: string
  model: string
  frameSize: string
  frameMaterial: string
  groupset: string
  wheelSize: string
  condition: 'like_new' | 'excellent' | 'good' | 'fair'
  usageHistory?: string
  serial: string
  city: string
  images: string[]
  videoUrl?: string
  status: 'draft' | 'pending_review' | 'published' | 'sold' | 'withdrawn'
  isVeloSafeVerified: boolean
  seller: Seller
  inspection?: Inspection
  createdAt: string
  updatedAt: string
}

export interface Seller {
  id: string
  name: string
  avatar?: string
  rating: number
  totalSales: number
  memberSince: string
  // PII - only visible after deposit confirmed
  phone?: string
  address?: string
}

export interface Inspection {
  id: string
  inspectorName: string
  inspectedAt: string
  status: 'pending' | 'completed' | 'failed'
  report: InspectionReport
}

export interface InspectionReport {
  frameCondition: ChecklistItem
  brakeSystem: ChecklistItem
  drivetrain: ChecklistItem
  wheels: ChecklistItem
  suspension?: ChecklistItem
  overallGrade: 'A' | 'B' | 'C' | 'D' | 'F'
  notes: string
  photos: string[]
}

export interface ChecklistItem {
  status: 'pass' | 'warning' | 'fail'
  notes: string
}

export interface Order {
  id: string
  listingId: string
  buyerId: string
  type: 'deposit' | 'full_purchase'
  depositAmount: number
  totalAmount: number
  status: 'pending_payment' | 'payment_received' | 'inspection' | 'pending_fulfillment' | 'completed' | 'cancelled' | 'disputed'
  createdAt: string
}

// Filter options
export const BRANDS = [
  'Giant', 'Trek', 'Specialized', 'Cannondale', 'Pinarello',
  'Cervélo', 'BMC', 'Scott', 'Merida', 'Bianchi', 'Canyon', 'Other'
]

export const FRAME_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

export const GROUPSETS = [
  'Shimano Dura-Ace', 'Shimano Ultegra', 'Shimano 105', 'Shimano Tiagra', 'Shimano Sora',
  'SRAM Red', 'SRAM Force', 'SRAM Rival', 'SRAM Apex',
  'Campagnolo Super Record', 'Campagnolo Record', 'Campagnolo Chorus',
  'Other'
]

export const CONDITIONS = [
  { value: 'like_new', label: 'Like New', description: 'Minimal use, no visible wear' },
  { value: 'excellent', label: 'Excellent', description: 'Light use, minor cosmetic marks' },
  { value: 'good', label: 'Good', description: 'Regular use, normal wear' },
  { value: 'fair', label: 'Fair', description: 'Heavy use, visible wear' },
]

export const CITIES = [
  { value: 'hanoi', label: 'Hà Nội' },
  { value: 'hcm', label: 'TP. Hồ Chí Minh' },
  { value: 'danang', label: 'Đà Nẵng' },
]

export const CATEGORIES = [
  { value: 'road', label: 'Road Bike', icon: 'road' },
  { value: 'mtb', label: 'Mountain Bike', icon: 'mountain' },
  { value: 'gravel', label: 'Gravel Bike', icon: 'gravel' },
  { value: 'urban', label: 'Urban/Commuter', icon: 'urban' },
]

// Mock listings data
export const MOCK_LISTINGS: Listing[] = [
  {
    id: '1',
    title: 'Giant TCR Advanced Pro 1 - Full Carbon',
    price: 45000000,
    description: 'Xe đạp road cao cấp, khung carbon full, groupset Ultegra Di2. Đã đi 3000km, bảo dưỡng định kỳ tại Giant Store. Phù hợp cho người cao 170-180cm.',
    category: 'road',
    brand: 'Giant',
    model: 'TCR Advanced Pro 1',
    frameSize: 'M',
    frameMaterial: 'Carbon',
    groupset: 'Shimano Ultegra Di2',
    wheelSize: '700c',
    condition: 'excellent',
    usageHistory: '3000km trong 18 tháng, chủ yếu đi weekend',
    serial: 'GNT2023TCR001234',
    city: 'Hà Nội',
    images: [
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&q=80',
      'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&q=80',
      'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=800&q=80',
    ],
    status: 'published',
    isVeloSafeVerified: true,
    seller: {
      id: 's1',
      name: 'Minh Đức',
      rating: 4.8,
      totalSales: 12,
      memberSince: '2022-03-15',
    },
    inspection: {
      id: 'insp1',
      inspectorName: 'Nguyễn Văn Kiểm',
      inspectedAt: '2024-01-10',
      status: 'completed',
      report: {
        frameCondition: { status: 'pass', notes: 'Không có vết nứt hay va đập' },
        brakeSystem: { status: 'pass', notes: 'Má phanh còn 80%, hoạt động tốt' },
        drivetrain: { status: 'pass', notes: 'Xích và líp còn tốt, chuyển số mượt' },
        wheels: { status: 'pass', notes: 'Vành thẳng, nan hoa căng đều' },
        overallGrade: 'A',
        notes: 'Xe trong tình trạng rất tốt, phù hợp cho người mua đòi hỏi chất lượng cao.',
        photos: [],
      }
    },
    createdAt: '2024-01-05',
    updatedAt: '2024-01-10',
  },
  {
    id: '2',
    title: 'Trek Domane SL 5 - Endurance Road',
    price: 38000000,
    description: 'Xe endurance road thoải mái cho đường dài. IsoSpeed decoupler giảm rung, phù hợp đi touring. Groupset 105 R7000, bánh xe Bontrager.',
    category: 'road',
    brand: 'Trek',
    model: 'Domane SL 5',
    frameSize: 'L',
    frameMaterial: 'Carbon',
    groupset: 'Shimano 105 R7000',
    wheelSize: '700c',
    condition: 'good',
    usageHistory: '5000km, đi tour Tây Bắc 2 lần',
    serial: 'TRK2022DOM005678',
    city: 'TP.HCM',
    images: [
      'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=800&q=80',
      'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=800&q=80',
    ],
    status: 'published',
    isVeloSafeVerified: true,
    seller: {
      id: 's2',
      name: 'Hồng Anh',
      rating: 4.5,
      totalSales: 5,
      memberSince: '2023-01-20',
    },
    inspection: {
      id: 'insp2',
      inspectorName: 'Trần Minh Tuấn',
      inspectedAt: '2024-01-08',
      status: 'completed',
      report: {
        frameCondition: { status: 'pass', notes: 'Có vài vết xước nhỏ bình thường' },
        brakeSystem: { status: 'pass', notes: 'Phanh đĩa hydraulic hoạt động tốt' },
        drivetrain: { status: 'warning', notes: 'Xích cần thay trong 500km tới' },
        wheels: { status: 'pass', notes: 'Bánh xe tình trạng tốt' },
        overallGrade: 'B',
        notes: 'Xe tốt, cần chú ý bảo dưỡng xích sớm.',
        photos: [],
      }
    },
    createdAt: '2024-01-03',
    updatedAt: '2024-01-08',
  },
  {
    id: '3',
    title: 'Specialized Tarmac SL7 Expert',
    price: 75000000,
    description: 'Flagship road bike từ Specialized. Khung S-Works geometry, full SRAM Force eTap AXS. Bánh xe Roval CLX 50. Xe của pro cyclist chuyển nhượng.',
    category: 'road',
    brand: 'Specialized',
    model: 'Tarmac SL7 Expert',
    frameSize: 'S',
    frameMaterial: 'Carbon',
    groupset: 'SRAM Force eTap AXS',
    wheelSize: '700c',
    condition: 'like_new',
    usageHistory: '1500km, chỉ đi race và training',
    serial: 'SPZ2023TAR009012',
    city: 'Đà Nẵng',
    images: [
      'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800&q=80',
      'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80',
    ],
    status: 'published',
    isVeloSafeVerified: true,
    seller: {
      id: 's3',
      name: 'Quang Trung',
      rating: 5.0,
      totalSales: 3,
      memberSince: '2023-06-10',
    },
    inspection: {
      id: 'insp3',
      inspectorName: 'Lê Hoàng Nam',
      inspectedAt: '2024-01-12',
      status: 'completed',
      report: {
        frameCondition: { status: 'pass', notes: 'Tình trạng như mới' },
        brakeSystem: { status: 'pass', notes: 'SRAM hydraulic hoàn hảo' },
        drivetrain: { status: 'pass', notes: 'Electronic shifting chính xác 100%' },
        wheels: { status: 'pass', notes: 'Roval CLX không có vấn đề' },
        overallGrade: 'A',
        notes: 'Xe flagship trong tình trạng xuất sắc.',
        photos: [],
      }
    },
    createdAt: '2024-01-10',
    updatedAt: '2024-01-12',
  },
  {
    id: '4',
    title: 'Scott Spark 920 - Full Suspension MTB',
    price: 52000000,
    description: 'Mountain bike full suspension cao cấp. Fox suspension, SRAM GX Eagle 12 speed. Bánh xe 29 inch, phù hợp trail và enduro.',
    category: 'mtb',
    brand: 'Scott',
    model: 'Spark 920',
    frameSize: 'L',
    frameMaterial: 'Alloy/Carbon',
    groupset: 'SRAM GX Eagle',
    wheelSize: '29"',
    condition: 'good',
    usageHistory: '2 năm sử dụng, đi trail hàng tuần',
    serial: 'SCT2022SPK003456',
    city: 'Hà Nội',
    images: [
      'https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?w=800&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    ],
    status: 'published',
    isVeloSafeVerified: false,
    seller: {
      id: 's4',
      name: 'Văn Hùng',
      rating: 4.2,
      totalSales: 8,
      memberSince: '2021-11-05',
    },
    createdAt: '2024-01-08',
    updatedAt: '2024-01-08',
  },
  {
    id: '5',
    title: 'Canyon Grail CF SL 8 - Gravel Bike',
    price: 55000000,
    description: 'Gravel bike từ Canyon với thiết kế CP Cockpit độc đáo. Shimano GRX 810 groupset, bánh xe DT Swiss. Phù hợp cho adventure cycling.',
    category: 'gravel',
    brand: 'Canyon',
    model: 'Grail CF SL 8',
    frameSize: 'M',
    frameMaterial: 'Carbon',
    groupset: 'Shimano GRX 810',
    wheelSize: '700c',
    condition: 'excellent',
    usageHistory: '2000km, đi gravel events',
    serial: 'CYN2023GRL007890',
    city: 'TP.HCM',
    images: [
      'https://images.unsplash.com/photo-1511994298241-608e28f14fde?w=800&q=80',
      'https://images.unsplash.com/photo-1505705694340-019e1e335916?w=800&q=80',
    ],
    status: 'published',
    isVeloSafeVerified: true,
    seller: {
      id: 's5',
      name: 'Thu Hương',
      rating: 4.9,
      totalSales: 15,
      memberSince: '2020-08-20',
    },
    inspection: {
      id: 'insp5',
      inspectorName: 'Phạm Đức Anh',
      inspectedAt: '2024-01-11',
      status: 'completed',
      report: {
        frameCondition: { status: 'pass', notes: 'Carbon frame hoàn hảo' },
        brakeSystem: { status: 'pass', notes: 'GRX hydraulic brakes tốt' },
        drivetrain: { status: 'pass', notes: 'GRX groupset hoạt động mượt' },
        wheels: { status: 'pass', notes: 'DT Swiss wheels true và tight' },
        overallGrade: 'A',
        notes: 'Gravel bike chất lượng cao, sẵn sàng cho adventure.',
        photos: [],
      }
    },
    createdAt: '2024-01-09',
    updatedAt: '2024-01-11',
  },
  {
    id: '6',
    title: 'Merida Scultura 4000 - Entry Race',
    price: 22000000,
    description: 'Xe đua entry-level tốt cho người mới. Full Shimano Tiagra, khung nhôm nhẹ, fork carbon. Lý tưởng để bắt đầu đua xe.',
    category: 'road',
    brand: 'Merida',
    model: 'Scultura 4000',
    frameSize: 'S',
    frameMaterial: 'Alloy',
    groupset: 'Shimano Tiagra',
    wheelSize: '700c',
    condition: 'good',
    usageHistory: '4000km, tập luyện hàng ngày',
    serial: 'MRD2022SCL001122',
    city: 'Đà Nẵng',
    images: [
      'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80',
    ],
    status: 'published',
    isVeloSafeVerified: false,
    seller: {
      id: 's6',
      name: 'Thanh Tùng',
      rating: 4.0,
      totalSales: 2,
      memberSince: '2023-09-01',
    },
    createdAt: '2024-01-07',
    updatedAt: '2024-01-07',
  },
]

// Helper to format Vietnamese Dong — re-exported from @/lib/utils for backward compatibility
export { formatVND } from '@/lib/utils'

// Calculate deposit amount (10% max 2M VND per SRS)
export function calculateDeposit(price: number): number {
  const tenPercent = price * 0.1
  const maxDeposit = 2000000
  return Math.min(tenPercent, maxDeposit)
}

// Get condition badge color
export function getConditionColor(condition: Listing['condition']): string {
  switch (condition) {
    case 'like_new':
      return 'bg-success/20 text-success border-success/30'
    case 'excellent':
      return 'bg-primary/20 text-primary border-primary/30'
    case 'good':
      return 'bg-accent/20 text-accent-foreground border-accent/30'
    case 'fair':
      return 'bg-muted text-muted-foreground border-border'
    default:
      return 'bg-muted text-muted-foreground border-border'
  }
}

// Get listing by ID
export function getListingById(id: string): Listing | undefined {
  return MOCK_LISTINGS.find(listing => listing.id === id)
}

// Additional types for expanded functionality

export interface SellerOrder {
  id: string
  listing: Listing
  buyer: {
    id: string
    name: string
    avatar?: string
  }
  depositAmount: number
  totalAmount: number
  status:
    | 'pending_deposit'
    | 'inspection_scheduled'
    | 'inspection_completed'
    | 'pending_payment'
    | 'delivered'
    | 'pending_confirmation'
    | 'completed'
    | 'cancelled'
    | 'disputed'
  createdAt: string
  inspectionDate?: string
}

export interface InspectorAssignment {
  id: string
  listing: Listing
  seller: {
    id: string
    name: string
    phone: string
    address: string
  }
  buyer: {
    id: string
    name: string
  }
  status: 'assigned' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  scheduledDate: string
  scheduledTime: string
  notes?: string
  report?: InspectionReport
}

export interface AdminListingApproval {
  id: string
  listing: Listing
  submittedAt: string
  serialPhotoUrl: string
  status: 'pending' | 'approved' | 'rejected'
  reviewNotes?: string
}

export interface Dispute {
  id: string
  orderId: string
  listing: Listing
  buyer: { id: string; name: string }
  seller: { id: string; name: string }
  type: 'condition_mismatch' | 'not_as_described' | 'delivery_issue' | 'payment_issue' | 'other'
  description: string
  status: 'open' | 'investigating' | 'resolved_buyer_favor' | 'resolved_seller_favor' | 'closed'
  createdAt: string
  resolution?: string
}

export interface WalletTransaction {
  id: string
  type: 'deposit_received' | 'payout' | 'fee' | 'refund'
  amount: number
  description: string
  status: 'pending' | 'completed' | 'failed'
  createdAt: string
  relatedOrderId?: string
}

// Mock Seller Orders
export const MOCK_SELLER_ORDERS: SellerOrder[] = [
  {
    id: 'order-1',
    listing: MOCK_LISTINGS[0],
    buyer: { id: 'buyer-1', name: 'Nguyễn Văn An', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=buyer1' },
    depositAmount: 2000000,
    totalAmount: 45000000,
    status: 'inspection_scheduled',
    createdAt: '2024-01-12',
    inspectionDate: '2024-01-15',
  },
  {
    id: 'order-2',
    listing: MOCK_LISTINGS[1],
    buyer: { id: 'buyer-2', name: 'Lê Thị Mai', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=buyer2' },
    depositAmount: 2000000,
    totalAmount: 38000000,
    status: 'pending_confirmation',
    createdAt: '2024-01-11',
  },
  {
    id: 'order-3',
    listing: MOCK_LISTINGS[2],
    buyer: { id: 'buyer-3', name: 'Phạm Đức Anh', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=buyer3' },
    depositAmount: 2000000,
    totalAmount: 75000000,
    status: 'completed',
    createdAt: '2024-01-05',
  },
]

// Mock Inspector Assignments
export const MOCK_INSPECTOR_ASSIGNMENTS: InspectorAssignment[] = [
  {
    id: 'assign-1',
    listing: MOCK_LISTINGS[0],
    seller: { id: 's1', name: 'Minh Đức', phone: '0901234567', address: '123 Phố Huế, Hai Bà Trưng, Hà Nội' },
    buyer: { id: 'buyer-1', name: 'Nguyễn Văn An' },
    status: 'scheduled',
    scheduledDate: '2024-01-15',
    scheduledTime: '09:00',
    notes: 'Xe tại nhà riêng, gọi trước 30 phút',
  },
  {
    id: 'assign-2',
    listing: MOCK_LISTINGS[3],
    seller: { id: 's4', name: 'Văn Hùng', phone: '0912345678', address: '45 Hoàng Quốc Việt, Cầu Giấy, Hà Nội' },
    buyer: { id: 'buyer-4', name: 'Trần Minh Tuấn' },
    status: 'assigned',
    scheduledDate: '2024-01-16',
    scheduledTime: '14:00',
  },
  {
    id: 'assign-3',
    listing: MOCK_LISTINGS[5],
    seller: { id: 's6', name: 'Thanh Tùng', phone: '0923456789', address: '78 Nguyễn Văn Linh, Hải Châu, Đà Nẵng' },
    buyer: { id: 'buyer-5', name: 'Võ Hoàng Long' },
    status: 'in_progress',
    scheduledDate: '2024-01-14',
    scheduledTime: '10:30',
  },
]

// Mock Admin Listing Approvals
export const MOCK_ADMIN_APPROVALS: AdminListingApproval[] = [
  {
    id: 'approval-1',
    listing: {
      ...MOCK_LISTINGS[3],
      status: 'pending_review',
    },
    submittedAt: '2024-01-13T10:30:00',
    serialPhotoUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
    status: 'pending',
  },
  {
    id: 'approval-2',
    listing: {
      ...MOCK_LISTINGS[5],
      status: 'pending_review',
      title: 'BMC Teammachine SLR01 - Pro Level',
      brand: 'BMC',
      model: 'Teammachine SLR01',
      price: 85000000,
    },
    submittedAt: '2024-01-13T09:15:00',
    serialPhotoUrl: 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=400&q=80',
    status: 'pending',
  },
  {
    id: 'approval-3',
    listing: {
      ...MOCK_LISTINGS[4],
      status: 'pending_review',
      title: 'Cervélo S5 Disc - Aero Road',
      brand: 'Cervélo',
      model: 'S5 Disc',
      price: 120000000,
    },
    submittedAt: '2024-01-12T16:45:00',
    serialPhotoUrl: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=400&q=80',
    status: 'pending',
  },
]

// Mock Disputes
export const MOCK_DISPUTES: Dispute[] = [
  {
    id: 'dispute-1',
    orderId: 'order-old-1',
    listing: MOCK_LISTINGS[1],
    buyer: { id: 'buyer-6', name: 'Hoàng Văn Bình' },
    seller: { id: 's2', name: 'Hồng Anh' },
    type: 'condition_mismatch',
    description: 'Xe có vết nứt nhỏ ở seatstay không được đề cập trong mô tả. Phát hiện sau khi kiểm định.',
    status: 'investigating',
    createdAt: '2024-01-10',
  },
  {
    id: 'dispute-2',
    orderId: 'order-old-2',
    listing: MOCK_LISTINGS[0],
    buyer: { id: 'buyer-7', name: 'Đỗ Minh Khoa' },
    seller: { id: 's1', name: 'Minh Đức' },
    type: 'not_as_described',
    description: 'Groupset không phải Di2 như quảng cáo mà là bản cơ thường.',
    status: 'open',
    createdAt: '2024-01-11',
  },
]

// Mock Wallet Transactions
export const MOCK_WALLET_TRANSACTIONS: WalletTransaction[] = [
  {
    id: 'tx-1',
    type: 'deposit_received',
    amount: 2000000,
    description: 'Cọc từ đơn hàng #ORD-2024-001',
    status: 'completed',
    createdAt: '2024-01-12T14:30:00',
    relatedOrderId: 'order-1',
  },
  {
    id: 'tx-2',
    type: 'payout',
    amount: -43000000,
    description: 'Thanh toán đơn hàng #ORD-2024-003 (trừ phí 5%)',
    status: 'completed',
    createdAt: '2024-01-10T09:00:00',
    relatedOrderId: 'order-3',
  },
  {
    id: 'tx-3',
    type: 'fee',
    amount: -2250000,
    description: 'Phí hoa hồng 5% đơn #ORD-2024-003',
    status: 'completed',
    createdAt: '2024-01-10T09:00:00',
    relatedOrderId: 'order-3',
  },
  {
    id: 'tx-4',
    type: 'deposit_received',
    amount: 2000000,
    description: 'Cọc từ đơn hàng #ORD-2024-002',
    status: 'pending',
    createdAt: '2024-01-11T16:45:00',
    relatedOrderId: 'order-2',
  },
]

// Analytics data for Admin
export const MOCK_ANALYTICS = {
  totalListings: 156,
  activeListings: 89,
  pendingApproval: 12,
  totalUsers: 1245,
  activeBuyers: 890,
  activeSellers: 355,
  totalTransactions: 234,
  totalVolume: 2500000000,
  thisMonthVolume: 450000000,
  avgTransactionValue: 35000000,
  veloSafeInspections: 78,
  disputeRate: 2.3,
  citiesBreakdown: {
    'Hà Nội': { listings: 67, transactions: 98 },
    'TP.HCM': { listings: 54, transactions: 112 },
    'Đà Nẵng': { listings: 35, transactions: 24 },
  },
}

// Order status labels
export const ORDER_STATUS_LABELS = {
  pending_deposit: { vi: 'Chờ Đặt Cọc', en: 'Pending Deposit' },
  pending: { vi: 'Chờ Xử Lý', en: 'Pending' },
  paid: { vi: 'Chờ Xác Nhận', en: 'Pending Confirmation' },
  confirmed: { vi: 'Đã Xác Nhận', en: 'Confirmed' },
  shipping: { vi: 'Đang Giao Hàng', en: 'Shipping' },
  delivered: { vi: 'Đã Giao Hàng', en: 'Delivered' },
  completed: { vi: 'Hoàn Thành', en: 'Completed' },
  cancelled: { vi: 'Đã Hủy', en: 'Cancelled' },
  locked: { vi: 'Đã Khóa', en: 'Locked' },
  disputed: { vi: 'Đang Tranh Chấp', en: 'In Dispute' },
}

// Dispute type labels
export const DISPUTE_TYPE_LABELS = {
  condition_mismatch: { vi: 'Tình trạng không khớp', en: 'Condition Mismatch' },
  not_as_described: { vi: 'Không đúng mô tả', en: 'Not as Described' },
  delivery_issue: { vi: 'Vấn đề giao hàng', en: 'Delivery Issue' },
  payment_issue: { vi: 'Vấn đề thanh toán', en: 'Payment Issue' },
  other: { vi: 'Khác', en: 'Other' },
}
