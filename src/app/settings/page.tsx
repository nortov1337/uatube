import Link from "next/link";
import { redirect } from "next/navigation";
import { DeleteAccount } from "@/components/settings/DeleteAccount";
import { ImageSettings } from "@/components/settings/ImageSettings";
import { PasswordSettingsForm } from "@/components/settings/PasswordSettingsForm";
import { PreferencesPanel } from "@/components/settings/PreferencesPanel";
import { ProfileSettingsForm } from "@/components/settings/ProfileSettingsForm";
import { container } from "@/lib/container";
import { currentUserId } from "@/lib/http/currentUserId";
import { getI18n } from "@/lib/i18n/server";
import { getPreferences } from "@/lib/preferences-server";

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
    <section className="animate-fade-up rounded-2xl border border-neutral-200 p-4">
      <h2 className="text-base font-semibold text-neutral-900">{title}</h2>
      {description ? <p className="mt-1 text-sm text-neutral-600">{description}</p> : null}
      <div className="mt-3">{children}</div>
    </section>
  );
}

export default async function SettingsPage() {
  const userId = await currentUserId();
  if (!userId) redirect("/login?next=/settings");

  const { t } = await getI18n();
  const { theme } = await getPreferences();
  const settings = await container.profile.get(userId);

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold text-neutral-900">{t("settings.title")}</h1>
        <Link
          href={`/channel/${settings.handle}`}
          className="text-sm font-medium text-red-600 hover:underline"
        >
          {t("settings.openChannel")}
        </Link>
      </div>

      <div className="mt-5 flex flex-col gap-4">
        <Section title={t("prefs.title")} description={t("prefs.hint")}>
          <PreferencesPanel theme={theme} />
        </Section>

        <Section title={t("settings.appearance")} description={t("settings.appearanceDesc")}>
          <ImageSettings
            handle={settings.handle}
            name={settings.name}
            avatarUrl={settings.avatarUrl}
            bannerUrl={settings.bannerUrl}
          />
        </Section>

        <Section title={t("settings.profile")} description={t("settings.profileDesc")}>
          <ProfileSettingsForm settings={settings} />
        </Section>

        <Section title={t("settings.security")} description={t("settings.securityDesc")}>
          <PasswordSettingsForm />
        </Section>

        <Section title={t("settings.delete")}>
          <DeleteAccount />
        </Section>
      </div>
    </div>
  );
}
