import { Schema, model, models, type InferSchemaType } from "mongoose";

const coordsSchema = new Schema(
  { lat: { type: Number, required: true }, lng: { type: Number, required: true } },
  { _id: false },
);

const messageSchema = new Schema(
  {
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    flockId: { type: Schema.Types.ObjectId, ref: "Flock", default: null },
    birdType: { type: Schema.Types.ObjectId, ref: "Bird", required: true },
    content: { type: String, required: true, maxlength: 500 },
    status: {
      type: String,
      enum: ["in_flight", "delivered", "lost"],
      default: "in_flight",
    },
    senderCoords: { type: coordsSchema, required: true },
    receiverCoords: { type: coordsSchema, required: true },
    distanceKm: { type: Number, required: true },
    speedActualKmh: { type: Number, required: true },
    sentAt: { type: Date, default: Date.now },
    estimatedEta: { type: Date, required: true },
    deliveredAt: { type: Date, default: null },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: false },
);

messageSchema.index({ senderId: 1, sentAt: -1 });
messageSchema.index({ receiverId: 1, sentAt: -1 });

export type MessageDoc = InferSchemaType<typeof messageSchema>;
export const Message = models.Message || model("Message", messageSchema);
