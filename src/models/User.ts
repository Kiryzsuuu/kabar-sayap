import { Schema, model, models, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, default: null },
    avatar: { type: String, default: null },
    location: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      city: { type: String, default: null },
      updatedAt: { type: Date, default: null },
    },
    coins: { type: Number, default: 50 },
    isPremium: { type: Boolean, default: false },
    premiumUntil: { type: Date, default: null },
    flock: [{ type: Schema.Types.ObjectId, ref: "User" }],
    aviary: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } },
);

export type UserDoc = InferSchemaType<typeof userSchema>;
export const User = models.User || model("User", userSchema);
