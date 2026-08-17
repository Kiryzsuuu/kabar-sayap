import type { Bird } from "@/lib/birds";
import { TIER_LABEL } from "@/lib/birds";

const TIER_STYLE: Record<Bird["tier"], string> = {
  free: "bg-surface-raised text-muted-foreground border-border",
  premium: "bg-indigo/5 text-indigo border-indigo/20",
  legendary: "bg-gold/10 text-gold border-gold/30",
};

export function BirdCard({ bird }: { bird: Bird }) {
  return (
    <div className="group relative flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 shadow-[0_1px_2px_rgba(42,32,24,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(42,32,24,0.08)]">
      <div className="flex items-start justify-between">
        <span className="text-3xl">{bird.emoji}</span>
        <span
          className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${TIER_STYLE[bird.tier]}`}
        >
          {TIER_LABEL[bird.tier]}
        </span>
      </div>

      <div>
        <h3 className="text-[15px] font-semibold text-foreground">
          {bird.name}
        </h3>
        <p className="text-[12px] italic text-muted-foreground">
          {bird.nameLatin}
        </p>
      </div>

      <p className="text-[13px] leading-relaxed text-muted-foreground">
        {bird.description}
      </p>

      <div className="mt-1 grid grid-cols-3 gap-2 border-t border-border pt-3 text-center">
        <div>
          <div className="text-[13px] font-semibold text-foreground">
            {bird.speedKmh}
          </div>
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
            km/h
          </div>
        </div>
        <div>
          <div className="text-[13px] font-semibold text-foreground">
            ±{Math.round(bird.variancePct * 100)}%
          </div>
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
            varian
          </div>
        </div>
        <div>
          <div className="text-[13px] font-semibold text-maroon">
            {(bird.failRate * 100).toFixed(1)}%
          </div>
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
            gagal
          </div>
        </div>
      </div>
    </div>
  );
}
