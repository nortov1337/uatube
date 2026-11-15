import Link from "next/link";
import { redirect } from "next/navigation";
import { DeleteAccount } from "@/components/settings/DeleteAccount";
import { ImageSettings } from "@/components/settings/ImageSettings";
import { PasswordSettingsForm } from "@/components/settings/PasswordSettingsForm";
import { ProfileSettingsForm } from "@/components/settings/ProfileSettingsForm";
import { container } from "@/lib/container";
import { currentUserId } from "@/lib/http/currentUserId";

export const dynamic = "force-dynamic";

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-neutral-200 p-4">
      <h2 className="text-base font-semibold text-neutral-900">{title}</h2>
      {description ? <p className="mt-1 text-sm text-neutral-600">{description}</p> : null}
      <div className="mt-3">{children}</div>
    </section>
  );
}

export default async function SettingsPage() {
  const userId = await currentUserId();
  if (!userId) redirect("/login?next=/settings");

  const settings = await container.profile.get(userId);

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold text-neutral-900">Настройки</h1>
        <Link
          href={`/channel/${settings.handle}`}
          className="text-sm font-medium text-red-600 hover:underline"
        >
          Открыть канал
        </Link>
      </div>

      <div className="mt-5 flex flex-col gap-4">
        <Section title="Оформление канала" description="Аватар и баннер видны на канале и под видео.">
          <ImageSettings
            handle={settings.handle}
            name={settings.name}
            avatarUrl={settings.avatarUrl}
            bannerUrl={settings.bannerUrl}
          />
        </Section>

        <Section title="Профиль" description="Имя, адрес канала и описание.">
          <ProfileSettingsForm settings={settings} />
        </Section>

        <Section title="Безопасность" description="Смена пароля входа.">
          <PasswordSettingsForm />
        </Section>

        <Section title="Удаление аккаунта">
          <DeleteAccount />
        </Section>
      </div>
    </div>
  );
}
