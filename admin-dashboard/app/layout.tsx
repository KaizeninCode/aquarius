// "use client";
import type { Metadata } from "next";
import { Lora, Noto_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Header } from "./components/Header";
import Aside from "./components/Aside";
// import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "./components/AppSidebar";
import Footer from "./components/Footer";
import { SidebarProvider } from "@/components/ui/sidebar";

const playfairDisplayHeading = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
});

const notoSans = Noto_Sans({ subsets: ["latin"], variable: "--font-sans" });

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aquarius Admin Dashboard",
  description: "Manage customers, drivers, and orders efficiently",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const pathname = usePathname();
  // const isAuthPage = pathname.startsWith("/auth");
  return (
    <html>
      <body>
        <main className="min-h-screen w-full bg-slate-50">
          {/* {!isAuthPage && <Header />} */}
          {children}
          {/* <Footer /> */}
        </main>
      </body>
    </html>
  );
}
