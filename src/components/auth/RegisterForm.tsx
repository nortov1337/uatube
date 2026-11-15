"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { FieldError } from "@/components/auth/FieldError";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { errorMessage, requestJson } from "@/lib/api-client";

interface RegisterFormProps {
  next: string;
}

export function RegisterForm({ next }: RegisterFormProps) {
  const router = useRouter();
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
        <span className="text-sm font-medium text-neutral-900">Имя</span>
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
          autoComplete="new-password"
          minLength={8}
          required
          invalid={Boolean(error)}
        />
        <span className="text-xs text-neutral-500">Минимум 8 символов</span>
      </label>

      <FieldError message={error} />

      <Button type="submit" disabled={pending} className="mt-1">
        {pending ? "Создаём…" : "Создать аккаунт"}
      </Button>

      <p className="text-center text-sm text-neutral-600">
        Уже есть аккаунт?{" "}
        <Link href="/login" className="font-semibold text-red-600 hover:underline">
          Войти
        </Link>
      </p>
    </form>
  );
}
