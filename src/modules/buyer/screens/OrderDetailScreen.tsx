"use client";

import { useMemo } from "react";

import { useAuth } from "@/lib/auth/authContext";
import { useOrderQuery } from "@/lib/api/queries/orders";
import { getListingById, getSellerProfileByUserId } from "@/mocks/mockData";
import { getSellerContactForOrder } from "@/lib/domain/pii";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatVnd } from "@/lib/utils/format";
import type { Id } from "@/types/domain";

export function OrderDetailScreen({ orderId }: { orderId: Id }) {
  const auth = useAuth();
  const { data: order, isLoading } = useOrderQuery(orderId);

  const contactView = useMemo(() => {
    if (!order) return null;
    const listing = getListingById(order.listingId);
    if (!listing) return null;
    const sellerProfile = getSellerProfileByUserId(listing.sellerId);
    if (!sellerProfile) return null;
    return getSellerContactForOrder({
      order,
      listing,
      sellerProfile,
      viewer: {
        user: auth.user,
        activeRole: auth.activeRole,
        depositConfirmedOrderIds: auth.depositConfirmedOrderIds,
      },
    });
  }, [order, auth]);

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading order...</p>;
  if (!order) return <p className="text-sm text-muted-foreground">Order not found.</p>;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Badge>{order.status}</Badge>
        <Badge variant="secondary">{order.type}</Badge>
      </div>
      <p className="text-sm">Deposit amount: {formatVnd(order.depositAmount)}</p>
      <div className="rounded-md border p-3 text-sm">
        <p className="font-medium">Seller contact visibility (PII policy)</p>
        {contactView?.visibility === "revealed" ? (
          <p>
            {contactView.phone} • {contactView.addressLine1}, {contactView.district},{" "}
            {contactView.cityCode}
          </p>
        ) : (
          <p className="text-muted-foreground">
            Hidden until deposit is confirmed for this order.
          </p>
        )}
      </div>
      <Button
        variant="outline"
        onClick={() => auth.setDepositConfirmed(order.id, true)}
      >
        Mark deposit confirmed (demo)
      </Button>
    </div>
  );
}

