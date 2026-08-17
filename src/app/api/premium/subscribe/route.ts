import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Transaction } from "@/models/Transaction";
import { PREMIUM_PLANS } from "@/lib/pricing";

/** Simulated instant subscription, same rationale as /api/coins/purchase. */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Belum login." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const plan = PREMIUM_PLANS.find((p) => p.id === body?.planId);
  if (!plan) {
    return NextResponse.json({ error: "Paket langganan tidak dikenal." }, { status: 400 });
  }

  await connectDB();

  const user = await User.findById(session.user.id);
  if (!user) {
    return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });
  }

  const base = user.isPremium && user.premiumUntil && user.premiumUntil > new Date()
    ? user.premiumUntil
    : new Date();
  user.isPremium = true;
  user.premiumUntil = new Date(base.getTime() + plan.days * 24 * 60 * 60 * 1000);
  await user.save();

  await Transaction.create({
    userId: user._id,
    type: "subscription",
    amount: plan.priceIdr,
    description: `Langganan Kabar Sayap Pro (${plan.label}) seharga Rp${plan.priceIdr.toLocaleString("id-ID")}`,
  });

  return NextResponse.json({ isPremium: user.isPremium, premiumUntil: user.premiumUntil });
}
