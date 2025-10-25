import { Geist, Geist_Mono } from "next/font/google"
import NavBar from "@/components/NavBar"
import Footer from "@/components/Footer"
import "./globals.css"
import Providers from "./Providers"
import WhatsAppButton from "@/components/WhatsAppButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata = {
  title: "Raven Fragrance",
  description: "Luxury perfumes for the rebel woman",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <NavBar />
          {children}
          <Footer />
        </Providers>
        <WhatsAppButton />
      </body>
    </html>
  )
}
