import './globals.css'

export const metadata = {
  title: 'animation',
  description: 'three.js animation practice',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}