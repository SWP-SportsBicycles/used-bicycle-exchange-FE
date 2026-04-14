import { SellerNewListingForm } from "@/modules/seller/screens/SellerNewListingForm";

export default function SellerNewListingPage() {
  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight">Create listing</h2>
      <p className="mt-2 mb-4 text-sm text-muted-foreground">
        Form upload thông số + validate chặt theo policy C.1.
      </p>
      <SellerNewListingForm />
    </div>
  );
}

