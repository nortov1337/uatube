import { VideoGrid } from "@/components/video/VideoGrid";
import { container } from "@/lib/container";

export const dynamic = "force-dynamic";

interface HomePageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { q } = await searchParams;
  const feed = await container.videos.listFeed({ q, limit: 24 });

  return (
    <div>
      {q ? (
        <h1 className="mb-6 text-lg font-semibold text-neutral-900">Результаты по «{q}»</h1>
      ) : null}
      <VideoGrid
        videos={feed.items}
        emptyTitle={q ? "Ничего не найдено" : "Пока нет видео"}
        emptyDescription={
          q ? "Попробуйте другой запрос." : "Загрузите первое видео — оно сразу появится в ленте."
        }
      />
    </div>
  );
}
