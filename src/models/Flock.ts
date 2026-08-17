import { Schema, model, models, type InferSchemaType } from "mongoose";

const memberSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["owner", "admin", "member"], default: "member" },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const flockSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: [memberSchema],
    maxMembers: { type: Number, default: 5 },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } },
);

export type FlockDoc = InferSchemaType<typeof flockSchema>;
export const Flock = models.Flock || model("Flock", flockSchema);
