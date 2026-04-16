import type { Metadata, Viewport } from 'next'
import { Inter, Archivo, Space_Grotesk } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ChatWidget } from '@/components/ChatWidget'
import { Providers } from '@/components/providers'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin", "vietnamese"],
  variable: '--font-inter'
});

const archivo = Archivo({
  subsets: ["latin", "vietnamese"],
  variable: '--font-archivo',
  weight: ['400', '500', '600', '700', '800', '900']
});

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin", "vietnamese"],
  variable: '--font-space-grotesk'
});

export const metadata: Metadata = {
  title: 'VeloTrust - Marketplace Xe Đạp Thể Thao Đã Qua Sử Dụng',
  description: 'Nền tảng mua bán xe đạp thể thao đã qua sử dụng uy tín với dịch vụ kiểm định VeloSafe tại Hà Nội, TP.HCM và Đà Nẵng.',
  generator: 'v0.app',
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#f8fafc',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" className="bg-background">
      <body className={`${inter.variable} ${archivo.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <Providers>
          {children}
        </Providers>
        <ChatWidget />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
