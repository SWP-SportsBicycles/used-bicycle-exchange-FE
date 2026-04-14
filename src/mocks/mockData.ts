import type {
  Dispute,
  Id,
  Inspection,
  InspectionReport,
  Listing,
  Order,
  SellerProfile,
  User,
} from "@/types/domain";
import { calcDepositAmountVnd } from "@/lib/domain/money";

const now = new Date();
const iso = (d: Date) => d.toISOString();

export const mockUsers: User[] = [
  {
    id: "u_buyer_01",
    email: "buyer@example.com",
    displayName: "Buyer Nguyen",
    roles: ["buyer"],
  },
  {
    id: "u_seller_01",
    email: "seller1@example.com",
    displayName: "Seller Tran",
    roles: ["seller"],
  },
  {
    id: "u_seller_02",
    email: "seller2@example.com",
    displayName: "Seller Le",
    roles: ["seller"],
  },
  {
    id: "u_inspector_01",
    email: "inspector@example.com",
    displayName: "Inspector Pham",
    roles: ["inspector"],
  },
  {
    id: "u_admin_01",
    email: "admin@example.com",
    displayName: "Admin",
    roles: ["admin"],
  },
];

export const mockSellerProfiles: SellerProfile[] = [
  {
    userId: "u_seller_01",
    phone: "0987 111 222",
    addressLine1: "12 Nguyen Hue",
    district: "Q1",
    cityCode: "SG",
    reputationScore: 4.6,
  },
  {
    userId: "u_seller_02",
    phone: "0909 333 444",
    addressLine1: "55 Tran Phu",
    district: "Hai Chau",
    cityCode: "DN",
    reputationScore: 4.2,
  },
];

export const mockListings: Listing[] = [
  {
    id: "l_road_01",
    sellerId: "u_seller_01",
    title: "Giant TCR Advanced 2 - Shimano 105",
    description:
      "Road bike carbon nhẹ, phù hợp endurance/leo dốc. Xe sử dụng kỹ, bảo dưỡng định kỳ. Có ảnh groupset cận cảnh.",
    price: 28_500_000,
    cityCode: "SG",
    frameSerial: "GIANT-TCR-2021-ABCD1234",
    condition: "good",
    status: "published",
    createdAt: iso(new Date(now.getTime() - 1000 * 60 * 60 * 24 * 10)),
    updatedAt: iso(new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2)),
    spec: {
      category: "road",
      frameMaterial: "carbon",
      frameSize: "54",
      brakeType: "disc_hydraulic",
      drivetrainSpeeds: 22,
      groupset: { brand: "Shimano", model: "105 R7000", tier: "mid" },
      wheels: { brand: "Giant", model: "PR-2", material: "alloy", depthMm: 30 },
    },
    media: [
      {
        id: "m_road_01_1",
        url: "https://images.placeholders.dev/?id=road1-hero",
        kind: "image",
        sortOrder: 1,
      },
      {
        id: "m_road_01_2",
        url: "https://images.placeholders.dev/?id=road1-groupset-close",
        kind: "image",
        sortOrder: 2,
      },
    ],
  },
  {
    id: "l_mtb_01",
    sellerId: "u_seller_02",
    title: "Trek Marlin 7 - 1x12, 29\"",
    description:
      "MTB hardtail 29er, phù hợp city trail. Chuyển số mượt, phanh ổn. Có checklist kiểm định mẫu.",
    price: 15_900_000,
    cityCode: "DN",
    frameSerial: "TREK-MARLIN7-2020-ZYXW9876",
    condition: "like_new",
    status: "published",
    createdAt: iso(new Date(now.getTime() - 1000 * 60 * 60 * 24 * 20)),
    updatedAt: iso(new Date(now.getTime() - 1000 * 60 * 60 * 24 * 1)),
    spec: {
      category: "mtb",
      frameMaterial: "aluminum",
      frameSize: "M",
      brakeType: "disc_hydraulic",
      wheelSizeInch: 29,
      suspension: { type: "hardtail", forkTravelMm: 100 },
      drivetrain: { brand: "SRAM", model: "SX Eagle", speeds: 12 },
    },
    media: [
      {
        id: "m_mtb_01_1",
        url: "https://images.placeholders.dev/?id=mtb1-hero",
        kind: "image",
        sortOrder: 1,
      },
      {
        id: "m_mtb_01_2",
        url: "https://images.placeholders.dev/?id=mtb1-groupset-close",
        kind: "image",
        sortOrder: 2,
      },
    ],
  },
];

export const mockOrders: Order[] = [
  (() => {
    const listing = mockListings[0]!;
    const depositAmount = calcDepositAmountVnd(listing.price);
    return {
      id: "o_deposit_01",
      listingId: listing.id,
      buyerId: "u_buyer_01",
      type: "deposit",
      status: "inspection",
      amountTotal: listing.price,
      depositAmount,
      createdAt: iso(new Date(now.getTime() - 1000 * 60 * 60 * 24 * 1)),
    } satisfies Order;
  })(),
  (() => {
    const listing = mockListings[1]!;
    const depositAmount = calcDepositAmountVnd(listing.price);
    return {
      id: "o_deposit_02",
      listingId: listing.id,
      buyerId: "u_buyer_01",
      type: "deposit",
      status: "disputed",
      amountTotal: listing.price,
      depositAmount,
      createdAt: iso(new Date(now.getTime() - 1000 * 60 * 60 * 24 * 5)),
    } satisfies Order;
  })(),
];

export const mockInspections: Inspection[] = [
  {
    id: "insp_01",
    listingId: "l_road_01",
    inspectorId: "u_inspector_01",
    status: "submitted",
    outcome: "minor_issues",
    scheduledAt: iso(new Date(now.getTime() - 1000 * 60 * 60 * 12)),
    completedAt: iso(new Date(now.getTime() - 1000 * 60 * 60 * 2)),
  },
];

export const mockInspectionReports: InspectionReport[] = [
  {
    id: "insprept_01",
    inspectionId: "insp_01",
    reportUrl: "https://files.placeholders.dev/?id=inspection-report-01.pdf",
    photoUrls: [
      "https://images.placeholders.dev/?id=inspection-01-frame",
      "https://images.placeholders.dev/?id=inspection-01-drivetrain",
    ],
    checklist: {
      frame: { cracks: "ok", dents: "minor", alignment: "ok" },
      brakes: { type: "disc_hydraulic", pads: "replace_soon", rotors: "ok" },
      drivetrain: { chainWearPct: 0.35, cassette: "ok", shifting: "needs_adjustment" },
      notes:
        "Xe đúng mô tả tổng quan. Lưu ý bố thắng mòn ~70%, nên thay trong 2-4 tuần.",
    },
  },
];

export const mockDisputes: Dispute[] = [
  {
    id: "d_01",
    orderId: "o_deposit_02",
    status: "open",
    reason: "not_as_described",
    createdAt: iso(new Date(now.getTime() - 1000 * 60 * 60 * 6)),
    messages: [
      {
        id: "dm_01",
        disputeId: "d_01",
        senderId: "u_buyer_01",
        body:
          "Xe nhận thực tế khác mô tả: xước khung nhiều hơn và bộ truyền động bị kêu.",
        at: iso(new Date(now.getTime() - 1000 * 60 * 60 * 6)),
      },
      {
        id: "dm_02",
        disputeId: "d_01",
        senderId: "u_seller_02",
        body: "Mình đã mô tả đúng, có thể do vận chuyển. Sẵn sàng hỗ trợ kiểm tra lại.",
        at: iso(new Date(now.getTime() - 1000 * 60 * 60 * 5)),
      },
    ],
  },
];

export function getListingById(id: Id) {
  return mockListings.find((l) => l.id === id) ?? null;
}

export function getOrderById(id: Id) {
  return mockOrders.find((o) => o.id === id) ?? null;
}

export function getSellerProfileByUserId(userId: Id) {
  return mockSellerProfiles.find((p) => p.userId === userId) ?? null;
}

