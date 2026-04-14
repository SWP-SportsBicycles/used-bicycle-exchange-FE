export default async function SellerEditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight">Edit listing #{id}</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        (Placeholder) Dev3 sẽ build edit flow + lock when order active.
      </p>
    </div>
  );
}

