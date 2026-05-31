import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Viral Caption Studio — AI Content Generator for Facebook Creators",
  description:
    "Generate viral Facebook captions, hooks, hashtags, and more in seconds using AI. Built for Filipino creators.",
  keywords: "viral caption generator, facebook content, AI caption, Filipino creator, tagalog caption",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-950 text-white antialiased`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
