"use client";

import { useMemo } from "react";

import { useAdminDisputesQuery } from "@/lib/api/queries/admin";
import { getRecommendedDecision, getSlaDeadlines } from "@/lib/domain/dispute";
import { formatDateTimeVi } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function DisputesTable() {
  const { data, isLoading } = useAdminDisputesQuery();

  const rows = useMemo(
    () =>
      (data ?? []).map((d) => {
        const sla = getSlaDeadlines(d.createdAt);
        return { ...d, sla };
      }),
    [data]
  );

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading disputes...</p>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Reason</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>SLA ack</TableHead>
          <TableHead>SLA resolve</TableHead>
          <TableHead>Recommended decision</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell>{row.id}</TableCell>
            <TableCell>{row.reason}</TableCell>
            <TableCell>
              <Badge variant="secondary">{row.status}</Badge>
            </TableCell>
            <TableCell>{formatDateTimeVi(row.sla.ackBy)}</TableCell>
            <TableCell>{formatDateTimeVi(row.sla.resolveBy)}</TableCell>
            <TableCell>{getRecommendedDecision(row.reason)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

