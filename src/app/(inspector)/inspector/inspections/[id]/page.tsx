import { InspectionChecklistForm } from "@/modules/inspector/screens/InspectionChecklistForm";

export default async function InspectorInspectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight">Inspection #{id}</h2>
      <p className="mt-2 mb-4 text-sm text-muted-foreground">
        Checklist khung/phanh/truyền động + upload report theo FR-INSP-02.
      </p>
      <InspectionChecklistForm />
    </div>
  );
}

