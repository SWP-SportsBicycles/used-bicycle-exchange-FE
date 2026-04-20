"use client";

import { useInspectorAssignmentsQuery } from "@/lib/api/queries/inspector";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function AssignmentsTable() {
  const { data, isLoading } = useInspectorAssignmentsQuery("u_inspector_01");

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading assignments...</p>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Inspection ID</TableHead>
          <TableHead>Listing ID</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data?.map((it) => (
          <TableRow key={it.id}>
            <TableCell>{it.id}</TableCell>
            <TableCell>{it.listingId}</TableCell>
            <TableCell>
              <Badge variant="secondary">{it.status}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

