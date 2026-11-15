import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = {
  title: "Вход — UaTube",
};

interface LoginPageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;

  return (
    <div className="mx-auto mt-6 w-full max-w-sm rounded-2xl border border-neutral-200 p-6">
      <h1 className="mb-4 text-xl font-semibold text-neutral-900">Вход</h1>
      <LoginForm next={next ?? "/"} />
      <p className="mt-4 text-center text-xs text-neutral-500">
        <Link href="/" className="hover:underline">
          На главную
        </Link>
      </p>
    </div>
  );
}
