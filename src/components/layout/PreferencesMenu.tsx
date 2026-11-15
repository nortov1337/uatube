"use client";

import { Settings2 } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { PreferencesPanel } from "@/components/settings/PreferencesPanel";
import type { Theme } from "@/lib/preferences";

interface PreferencesMenuProps {
  theme: Theme;
}

export function PreferencesMenu({ theme }: PreferencesMenuProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative lg:hidden">
      <button
        type="button"
        aria-label={t("nav.preferences")}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-neutral-700 transition-colors hover:bg-neutral-100"
      >
        <Settings2 aria-hidden="true" className="h-5 w-5" />
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-label={t("nav.closeMenu")}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div className="absolute right-0 z-50 mt-2 w-64 animate-pop rounded-2xl border border-neutral-200 bg-surface p-3 shadow-lg">
            <PreferencesPanel theme={theme} />
          </div>
        </>
      ) : null}
    </div>
  );
}
