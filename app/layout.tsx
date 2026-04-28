import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { AuthProvider } from "@/app/contexts/auth-context"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CSA Student Portal",
  description: "Official Student Portal for College of Saint Amatiel",

  openGraph: {
    title: "CSA Student Portal",
    description: "Official Student Portal for College of Saint Amatiel",
    url: "https://csa-studentportal.vercel.app",
    siteName: "CSA Portal",
    images: [
      {
        url: "https://csa-studentportal.vercel.app/image.png",
        width: 1200,
        height: 630,
        alt: "CSA Student Portal Preview",
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "CSA Student Portal",
    description: "Official Student Portal for College of Saint Amatiel",
    images: ["https://csa-studentportal.vercel.app/image.png"],
  },

  icons: {
    icon: "/image.png",
    apple: "/image.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <AuthProvider>{children}</AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
