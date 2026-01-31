import './globals.css'
import '@/styles/albion.css'
import { Inter, Cinzel } from 'next/font/google'
import { Providers } from './providers'
import { NavbarV2 } from '@/components/navbar'
import { FooterV2 } from '@/components/FooterV2'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const cinzel = Cinzel({ subsets: ['latin'], weight: ['600'], variable: '--font-cinzel' })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${cinzel.variable}`}>
      <body className="font-sans bg-bg-light dark:bg-bg min-h-screen flex flex-col">
        <Providers>
          <NavbarV2 />
          <main className="mx-auto max-w-[1600px] w-full px-4 py-6 flex-1">{children}</main>
          <FooterV2 />
        </Providers>
      </body>
    </html>
  )
}
