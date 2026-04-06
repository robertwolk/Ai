"use client";

import { useSession } from "next-auth/react";
import { GlobalSearch } from "@/components/global-search";
import { getInitials } from "@/lib/utils";

export function TopBar() {
  const { data: session } = useSession();
  const userName = session?.user?.name || "User";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
      <GlobalSearch />
      <div className="flex items-center gap-3">
        {/* Notifications bell */}
        <button className="relative rounded-lg p-2 hover:bg-muted transition-colors">
          <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
        </button>
        {/* User avatar */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
          {getInitials(userName)}
        </div>
      </div>
    </header>
  );
}
