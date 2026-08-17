import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Transaction } from "@/models/Transaction";
import { COIN_PACKAGES } from "@/lib/pricing";

/**
 * No real payment gateway is wired up (out of scope for this project).
 * This simulates an instant successful purchase, same as a sandbox/test
 * mode checkout would, and records it as a transaction.
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Belum login." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const pkg = COIN_PACKAGES.find((p) => p.id === body?.packageId);
  if (!pkg) {
    return NextResponse.json({ error: "Paket koin tidak dikenal." }, { status: 400 });
  }

  await connectDB();

  const user = await User.findByIdAndUpdate(
    session.user.id,
    { $inc: { coins: pkg.coins } },
    { new: true },
  );
  if (!user) {
    return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });
  }

  await Transaction.create({
    userId: user._id,
    type: "coin_purchase",
    amount: pkg.coins,
    description: `Beli ${pkg.coins} koin seharga Rp${pkg.priceIdr.toLocaleString("id-ID")}`,
  });

  return NextResponse.json({ coins: user.coins });
}
