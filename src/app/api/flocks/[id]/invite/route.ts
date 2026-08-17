import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { Flock } from "@/models/Flock";
import { User } from "@/models/User";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Belum login." }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const email = body?.email?.toString().toLowerCase().trim();
  if (!email) {
    return NextResponse.json({ error: "Email wajib diisi." }, { status: 400 });
  }

  await connectDB();
  const flock = await Flock.findById(id);
  if (!flock) {
    return NextResponse.json({ error: "Flock tidak ditemukan." }, { status: 404 });
  }

  const isAdmin = flock.members.some(
    (m: { userId: { toString(): string }; role: string }) =>
      m.userId.toString() === session.user.id && (m.role === "owner" || m.role === "admin"),
  );
  if (!isAdmin) {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
  }
  if (flock.members.length >= flock.maxMembers) {
    return NextResponse.json({ error: "Flock sudah penuh." }, { status: 422 });
  }

  const invitee = await User.findOne({ email });
  if (!invitee) {
    return NextResponse.json({ error: "Pengguna tidak ditemukan." }, { status: 404 });
  }
  if (
    flock.members.some(
      (m: { userId: { toString(): string } }) => m.userId.toString() === invitee._id.toString(),
    )
  ) {
    return NextResponse.json({ error: "Sudah menjadi anggota." }, { status: 409 });
  }

  flock.members.push({ userId: invitee._id, role: "member", joinedAt: new Date() });
  await flock.save();

  return NextResponse.json(flock);
}
