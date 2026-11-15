"use client";

import { CheckCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { requestJson } from "@/lib/api-client";

export function NotificationsToolbar() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const markAll = async () => {
    setPending(true);
    try {
      await requestJson<null>("/api/notifications", { method: "POST" });
      router.refresh();
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={markAll}
      disabled={pending}
      className="inline-flex h-9 items-center gap-2 rounded-full bg-neutral-100 px-3 text-sm font-medium text-neutral-900 hover:bg-neutral-200 disabled:opacity-60"
    >
      <CheckCheck aria-hidden="true" className="h-4 w-4" />
      Прочитать все
    </button>
  );
}
