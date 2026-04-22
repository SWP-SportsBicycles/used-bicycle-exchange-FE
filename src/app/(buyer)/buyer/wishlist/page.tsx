"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { ListingCard } from "@/modules/buyer/components/ListingCard";
import { useWishlist } from "@/modules/buyer/hooks/useWishlist";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WishlistPage() {
  const [page, setPage] = useState(1);
  const { data: wishlistPage, isLoading } = useWishlist(page, 12);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-foreground flex items-center gap-2">
            <Heart className="h-8 w-8 text-rose-500 fill-rose-500" />
            Wishlist của tôi
          </h1>
          <p className="text-muted-foreground mt-2">
            Những chiếc xe đạp mà bạn đang quan tâm và lưu lại.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-muted rounded-2xl h-[400px]" />
            ))}
          </div>
        ) : !wishlistPage || wishlistPage.items.length === 0 ? (
          <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed border-border">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Chưa có xe đạp nào</h2>
            <p className="text-muted-foreground mb-6">
              Bạn chưa lưu chiếc xe nào vào wishlist.
            </p>
            <Button asChild>
              <a href="/marketplace">Khám phá Marketplace</a>
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistPage.items.map((listing, idx) => (
                <ListingCard key={listing.id} listing={listing} index={idx} />
              ))}
            </div>

            {/* Pagination */}
            {wishlistPage.totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  ← Trước
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: wishlistPage.totalPages }, (_, i) => i + 1)
                    .filter((p) => Math.abs(p - page) <= 2)
                    .map((p) => (
                      <Button
                        key={p}
                        variant={p === page ? "default" : "outline"}
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </Button>
                    ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= wishlistPage.totalPages}
                  onClick={() => setPage((p) => Math.min(wishlistPage.totalPages, p + 1))}
                >
                  Tiếp →
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
