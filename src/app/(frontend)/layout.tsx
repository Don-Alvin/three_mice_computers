import React from 'react'
import './styles.css'

export const metadata = {
  description:
    'Computers, CCTV, networking, printers and accessories — genuine stock, delivered across Kenya.',
  title: 'Three Mice Computers',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
