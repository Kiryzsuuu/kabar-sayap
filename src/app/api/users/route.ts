import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

/** GET /api/users?email=someone@example.com — look up a recipient by email. */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Belum login." }, { status: 401 });
  }

  const email = req.nextUrl.searchParams.get("email")?.toLowerCase().trim();
  if (!email) {
    return NextResponse.json({ error: "Parameter email wajib diisi." }, { status: 400 });
  }

  await connectDB();
  const user = await User.findOne({ email }).select("name email avatar location");
  if (!user) {
    return NextResponse.json({ error: "Pengguna tidak ditemukan." }, { status: 404 });
  }
  if (!user.location?.lat || !user.location?.lng) {
    return NextResponse.json(
      { error: "Pengguna belum membagikan lokasi GPS-nya." },
      { status: 422 },
    );
  }

  return NextResponse.json(user);
}
