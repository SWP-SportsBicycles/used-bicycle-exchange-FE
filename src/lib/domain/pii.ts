import type { Id, Listing, Order, SellerProfile, User, UserRole } from "@/types/domain";

export type ViewerContext = {
  user: User | null;
  activeRole: UserRole;
  depositConfirmedOrderIds: Set<Id>;
};

export type SellerContactView =
  | { visibility: "hidden" }
  | {
      visibility: "revealed";
      phone: string;
      addressLine1: string;
      district?: string;
      cityCode: SellerProfile["cityCode"];
    };

export function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7) return "******";
  return `${digits.slice(0, 3)}****${digits.slice(-3)}`;
}

/**
 * Policy B.2: Seller phone + full address only after Buyer has a deposit-confirmed order.
 */
export function getSellerContactForOrder({
  order,
  listing,
  sellerProfile,
  viewer,
}: {
  order: Order;
  listing: Listing;
  sellerProfile: SellerProfile;
  viewer: ViewerContext;
}): SellerContactView {
  const viewerIsBuyerOfOrder = viewer.user?.id === order.buyerId;
  const viewerIsSellerOfListing = viewer.user?.id === listing.sellerId;
  const viewerIsAdmin = viewer.activeRole === "admin";

  const depositConfirmed = viewer.depositConfirmedOrderIds.has(order.id);

  if (viewerIsAdmin) {
    return {
      visibility: "revealed",
      phone: sellerProfile.phone,
      addressLine1: sellerProfile.addressLine1,
      district: sellerProfile.district,
      cityCode: sellerProfile.cityCode,
    };
  }

  if ((viewerIsBuyerOfOrder || viewerIsSellerOfListing) && depositConfirmed) {
    return {
      visibility: "revealed",
      phone: sellerProfile.phone,
      addressLine1: sellerProfile.addressLine1,
      district: sellerProfile.district,
      cityCode: sellerProfile.cityCode,
    };
  }

  return { visibility: "hidden" };
}

export function getPublicSellerSnippet(sellerProfile: SellerProfile) {
  return {
    cityCode: sellerProfile.cityCode,
    district: sellerProfile.district,
    phoneMasked: maskPhone(sellerProfile.phone),
  };
}

