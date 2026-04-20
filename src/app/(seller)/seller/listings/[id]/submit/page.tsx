export default async function SellerSubmitListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight">Submit listing #{id}</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        (Placeholder) Submit: draft → pending_review.
      </p>
    </div>
  );
}

