"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, UserRound } from "lucide-react";
import { useState } from "react";
import type { PublicUserDTO } from "@/application/dto/PublicUserDTO";
import { Avatar } from "@/components/ui/Avatar";
import { requestJson } from "@/lib/api-client";

interface UserMenuProps {
  user: PublicUserDTO;
}

export function UserMenu({ user }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const logout = async () => {
    setOpen(false);
    await requestJson<null>("/api/auth/logout", { method: "POST" }).catch(() => null);
    router.refresh();
  };

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Меню профиля"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
      >
        <Avatar handle={user.handle} name={user.name} />
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Закрыть меню"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-lg">
            <div className="px-3 py-2">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-neutral-500">@{user.handle}</p>
            </div>
            <Link
              href={`/channel/${user.handle}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-neutral-100"
            >
              <UserRound aria-hidden="true" className="h-4 w-4" />
              Мой канал
            </Link>
            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-neutral-100"
            >
              <LogOut aria-hidden="true" className="h-4 w-4" />
              Выйти
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
