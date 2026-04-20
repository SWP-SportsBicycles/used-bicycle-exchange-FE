import { DisputesTable } from "@/modules/admin/screens/DisputesTable";

export default function AdminDisputesPage() {
  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight">Disputes</h2>
      <p className="mt-2 mb-4 text-sm text-muted-foreground">
        Ma trận xử lý tranh chấp + SLA 8h/48h theo policy.
      </p>
      <DisputesTable />
    </div>
  );
}

