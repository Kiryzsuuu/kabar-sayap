import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { BirdCard } from "@/components/BirdCard";
import { Gunungan } from "@/components/motifs/Gunungan";
import { BIRDS } from "@/lib/birds";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="batik-watermark relative overflow-hidden border-b border-border">
          <Gunungan
            className="pointer-events-none absolute -right-16 top-0 h-[520px] w-auto text-gold/10"
          />
          <Gunungan
            className="pointer-events-none absolute -left-24 top-24 h-[420px] w-auto scale-x-[-1] text-indigo/5"
          />
          <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-32">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[12px] font-medium text-gold">
              ✦ Pesan yang terbang, bukan pesan yang instan
            </span>
            <h1 className="mt-6 max-w-2xl text-[42px] font-semibold leading-[1.1] tracking-tight text-foreground sm:text-[56px]">
              Kabar Sayap
            </h1>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-muted-foreground">
              Kirim pesanmu lewat burung kurir virtual. Setiap kata terbang
              sejauh jarak GPS yang sesungguhnya — pelan, sabar, dan penuh
              risiko, seperti kabar yang dulu dibawa merpati pos.
            </p>
            <p className="mt-2 text-[14px] italic text-muted-foreground/80">
              &ldquo;Slow down. Let the bird carry it.&rdquo;
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/kirim"
                className="rounded-full bg-foreground px-6 py-3 text-[14px] font-semibold text-surface shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Terbangkan Pesan Pertamamu
              </Link>
              <Link
                href="/track"
                className="rounded-full border border-border-strong bg-surface px-6 py-3 text-[14px] font-semibold text-foreground transition-colors hover:bg-surface-raised"
              >
                Lihat Peta Pelacakan
              </Link>
            </div>
          </div>
        </section>

        {/* Birds */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="text-[24px] font-semibold tracking-tight">
                Pilih Burung Kurirmu
              </h2>
              <p className="mt-1 text-[14px] text-muted-foreground">
                Setiap burung punya kecepatan, risiko, dan karakter berbeda.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {BIRDS.map((bird) => (
              <BirdCard key={bird.slug} bird={bird} />
            ))}
          </div>
        </section>

        {/* Flock */}
        <section className="border-t border-border bg-surface-raised">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 sm:grid-cols-2 sm:items-center">
            <div>
              <h2 className="text-[24px] font-semibold tracking-tight">
                Kumpulkan Flock-mu
              </h2>
              <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
                Buat kawanan (flock) dan kirim satu pesan ke semua anggota
                sekaligus — masing-masing mendapat burung kurirnya sendiri,
                terbang dengan waktu dan risikonya masing-masing.
              </p>
              <Link
                href="/flock"
                className="mt-6 inline-flex items-center gap-1.5 text-[14px] font-semibold text-gold"
              >
                Buat flock baru →
              </Link>
            </div>
            <div className="relative mx-auto flex h-56 w-56 items-center justify-center rounded-full border border-gold/20 bg-gradient-to-br from-gold/5 to-transparent">
              <Gunungan className="h-40 w-auto text-gold/40" />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-6xl px-6 text-center text-[12px] text-muted-foreground">
          Kabar Sayap — dibuat dengan sabar, seperti burung yang terbang
          pulang.
        </div>
      </footer>
    </>
  );
}
