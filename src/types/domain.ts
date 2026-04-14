export type CityCode = "HN" | "SG" | "DN";

export type UserRole = "guest" | "buyer" | "seller" | "inspector" | "admin";

export type ListingStatus =
  | "draft"
  | "pending_review"
  | "published"
  | "rejected"
  | "reserved"
  | "sold"
  | "withdrawn";

export type ListingMediaKind = "image" | "video" | "document";

export type BicycleCategory = "road" | "mtb";

export type BicycleCondition = "new" | "like_new" | "good" | "fair" | "needs_work";

export type BrakeType = "rim" | "disc_mechanical" | "disc_hydraulic";

export type GroupsetBrand = "Shimano" | "SRAM" | "Campagnolo" | "MicroSHIFT" | "Other";

export type OrderType = "deposit" | "full_purchase";

export type OrderStatus =
  | "pending_payment"
  | "payment_received"
  | "inspection"
  | "pending_fulfillment"
  | "completed"
  | "cancelled"
  | "disputed";

export type PaymentMethod = "offline_transfer" | "cash" | "other";

export type PaymentStatus = "pending" | "confirmed" | "rejected";

export type InspectionStatus = "scheduled" | "in_progress" | "submitted" | "approved";

export type InspectionOutcome =
  | "ok"
  | "minor_issues"
  | "major_mismatch"
  | "unsafe";

export type DisputeStatus = "open" | "awaiting_evidence" | "resolved" | "closed";

export type DisputeReason =
  | "not_as_described"
  | "shipping_damage"
  | "buyer_changed_mind"
  | "seller_not_delivering"
  | "technical";

export type AdminDecision =
  | "refund_buyer"
  | "partial_refund"
  | "release_to_seller"
  | "hold_for_logistics"
  | "deposit_split_50_50"
  | "penalize_seller";

export type MoneyVnd = number;

export type Id = string;

export type ListingSpecRoad = {
  category: "road";
  frameMaterial?: "carbon" | "aluminum" | "steel" | "titanium";
  frameSize: string; // e.g. 52, 54, S/M/L
  brakeType: BrakeType;
  drivetrainSpeeds: number; // e.g. 22, 24
  groupset: {
    brand: GroupsetBrand;
    model: string; // e.g. "105 R7000"
    tier?: "entry" | "mid" | "pro";
  };
  wheels?: {
    brand?: string;
    model?: string;
    material?: "alloy" | "carbon";
    depthMm?: number;
  };
};

export type ListingSpecMtb = {
  category: "mtb";
  frameMaterial?: "carbon" | "aluminum" | "steel" | "titanium";
  frameSize: string;
  brakeType: BrakeType;
  wheelSizeInch: 26 | 27.5 | 29;
  suspension: {
    type: "hardtail" | "full_suspension";
    forkTravelMm?: number;
    rearTravelMm?: number;
  };
  drivetrain: {
    brand: GroupsetBrand;
    model: string;
    speeds: number; // e.g. 12
  };
};

export type ListingSpec = ListingSpecRoad | ListingSpecMtb;

export type ListingMedia = {
  id: Id;
  url: string;
  kind: ListingMediaKind;
  sortOrder: number;
};

export type SellerProfile = {
  userId: Id;
  phone: string;
  addressLine1: string;
  district?: string;
  cityCode: CityCode;
  reputationScore?: number;
};

export type User = {
  id: Id;
  email: string;
  displayName: string;
  roles: UserRole[];
};

export type Listing = {
  id: Id;
  sellerId: Id;
  title: string;
  description: string;
  price: MoneyVnd;
  cityCode: CityCode;
  frameSerial: string;
  condition: BicycleCondition;
  status: ListingStatus;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  spec: ListingSpec;
  media: ListingMedia[];
};

export type Payment = {
  id: Id;
  orderId: Id;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: MoneyVnd;
  proofUrl?: string;
  confirmedAt?: string;
};

export type Order = {
  id: Id;
  listingId: Id;
  buyerId: Id;
  type: OrderType;
  status: OrderStatus;
  amountTotal: MoneyVnd;
  depositAmount: MoneyVnd;
  createdAt: string;
};

export type Inspection = {
  id: Id;
  listingId: Id;
  inspectorId: Id;
  status: InspectionStatus;
  outcome?: InspectionOutcome;
  scheduledAt?: string;
  completedAt?: string;
};

export type InspectionChecklist = {
  frame: {
    cracks: "ok" | "minor" | "major";
    dents: "ok" | "minor" | "major";
    alignment: "ok" | "needs_attention";
  };
  brakes: {
    type: BrakeType;
    pads: "ok" | "replace_soon" | "replace_now";
    rotors?: "ok" | "replace_soon" | "replace_now";
  };
  drivetrain: {
    chainWearPct: number;
    cassette: "ok" | "worn";
    shifting: "ok" | "needs_adjustment" | "problematic";
  };
  notes?: string;
};

export type InspectionReport = {
  id: Id;
  inspectionId: Id;
  reportUrl?: string;
  checklist: InspectionChecklist;
  photoUrls: string[];
};

export type DisputeMessage = {
  id: Id;
  disputeId: Id;
  senderId: Id;
  body: string;
  at: string;
};

export type Dispute = {
  id: Id;
  orderId: Id;
  status: DisputeStatus;
  reason: DisputeReason;
  createdAt: string;
  messages: DisputeMessage[];
  adminDecision?: AdminDecision;
};

