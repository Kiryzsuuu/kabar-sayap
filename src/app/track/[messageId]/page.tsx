"use client";

import { use } from "react";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/Navbar";

const LiveMessageMap = dynamic(
  () => import("@/components/map/LiveMessageMap").then((m) => m.LiveMessageMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center rounded-2xl border border-border bg-surface text-[13px] text-muted-foreground">
        Menyiapkan peta…
      </div>
    ),
  },
);

export default function TrackMessagePage({
  params,
}: {
  params: Promise<{ messageId: string }>;
}) {
  const { messageId } = use(params);

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background">
        <div className="mx-auto flex h-[calc(100vh-64px)] max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-[20px] font-semibold tracking-tight">
              Melacak Pesanmu
            </h1>
            <p className="text-[13px] text-muted-foreground">
              Posisi diperbarui otomatis setiap 5 detik.
            </p>
          </div>
          <div className="min-h-0 flex-1">
            <LiveMessageMap messageId={messageId} />
          </div>
        </div>
      </main>
    </>
  );
}
