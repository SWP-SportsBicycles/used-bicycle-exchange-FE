export type ChatRole = "guest" | "buyer" | "seller" | "inspector" | "admin";

type EndpointItem = {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  notes?: string;
};

type RoleApiKnowledge = {
  tags: string[];
  endpoints: EndpointItem[];
};

export const ROLE_API_KNOWLEDGE: Record<Exclude<ChatRole, "guest">, RoleApiKnowledge> = {
  admin: {
    tags: ["AdminAccount", "AdminDashboard", "AdminListing", "AdminOrder", "AdminUser", "Auth"],
    endpoints: [
      { method: "GET", path: "/api/AdminDashboard" },
      { method: "GET", path: "/api/admin-listing" },
      { method: "GET", path: "/api/admin-listing/all" },
      { method: "GET", path: "/api/admin-listing/{listingId}" },
      { method: "POST", path: "/api/admin-listing/{listingId}/approve" },
      { method: "POST", path: "/api/admin-listing/{listingId}/reject", notes: "Body: RejectListingDTO" },
      { method: "GET", path: "/api/AdminOrder" },
      { method: "POST", path: "/api/AdminOrder/{orderId}/notify-seller" },
      { method: "POST", path: "/api/AdminOrder/{orderId}/confirm-payout" },
      { method: "GET", path: "/api/AdminUser" },
      { method: "GET", path: "/api/AdminUser/{userId}" },
      { method: "GET", path: "/api/AdminUser/sellers" },
      { method: "GET", path: "/api/AdminUser/buyers" },
      { method: "PUT", path: "/api/AdminUser/ban/{userId}" },
      { method: "PUT", path: "/api/AdminUser/unban/{userId}" },
      { method: "POST", path: "/api/AdminAccount/admin/create-inspector" },
      { method: "GET", path: "/api/Auth/me" },
    ],
  },
  buyer: {
    tags: ["BuyerListing", "BuyerOrder", "BuyerReport", "BuyerShipment", "Cart", "Payment", "Wishlist", "Auth"],
    endpoints: [
      { method: "GET", path: "/api/buyer-listing" },
      { method: "GET", path: "/api/buyer-listing/search" },
      { method: "GET", path: "/api/buyer-listing/{listingId}" },
      { method: "POST", path: "/api/buyer-order", notes: "Body: CreateOrderDTO" },
      { method: "GET", path: "/api/buyer-order" },
      { method: "GET", path: "/api/buyer-order/{orderId}" },
      { method: "POST", path: "/api/buyer-order/{orderId}/paid" },
      { method: "POST", path: "/api/buyer-report/{orderId}", notes: "Body: CreateReportDTO" },
      { method: "GET", path: "/api/buyer-report/my" },
      { method: "GET", path: "/api/buyer-report" },
      { method: "GET", path: "/api/buyer-shipment/{orderId}" },
      { method: "POST", path: "/api/buyer-shipment/sync/{orderId}" },
      { method: "POST", path: "/api/buyer-shipment/confirm-received/{orderId}" },
      { method: "POST", path: "/api/buyer-cart/add", notes: "Body: AddToCartDTO" },
      { method: "GET", path: "/api/buyer-cart/my-cart" },
      { method: "PUT", path: "/api/buyer-cart/selection" },
      { method: "DELETE", path: "/api/buyer-cart/items/{cartItemId}" },
      { method: "POST", path: "/api/buyer-cart/checkout" },
      { method: "POST", path: "/api/buyer-cart/preview-checkout" },
      { method: "POST", path: "/api/payment/{orderId}" },
      { method: "POST", path: "/api/payment/cancel/{orderId}" },
      { method: "POST", path: "/api/payment/refund-info/{orderId}" },
      { method: "GET", path: "/api/payment/refund-status/{orderId}" },
      { method: "POST", path: "/api/payment/refund-confirm/{orderId}" },
      { method: "POST", path: "/api/wishlist/{bikeId}" },
      { method: "DELETE", path: "/api/wishlist/{bikeId}" },
      { method: "GET", path: "/api/wishlist" },
    ],
  },
  seller: {
    tags: ["SellerListing", "SellerMedia", "SellerOrder", "SellerShipment", "SellerShippingProfile", "Upload", "Auth"],
    endpoints: [
      { method: "POST", path: "/api/seller-listing" },
      { method: "GET", path: "/api/seller-listing" },
      { method: "GET", path: "/api/seller-listing/{listingId}" },
      { method: "PUT", path: "/api/seller-listing/{listingId}" },
      { method: "DELETE", path: "/api/seller-listing/{listingId}" },
      { method: "POST", path: "/api/seller-listing/{listingId}/submit" },
      { method: "POST", path: "/api/seller-listing/{listingId}/withdraw" },
      { method: "POST", path: "/api/seller-listing/{id}/resubmit" },
      { method: "POST", path: "/api/seller-media/upload-multiple" },
      { method: "DELETE", path: "/api/seller-media/{mediaId}" },
      { method: "PUT", path: "/api/seller-media/{mediaId}/type" },
      { method: "GET", path: "/api/SellerOrder" },
      { method: "GET", path: "/api/SellerOrder/{orderId}" },
      { method: "POST", path: "/api/SellerOrder/{orderId}/confirm" },
      { method: "POST", path: "/api/SellerOrder/{orderId}/cancel" },
      { method: "POST", path: "/api/seller-shipment/{orderId}" },
      { method: "POST", path: "/api/SellerShippingProfile" },
      { method: "GET", path: "/api/SellerShippingProfile" },
      { method: "POST", path: "/api/Upload/image" },
      { method: "POST", path: "/api/Upload/video" },
      { method: "POST", path: "/api/Upload/file" },
    ],
  },
  inspector: {
    tags: ["Inspector", "InspectorListing", "Auth"],
    endpoints: [
      { method: "GET", path: "/api/inspector/pending" },
      { method: "GET", path: "/api/inspector/{orderId}" },
      { method: "POST", path: "/api/inspector/{orderId}/submit", notes: "Body: InspectionDTO" },
      { method: "GET", path: "/api/inspector/history" },
      { method: "GET", path: "/api/inspector/history/{inspectionId}" },
      { method: "GET", path: "/api/inspector-listing/pending" },
      { method: "GET", path: "/api/inspector-listing/{listingId}" },
      { method: "POST", path: "/api/inspector-listing/{listingId}/submit-to-admin", notes: "Body: ReviewListingDTO" },
    ],
  },
};

export function getRoleApiContext(role: ChatRole): string {
  if (role === "guest") {
    return "Guest users have no privileged API access. Only provide general guidance and ask user to sign in.";
  }

  const data = ROLE_API_KNOWLEDGE[role];
  const endpointsText = data.endpoints
    .map((item) => `- ${item.method} ${item.path}${item.notes ? ` (${item.notes})` : ""}`)
    .join("\n");

  return [
    `Current user role: ${role.toUpperCase()}`,
    `Allowed API tags: ${data.tags.join(", ")}`,
    "Allowed endpoints:",
    endpointsText,
  ].join("\n");
}
