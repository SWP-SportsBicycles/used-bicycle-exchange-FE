import { mockListings } from "@/mocks/mockData";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AdminPendingListingsPage() {
  const rows = mockListings.filter((l) => l.status === "pending_review" || l.status === "published");

  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight">Pending listings</h2>
      <p className="mt-2 mb-4 text-sm text-muted-foreground">
        Moderation queue: kiểm serial + ảnh groupset trước khi duyệt.
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Listing</TableHead>
            <TableHead>Serial</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.title}</TableCell>
              <TableCell>{row.frameSerial}</TableCell>
              <TableCell>
                <Badge variant="secondary">{row.status}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

