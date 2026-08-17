import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { Flock } from "@/models/Flock";
import { User } from "@/models/User";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Belum login." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const name = body?.name?.toString().trim();
  const description = body?.description?.toString().trim() ?? "";

  if (!name) {
    return NextResponse.json({ error: "Nama flock wajib diisi." }, { status: 400 });
  }

  await connectDB();
  const user = await User.findById(session.user.id);
  const maxMembers = user?.isPremium ? 50 : 5;

  const flock = await Flock.create({
    name,
    description,
    ownerId: session.user.id,
    maxMembers,
    members: [{ userId: session.user.id, role: "owner", joinedAt: new Date() }],
  });

  return NextResponse.json(flock, { status: 201 });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Belum login." }, { status: 401 });
  }

  await connectDB();
  const flocks = await Flock.find({ "members.userId": session.user.id }).populate(
    "members.userId",
    "name email avatar",
  );

  return NextResponse.json(flocks);
}
