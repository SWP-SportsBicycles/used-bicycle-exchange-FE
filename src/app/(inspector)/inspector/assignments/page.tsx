import { AssignmentsTable } from "@/modules/inspector/screens/AssignmentsTable";

export default function InspectorAssignmentsPage() {
  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight">Assignments</h2>
      <p className="mt-2 mb-4 text-sm text-muted-foreground">
        Danh sách assignment inspector theo mock API.
      </p>
      <AssignmentsTable />
    </div>
  );
}

