import { Schema, model, models, type InferSchemaType } from "mongoose";

const birdSchema = new Schema({
  type: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  emoji: { type: String, required: true },
  speedKmh: { type: Number, required: true },
  variancePct: { type: Number, required: true },
  failRate: { type: Number, required: true },
  tier: { type: String, enum: ["free", "premium", "legendary"], required: true },
  coinCost: { type: Number, default: 0 },
  description: { type: String, default: "" },
});

export type BirdDoc = InferSchemaType<typeof birdSchema>;
export const Bird = models.Bird || model("Bird", birdSchema);
