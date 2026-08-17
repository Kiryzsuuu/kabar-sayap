import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Belum login." }, { status: 401 });
  }

  await connectDB();
  const user = await User.findById(session.user.id).select("-password");
  if (!user) {
    return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Belum login." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const update: Record<string, unknown> = {};

  if (body.avatar) update.avatar = body.avatar;
  if (
    typeof body.lat === "number" &&
    typeof body.lng === "number" &&
    Math.abs(body.lat) <= 90 &&
    Math.abs(body.lng) <= 180
  ) {
    update.location = {
      lat: body.lat,
      lng: body.lng,
      city: body.city ?? null,
      updatedAt: new Date(),
    };
  }

  await connectDB();
  const user = await User.findByIdAndUpdate(session.user.id, update, {
    new: true,
  }).select("-password");

  return NextResponse.json(user);
}
