"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/Navbar";
import { TIER_LABEL } from "@/lib/birds";

type ApiBird = {
  _id: string;
  type: string;
  name: string;
  emoji: string;
  speedKmh: number;
  failRate: number;
  tier: "free" | "premium" | "legendary";
  coinCost: number;
};

export default function KirimPage() {
  const { status } = useSession();
  const router = useRouter();

  const [birds, setBirds] = useState<ApiBird[] | null>(null);
  const [selectedBird, setSelectedBird] = useState<string>("");
  const [receiverEmail, setReceiverEmail] = useState("");
  const [content, setContent] = useState("");
  const [locationReady, setLocationReady] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  useEffect(() => {
    fetch("/api/birds")
      .then((r) => r.json())
      .then((data: ApiBird[]) => {
        setBirds(data);
        if (data[0]) setSelectedBird(data[0].type);
      });
  }, []);

  function shareLocation() {
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError("Browser tidak mendukung geolokasi.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await fetch("/api/users/me", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        });
        setLocationReady(true);
      },
      () => setLocationError("Izin lokasi ditolak. Aktifkan GPS untuk mengirim pesan."),
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSending(true);

    const userRes = await fetch(`/api/users?email=${encodeURIComponent(receiverEmail)}`);
    if (!userRes.ok) {
      const body = await userRes.json().catch(() => ({}));
      setError(body.error ?? "Penerima tidak ditemukan.");
      setSending(false);
      return;
    }
    const receiver = await userRes.json();

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        receiverId: receiver._id,
        birdType: selectedBird,
        content,
      }),
    });

    setSending(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Gagal mengirim pesan.");
      return;
    }

    const data = await res.json();
    setSuccess("Pesan sedang terbang!");
    setContent("");
    router.push(`/track/${data.id}`);
  }

  if (status !== "authenticated") return null;

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
          <h1 className="text-[20px] font-semibold tracking-tight sm:text-[22px]">
            Terbangkan Pesan
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Pilih burung, tulis pesanmu, dan biarkan ia terbang sejauh jarak
            sesungguhnya.
          </p>

          {!locationReady && (
            <div className="mt-6 flex flex-col items-start gap-3 rounded-2xl border border-gold/25 bg-gold/5 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[13px] text-foreground">
                Bagikan lokasimu agar burung tahu titik keberangkatan.
              </p>
              <button
                onClick={shareLocation}
                className="shrink-0 rounded-full bg-foreground px-3.5 py-1.5 text-[12px] font-semibold text-surface"
              >
                Bagikan Lokasi
              </button>
            </div>
          )}
          {locationError && (
            <p className="mt-2 text-[12px] text-maroon">{locationError}</p>
          )}
          {locationReady && (
            <p className="mt-2 text-[12px] text-indigo">✓ Lokasi tersimpan.</p>
          )}

          <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-5">
            <div>
              <label className="text-[12px] font-medium text-muted-foreground">
                Email penerima
              </label>
              <input
                type="email"
                required
                value={receiverEmail}
                onChange={(e) => setReceiverEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-[14px] outline-none focus:border-gold"
                placeholder="teman@contoh.com"
              />
            </div>

            <div>
              <label className="text-[12px] font-medium text-muted-foreground">
                Pilih burung
              </label>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {birds?.map((b) => (
                  <button
                    type="button"
                    key={b.type}
                    onClick={() => setSelectedBird(b.type)}
                    className={`rounded-xl border p-3 text-left transition-colors ${
                      selectedBird === b.type
                        ? "border-gold bg-gold/10"
                        : "border-border bg-surface hover:bg-surface-raised"
                    }`}
                  >
                    <div className="text-xl">{b.emoji}</div>
                    <div className="mt-1 text-[12px] font-semibold">{b.name}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {b.speedKmh} km/h · {TIER_LABEL[b.tier]}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[12px] font-medium text-muted-foreground">
                Pesan (maks. 500 karakter)
              </label>
              <textarea
                required
                maxLength={500}
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="mt-1 w-full resize-none rounded-xl border border-border bg-surface px-3.5 py-2.5 text-[14px] outline-none focus:border-gold"
              />
            </div>

            {error && <p className="text-[13px] text-maroon">{error}</p>}
            {success && <p className="text-[13px] text-indigo">{success}</p>}

            <button
              type="submit"
              disabled={sending || !locationReady}
              className="rounded-full bg-foreground py-3 text-[14px] font-semibold text-surface transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {sending ? "Melepas burung…" : "Terbangkan Pesan"}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
