'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sparkles, Phone, Mail, MapPin, ShieldCheck, Truck, Search, Bike, ArrowRight } from 'lucide-react'
import { Header } from '@/components/header'
import { ListingCard } from '@/components/listing-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MOCK_LISTINGS } from '@/lib/mock-data'

const cityOptions = [
  { value: 'all', label: 'Toàn quốc' },
  { value: 'hanoi', label: 'Hà Nội' },
  { value: 'hcm', label: 'TP Hồ Chí Minh' },
  { value: 'danang', label: 'Đà Nẵng' },
] as const

const bikeTypeOptions = [
  { value: 'all', label: 'Tất cả xe đạp' },
  { value: 'road', label: 'Xe đạp đua' },
  { value: 'mtb', label: 'Xe đạp địa hình' },
  { value: 'gravel', label: 'Xe đạp gravel' },
  { value: 'urban', label: 'Xe đạp touring' },
] as const

export default function HomePage() {
  const router = useRouter()
  const [searchInput, setSearchInput] = useState('')
  const [selectedCity, setSelectedCity] = useState<(typeof cityOptions)[number]['value']>('all')
  const [selectedBikeType, setSelectedBikeType] = useState<(typeof bikeTypeOptions)[number]['value']>('all')

  const verifiedListings = useMemo(() => {
    return MOCK_LISTINGS.filter((listing) => listing.isVeloSafeVerified).slice(0, 6)
  }, [])

  const applyHeroSearch = () => {
    const params = new URLSearchParams()
    const term = searchInput.trim()

    if (term) params.set('q', term)
    if (selectedCity !== 'all') params.set('city', selectedCity)
    if (selectedBikeType !== 'all') params.set('type', selectedBikeType)

    const query = params.toString()
    router.push(query ? `/marketplace?${query}` : '/marketplace')
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="relative overflow-hidden border-b border-border/60">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/hero-bike-art.png')",
          }}
        />
        <div className="absolute left-0 top-0 h-full w-[22%] bg-[#aee86c]/95 [clip-path:polygon(0_0,100%_0,56%_100%,0_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1d2a14]/70 via-[#1d2a14]/45 to-[#1d2a14]/65" />
        <div className="absolute inset-0 opacity-25 [background:radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_42%),radial-gradient(circle_at_80%_15%,rgba(255,255,255,0.25),transparent_38%)]" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 lg:px-6 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <Badge variant="secondary" className="mb-5 gap-1.5 border-white/30 bg-white/20 px-4 py-1.5 text-sm font-medium text-white">
              <Sparkles className="h-3.5 w-3.5 text-lime-100" />
              Marketplace Xe Đạp Uy Tín #1 Việt Nam
            </Badge>
            <h1 className="text-balance text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl" style={{ fontFamily: 'var(--font-archivo)' }}>
              Tìm Xe Đạp Thể Thao
              <br />
              <span className="text-lime-200">Đã Qua Sử Dụng</span> Chất Lượng
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg text-slate-100/95">
              Trang chủ chỉ hiển thị các xe đã kiểm định. Bạn có thể vào Marketplace để lọc chi tiết và tìm xe đúng nhu cầu.
            </p>

            <div className="mx-auto mt-10 w-full max-w-6xl rounded-3xl border border-white/75 bg-white p-3 shadow-2xl">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
                  <input
                    type="text"
                    placeholder="Tìm xe đạp theo tên, thương hiệu..."
                    className="h-14 w-full rounded-xl border border-transparent bg-slate-50 pl-11 pr-4 text-base text-foreground outline-none transition-colors focus:border-primary/40 focus:bg-white"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') applyHeroSearch()
                    }}
                  />
                </div>

                <Select value={selectedCity} onValueChange={(value) => setSelectedCity(value as typeof selectedCity)}>
                  <SelectTrigger className="h-14 rounded-xl border-primary/25 bg-slate-50 font-semibold text-[#253218]">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {cityOptions.map((city) => (
                      <SelectItem key={city.value} value={city.value}>
                        {city.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedBikeType} onValueChange={(value) => setSelectedBikeType(value as typeof selectedBikeType)}>
                  <SelectTrigger className="h-14 rounded-xl border-primary/25 bg-slate-50 font-semibold text-[#253218]">
                    <div className="flex items-center gap-2">
                      <Bike className="h-4 w-4 text-primary" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {bikeTypeOptions.map((bikeType) => (
                      <SelectItem key={bikeType.value} value={bikeType.value}>
                        {bikeType.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  onClick={applyHeroSearch}
                  className="h-14 rounded-xl bg-primary px-8 text-base font-semibold text-primary-foreground hover:bg-[#90cb4f]"
                >
                  Tìm xe
                </Button>

                <Button asChild className="h-14 rounded-xl bg-[#407F3E] px-8 text-base font-semibold text-white hover:bg-[#346734]">
                  <Link href="/seller/create">Bán ngay</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Đã kiểm định VeloSafe</p>
            <h2 className="mt-2 text-2xl font-bold uppercase tracking-wide text-foreground" style={{ fontFamily: 'var(--font-archivo)' }}>
              Sản Phẩm Nổi Bật
            </h2>
          </div>
          <Button variant="outline" asChild>
            <Link href="/marketplace" className="gap-1.5">
              Xem Marketplace
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {verifiedListings.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {verifiedListings.map((listing, index) => (
              <ListingCard key={listing.id} listing={listing} index={index} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <h3 className="text-lg font-semibold text-foreground">Chưa có xe đã kiểm định</h3>
            <p className="mt-1 text-sm text-muted-foreground">Thử quay lại sau hoặc vào Marketplace để xem tất cả tin đăng.</p>
          </div>
        )}
      </main>

      <footer className="mt-6 border-t border-border/70 bg-[#253218] text-slate-200">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-3 lg:px-6">
          <div>
            <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-archivo)' }}>
              VeloTrust
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Nền tảng mua bán xe đạp thể thao đã qua sử dụng, minh bạch thông tin và hỗ trợ kiểm định VeloSafe.
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm text-lime-200">
              <ShieldCheck className="h-4 w-4" />
              Cam kết xe rõ nguồn gốc - giao dịch an toàn
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-white">Thông tin chính sách</h4>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              <li className="flex items-center gap-2"><Truck className="h-4 w-4 text-lime-200" /> Chính sách giao hàng toàn quốc</li>
              <li>Chính sách kiểm định VeloSafe</li>
              <li>Chính sách đổi trả và hoàn tiền</li>
              <li>Chính sách bảo mật dữ liệu</li>
              <li>Điều khoản sử dụng nền tảng</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-white">Liên hệ</h4>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-lime-200" />
                Hotline: 028.9996.5775
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-lime-200" />
                Email: support@velotrust.vn
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-lime-200" />
                330 Hùng Vương, Châu Đức, BR-VT
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-700/70 py-4 text-center text-xs text-slate-400">
          Copyright {new Date().getFullYear()} VeloTrust. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
