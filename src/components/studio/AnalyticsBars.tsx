import type { VideoAnalyticsDTO } from "@/application/dto/VideoAnalyticsDTO";
import { INTL_LOCALES } from "@/lib/i18n/config";
import { getI18n } from "@/lib/i18n/server";
import { countOf } from "@/lib/i18n/units";

interface AnalyticsBarsProps {
  analytics: VideoAnalyticsDTO;
}

export async function AnalyticsBars({ analytics }: AnalyticsBarsProps) {
  const { locale, t } = await getI18n();
  const dayLabel = new Intl.DateTimeFormat(INTL_LOCALES[locale], {
    day: "2-digit",
    month: "2-digit",
  });
  const max = Math.max(1, ...analytics.days.map((day) => day.views));
  const total = analytics.days.reduce((sum, day) => sum + day.views, 0);

  return (
    <div className="rounded-2xl border border-neutral-200 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-neutral-900">{t("studio.analyticsTitle")}</h2>
        <p className="text-xs text-neutral-600">
          {countOf("views", total, locale)} · {countOf("views", analytics.totalViews, locale)} ·{" "}
          {countOf("likes", analytics.likes, locale)} ·{" "}
          {countOf("comments", analytics.comments, locale)}
        </p>
      </div>
      <div className="mt-3 flex h-28 items-end gap-1">
        {analytics.days.map((day) => (
          <div key={day.date} className="group flex flex-1 flex-col items-center justify-end gap-1">
            <span className="text-[10px] text-neutral-500 opacity-0 transition-opacity group-hover:opacity-100">
              {day.views}
            </span>
            <div
              className="w-full rounded-t bg-red-500/80 transition-colors group-hover:bg-red-600"
              style={{ height: `${Math.max(2, (day.views / max) * 90)}px` }}
              title={`${dayLabel.format(new Date(day.date))}: ${day.views}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
