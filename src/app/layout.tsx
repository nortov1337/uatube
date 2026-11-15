import type { Metadata } from "next";
import type { ReactNode } from "react";
import { I18nProvider } from "@/components/i18n/I18nProvider";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { getI18n } from "@/lib/i18n/server";
import { getPreferences } from "@/lib/preferences-server";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: "UaTube",
    description: t("app.description"),
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const { locale } = await getI18n();
  const { theme } = await getPreferences();

  return (
    <html lang={locale} data-theme={theme}>
      <body className="min-h-screen bg-surface text-neutral-900">
        <I18nProvider locale={locale}>
          <Header />
          <div className="mx-auto flex w-full max-w-[1600px] gap-6 px-4 sm:px-6">
            <Sidebar />
            <main className="min-w-0 flex-1 pb-16 pt-6">
              <MobileNav />
              {children}
            </main>
          </div>
        </I18nProvider>
      </body>
    </html>
  );
}
