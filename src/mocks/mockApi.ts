import type { Dispute, Id, Inspection, Listing, Order } from "@/types/domain";
import {
  getListingById,
  getOrderById,
  mockDisputes,
  mockInspections,
  mockListings,
  mockOrders,
} from "@/mocks/mockData";
import { calcDepositAmountVnd } from "@/lib/domain/money";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export type ListingsQuery = {
  q?: string;
  cityCode?: "HN" | "SG" | "DN";
  category?: "road" | "mtb";
};

export async function apiListListings(query: ListingsQuery = {}): Promise<Listing[]> {
  await sleep(250);
  const q = query.q?.toLowerCase().trim();
  return mockListings
    .filter((l) => l.status === "published")
    .filter((l) => (query.cityCode ? l.cityCode === query.cityCode : true))
    .filter((l) => (query.category ? l.spec.category === query.category : true))
    .filter((l) =>
      q ? `${l.title} ${l.description}`.toLowerCase().includes(q) : true
    );
}

export async function apiGetListing(id: Id): Promise<Listing> {
  await sleep(200);
  const listing = getListingById(id);
  if (!listing) throw new Error("Listing not found");
  return listing;
}

export async function apiListBuyerOrders(buyerId: Id): Promise<Order[]> {
  await sleep(200);
  return mockOrders.filter((o) => o.buyerId === buyerId);
}

export async function apiGetOrder(id: Id): Promise<Order> {
  await sleep(150);
  const order = getOrderById(id);
  if (!order) throw new Error("Order not found");
  return order;
}

export async function apiCreateDepositOrder(args: {
  listingId: Id;
  buyerId: Id;
}): Promise<Order> {
  await sleep(300);
  const listing = getListingById(args.listingId);
  if (!listing) throw new Error("Listing not found");
  const depositAmount = calcDepositAmountVnd(listing.price);

  const created: Order = {
    id: `o_${Date.now()}`,
    listingId: listing.id,
    buyerId: args.buyerId,
    type: "deposit",
    status: "pending_payment",
    amountTotal: listing.price,
    depositAmount,
    createdAt: new Date().toISOString(),
  };

  mockOrders.push(created);
  return created;
}

export async function apiListInspectorAssignments(inspectorId: Id): Promise<Inspection[]> {
  await sleep(200);
  return mockInspections.filter((i) => i.inspectorId === inspectorId);
}

export async function apiListAdminDisputes(): Promise<Dispute[]> {
  await sleep(200);
  return [...mockDisputes];
}

