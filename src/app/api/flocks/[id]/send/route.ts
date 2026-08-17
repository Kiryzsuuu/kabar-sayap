import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { Flock } from "@/models/Flock";
import { User } from "@/models/User";
import { Bird } from "@/models/Bird";
import { Message } from "@/models/Message";
import { planDelivery } from "@/lib/bird-calculator";

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
  const content = body?.content?.toString().trim();
  const birdSlug = body?.birdType?.toString();

  if (!content || !birdSlug) {
    return NextResponse.json(
      { error: "content dan birdType wajib diisi." },
      { status: 400 },
    );
  }

  await connectDB();

  const [flock, sender, bird] = await Promise.all([
    Flock.findById(id).populate("members.userId", "name email location"),
    User.findById(session.user.id),
    Bird.findOne({ type: birdSlug }),
  ]);

  if (!flock) {
    return NextResponse.json({ error: "Flock tidak ditemukan." }, { status: 404 });
  }
  if (!sender?.location?.lat || !sender?.location?.lng) {
    return NextResponse.json(
      { error: "Bagikan lokasi GPS-mu dulu sebelum mengirim pesan." },
      { status: 422 },
    );
  }
  if (!bird) {
    return NextResponse.json({ error: "Jenis burung tidak dikenal." }, { status: 404 });
  }

  const senderCoords = { lat: sender.location.lat, lng: sender.location.lng };
  const recipients = flock.members.filter(
    (m: { userId: { _id: { toString(): string } } }) =>
      m.userId._id.toString() !== session.user.id,
  );

  const created = [];
  for (const member of recipients) {
    const receiver = member.userId as unknown as {
      _id: unknown;
      location?: { lat?: number; lng?: number };
    };
    if (!receiver.location?.lat || !receiver.location?.lng) continue;

    const receiverCoords = { lat: receiver.location.lat, lng: receiver.location.lng };
    const plan = planDelivery(senderCoords, receiverCoords, bird);

    const message = await Message.create({
      senderId: sender._id,
      receiverId: receiver._id,
      flockId: flock._id,
      birdType: bird._id,
      content,
      status: "in_flight",
      senderCoords,
      receiverCoords,
      distanceKm: plan.distanceKm,
      speedActualKmh: plan.speedActualKmh,
      sentAt: new Date(),
      estimatedEta: plan.estimatedEta,
    });
    created.push(message._id.toString());
  }

  return NextResponse.json({ sent: created.length, messageIds: created }, { status: 201 });
}
