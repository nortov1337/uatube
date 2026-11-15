import Link from "next/link";
import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("auth.registerMeta") };
}

interface RegisterPageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { next } = await searchParams;
  const { t } = await getI18n();

  return (
    <div className="mx-auto mt-6 w-full max-w-sm animate-fade-up rounded-2xl border border-neutral-200 bg-surface p-6 shadow-sm">
      <h1 className="mb-4 text-xl font-semibold text-neutral-900">{t("auth.registerTitle")}</h1>
      <RegisterForm next={next ?? "/"} />
      <p className="mt-4 text-center text-xs text-neutral-500">
        <Link href="/" className="hover:underline">
          {t("auth.backHome")}
        </Link>
      </p>
    </div>
  );
}
