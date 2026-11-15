"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { FieldError } from "@/components/auth/FieldError";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { errorMessage, requestJson } from "@/lib/api-client";

interface LoginFormProps {
  next: string;
}

export function LoginForm({ next }: LoginFormProps) {
  const router = useRouter();
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
      await requestJson("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      router.replace(next || "/");
      router.refresh();
    } catch (loginError) {
      setError(errorMessage(loginError));
      setPending(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-neutral-900">Email</span>
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
        <span className="text-sm font-medium text-neutral-900">Пароль</span>
        <Input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
          invalid={Boolean(error)}
        />
      </label>

      <FieldError message={error} />

      <Button type="submit" disabled={pending} className="mt-1">
        {pending ? "Входим…" : "Войти"}
      </Button>

      <p className="text-center text-sm text-neutral-600">
        Нет аккаунта?{" "}
        <Link href="/register" className="font-semibold text-red-600 hover:underline">
          Зарегистрироваться
        </Link>
      </p>
    </form>
  );
}
