import type React from "react"
import "./globals.css"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider" // Assuming you have this for shadcn/ui
import { instrumentSerif, satoshi, ppNeueBit, ppRightSerif, ppMondwest } from "@/utils/fonts";
import type { Viewport } from "next"
export const metadata = {
  title: "XD :UI",
  description: "A showcase of UI components library",
    generator: 'v0.dev'
}


export const viewport: Viewport = {
  maximumScale: 1,
  userScalable: false
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(`${satoshi.variable} ${instrumentSerif.variable} ${ppNeueBit.variable} ${ppRightSerif.variable} ${ppMondwest.variable} min-h-screen bg-brand-bg-page font-sans antialiased text-brand-text-primary overscroll-contain scroll-smooth`)}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
