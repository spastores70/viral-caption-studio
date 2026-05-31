import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#030712",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  title: "Viral Caption Studio — AI Content Generator for Facebook Creators",
  description:
    "Generate viral Facebook captions, hooks, hashtags, and more in seconds using AI. Built for Filipino creators.",
  keywords: "viral caption generator, facebook content, AI caption, Filipino creator, tagalog caption",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Viral Caption Studio",
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-950 text-white antialiased overflow-x-hidden`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
