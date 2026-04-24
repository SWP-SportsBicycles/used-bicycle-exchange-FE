"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { ListingCard } from "@/modules/buyer/components/ListingCard";
import { useWishlist } from "@/modules/buyer/hooks/useWishlist";
import { Heart, HeartCrack, Bike } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListingCardSkeleton } from "@/modules/buyer/components/skeletons/ListingCardSkeleton";

export default function WishlistPage() {
  const [page, setPage] = useState(1);
  const { data: wishlistPage, isLoading } = useWishlist(page, 12);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground flex items-center gap-3 tracking-tight" style={{ fontFamily: 'var(--font-archivo)' }}>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-900/30 text-rose-500 shadow-sm">
              <Heart className="h-6 w-6 fill-current" />
            </div>
            Bộ sưu tập của tôi
          </h1>
          <p className="text-muted-foreground mt-3 text-lg max-w-2xl">
            Những mẫu xe đạp và phụ kiện mà bạn đang để mắt tới. Đừng để lỡ mất cơ hội sở hữu chúng nhé!
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4].map((n) => (
              <ListingCardSkeleton key={n} />
            ))}
          </div>
        ) : !wishlistPage || wishlistPage.items.length === 0 ? (
          <div className="rounded-3xl border border-border/50 bg-card p-12 sm:p-20 shadow-sm text-center flex flex-col items-center mt-10">
            <div className="relative mb-8 group">
              <div className="absolute inset-0 bg-rose-500/20 blur-2xl rounded-full scale-150 transition-transform group-hover:scale-175 duration-500"></div>
              <div className="relative h-24 w-24 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center border-2 border-rose-100 dark:border-rose-900/50 shadow-inner">
                <HeartCrack className="h-10 w-10 text-rose-400" strokeWidth={1.5} />
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground" style={{ fontFamily: 'var(--font-archivo)' }}>Bộ sưu tập đang trống</h2>
            <p className="text-muted-foreground mb-8 text-lg max-w-md mx-auto">
              Bạn chưa lưu chiếc xe nào vào wishlist. Khám phá hàng ngàn mẫu xe đạp chất lượng với chính sách bảo vệ Escrow 100%.
            </p>
            <Button asChild className="rounded-xl h-14 px-8 font-bold text-lg shadow-athletic group">
              <Link href="/marketplace" className="flex items-center gap-2">
                <Bike className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                Khám phá Marketplace ngay
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              {wishlistPage.items.map((listing, idx) => (
                <div key={listing.id} className="relative group">
                  <ListingCard listing={listing} index={idx} />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {wishlistPage.totalPages > 1 && (
              <div className="mt-14 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-full font-semibold border-border/50 hover:bg-secondary/50"
                >
                  ← Trước
                </Button>
                <div className="flex items-center gap-1 bg-card rounded-full p-1 border border-border/40 shadow-sm">
                  {Array.from({ length: wishlistPage.totalPages }, (_, i) => i + 1)
                    .filter((p) => Math.abs(p - page) <= 2)
                    .map((p) => (
                      <Button
                        key={p}
                        variant={p === page ? "default" : "ghost"}
                        size="sm"
                        className={`h-9 w-9 p-0 rounded-full font-bold ${p === page ? 'shadow-md shadow-primary/20' : ''}`}
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
                  className="rounded-full font-semibold border-border/50 hover:bg-secondary/50"
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
