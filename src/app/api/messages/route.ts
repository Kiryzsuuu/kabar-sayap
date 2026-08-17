import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Bird } from "@/models/Bird";
import { Message } from "@/models/Message";
import { planDelivery } from "@/lib/bird-calculator";
import { sendSentEmail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Belum login." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const receiverId = body?.receiverId?.toString();
  const birdSlug = body?.birdType?.toString();
  const content = body?.content?.toString().trim();

  if (!receiverId || !birdSlug || !content) {
    return NextResponse.json(
      { error: "receiverId, birdType, dan content wajib diisi." },
      { status: 400 },
    );
  }
  if (content.length > 500) {
    return NextResponse.json(
      { error: "Pesan maksimal 500 karakter." },
      { status: 400 },
    );
  }

  await connectDB();

  const [sender, receiver, bird] = await Promise.all([
    User.findById(session.user.id),
    User.findById(receiverId),
    Bird.findOne({ type: birdSlug }),
  ]);

  if (!sender?.location?.lat || !sender?.location?.lng) {
    return NextResponse.json(
      { error: "Bagikan lokasi GPS-mu dulu sebelum mengirim pesan." },
      { status: 422 },
    );
  }
  if (!receiver?.location?.lat || !receiver?.location?.lng) {
    return NextResponse.json(
      { error: "Penerima belum membagikan lokasi GPS-nya." },
      { status: 422 },
    );
  }
  if (!bird) {
    return NextResponse.json({ error: "Jenis burung tidak dikenal." }, { status: 404 });
  }
  if (bird.tier !== "free" && !sender.isPremium && sender.coins < bird.coinCost) {
    return NextResponse.json(
      { error: "Koin tidak cukup untuk burung ini." },
      { status: 402 },
    );
  }

  const senderCoords = { lat: sender.location.lat, lng: sender.location.lng };
  const receiverCoords = { lat: receiver.location.lat, lng: receiver.location.lng };
  const plan = planDelivery(senderCoords, receiverCoords, bird);

  const message = await Message.create({
    senderId: sender._id,
    receiverId: receiver._id,
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

  if (bird.tier !== "free" && !sender.isPremium) {
    sender.coins -= bird.coinCost;
    await sender.save();
  }

  await sendSentEmail(
    sender.email,
    bird.name,
    receiver.name,
    plan.estimatedEta.toLocaleString("id-ID"),
  ).catch(() => null);

  return NextResponse.json(
    { id: message._id.toString(), status: message.status, estimatedEta: message.estimatedEta },
    { status: 201 },
  );
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Belum login." }, { status: 401 });
  }

  const box = req.nextUrl.searchParams.get("box") || "all"; // inbox | sent | all

  await connectDB();

  const filter =
    box === "inbox"
      ? { receiverId: session.user.id }
      : box === "sent"
        ? { senderId: session.user.id }
        : { $or: [{ receiverId: session.user.id }, { senderId: session.user.id }] };

  const messages = await Message.find(filter)
    .sort({ sentAt: -1 })
    .limit(100)
    .populate("senderId", "name email avatar")
    .populate("receiverId", "name email avatar")
    .populate("birdType", "name emoji type");

  return NextResponse.json(messages);
}
