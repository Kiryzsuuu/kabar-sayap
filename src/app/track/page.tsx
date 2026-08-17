"use client";

import dynamic from "next/dynamic";
import { Navbar } from "@/components/Navbar";

const BirdTrackerMap = dynamic(
  () => import("@/components/map/BirdTrackerMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center rounded-2xl border border-border bg-surface text-[13px] text-muted-foreground">
        Menyiapkan peta…
      </div>
    ),
  },
);

export default function TrackPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background">
        <div className="mx-auto flex h-[calc(100vh-64px)] max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-[20px] font-semibold tracking-tight">
              Lacak Burung Secara Langsung
            </h1>
            <p className="text-[13px] text-muted-foreground">
              Posisi burung diperbarui secara real-time sepanjang jalur GPS
              antara pengirim dan penerima.
            </p>
          </div>
          <div className="min-h-0 flex-1">
            <BirdTrackerMap />
          </div>
        </div>
      </main>
    </>
  );
}
