import { http } from "@/lib/api/http";
import { type Listing } from "@/lib/mock-data";

export interface ListingsQueryParams {
  search?: string;
  city?: string;
  category?: string;
}

function buildQuery(params: ListingsQueryParams) {
  const query = new URLSearchParams();

  if (params.search) query.set("search", params.search);
  if (params.city) query.set("city", params.city);
  if (params.category) query.set("category", params.category);

  const value = query.toString();
  return value ? `?${value}` : "";
}

export const listingsApi = {
  async getMarketplaceListings(params: ListingsQueryParams = {}): Promise<Listing[]> {
    const query = buildQuery(params);
    return http.get<Listing[]>(`/api/listings${query}`);
  },
};
