"use client";

import { useMemo } from "react";

import { DepositCheckoutDialog } from "@/modules/buyer/components/DepositCheckoutDialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatVnd } from "@/lib/utils/format";
import { useListingQuery } from "@/lib/api/queries/listings";
import type { Id } from "@/types/domain";

export function PdpScreen({ listingId }: { listingId: Id }) {
  const { data, isLoading } = useListingQuery(listingId);
  const specs = useMemo(() => {
    if (!data) return [];
    if (data.spec.category === "road") {
      return [
        `Groupset: ${data.spec.groupset.brand} ${data.spec.groupset.model}`,
        `Frame: ${data.spec.frameMaterial ?? "N/A"} ${data.spec.frameSize}`,
        `Brake: ${data.spec.brakeType}`,
      ];
    }
    return [
      `Groupset: ${data.spec.drivetrain.brand} ${data.spec.drivetrain.model}`,
      `Wheel: ${data.spec.wheelSizeInch}"`,
      `Suspension: ${data.spec.suspension.type}`,
    ];
  }, [data]);

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading bicycle...</p>;
  if (!data) return <p className="text-sm text-muted-foreground">Listing not found.</p>;

  return (
    <section className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{data.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-2xl font-semibold">{formatVnd(data.price)}</p>
          <div className="flex gap-2">
            <Badge>{data.spec.category.toUpperCase()}</Badge>
            <Badge variant="secondary">{data.condition}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{data.description}</p>
          <DepositCheckoutDialog listingId={data.id} listingPrice={data.price} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Thông số kỹ thuật</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {specs.map((s) => (
            <div key={s} className="rounded border p-2">
              {s}
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}

