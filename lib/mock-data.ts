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
  city: 'hanoi' | 'hcm' | 'danang'
  images: string[]
  videoUrl?: string
  status: 'draft' | 'pending_review' | 'published' | 'reserved' | 'sold' | 'withdrawn'
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
    city: 'hanoi',
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
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=minh-duc',
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
    city: 'hcm',
    images: [
      'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=800&q=80',
      'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=800&q=80',
    ],
    status: 'published',
    isVeloSafeVerified: true,
    seller: {
      id: 's2',
      name: 'Hồng Anh',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hong-anh',
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
    city: 'danang',
    images: [
      'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800&q=80',
      'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80',
    ],
    status: 'published',
    isVeloSafeVerified: true,
    seller: {
      id: 's3',
      name: 'Quang Trung',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=quang-trung',
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
    city: 'hanoi',
    images: [
      'https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?w=800&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    ],
    status: 'published',
    isVeloSafeVerified: false,
    seller: {
      id: 's4',
      name: 'Văn Hùng',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=van-hung',
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
    city: 'hcm',
    images: [
      'https://images.unsplash.com/photo-1511994298241-608e28f14fde?w=800&q=80',
      'https://images.unsplash.com/photo-1505705694340-019e1e335916?w=800&q=80',
    ],
    status: 'published',
    isVeloSafeVerified: true,
    seller: {
      id: 's5',
      name: 'Thu Hương',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=thu-huong',
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
    city: 'danang',
    images: [
      'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80',
    ],
    status: 'published',
    isVeloSafeVerified: false,
    seller: {
      id: 's6',
      name: 'Thanh Tùng',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=thanh-tung',
      rating: 4.0,
      totalSales: 2,
      memberSince: '2023-09-01',
    },
    createdAt: '2024-01-07',
    updatedAt: '2024-01-07',
  },
  // ── NEW LISTINGS ──────────────────────────────────────
  {
    id: '7',
    title: 'Cannondale SuperSix EVO Hi-MOD',
    price: 88000000,
    description: 'Siêu phẩm race bike từ Cannondale. Khung Hi-MOD Ballistec Carbon, groupset Dura-Ace R9200 Di2, bánh xe HollowGram. Xe đã vô địch giải đua nghiệp dư Hà Nội 2023.',
    category: 'road',
    brand: 'Cannondale',
    model: 'SuperSix EVO Hi-MOD',
    frameSize: 'M',
    frameMaterial: 'Carbon',
    groupset: 'Shimano Dura-Ace',
    wheelSize: '700c',
    condition: 'like_new',
    usageHistory: '1200km, chỉ dùng race và time trial',
    serial: 'CND2024SSE008811',
    city: 'hanoi',
    images: [
      'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&q=80',
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&q=80',
    ],
    status: 'published',
    isVeloSafeVerified: true,
    seller: {
      id: 's7',
      name: 'Phạm Việt Anh',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=viet-anh',
      rating: 4.9,
      totalSales: 7,
      memberSince: '2021-05-12',
    },
    inspection: {
      id: 'insp7',
      inspectorName: 'Nguyễn Văn Kiểm',
      inspectedAt: '2024-01-14',
      status: 'completed',
      report: {
        frameCondition: { status: 'pass', notes: 'Hi-MOD carbon tuyệt vời, không tì vết' },
        brakeSystem: { status: 'pass', notes: 'Dura-Ace calipers hoạt động xuất sắc' },
        drivetrain: { status: 'pass', notes: 'Di2 shifting hoàn hảo, pin 95%' },
        wheels: { status: 'pass', notes: 'HollowGram wheels chạy mượt' },
        overallGrade: 'A',
        notes: 'Xe đua cấp cao nhất, tình trạng gần như mới.',
        photos: [],
      }
    },
    createdAt: '2024-01-13',
    updatedAt: '2024-01-14',
  },
  {
    id: '8',
    title: 'BMC Teammachine SLR01 - Pro Level',
    price: 95000000,
    description: 'BMC Teammachine - xe chính hãng từ team AG2R. Premium ICS stem, groupset SRAM Red eTap AXS. Trọng lượng chỉ 6.8kg. Cơ hội sở hữu xe pro team hiếm có.',
    category: 'road',
    brand: 'BMC',
    model: 'Teammachine SLR01',
    frameSize: 'S',
    frameMaterial: 'Carbon',
    groupset: 'SRAM Red',
    wheelSize: '700c',
    condition: 'excellent',
    usageHistory: '2500km, bảo dưỡng tại BMC authorized dealer',
    serial: 'BMC2023TMS002244',
    city: 'hcm',
    images: [
      'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=800&q=80',
      'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800&q=80',
    ],
    status: 'published',
    isVeloSafeVerified: true,
    seller: {
      id: 's8',
      name: 'Lê Quang Minh',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=quang-minh',
      rating: 4.7,
      totalSales: 9,
      memberSince: '2020-11-08',
    },
    inspection: {
      id: 'insp8',
      inspectorName: 'Phạm Đức Anh',
      inspectedAt: '2024-01-13',
      status: 'completed',
      report: {
        frameCondition: { status: 'pass', notes: 'Premium carbon, có 2 vết xước nhẹ ở seatstay' },
        brakeSystem: { status: 'pass', notes: 'SRAM Red calipers xuất sắc' },
        drivetrain: { status: 'pass', notes: 'eTap AXS pin 88%, shifting mượt' },
        wheels: { status: 'warning', notes: 'Lốp cần thay trong 1000km, rim OK' },
        overallGrade: 'A',
        notes: 'Xe mức pro team, chất lượng rất cao. Chỉ cần thay lốp.',
        photos: [],
      }
    },
    createdAt: '2024-01-11',
    updatedAt: '2024-01-13',
  },
  {
    id: '9',
    title: 'Pinarello Dogma F - Aero Race',
    price: 120000000,
    description: 'Pinarello Dogma F - cùng dòng xe mà INEOS Grenadiers sử dụng. Khung Toray T1100 1K carbon, integrated cockpit, groupset Campagnolo Super Record EPS. Hàng collector.',
    category: 'road',
    brand: 'Pinarello',
    model: 'Dogma F',
    frameSize: 'L',
    frameMaterial: 'Carbon',
    groupset: 'Campagnolo Super Record',
    wheelSize: '700c',
    condition: 'like_new',
    usageHistory: '800km, chỉ đi gran fondo 2 lần',
    serial: 'PIN2024DGF001100',
    city: 'hcm',
    images: [
      'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80',
      'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=800&q=80',
    ],
    status: 'published',
    isVeloSafeVerified: true,
    seller: {
      id: 's9',
      name: 'Nguyễn Thành Đạt',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=thanh-dat',
      rating: 5.0,
      totalSales: 4,
      memberSince: '2022-08-01',
    },
    inspection: {
      id: 'insp9',
      inspectorName: 'Lê Hoàng Nam',
      inspectedAt: '2024-01-15',
      status: 'completed',
      report: {
        frameCondition: { status: 'pass', notes: 'Dogma F frame hoàn mỹ, không tì vết' },
        brakeSystem: { status: 'pass', notes: 'Campagnolo disc brakes hoạt động chuẩn' },
        drivetrain: { status: 'pass', notes: 'EPS electronic shifting hoàn hảo 100%' },
        wheels: { status: 'pass', notes: 'Bora WTO 45 wheels tuyệt vời' },
        overallGrade: 'A',
        notes: 'Hàng collector, tình trạng hoàn hảo. Khách hàng đẳng cấp.',
        photos: [],
      }
    },
    createdAt: '2024-01-14',
    updatedAt: '2024-01-15',
  },
  {
    id: '10',
    title: 'Bianchi Oltre RC - Celeste Dream',
    price: 68000000,
    description: 'Bianchi Oltre RC với màu Celeste huyền thoại. Khung CV system giảm rung, Shimano Ultegra Di2, bánh xe Fulcrum Wind 40. Xe Ý chính hãng.',
    category: 'road',
    brand: 'Bianchi',
    model: 'Oltre RC',
    frameSize: 'M',
    frameMaterial: 'Carbon',
    groupset: 'Shimano Ultegra Di2',
    wheelSize: '700c',
    condition: 'excellent',
    usageHistory: '3500km, chủ yếu đi cuối tuần, bảo quản trong nhà',
    serial: 'BIA2023OLT005566',
    city: 'danang',
    images: [
      'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=800&q=80',
      'https://images.unsplash.com/photo-1505705694340-019e1e335916?w=800&q=80',
    ],
    status: 'published',
    isVeloSafeVerified: true,
    seller: {
      id: 's10',
      name: 'Trần Bảo Long',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bao-long',
      rating: 4.6,
      totalSales: 6,
      memberSince: '2022-02-14',
    },
    inspection: {
      id: 'insp10',
      inspectorName: 'Trần Minh Tuấn',
      inspectedAt: '2024-01-12',
      status: 'completed',
      report: {
        frameCondition: { status: 'pass', notes: 'Celeste frame tuyệt đẹp, 1 vết xước nhỏ ở down tube' },
        brakeSystem: { status: 'pass', notes: 'Ultegra hydraulic disc đang tốt' },
        drivetrain: { status: 'pass', notes: 'Di2 chạy mượt, pin 90%' },
        wheels: { status: 'pass', notes: 'Fulcrum Wind 40 true, không rung' },
        overallGrade: 'A',
        notes: 'Xe Ý đẹp, chất lượng cao. Màu Celeste huyền thoại.',
        photos: [],
      }
    },
    createdAt: '2024-01-10',
    updatedAt: '2024-01-12',
  },
  {
    id: '11',
    title: 'Giant Revolt Advanced 2 - Gravel Adventure',
    price: 28000000,
    description: 'Gravel bike phù hợp cho người mới bắt đầu adventure cycling. Khung Advanced-Grade Composite, Shimano GRX 400 2x10, lốp 40c cho đường offroad. Giá tốt cho xe tầm này.',
    category: 'gravel',
    brand: 'Giant',
    model: 'Revolt Advanced 2',
    frameSize: 'M',
    frameMaterial: 'Carbon',
    groupset: 'Other',
    wheelSize: '700c',
    condition: 'good',
    usageHistory: '3200km, đi phượt Đà Lạt và Mũi Né nhiều lần',
    serial: 'GNT2022RVL004455',
    city: 'hcm',
    images: [
      'https://images.unsplash.com/photo-1505705694340-019e1e335916?w=800&q=80',
      'https://images.unsplash.com/photo-1511994298241-608e28f14fde?w=800&q=80',
    ],
    status: 'published',
    isVeloSafeVerified: true,
    seller: {
      id: 's11',
      name: 'Ngọc Trinh',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ngoc-trinh',
      rating: 4.3,
      totalSales: 4,
      memberSince: '2023-03-22',
    },
    inspection: {
      id: 'insp11',
      inspectorName: 'Phạm Đức Anh',
      inspectedAt: '2024-01-09',
      status: 'completed',
      report: {
        frameCondition: { status: 'pass', notes: 'Khung composite tốt, vài vết chip paint bình thường' },
        brakeSystem: { status: 'warning', notes: 'Má phanh cần thay sớm, còn 30%' },
        drivetrain: { status: 'pass', notes: 'GRX 400 hoạt động tốt' },
        wheels: { status: 'pass', notes: 'Lốp 40c còn 60%, rim tốt' },
        overallGrade: 'B',
        notes: 'Xe tốt cho gravel entry. Cần thay má phanh.',
        photos: [],
      }
    },
    createdAt: '2024-01-06',
    updatedAt: '2024-01-09',
  },
  {
    id: '12',
    title: 'Trek Marlin 7 - Trail Hardtail',
    price: 15000000,
    description: 'Mountain bike hardtail entry-level đến mid-range. RockShox Judy fork 100mm, Shimano Deore 1x10. Lý tưởng cho trail cơ bản và đi phố. Giá sinh viên.',
    category: 'mtb',
    brand: 'Trek',
    model: 'Marlin 7',
    frameSize: 'M',
    frameMaterial: 'Alloy',
    groupset: 'Other',
    wheelSize: '29"',
    condition: 'good',
    usageHistory: '6000km, đi học và trail weekends',
    serial: 'TRK2021MRL007799',
    city: 'hanoi',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
      'https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?w=800&q=80',
    ],
    status: 'published',
    isVeloSafeVerified: false,
    seller: {
      id: 's12',
      name: 'Hoàng Đình Nam',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dinh-nam',
      rating: 3.8,
      totalSales: 1,
      memberSince: '2024-01-01',
    },
    createdAt: '2024-01-12',
    updatedAt: '2024-01-12',
  },
  {
    id: '13',
    title: 'Specialized Sirrus X 4.0 - Urban Fitness',
    price: 18000000,
    description: 'Xe đạp urban fitness cao cấp từ Specialized. Khung nhôm A1 Premium, fork carbon, Shimano Deore 1x10. Tích hợp đèn Supernova, phù hợp đi làm hàng ngày.',
    category: 'urban',
    brand: 'Specialized',
    model: 'Sirrus X 4.0',
    frameSize: 'L',
    frameMaterial: 'Alloy',
    groupset: 'Other',
    wheelSize: '700c',
    condition: 'excellent',
    usageHistory: '1800km, chỉ đi commute trong thành phố',
    serial: 'SPZ2023SIR003344',
    city: 'hcm',
    images: [
      'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=800&q=80',
      'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&q=80',
    ],
    status: 'published',
    isVeloSafeVerified: true,
    seller: {
      id: 's13',
      name: 'Đỗ Thị Lan',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=thi-lan',
      rating: 4.4,
      totalSales: 3,
      memberSince: '2023-07-15',
    },
    inspection: {
      id: 'insp13',
      inspectorName: 'Nguyễn Văn Kiểm',
      inspectedAt: '2024-01-10',
      status: 'completed',
      report: {
        frameCondition: { status: 'pass', notes: 'Khung nhôm sạch sẽ, không biến dạng' },
        brakeSystem: { status: 'pass', notes: 'Phanh hydraulic hoạt động tốt' },
        drivetrain: { status: 'pass', notes: 'Deore groupset chạy mượt' },
        wheels: { status: 'pass', notes: 'Lốp Pathfinder còn mới' },
        overallGrade: 'A',
        notes: 'Xe urban fitness trong tình trạng rất tốt, sẵn sàng đi ngay.',
        photos: [],
      }
    },
    createdAt: '2024-01-08',
    updatedAt: '2024-01-10',
  },
  {
    id: '14',
    title: 'Cannondale Topstone Carbon 3 - Gravel Pro',
    price: 42000000,
    description: 'Gravel bike carbon từ Cannondale với hệ thống Kingpin rear suspension. Shimano GRX 810 1x, WTB Riddler 37c. Đã đi nhiều giải gravel tại Vietnam.',
    category: 'gravel',
    brand: 'Cannondale',
    model: 'Topstone Carbon 3',
    frameSize: 'L',
    frameMaterial: 'Carbon',
    groupset: 'Shimano GRX 810',
    wheelSize: '700c',
    condition: 'good',
    usageHistory: '4500km, đi nhiều gravel event và bikepacking',
    serial: 'CND2022TOP006677',
    city: 'danang',
    images: [
      'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=800&q=80',
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&q=80',
    ],
    status: 'published',
    isVeloSafeVerified: true,
    seller: {
      id: 's14',
      name: 'Võ Minh Tú',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=minh-tu',
      rating: 4.7,
      totalSales: 11,
      memberSince: '2021-09-20',
    },
    inspection: {
      id: 'insp14',
      inspectorName: 'Lê Hoàng Nam',
      inspectedAt: '2024-01-14',
      status: 'completed',
      report: {
        frameCondition: { status: 'warning', notes: 'Có vết chip paint nhỏ ở chainstay, cấu trúc OK' },
        brakeSystem: { status: 'pass', notes: 'GRX hydraulic brakes tốt' },
        drivetrain: { status: 'warning', notes: 'Cassette và chain cần thay trong 1000km' },
        wheels: { status: 'pass', notes: 'Wheels true, lốp Riddler còn 50%' },
        overallGrade: 'B',
        notes: 'Xe tốt cho gravel, cần bảo dưỡng drivetrain và thay lốp sớm.',
        photos: [],
      }
    },
    createdAt: '2024-01-12',
    updatedAt: '2024-01-14',
  },
  {
    id: '15',
    title: 'Scott Scale 970 - XC Hardtail',
    price: 12500000,
    description: 'XC hardtail nhẹ và nhanh từ Scott. Khung nhôm 6061, fork SR Suntour XCR 100mm, Shimano Deore 1x12. Giá tầm trung, phù hợp leo núi cơ bản.',
    category: 'mtb',
    brand: 'Scott',
    model: 'Scale 970',
    frameSize: 'S',
    frameMaterial: 'Alloy',
    groupset: 'Other',
    wheelSize: '29"',
    condition: 'fair',
    usageHistory: '8000km trong 3 năm, leo núi đều đặn',
    serial: 'SCT2021SCL008800',
    city: 'hanoi',
    images: [
      'https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?w=800&q=80',
    ],
    status: 'published',
    isVeloSafeVerified: true,
    seller: {
      id: 's15',
      name: 'Trương Công Hải',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=cong-hai',
      rating: 4.1,
      totalSales: 5,
      memberSince: '2022-06-18',
    },
    inspection: {
      id: 'insp15',
      inspectorName: 'Trần Minh Tuấn',
      inspectedAt: '2024-01-11',
      status: 'completed',
      report: {
        frameCondition: { status: 'warning', notes: 'Nhiều vết xước và chip paint, cấu trúc vẫn OK' },
        brakeSystem: { status: 'warning', notes: 'Má phanh cần thay, rotor còn dùng được' },
        drivetrain: { status: 'fail', notes: 'Chain và cassette đã mòn nhiều, cần thay bộ' },
        wheels: { status: 'pass', notes: 'Vành thẳng, nan hoa tốt, lốp cần thay' },
        overallGrade: 'C',
        notes: 'Xe cần bảo dưỡng nặng: thay chain+cassette, má phanh, lốp. Giá tốt nếu chấp nhận chi phí sửa chữa.',
        photos: [],
      }
    },
    createdAt: '2024-01-04',
    updatedAt: '2024-01-11',
  },
  {
    id: '16',
    title: 'Giant Escape 3 - City Commuter',
    price: 8500000,
    description: 'Xe đạp đô thị đơn giản từ Giant. Khung ALUXX nhôm, Shimano Tourney 3x7, rack mount sẵn sàng. Phù hợp đi làm, đi chợ, dạo phố. Bền bỉ và không cần bảo dưỡng nhiều.',
    category: 'urban',
    brand: 'Giant',
    model: 'Escape 3',
    frameSize: 'M',
    frameMaterial: 'Alloy',
    groupset: 'Other',
    wheelSize: '700c',
    condition: 'good',
    usageHistory: '2400km, đi làm hàng ngày tại Quận 7',
    serial: 'GNT2023ESC009900',
    city: 'hcm',
    images: [
      'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&q=80',
    ],
    status: 'published',
    isVeloSafeVerified: false,
    seller: {
      id: 's16',
      name: 'Phan Thị Yến',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=thi-yen',
      rating: 4.5,
      totalSales: 2,
      memberSince: '2023-11-10',
    },
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
]

// Helper to format Vietnamese Dong
export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount)
}

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
    | 'soft_reserved'
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
    hanoi: { listings: 67, transactions: 98 },
    hcm: { listings: 54, transactions: 112 },
    danang: { listings: 35, transactions: 24 },
  },
}

// Order status labels
export const ORDER_STATUS_LABELS = {
  pending_deposit: { vi: 'Chờ Đặt Cọc', en: 'Pending Deposit' },
  soft_reserved: { vi: 'Đã Soft Reserve', en: 'Soft Reserved' },
  inspection_scheduled: { vi: 'Đã Lên Lịch Kiểm Định', en: 'Inspection Scheduled' },
  inspection_completed: { vi: 'Kiểm Định Hoàn Tất', en: 'Inspection Completed' },
  pending_payment: { vi: 'Chờ Thanh Toán', en: 'Pending Payment' },
  delivered: { vi: 'Đã Giao Hàng', en: 'Delivered' },
  pending_confirmation: { vi: 'Chờ Xác Nhận', en: 'Pending Confirmation' },
  completed: { vi: 'Hoàn Thành', en: 'Completed' },
  cancelled: { vi: 'Đã Hủy', en: 'Cancelled' },
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

/* ─── UI Helpers (Market Price, Activity Signals) ─────────────────── */

/** Derive an estimated reference price at +15-30% above listing price for demo */
export function getMarketPrice(price: number, id: string): number {
  const seed = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const pct = 0.15 + (seed % 16) * 0.01   // 15–30%
  return Math.round((price * (1 + pct)) / 500_000) * 500_000
}

/** Generate a pseudo-random viewer count based on listing id (3-28) */
export function getViewerCount(id: string): number {
  const seed = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return 3 + (seed % 26)
}

/** Generate a time-ago string from createdAt date */
export function getTimeAgo(createdAt: string): string {
  const now = new Date('2024-01-16') // fixed "now" for demo consistency
  const created = new Date(createdAt)
  const diffMs = now.getTime() - created.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Hôm nay'
  if (diffDays === 1) return 'Hôm qua'
  if (diffDays < 7) return `${diffDays} ngày trước`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`
  return `${Math.floor(diffDays / 30)} tháng trước`
}
