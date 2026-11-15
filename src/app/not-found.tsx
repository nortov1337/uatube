import Link from "next/link";
import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { getI18n } from "@/lib/i18n/server";

export default async function NotFound() {
  const { t } = await getI18n();

  return (
    <div className="mx-auto w-full max-w-lg py-10">
      <EmptyState
        icon={<SearchX className="h-10 w-10" />}
        title={t("notFound.title")}
        description={t("notFound.desc")}
        action={
          <Link
            href="/"
            className="inline-flex h-10 items-center rounded-full bg-red-600 px-4 text-sm font-medium text-white shadow-sm transition-all hover:bg-red-700 active:scale-95"
          >
            {t("notFound.home")}
          </Link>
        }
      />
    </div>
  );
}
