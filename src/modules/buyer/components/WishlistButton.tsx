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

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating if inside a Link
    e.stopPropagation();

    // Optimistic UI update
    const newValue = !isWishlisted;
    setIsWishlisted(newValue);

    // Call API
    toggle(listingId, !newValue); // passing the original state to the hook
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={cn("transition-all duration-200", className)}
      onClick={handleToggle}
      disabled={isLoading}
    >
      <Heart
        className={cn(
          "h-4 w-4",
          isWishlisted && "fill-destructive text-destructive"
        )}
      />
      <span className="sr-only">
        {isWishlisted ? "Xóa khỏi wishlist" : "Thêm vào wishlist"}
      </span>
    </Button>
  );
}
