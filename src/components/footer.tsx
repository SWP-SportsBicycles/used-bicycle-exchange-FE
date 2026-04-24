'use client'

import Link from 'next/link'
import { Phone, Mail, MapPin, ShieldCheck, Truck, Facebook, Instagram, Youtube } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

export function Footer() {
  const { user } = useAuth()
  const sellerCtaHref =
    user?.role === 'seller' ? '/seller/create' : '/auth/register?role=2&redirect=/seller/create'

  return (
    <footer id="footer" className="border-t border-border/70 bg-[#253218] text-slate-200 mt-auto">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:px-6">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary shadow-athletic">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-primary-foreground" stroke="currentColor" strokeWidth="2.5">
                <circle cx="5.5" cy="17.5" r="3.5" />
                <circle cx="18.5" cy="17.5" r="3.5" />
                <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h2" />
              </svg>
            </div>
            <span className="text-xl font-extrabold text-white" style={{ fontFamily: 'var(--font-archivo)' }}>
              VeloTrust
            </span>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            Nền tảng mua bán xe đạp thể thao đã qua sử dụng, minh bạch thông tin và hỗ trợ kiểm định VeloSafe.
          </p>
          <div className="mt-4 flex items-center gap-2 text-sm text-lime-200">
            <ShieldCheck className="h-4 w-4" />
            Cam kết xe rõ nguồn gốc - giao dịch an toàn
          </div>
          {/* Social icons */}
          <div className="mt-5 flex gap-3">
            {[Facebook, Instagram, Youtube].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-slate-300 transition-colors hover:bg-primary/30 hover:text-white"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-white">Truy cập nhanh</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-slate-300">
            {[
              { href: '/marketplace', label: 'Marketplace' },
              { href: '/#how-it-works', label: 'Cách hoạt động' },
              { href: '/#why-velotrust', label: 'Tại sao VeloTrust' },
              { href: sellerCtaHref, label: 'Đăng bán xe' },
            ].map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition-colors hover:text-lime-200">{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Policies */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-white">Chính sách</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-slate-300">
            <li className="flex items-center gap-2"><Truck className="h-4 w-4 text-lime-200" /> Giao hàng toàn quốc</li>
            <li>Chính sách kiểm định VeloSafe</li>
            <li>Đổi trả và hoàn tiền</li>
            <li>Bảo mật dữ liệu</li>
            <li>Điều khoản sử dụng</li>
          </ul>
        </div>

        {/* Contact */}
        <div className="flex flex-col">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-white">Liên hệ</h4>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-lime-200 shrink-0" />
              Hotline: 028.9996.5775
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-lime-200 shrink-0" />
              support@velotrust.vn
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-1 h-4 w-4 text-lime-200 shrink-0" />
              <span className="leading-snug">7 Đ. D1, Long Thạnh Mỹ, Tăng Nhơn Phú, Hồ Chí Minh 700000, Việt Nam</span>
            </li>
          </ul>
          <div className="mt-5 h-[150px] w-full overflow-hidden rounded-xl border border-white/10 bg-white/5">
            <iframe
              src="https://www.google.com/maps?q=7+%C4%90.+D1,+Long+Th%E1%BA%A1nh+M%E1%BB%B9,+T%C3%A2ng+Nh%C6%A1n+Ph%C3%BA,+H%E1%BB%93+Ch%C3%AD+Minh+700000,+Vi%E1%BB%87t+Nam&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full w-full opacity-80 grayscale mix-blend-luminosity brightness-110 contrast-125 transition-all duration-500 hover:opacity-100 hover:grayscale-0 hover:mix-blend-normal"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-slate-700/70 py-5 text-center text-xs text-slate-400">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          Copyright {new Date().getFullYear()} VeloTrust. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
