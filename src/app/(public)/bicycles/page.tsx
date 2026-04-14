import { AppHeader } from "@/components/layout/AppHeader";
import { BrowseScreen } from "@/modules/buyer/screens/BrowseScreen";

export default function BicyclesPage() {
  return (
    <div className="min-h-full">
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="mb-5">
          <h2 className="text-2xl font-semibold tracking-tight">Bicycle marketplace</h2>
          <p className="text-sm text-muted-foreground">
            Bộ lọc đa chiều theo city/category và tìm kiếm theo nội dung.
          </p>
        </div>
        <BrowseScreen />
      </main>
    </div>
  );
}

