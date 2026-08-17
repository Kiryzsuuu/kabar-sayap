"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";

type Member = { userId: { _id: string; name: string; email: string }; role: string };
type FlockItem = {
  _id: string;
  name: string;
  description: string;
  members: Member[];
  maxMembers: number;
};

export default function FlocksPage() {
  const { status } = useSession();
  const router = useRouter();

  const [flocks, setFlocks] = useState<FlockItem[] | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [inviteEmail, setInviteEmail] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  function loadFlocks() {
    fetch("/api/flocks")
      .then((r) => r.json())
      .then(setFlocks);
  }

  useEffect(() => {
    if (status === "authenticated") loadFlocks();
  }, [status]);

  async function createFlock(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);

    const res = await fetch("/api/flocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });

    setCreating(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Gagal membuat flock.");
      return;
    }

    setName("");
    setDescription("");
    loadFlocks();
  }

  async function invite(flockId: string) {
    const email = inviteEmail[flockId];
    if (!email) return;

    const res = await fetch(`/api/flocks/${flockId}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (res.ok) {
      setInviteEmail((s) => ({ ...s, [flockId]: "" }));
      loadFlocks();
    }
  }

  if (status !== "authenticated") return null;

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <h1 className="text-[22px] font-semibold tracking-tight">Flock-mu</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Kumpulkan kawanan dan kirim pesan ke semua sekaligus.
          </p>

          <form
            onSubmit={createFlock}
            className="mt-6 flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5"
          >
            <div className="flex gap-3">
              <input
                required
                placeholder="Nama flock"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 rounded-xl border border-border bg-surface-raised px-3.5 py-2.5 text-[14px] outline-none focus:border-gold"
              />
              <button
                type="submit"
                disabled={creating}
                className="rounded-full bg-foreground px-4 py-2 text-[13px] font-semibold text-surface disabled:opacity-60"
              >
                {creating ? "Membuat…" : "Buat"}
              </button>
            </div>
            <input
              placeholder="Deskripsi (opsional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-xl border border-border bg-surface-raised px-3.5 py-2.5 text-[14px] outline-none focus:border-gold"
            />
            {error && <p className="text-[12px] text-maroon">{error}</p>}
          </form>

          <div className="mt-8 flex flex-col gap-4">
            {flocks?.map((f) => (
              <div key={f._id} className="rounded-2xl border border-border bg-surface p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-[15px] font-semibold">{f.name}</h3>
                  <span className="text-[12px] text-muted-foreground">
                    {f.members.length}/{f.maxMembers} anggota
                  </span>
                </div>
                {f.description && (
                  <p className="mt-1 text-[13px] text-muted-foreground">{f.description}</p>
                )}

                <div className="mt-3 flex flex-wrap gap-2">
                  {f.members.map((m) => (
                    <span
                      key={m.userId._id}
                      className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground"
                    >
                      {m.userId.name}
                    </span>
                  ))}
                </div>

                <div className="mt-4 flex gap-2">
                  <input
                    type="email"
                    placeholder="Undang lewat email"
                    value={inviteEmail[f._id] ?? ""}
                    onChange={(e) =>
                      setInviteEmail((s) => ({ ...s, [f._id]: e.target.value }))
                    }
                    className="flex-1 rounded-xl border border-border bg-surface-raised px-3.5 py-2 text-[13px] outline-none focus:border-gold"
                  />
                  <button
                    onClick={() => invite(f._id)}
                    className="rounded-full border border-border-strong px-3.5 py-2 text-[12px] font-semibold hover:bg-surface-raised"
                  >
                    Undang
                  </button>
                </div>
              </div>
            ))}
            {flocks?.length === 0 && (
              <p className="text-[13px] text-muted-foreground">
                Kamu belum punya flock. Buat satu di atas.
              </p>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
