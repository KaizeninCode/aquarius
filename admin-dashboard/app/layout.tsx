'use client'
import type { Metadata } from "next";
import { Lora } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Aside from "./components/Aside";
import { usePathname } from "next/navigation";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});



// export const metadata: Metadata = {
//   title: "Aquarius Admin Dashboard",
//   description: "Manage customers, drivers, and orders efficiently",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname()
  const isAuthPage = pathname.startsWith('/auth')
  return (
    <html
      lang="en"
      className={`${lora.variable} scroll-smooth h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {!isAuthPage && <Header/>}
        {children}
      </body>
    </html>
  );
}
