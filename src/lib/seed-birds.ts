import { connectDB } from "./mongodb";
import { Bird } from "@/models/Bird";
import { BIRDS } from "./birds";

export async function ensureBirdsSeeded() {
  await connectDB();
  const count = await Bird.countDocuments();
  if (count > 0) return;

  await Bird.insertMany(
    BIRDS.map((b) => ({
      type: b.slug,
      name: b.name,
      emoji: b.emoji,
      speedKmh: b.speedKmh,
      variancePct: b.variancePct,
      failRate: b.failRate,
      tier: b.tier,
      coinCost: b.tier === "free" ? 0 : b.tier === "premium" ? 20 : 60,
      description: b.description,
    })),
  );
}
