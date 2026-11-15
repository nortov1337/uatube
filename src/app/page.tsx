import Link from "next/link";
import { parseListQuery } from "@/application/validation/schemas";
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
  const query = parseListQuery({ q, tag, category, sort, cursor });
  const hasFilters =
    Boolean(query.q || query.tag || query.category) || query.sort !== "new";

  const [feed, continueWatching] = await Promise.all([
    hasFilters
      ? container.videos.listFeed(query)
      : container.videos.homeFeed(viewerId, 24).then((items) => ({ items, nextCursor: null })),
    viewerId && !hasFilters
      ? container.history.continueWatching(viewerId, 8)
      : Promise.resolve([]),
  ]);

  const title = query.q
    ? t("home.resultsFor", { query: query.q })
    : query.tag
      ? t("home.tagResults", { tag: query.tag })
      : query.category
        ? categoryLabel(query.category, locale)
        : viewerId
          ? t("home.recommended")
          : t("home.home");

  return (
    <div>
      <ContinueWatching items={continueWatching} />

      <div className="mb-4 flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-lg font-semibold text-neutral-900">{title}</h1>
          <SortTabs
            active={query.sort}
            q={query.q}
            tag={query.tag}
            category={query.category}
          />
        </div>
        <CategoryChips
          active={query.category}
          q={query.q}
          tag={query.tag}
          sort={query.sort}
        />
      </div>

      <VideoGrid
        videos={feed.items}
        emptyTitle={query.q || query.tag ? t("home.nothingFound") : undefined}
        emptyDescription={query.q || query.tag ? t("home.tryAnother") : undefined}
      />

      {feed.nextCursor ? (
        <div className="mt-8 flex justify-center">
          <Link
            href={withParams("/", {
              q: query.q,
              tag: query.tag,
              category: query.category,
              sort: query.sort === "new" ? undefined : query.sort,
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
