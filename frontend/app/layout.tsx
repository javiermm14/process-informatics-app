import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'プロセスインフォマティクス',
  description: '品質予測システム',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}