import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const name = body?.name?.toString().trim();
  const email = body?.email?.toString().toLowerCase().trim();
  const password = body?.password?.toString();

  if (!name || !email || !password || password.length < 6) {
    return NextResponse.json(
      { error: "Nama, email, dan password (min. 6 karakter) wajib diisi." },
      { status: 400 },
    );
  }

  await connectDB();

  const existing = await User.findOne({ email });
  if (existing) {
    return NextResponse.json(
      { error: "Email sudah terdaftar." },
      { status: 409 },
    );
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed });

  return NextResponse.json(
    { id: user._id.toString(), name: user.name, email: user.email },
    { status: 201 },
  );
}
