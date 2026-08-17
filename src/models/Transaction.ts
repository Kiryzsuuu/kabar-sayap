import { Schema, model, models, type InferSchemaType } from "mongoose";

const transactionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["coin_purchase", "message_sent", "subscription"],
      required: true,
    },
    amount: { type: Number, required: true },
    description: { type: String, default: "" },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } },
);

export type TransactionDoc = InferSchemaType<typeof transactionSchema>;
export const Transaction = models.Transaction || model("Transaction", transactionSchema);
