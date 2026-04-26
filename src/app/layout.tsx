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
  title: 'SBE - Marketplace Xe Đạp Thể Thao Đã Qua Sử Dụng',
  description: 'Nền tảng mua bán xe đạp thể thao đã qua sử dụng uy tín với dịch vụ kiểm định SBE tại Hà Nội, TP.HCM và Đà Nẵng.',
  generator: 'SBE',
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
    <html lang="vi" className="bg-background" suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme before React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('sbe-theme');if(t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
      </head>
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
