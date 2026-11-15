"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { FieldError } from "@/components/auth/FieldError";
import { useI18n } from "@/components/i18n/I18nProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { errorMessage, requestJson } from "@/lib/api-client";

interface RegisterFormProps {
  next: string;
}

export function RegisterForm({ next }: RegisterFormProps) {
  const router = useRouter();
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;

    setPending(true);
    setError(null);
    try {
      await requestJson("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
      router.replace(next || "/");
      router.refresh();
    } catch (registerError) {
      setError(errorMessage(registerError));
      setPending(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-neutral-900">{t("auth.name")}</span>
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="name"
          maxLength={60}
          required
          invalid={Boolean(error)}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-neutral-900">{t("auth.email")}</span>
        <Input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
          invalid={Boolean(error)}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-neutral-900">{t("auth.password")}</span>
        <Input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          minLength={8}
          required
          invalid={Boolean(error)}
        />
        <span className="text-xs text-neutral-500">{t("auth.minLength")}</span>
      </label>

      <FieldError message={error} />

      <Button type="submit" disabled={pending} className="mt-1">
        {pending ? t("auth.creating") : t("auth.createAccount")}
      </Button>

      <p className="text-center text-sm text-neutral-600">
        {t("auth.haveAccount")}{" "}
        <Link href="/login" className="font-semibold text-red-600 hover:underline">
          {t("auth.signIn")}
        </Link>
      </p>
    </form>
  );
}
