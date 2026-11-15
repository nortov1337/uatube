import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AnalyticsBars } from "@/components/studio/AnalyticsBars";
import { EditVideoForm } from "@/components/studio/EditVideoForm";
import { NotFoundError } from "@/domain/errors/NotFoundError";
import { container } from "@/lib/container";
import { currentUserId } from "@/lib/http/currentUserId";

export const dynamic = "force-dynamic";

interface StudioVideoPageProps {
  params: Promise<{ id: string }>;
}

export default async function StudioVideoPage({ params }: StudioVideoPageProps) {
  const { id } = await params;
  const userId = await currentUserId();
  if (!userId) redirect(`/login?next=/studio/${id}`);

  const [video, analytics] = await Promise.all([
    container.studio.get(id, userId).catch((error: unknown) => {
      if (error instanceof NotFoundError) notFound();
      throw error;
    }),
    container.studio.analytics(id, userId, 30),
  ]);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <Link
        href="/studio"
        className="inline-flex items-center gap-1 text-sm text-neutral-600 hover:text-neutral-900"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        Мои видео
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold text-neutral-900">Редактирование видео</h1>
        <Link
          href={`/watch/${video.id}`}
          className="text-sm font-medium text-red-600 hover:underline"
        >
          Смотреть
        </Link>
      </div>

      <div className="mt-4">
        <AnalyticsBars analytics={analytics} />
      </div>

      <div className="mt-6">
        <EditVideoForm video={video} />
      </div>
    </div>
  );
}
