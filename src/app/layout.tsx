import type { Metadata, Viewport } from "next"
import Script from "next/script"
import { Chakra_Petch, Manrope, Unbounded } from "next/font/google"
import "./globals.css"

// A wide, heavy display face for level titles, like a game's title card.
const display = Unbounded({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "700", "800"],
})

const sans = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
})

// The HUD: labels, counters, key hints.
const hud = Chakra_Petch({
  variable: "--font-hud",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
})

export const metadata: Metadata = {
  title: "Nihal Mishra · AI & Data Science, software engineer",
  description:
    "Nihal Mishra builds full-stack and intelligent systems: FastAPI and Node.js backends, Flutter apps, real-time dashboards and machine learning.",
}

export const viewport: Viewport = {
  themeColor: "#eceef3",
  // Declaring dark support stops phones and in-app browsers from force-darkening the page;
  // every colour is explicit in globals.css, so it stays light.
  colorScheme: "light dark",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // Browser extensions often add attributes to <html> before React hydrates; ignore those.
    <html lang="en" className={`${display.variable} ${sans.variable} ${hud.variable}`} suppressHydrationWarning>
      <body>
        {/* Decide before hydration whether the respawn intro plays (once per session). */}
        <Script id="intro-gate" strategy="beforeInteractive">
          {"try{if(sessionStorage.getItem('nm-intro'))document.documentElement.dataset.intro='skip';else sessionStorage.setItem('nm-intro','1')}catch(e){document.documentElement.dataset.intro='skip'}"}
        </Script>
        {children}
      </body>
    </html>
  )
}
