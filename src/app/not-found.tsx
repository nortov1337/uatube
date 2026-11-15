import Link from "next/link";
import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-lg py-10">
      <EmptyState
        icon={<SearchX className="h-10 w-10" />}
        title="Страница не найдена"
        description="Возможно, видео удалено или ссылка неверна."
        action={
          <Link
            href="/"
            className="inline-flex h-10 items-center rounded-full bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700"
          >
            На главную
          </Link>
        }
      />
    </div>
  );
}
