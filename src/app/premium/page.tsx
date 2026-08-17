"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Gunungan } from "@/components/motifs/Gunungan";
import { COIN_PACKAGES, PREMIUM_PLANS } from "@/lib/pricing";

type Me = { coins: number; isPremium: boolean; premiumUntil: string | null };

function formatIdr(n: number) {
  return `Rp${n.toLocaleString("id-ID")}`;
}

export default function PremiumPage() {
  const { status } = useSession();
  const router = useRouter();

  const [me, setMe] = useState<Me | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  function loadMe() {
    fetch("/api/users/me")
      .then((r) => r.json())
      .then(setMe);
  }

  useEffect(() => {
    if (status === "authenticated") loadMe();
  }, [status]);

  async function buyCoins(packageId: string) {
    setBusyId(packageId);
    setMessage(null);
    const res = await fetch("/api/coins/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packageId }),
    });
    setBusyId(null);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setMessage(body.error ?? "Gagal membeli koin.");
      return;
    }
    setMessage("Koin berhasil ditambahkan!");
    loadMe();
  }

  async function subscribe(planId: string) {
    setBusyId(planId);
    setMessage(null);
    const res = await fetch("/api/premium/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId }),
    });
    setBusyId(null);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setMessage(body.error ?? "Gagal berlangganan.");
      return;
    }
    setMessage("Selamat, kamu sekarang Kabar Sayap Pro!");
    loadMe();
  }

  if (status !== "authenticated") return null;

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background">
        <div className="batik-watermark relative overflow-hidden border-b border-border">
          <Gunungan className="pointer-events-none absolute -right-16 top-0 h-[360px] w-auto text-gold/10" />
          <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
            <h1 className="text-[22px] font-semibold tracking-tight sm:text-[28px]">
              Koin &amp; Kabar Sayap Pro
            </h1>
            <p className="mt-1 max-w-lg text-[13px] text-muted-foreground sm:text-[14px]">
              Beli koin untuk membuka burung premium per pesan, atau
              berlangganan Pro untuk akses semua burung dan flock besar.
            </p>

            {me && (
              <div className="mt-6 inline-flex items-center gap-4 rounded-full border border-gold/25 bg-surface/90 px-4 py-2 text-[13px]">
                <span>
                  🪙 <span className="font-semibold">{me.coins}</span> koin
                </span>
                <span className="h-3.5 w-px bg-border" />
                <span>
                  {me.isPremium
                    ? `✦ Pro aktif hingga ${new Date(me.premiumUntil!).toLocaleDateString("id-ID")}`
                    : "Belum berlangganan Pro"}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
          {message && (
            <div className="mb-6 rounded-xl border border-gold/25 bg-gold/5 px-4 py-2.5 text-[13px] text-foreground">
              {message}
            </div>
          )}

          <section>
            <h2 className="text-[16px] font-semibold">Paket Koin</h2>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Pakai koin untuk mengunlock burung premium tiap kirim pesan.
            </p>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {COIN_PACKAGES.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5"
                >
                  <div className="text-2xl">🪙</div>
                  <div>
                    <div className="text-[18px] font-semibold">{p.coins} koin</div>
                    {p.bonus && (
                      <div className="text-[12px] font-medium text-gold">{p.bonus}</div>
                    )}
                  </div>
                  <div className="text-[13px] text-muted-foreground">
                    {formatIdr(p.priceIdr)}
                  </div>
                  <button
                    onClick={() => buyCoins(p.id)}
                    disabled={busyId === p.id}
                    className="mt-1 rounded-full bg-foreground py-2 text-[13px] font-semibold text-surface transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
                  >
                    {busyId === p.id ? "Memproses…" : "Beli"}
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-[16px] font-semibold">Kabar Sayap Pro</h2>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Semua burung premium & legendaris, flock hingga 50 anggota, dan
              tanpa biaya koin per pesan.
            </p>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {PREMIUM_PLANS.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-col gap-3 rounded-2xl border border-gold/25 bg-gold/5 p-5"
                >
                  <div className="text-[18px] font-semibold">{p.label}</div>
                  <div className="text-[13px] text-muted-foreground">
                    {formatIdr(p.priceIdr)}
                  </div>
                  <button
                    onClick={() => subscribe(p.id)}
                    disabled={busyId === p.id}
                    className="mt-1 rounded-full bg-foreground py-2 text-[13px] font-semibold text-surface transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
                  >
                    {busyId === p.id ? "Memproses…" : "Berlangganan"}
                  </button>
                </div>
              ))}
            </div>
          </section>

          <p className="mt-10 text-[11px] text-muted-foreground">
            Catatan: belum ada payment gateway sungguhan tersambung — transaksi
            di halaman ini disimulasikan (langsung berhasil) untuk keperluan
            demo.
          </p>
        </div>
      </main>
    </>
  );
}
