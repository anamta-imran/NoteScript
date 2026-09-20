import mongoose, { Schema, type InferSchemaType } from "mongoose";

const UsageSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    /** @deprecated prefer textGenerations */
    generations: { type: Number, default: 0, min: 0 },
    textGenerations: { type: Number, default: 0, min: 0 },
    imageGenerations: { type: Number, default: 0, min: 0 },
    diagramGenerations: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

UsageSchema.index({ userId: 1, periodStart: 1 }, { unique: true });

export type UsageDoc = InferSchemaType<typeof UsageSchema> & { _id: mongoose.Types.ObjectId };

export const Usage = mongoose.models.Usage || mongoose.model("Usage", UsageSchema);
