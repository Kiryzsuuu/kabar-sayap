"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Gunungan } from "@/components/motifs/Gunungan";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Gagal mendaftar.");
      setLoading(false);
      return;
    }

    const signInRes = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);

    if (signInRes?.error) {
      router.push("/login");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="batik-watermark relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16">
      <Gunungan className="pointer-events-none absolute -left-20 top-0 h-[480px] w-auto scale-x-[-1] text-indigo/10" />

      <div className="relative w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-[0_10px_30px_rgba(42,32,24,0.08)]">
        <Link href="/" className="text-[13px] font-semibold text-gold">
          ← Kabar Sayap
        </Link>
        <h1 className="mt-4 text-[22px] font-semibold tracking-tight">
          Buat akun baru
        </h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Setiap akun baru mendapat 50 koin dan 3 burung gratis.
        </p>

        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <label className="text-[12px] font-medium text-muted-foreground">
              Nama
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-surface-raised px-3.5 py-2.5 text-[14px] outline-none focus:border-gold"
            />
          </div>
          <div>
            <label className="text-[12px] font-medium text-muted-foreground">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-surface-raised px-3.5 py-2.5 text-[14px] outline-none focus:border-gold"
            />
          </div>
          <div>
            <label className="text-[12px] font-medium text-muted-foreground">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-surface-raised px-3.5 py-2.5 text-[14px] outline-none focus:border-gold"
            />
          </div>

          {error && <p className="text-[12px] text-maroon">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-full bg-foreground py-2.5 text-[14px] font-semibold text-surface transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
          >
            {loading ? "Membuat akun…" : "Daftar"}
          </button>
        </form>

        <p className="mt-6 text-center text-[13px] text-muted-foreground">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-semibold text-gold">
            Masuk
          </Link>
        </p>
      </div>
    </main>
  );
}
