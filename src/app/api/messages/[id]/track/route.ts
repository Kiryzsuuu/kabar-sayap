import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { Message } from "@/models/Message";
import { Bird } from "@/models/Bird";
import { arcPoint } from "@/lib/geo";
import { sendDeliveredEmail, sendLostEmail } from "@/lib/mailer";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Belum login." }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();

  const message = await Message.findById(id)
    .populate("senderId", "name email")
    .populate("receiverId", "name email")
    .populate("birdType", "name emoji failRate");

  if (!message) {
    return NextResponse.json({ error: "Pesan tidak ditemukan." }, { status: 404 });
  }

  const isParticipant =
    message.senderId._id.toString() === session.user.id ||
    message.receiverId._id.toString() === session.user.id;
  if (!isParticipant) {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
  }

  if (message.status === "in_flight") {
    const totalMs = message.estimatedEta.getTime() - message.sentAt.getTime();
    const elapsedMs = Date.now() - message.sentAt.getTime();
    const progress = totalMs > 0 ? Math.min(1, elapsedMs / totalMs) : 1;

    if (progress >= 1) {
      const bird = await Bird.findById(message.birdType._id);
      const willFail = Math.random() < (bird?.failRate ?? 0.02);

      message.status = willFail ? "lost" : "delivered";
      message.deliveredAt = willFail ? null : new Date();
      await message.save();

      if (willFail) {
        await sendLostEmail(
          message.senderId.email,
          message.birdType.name,
          message.receiverId.name,
        ).catch(() => null);
      } else {
        await sendDeliveredEmail(
          message.receiverId.email,
          message.birdType.name,
          message.senderId.name,
        ).catch(() => null);
      }
    }
  }

  const totalMs = message.estimatedEta.getTime() - message.sentAt.getTime();
  const elapsedMs = Date.now() - message.sentAt.getTime();
  const progress =
    message.status === "delivered"
      ? 1
      : message.status === "lost"
        ? Math.min(1, totalMs > 0 ? elapsedMs / totalMs : 1)
        : Math.min(1, totalMs > 0 ? elapsedMs / totalMs : 1);

  const current = arcPoint(message.senderCoords, message.receiverCoords, progress, 0.08);

  return NextResponse.json({
    id: message._id.toString(),
    status: message.status,
    progress,
    currentCoords: current,
    senderCoords: message.senderCoords,
    receiverCoords: message.receiverCoords,
    distanceKm: message.distanceKm,
    speedActualKmh: message.speedActualKmh,
    sentAt: message.sentAt,
    estimatedEta: message.estimatedEta,
    deliveredAt: message.deliveredAt,
    bird: message.birdType,
    content: message.content,
  });
}
