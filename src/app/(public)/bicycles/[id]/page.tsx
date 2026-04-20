import Link from "next/link";

import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { PdpScreen } from "@/modules/buyer/screens/PdpScreen";

export default async function BicycleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="min-h-full">
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold tracking-tight">Bicycle #{id}</h2>
          <Button asChild variant="outline">
            <Link href="/bicycles">Back to list</Link>
          </Button>
        </div>
        <div className="mt-4">
          <PdpScreen listingId={id} />
        </div>
      </main>
    </div>
  );
}

