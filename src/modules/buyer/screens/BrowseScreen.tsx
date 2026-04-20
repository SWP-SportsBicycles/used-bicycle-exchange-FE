"use client";

import * as React from "react";

import { ListingCard } from "@/components/shared/ListingCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useListingsQuery } from "@/lib/api/queries/listings";
import type { BicycleCategory, CityCode } from "@/types/domain";

export function BrowseScreen() {
  const [q, setQ] = React.useState("");
  const [cityCode, setCityCode] = React.useState<CityCode | "all">("all");
  const [category, setCategory] = React.useState<BicycleCategory | "all">("all");

  const { data, isLoading } = useListingsQuery({
    q,
    cityCode: cityCode === "all" ? undefined : cityCode,
    category: category === "all" ? undefined : category,
  });

  return (
    <section className="space-y-6">
      <div className="grid gap-3 md:grid-cols-3">
        <Input
          placeholder="Tìm theo tên xe, mô tả..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Select value={cityCode} onValueChange={(v) => setCityCode(v as CityCode | "all")}>
          <SelectTrigger>
            <SelectValue placeholder="City" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All cities</SelectItem>
            <SelectItem value="HN">Hà Nội</SelectItem>
            <SelectItem value="SG">TP.HCM</SelectItem>
            <SelectItem value="DN">Đà Nẵng</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={category}
          onValueChange={(v) => setCategory(v as BicycleCategory | "all")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            <SelectItem value="road">Road</SelectItem>
            <SelectItem value="mtb">MTB</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading listings...</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data?.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
        </div>
      )}
    </section>
  );
}

