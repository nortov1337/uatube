"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { requestJson } from "@/lib/api-client";

interface NotificationRemoveProps {
  id: string;
}

export function NotificationRemove({ id }: NotificationRemoveProps) {
  const router = useRouter();

  const remove = async () => {
    await requestJson<null>(`/api/notifications/${id}`, { method: "DELETE" }).catch(() => null);
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={remove}
      aria-label="Удалить уведомление"
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100"
    >
      <X aria-hidden="true" className="h-4 w-4" />
    </button>
  );
}
