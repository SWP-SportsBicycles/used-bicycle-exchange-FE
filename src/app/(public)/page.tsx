import Link from "next/link";

import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="min-h-full bg-gradient-to-b from-background to-muted/40">
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div className="space-y-5">
            <Badge variant="secondary">MVP • HN / SG / DN</Badge>
            <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">
              Sàn mua bán xe đạp thể thao đã qua sử dụng
            </h1>
            <p className="text-pretty text-base leading-7 text-muted-foreground md:text-lg">
              Đặt cọc 10% (tối đa 2.000.000đ) để giữ xe và kích hoạt kiểm định tại nhà Seller.
              Thông tin PII chỉ hiển thị sau khi cọc được xác nhận.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/bicycles">Khám phá xe đang bán</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/seller/listings/new">Đăng tin bán xe</Link>
              </Button>
            </div>
          </div>

          <Card className="border-muted-foreground/20">
            <CardHeader>
              <CardTitle>Quick links (dev)</CardTitle>
              <CardDescription>
                Route groups đã sẵn sàng để team làm song song.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button asChild variant="secondary" className="justify-start">
                <Link href="/buyer/orders">Buyer Portal</Link>
              </Button>
              <Button asChild variant="secondary" className="justify-start">
                <Link href="/seller/listings">Seller Dashboard</Link>
              </Button>
              <Button asChild variant="secondary" className="justify-start">
                <Link href="/inspector/assignments">Inspector Portal</Link>
              </Button>
              <Button asChild variant="secondary" className="justify-start">
                <Link href="/admin/listings/pending">Admin Panel</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
