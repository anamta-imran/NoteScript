import mongoose, { Schema } from "mongoose";

const ProcessedWebhookSchema = new Schema(
  {
    provider: { type: String, required: true, default: "paddle" },
    eventId: { type: String, required: true, unique: true, index: true },
    eventType: { type: String, required: true },
    processedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export const ProcessedWebhook =
  mongoose.models.ProcessedWebhook ||
  mongoose.model("ProcessedWebhook", ProcessedWebhookSchema);
