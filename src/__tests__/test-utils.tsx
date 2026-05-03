/**
 * Test utilities and shared mock factories.
 * Centralizes test helpers to keep individual test files DRY.
 */
import { render, type RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactElement, type ReactNode } from "react";

// ---------- Factory: QueryClient for tests ----------

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

// ---------- Custom render with providers ----------

interface WrapperProps {
  children: ReactNode;
}

export function createWrapper() {
  const queryClient = createTestQueryClient();
  return function Wrapper({ children }: WrapperProps) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  const queryClient = createTestQueryClient();

  function Wrapper({ children }: WrapperProps) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...options }),
    queryClient,
  };
}

// ---------- Mock Data Factories ----------

export function createMockListing(overrides: Record<string, unknown> = {}) {
  return {
    id: "listing-1",
    bikeId: "bike-1",
    title: "Giant TCR Advanced Pro",
    brand: "Giant",
    model: "TCR Advanced Pro",
    category: "road",
    condition: "excellent" as const,
    price: 25000000,
    frameSize: "M",
    frameMaterial: "Carbon",
    groupset: "Shimano Ultegra",
    wheelSize: "700c",
    description: "Xe đạp road bike cao cấp",
    images: ["https://example.com/img1.jpg", "https://example.com/img2.jpg"],
    videoUrls: [],
    city: "hcm",
    isVeloSafeVerified: true,
    isWishlisted: false,
    isInspected: true,
    isLocked: false,
    serial: "GNT-2024-001",
    status: "published" as const,
    seller: {
      id: "seller-1",
      name: "Bike Shop HCM",
      rating: 4.8,
      totalSales: 42,
      memberSince: "2023-01-15",
    },
    createdAt: "2024-12-01T08:00:00Z",
    updatedAt: "2024-12-15T10:30:00Z",
    ...overrides,
  };
}

export function createMockOrder(overrides: Record<string, unknown> = {}) {
  return {
    id: "order-1",
    listingId: "listing-1",
    listing: {
      id: "listing-1",
      title: "Giant TCR Advanced Pro",
      images: ["https://example.com/img1.jpg"],
      price: 25000000,
    },
    status: "pending" as const,
    statusLabel: "Chờ thanh toán",
    receiverName: "Nguyễn Văn A",
    receiverPhone: "0912345678",
    receiverAddress: "123 Đường Lê Lợi, Quận 1, TP.HCM",
    shippingFee: 50000,
    totalPrice: 25050000,
    createdAt: "2024-12-20T10:00:00Z",
    updatedAt: "2024-12-20T10:00:00Z",
    ...overrides,
  };
}

export function createMockReport(overrides: Record<string, unknown> = {}) {
  return {
    id: "report-1",
    orderId: "order-1",
    type: "Thiếu phụ kiện / Sai hàng",
    reason: "Sản phẩm nhận được không đúng mô tả",
    description: "Xe thiếu bộ công cụ kèm theo",
    status: "Pending",
    statusDisplay: "Đang chờ Inspector kiểm định",
    createdAt: "2024-12-25T14:00:00Z",
    ...overrides,
  };
}

export function createMockListingPage(
  items = [createMockListing()],
  overrides: Record<string, unknown> = {},
) {
  return {
    items,
    totalCount: items.length,
    pageNumber: 1,
    pageSize: 12,
    totalPages: 1,
    ...overrides,
  };
}

export function createMockOrderPage(
  items = [createMockOrder()],
  overrides: Record<string, unknown> = {},
) {
  return {
    items,
    totalCount: items.length,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 1,
    ...overrides,
  };
}

export function createMockCart(overrides: Record<string, unknown> = {}) {
  return {
    items: [],
    totalCount: 0,
    selectedCount: 0,
    subtotal: 0,
    ...overrides,
  };
}

export function createMockCartItem(overrides: Record<string, unknown> = {}) {
  const listing = createMockListing();
  return {
    id: "cart-item-1",
    bikeId: "bike-1",
    listingId: "listing-1",
    isSelected: true,
    listing,
    ...overrides,
  };
}
