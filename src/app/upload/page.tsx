import type { Metadata } from "next";
import { UploadForm } from "@/components/upload/UploadForm";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("upload.metaTitle") };
}

export default async function UploadPage() {
  const { t } = await getI18n();

  return (
    <div className="mx-auto w-full max-w-2xl">
      <h1 className="mb-4 text-xl font-semibold text-neutral-900">{t("upload.title")}</h1>
      <UploadForm />
    </div>
  );
}
