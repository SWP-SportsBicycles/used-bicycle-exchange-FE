import { BuyerOrdersScreen } from "@/modules/buyer/screens/BuyerOrdersScreen";

export default function BuyerOrdersPage() {
  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight">My Orders</h2>
      <p className="mt-2 mb-4 text-sm text-muted-foreground">
        Luồng order buyer: pending_payment → inspection → disputed/completed.
      </p>
      <BuyerOrdersScreen />
    </div>
  );
}

