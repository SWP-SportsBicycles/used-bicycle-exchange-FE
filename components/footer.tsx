'use client'

import Link from 'next/link'
import {
  ArrowUpRight,
  Clock3,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Youtube,
} from 'lucide-react'

const proofPoints = [
  { label: 'Reserve with structure', value: 'Soft reserve + managed checkout' },
  { label: 'Inspection workflow', value: 'Field report before high-value handoff' },
  { label: 'Human support', value: 'Ops review for disputes and delivery issues' },
]

const quickLinks = [
  { href: '/marketplace', label: 'Marketplace' },
  { href: '/seller/create', label: 'Sell on VeloTrust' },
  { href: '/orders', label: 'Order center' },
  { href: '/profile', label: 'Account' },
]

const platformLinks = [
  'Inspection standards',
  'Managed payment policy',
  'Delivery handoff notes',
  'Dispute handling',
]

export function Footer() {
  return (
    <footer id="footer" className="relative overflow-hidden border-t border-border/70 bg-[#182410] text-slate-100">
      <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(174,232,108,0.75),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(174,232,108,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.06),transparent_26%)]" />

      <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-14 lg:px-6">
        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.9fr_0.85fr_1fr]">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[radial-gradient(circle_at_top,var(--primary),#263f17_78%)] text-primary-foreground shadow-[0_24px_60px_-34px_rgba(174,232,108,0.65)]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xl font-extrabold tracking-[-0.03em] text-white" style={{ fontFamily: 'var(--font-archivo)' }}>
                  VeloTrust
                </div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                  Managed bike marketplace
                </div>
              </div>
            </div>

            <p className="max-w-xl text-sm leading-7 text-slate-300">
              Built to make second-hand performance bikes feel more credible, more structured,
              and easier to hand off with confidence.
            </p>

            <div className="grid gap-3">
              {proofPoints.map((point) => (
                <div key={point.label} className="rounded-[1.35rem] border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-lime-200/90">
                    {point.label}
                  </div>
                  <div className="mt-1 text-sm text-slate-200">{point.value}</div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 text-sm text-lime-200">
              <Sparkles className="h-4 w-4" />
              UI demo polished for a premium marketplace pitch.
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-white">Explore</h4>
            <ul className="mt-5 space-y-3 text-sm text-slate-300">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="inline-flex items-center gap-2 transition-colors hover:text-white">
                    <span>{link.label}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-lime-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-white">Platform</h4>
            <ul className="mt-5 space-y-3 text-sm text-slate-300">
              {platformLinks.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-lime-200" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-white">Contact</h4>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5">
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-lime-200" />
                  <span>028 9996 5775</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-lime-200" />
                  <span>support@velotrust.vn</span>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-lime-200" />
                  <span>Thu Duc City, Ho Chi Minh City</span>
                </li>
                <li className="flex items-center gap-3">
                  <Clock3 className="h-4 w-4 text-lime-200" />
                  <span>Daily support, 09:00 - 21:00</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-3">
              {[Facebook, Instagram, Youtube].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-slate-300 transition-all hover:-translate-y-0.5 hover:border-lime-200/30 hover:bg-white/12 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <span>Copyright {new Date().getFullYear()} VeloTrust. Premium UI demo edition.</span>
          <span>Reserve. Inspect. Settle. Hand off with confidence.</span>
        </div>
      </div>
    </footer>
  )
}
