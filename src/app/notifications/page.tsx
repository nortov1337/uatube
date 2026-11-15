import Link from "next/link";
import { redirect } from "next/navigation";
import { Bell } from "lucide-react";
import { NotificationRemove } from "@/components/notifications/NotificationRemove";
import { NotificationsToolbar } from "@/components/notifications/NotificationsToolbar";
import { EmptyState } from "@/components/ui/EmptyState";
import { container } from "@/lib/container";
import { currentUserId } from "@/lib/http/currentUserId";
import { timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const userId = await currentUserId();
  if (!userId) redirect("/login?next=/notifications");

  const page = await container.notifications.list(userId, { limit: 50 });

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-neutral-900">Уведомления</h1>
        {page.items.length > 0 ? <NotificationsToolbar /> : null}
      </div>

      {page.items.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={<Bell className="h-10 w-10" />}
            title="Уведомлений нет"
            description="Здесь появятся новые видео ваших подписок и ответы на комментарии."
          />
        </div>
      ) : (
        <div className="mt-5 flex flex-col divide-y divide-neutral-200 rounded-2xl border border-neutral-200">
          {page.items.map((item) => (
            <div
              key={item.id}
              className={`flex items-start gap-3 p-3 ${item.read ? "" : "bg-red-50/50"}`}
            >
              <span
                aria-hidden="true"
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                  item.read ? "bg-transparent" : "bg-red-600"
                }`}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-neutral-900">
                  {item.kind === "new_video" ? (
                    <>
                      <Link
                        href={`/channel/${item.actorHandle}`}
                        className="font-semibold hover:underline"
                      >
                        {item.actorName}
                      </Link>{" "}
                      опубликовал новое видео
                    </>
                  ) : (
                    <>
                      <Link
                        href={`/channel/${item.actorHandle}`}
                        className="font-semibold hover:underline"
                      >
                        {item.actorName}
                      </Link>{" "}
                      ответил на ваш комментарий
                    </>
                  )}
                </p>
                {item.videoId ? (
                  <Link
                    href={`/watch/${item.videoId}`}
                    className="mt-0.5 line-clamp-2 text-sm font-medium text-red-600 hover:underline"
                  >
                    {item.body || "Открыть видео"}
                  </Link>
                ) : (
                  <p className="mt-0.5 line-clamp-2 text-sm text-neutral-700">{item.body}</p>
                )}
                <p className="mt-1 text-xs text-neutral-500">{timeAgo(item.createdAt)}</p>
              </div>
              <NotificationRemove id={item.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
