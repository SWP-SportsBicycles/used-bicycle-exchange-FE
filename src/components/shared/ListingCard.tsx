"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import type { Listing } from "@/types/domain";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatVnd } from "@/lib/utils/format";

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">{listing.title}</CardTitle>
          <CardDescription>
            {listing.cityCode} • {listing.spec.category.toUpperCase()} •{" "}
            {"frameSize" in listing.spec ? listing.spec.frameSize : "-"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge>{listing.condition}</Badge>
            <Badge variant="secondary">{listing.status}</Badge>
          </div>
          <div className="text-2xl font-semibold tracking-tight">{formatVnd(listing.price)}</div>
          <p className="line-clamp-2 text-sm text-muted-foreground">{listing.description}</p>
          <Button asChild className="w-full">
            <Link href={`/bicycles/${listing.id}`}>Xem chi tiết</Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

