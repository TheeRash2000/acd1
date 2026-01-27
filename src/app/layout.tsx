import './globals.css'
import '@/styles/albion.css'
import { Inter, Cinzel } from 'next/font/google'
import { Providers } from './providers'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const cinzel = Cinzel({ subsets: ['latin'], weight: ['600'], variable: '--font-cinzel' })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${cinzel.variable}`}>
      <body className="font-sans">
        <Providers>
          <Navbar />
          <main className="mx-auto max-w-[1600px] px-4 py-6">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
