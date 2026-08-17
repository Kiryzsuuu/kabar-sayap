import { NextResponse } from "next/server";
import { Bird } from "@/models/Bird";
import { ensureBirdsSeeded } from "@/lib/seed-birds";

export async function GET() {
  await ensureBirdsSeeded();
  const birds = await Bird.find().sort({ speedKmh: 1 });
  return NextResponse.json(birds);
}
