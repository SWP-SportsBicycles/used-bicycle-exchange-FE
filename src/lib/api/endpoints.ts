export const endpoints = {
  listings: "/api/v1/listings",
  listingDetail: (id: string) => `/api/v1/listings/${id}`,
  orders: "/api/v1/orders",
  orderDetail: (id: string) => `/api/v1/orders/${id}`,
  inspectorAssignments: "/api/v1/inspector/assignments",
  adminDisputes: "/api/v1/admin/disputes",
};

