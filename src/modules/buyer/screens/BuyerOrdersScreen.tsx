"use client";

import Link from "next/link";

import { useAuth } from "@/lib/auth/authContext";
import { useBuyerOrdersQuery } from "@/lib/api/queries/orders";
import { formatVnd } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function BuyerOrdersScreen() {
  const { user } = useAuth();
  const buyerId = user?.id ?? "";
  const { data, isLoading } = useBuyerOrdersQuery(buyerId);

  if (!buyerId) {
    return (
      <p className="text-sm text-muted-foreground">
        Hãy chọn role buyer ở góc trên để xem danh sách đơn.
      </p>
    );
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading orders...</p>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Deposit</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data?.map((order) => (
          <TableRow key={order.id}>
            <TableCell>{order.id}</TableCell>
            <TableCell>
              <Badge variant="secondary">{order.status}</Badge>
            </TableCell>
            <TableCell>{formatVnd(order.depositAmount)}</TableCell>
            <TableCell className="text-right">
              <Button asChild size="sm" variant="outline">
                <Link href={`/buyer/orders/${order.id}`}>Detail</Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

