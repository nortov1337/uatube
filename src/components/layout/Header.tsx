import Link from "next/link";
import { Suspense } from "react";
import { Upload } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { SearchBar } from "@/components/layout/SearchBar";
import { UserMenu } from "@/components/layout/UserMenu";
import { container } from "@/lib/container";

export async function Header() {
  const user = await container.auth.currentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white">
      <div className="mx-auto flex h-14 w-full max-w-[1600px] items-center gap-2 px-4 sm:gap-4 sm:px-6">
        <Logo />
        <div className="mx-auto hidden w-full max-w-xl md:block">
          <Suspense fallback={null}>
            <SearchBar />
          </Suspense>
        </div>
        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <Link
            href="/upload"
            aria-label="Загрузить видео"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-neutral-100 px-3 text-sm font-medium text-neutral-900 hover:bg-neutral-200"
          >
            <Upload aria-hidden="true" className="h-4 w-4" />
            <span className="hidden sm:inline">Загрузить</span>
          </Link>
          {user ? (
            <UserMenu user={user} />
          ) : (
            <Link
              href="/login"
              className="inline-flex h-10 items-center rounded-full border border-neutral-300 px-4 text-sm font-medium text-neutral-900 hover:bg-neutral-100"
            >
              Войти
            </Link>
          )}
        </div>
      </div>
      <div className="px-4 pb-2 md:hidden">
        <Suspense fallback={null}>
          <SearchBar />
        </Suspense>
      </div>
    </header>
  );
}
