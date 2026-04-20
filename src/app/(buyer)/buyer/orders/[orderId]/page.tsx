import { OrderDetailScreen } from "@/modules/buyer/screens/OrderDetailScreen";

export default async function BuyerOrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight">Order #{orderId}</h2>
      <p className="mt-2 mb-4 text-sm text-muted-foreground">
        Demo PII masking/unmasking theo trạng thái cọc.
      </p>
      <OrderDetailScreen orderId={orderId} />
    </div>
  );
}

