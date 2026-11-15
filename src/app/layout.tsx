import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Sidebar } from "@/components/layout/Sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "UaTube",
  description: "UaTube — видеохостинг для своих",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-white text-neutral-900">
        <Header />
        <div className="mx-auto flex w-full max-w-[1600px] gap-6 px-4 sm:px-6">
          <Sidebar />
          <main className="min-w-0 flex-1 pb-16 pt-6">
            <MobileNav />
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
