"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";

type PopulatedUser = { _id: string; name: string; email: string };
type PopulatedBird = { _id: string; name: string; emoji: string };

type MessageItem = {
  _id: string;
  senderId: PopulatedUser;
  receiverId: PopulatedUser;
  birdType: PopulatedBird;
  content: string;
  status: "in_flight" | "delivered" | "lost";
  sentAt: string;
  estimatedEta: string;
};

const STATUS_LABEL: Record<MessageItem["status"], string> = {
  in_flight: "Terbang",
  delivered: "Tiba",
  lost: "Hilang",
};

const STATUS_STYLE: Record<MessageItem["status"], string> = {
  in_flight: "bg-gold/10 text-gold",
  delivered: "bg-indigo/10 text-indigo",
  lost: "bg-maroon/10 text-maroon",
};

export default function DashboardPage() {
  const { status } = useSession();
  const router = useRouter();
  const [box, setBox] = useState<"all" | "inbox" | "sent">("all");
  const [messages, setMessages] = useState<MessageItem[] | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch(`/api/messages?box=${box}`)
      .then((r) => r.json())
      .then(setMessages);
  }, [box, status]);

  if (status !== "authenticated") {
    return (
      <>
        <Navbar />
        <main className="flex flex-1 items-center justify-center text-[13px] text-muted-foreground">
          Memuat…
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[22px] font-semibold tracking-tight">Aviary-mu</h1>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Semua pesan yang kamu kirim dan terima.
              </p>
            </div>
            <Link
              href="/kirim"
              className="rounded-full bg-foreground px-4 py-2 text-[13px] font-semibold text-surface"
            >
              Kirim Pesan
            </Link>
          </div>

          <div className="mt-6 flex gap-2">
            {(["all", "inbox", "sent"] as const).map((b) => (
              <button
                key={b}
                onClick={() => setBox(b)}
                className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium ${
                  box === b
                    ? "bg-foreground text-surface"
                    : "border border-border text-muted-foreground hover:bg-surface-raised"
                }`}
              >
                {b === "all" ? "Semua" : b === "inbox" ? "Masuk" : "Terkirim"}
              </button>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3">
            {messages === null && (
              <p className="text-[13px] text-muted-foreground">Memuat pesan…</p>
            )}
            {messages?.length === 0 && (
              <p className="text-[13px] text-muted-foreground">
                Belum ada pesan. Terbangkan yang pertama!
              </p>
            )}
            {messages?.map((m) => (
              <Link
                key={m._id}
                href={`/track/${m._id}`}
                className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 transition-colors hover:bg-surface-raised"
              >
                <span className="text-2xl">{m.birdType?.emoji ?? "🐦"}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[13px] font-semibold">
                    {m.senderId?.name} → {m.receiverId?.name}
                  </div>
                  <p className="truncate text-[13px] text-muted-foreground">
                    “{m.content}”
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${STATUS_STYLE[m.status]}`}
                >
                  {STATUS_LABEL[m.status]}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
