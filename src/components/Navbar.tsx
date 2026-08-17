"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Menu, X } from "lucide-react";
import { BirdSilhouette } from "./motifs/BirdSilhouette";

const links = [
  { href: "/", label: "Beranda" },
  { href: "/track", label: "Lacak Burung" },
  { href: "/dashboard", label: "Aviary" },
  { href: "/premium", label: "Koin & Pro" },
];

type Me = { coins: number; isPremium: boolean };

export function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    if (status !== "authenticated") {
      setMe(null);
      return;
    }
    fetch("/api/users/me")
      .then((r) => (r.ok ? r.json() : null))
      .then(setMe)
      .catch(() => setMe(null));
  }, [status, pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="flex shrink-0 items-center gap-2 sm:gap-2.5"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold-soft to-gold text-surface shadow-sm sm:h-9 sm:w-9">
            <BirdSilhouette className="h-4.5 w-4.5 sm:h-5 sm:w-5" color="#fffdf8" />
          </span>
          <span className="whitespace-nowrap text-[15px] font-semibold tracking-tight sm:text-[17px]">
            Kabar Sayap
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-[14px] font-medium text-muted-foreground lg:flex xl:gap-8">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 lg:flex">
          {status === "authenticated" ? (
            <>
              {me && (
                <Link
                  href="/premium"
                  className="whitespace-nowrap rounded-full border border-gold/25 bg-gold/5 px-3 py-1.5 text-[12px] font-medium text-gold hover:bg-gold/10"
                >
                  🪙 {me.coins}
                  {me.isPremium && " · Pro"}
                </Link>
              )}
              <Link
                href="/kirim"
                className="whitespace-nowrap rounded-full bg-foreground px-4 py-2 text-[13px] font-semibold text-surface shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Terbangkan Pesan
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="whitespace-nowrap text-[13px] font-medium text-muted-foreground hover:text-foreground"
              >
                {session.user?.name?.split(" ")[0] ?? "Keluar"} · Keluar
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="whitespace-nowrap rounded-full bg-foreground px-4 py-2 text-[13px] font-semibold text-surface shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Masuk
            </Link>
          )}
        </div>

        {/* Mobile/tablet: compact CTA + hamburger */}
        <div className="flex items-center gap-2 lg:hidden">
          {status === "authenticated" ? (
            <Link
              href="/kirim"
              className="whitespace-nowrap rounded-full bg-foreground px-3 py-2 text-[12px] font-semibold text-surface shadow-sm"
            >
              Kirim
            </Link>
          ) : (
            <Link
              href="/login"
              className="whitespace-nowrap rounded-full bg-foreground px-3 py-2 text-[12px] font-semibold text-surface shadow-sm"
            >
              Masuk
            </Link>
          )}
          <button
            aria-label={open ? "Tutup menu" : "Buka menu"}
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-foreground"
          >
            {open ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
          </button>
        </div>
      </div>

      {/* Mobile/tablet menu panel */}
      {open && (
        <div className="border-t border-border bg-surface px-4 py-3 lg:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-2.5 text-[14px] font-medium transition-colors ${
                  pathname === l.href
                    ? "bg-gold/10 text-gold"
                    : "text-muted-foreground hover:bg-surface-raised hover:text-foreground"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          {me && (
            <div className="mt-2 rounded-lg bg-gold/5 px-3 py-2 text-[13px] font-medium text-gold">
              🪙 {me.coins} koin{me.isPremium && " · Pro aktif"}
            </div>
          )}
          {status === "authenticated" && (
            <button
              onClick={() => {
                setOpen(false);
                signOut({ callbackUrl: "/" });
              }}
              className="mt-2 w-full rounded-lg px-3 py-2.5 text-left text-[14px] font-medium text-muted-foreground hover:bg-surface-raised hover:text-foreground"
            >
              {session.user?.name ? `Keluar (${session.user.name})` : "Keluar"}
            </button>
          )}
        </div>
      )}
    </header>
  );
}
