"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          {!isHome && (
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">All Trips</span>
            </Link>
          )}
          {isHome && (
            <Link href="/" className="flex items-center gap-2">
              <span className="text-lg font-semibold tracking-tight">
                Trips
              </span>
              <span className="text-xs tracking-widest text-ink-muted uppercase">
                Journal
              </span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
