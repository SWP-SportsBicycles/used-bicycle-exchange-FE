"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useWishlistToggle } from "@/modules/buyer/hooks/useWishlist";

interface WishlistButtonProps {
  listingId: string;
  initialIsWishlisted?: boolean;
  className?: string;
  variant?: "ghost" | "outline" | "default";
  size?: "default" | "sm" | "lg" | "icon";
}

export function WishlistButton({
  listingId,
  initialIsWishlisted = false,
  className,
  variant = "outline",
  size = "icon",
}: WishlistButtonProps) {
  // Use optimistic state internally for instant feedback
  const [isWishlisted, setIsWishlisted] = useState(initialIsWishlisted);
  const { toggle, isLoading } = useWishlistToggle();

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating if inside a Link
    e.stopPropagation();

    // Guard: do not fire if we don't have a valid id
    if (!listingId || !listingId.trim()) return;

    // Optimistic UI update
    const newValue = !isWishlisted;
    setIsWishlisted(newValue);

    try {
      // Call API
      await toggle(listingId, !newValue); // passing the original state to the hook
    } catch {
      // Rollback on error
      setIsWishlisted(!newValue);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        "transition-all duration-300 active:scale-90 hover:shadow-md",
        isWishlisted && "border-destructive/30 bg-destructive/5 hover:bg-destructive/10",
        className
      )}
      onClick={handleToggle}
      disabled={isLoading}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-transform duration-300",
          isWishlisted ? "fill-destructive text-destructive scale-110" : "text-muted-foreground group-hover:scale-110"
        )}
      />
      <span className="sr-only">
        {isWishlisted ? "Xóa khỏi wishlist" : "Thêm vào wishlist"}
      </span>
    </Button>
  );
}
