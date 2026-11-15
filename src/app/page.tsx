import Link from "next/link";
import { CategoryChips } from "@/components/video/CategoryChips";
import { ContinueWatching } from "@/components/video/ContinueWatching";
import { SortTabs } from "@/components/video/SortTabs";
import { VideoGrid } from "@/components/video/VideoGrid";
import { container } from "@/lib/container";
import { currentUserId } from "@/lib/http/currentUserId";
import { categoryLabel } from "@/domain/values/VideoCategory";
import { getI18n } from "@/lib/i18n/server";
import { withParams } from "@/lib/url";

export const dynamic = "force-dynamic";

interface HomePageProps {
  searchParams: Promise<{
    q?: string;
    tag?: string;
    category?: string;
    sort?: string;
    cursor?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { q, tag, category, sort, cursor } = await searchParams;
  const { locale, t } = await getI18n();
  const viewerId = await currentUserId();
  const activeSort = sort ?? "new";
  const hasFilters = Boolean(q || tag || category) || activeSort !== "new";

  const [feed, continueWatching] = await Promise.all([
    hasFilters
      ? container.videos.listFeed({ q, tag, category, sort: activeSort, cursor, limit: 24 })
      : container.videos.homeFeed(viewerId, 24).then((items) => ({ items, nextCursor: null })),
    viewerId && !hasFilters
      ? container.history.continueWatching(viewerId, 8)
      : Promise.resolve([]),
  ]);

  const title = q
    ? t("home.resultsFor", { query: q })
    : tag
      ? t("home.tagResults", { tag })
      : category
        ? categoryLabel(category, locale)
        : viewerId
          ? t("home.recommended")
          : t("home.home");

  return (
    <div>
      <ContinueWatching items={continueWatching} />

      <div className="mb-4 flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-lg font-semibold text-neutral-900">{title}</h1>
          <SortTabs active={activeSort} q={q} tag={tag} category={category} />
        </div>
        <CategoryChips active={category} q={q} tag={tag} />
      </div>

      <VideoGrid
        videos={feed.items}
        emptyTitle={q || tag ? t("home.nothingFound") : undefined}
        emptyDescription={q || tag ? t("home.tryAnother") : undefined}
      />

      {feed.nextCursor ? (
        <div className="mt-8 flex justify-center">
          <Link
            href={withParams("/", {
              q,
              tag,
              category,
              sort: activeSort === "new" ? undefined : activeSort,
              cursor: feed.nextCursor,
            })}
            className="inline-flex h-10 items-center rounded-full bg-neutral-100 px-5 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-200"
          >
            {t("home.showMore")}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
