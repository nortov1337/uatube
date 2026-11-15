import Link from "next/link";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("auth.loginMeta") };
}

interface LoginPageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;
  const { t } = await getI18n();

  return (
    <div className="mx-auto mt-6 w-full max-w-sm animate-fade-up rounded-2xl border border-neutral-200 bg-surface p-6 shadow-sm">
      <h1 className="mb-4 text-xl font-semibold text-neutral-900">{t("auth.loginTitle")}</h1>
      <LoginForm next={next ?? "/"} />
      <p className="mt-4 text-center text-xs text-neutral-500">
        <Link href="/" className="hover:underline">
          {t("auth.backHome")}
        </Link>
      </p>
    </div>
  );
}
