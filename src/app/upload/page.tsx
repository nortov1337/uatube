import { UploadForm } from "@/components/upload/UploadForm";

export const metadata = {
  title: "Загрузка видео — UaTube",
};

export default function UploadPage() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <h1 className="mb-4 text-xl font-semibold text-neutral-900">Загрузка видео</h1>
      <UploadForm />
    </div>
  );
}
