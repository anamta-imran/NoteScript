import mongoose, { Schema, type InferSchemaType } from "mongoose";

const ProcessingJobSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    state: {
      type: String,
      enum: ["queued", "processing", "completed", "failed", "cancelled"],
      default: "queued",
      index: true,
    },
    stage: { type: String, default: "Queued" },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    sourceType: { type: String, required: true },
    payload: { type: Schema.Types.Mixed, required: true },
    error: { type: String },
    noteId: { type: Schema.Types.ObjectId, ref: "Note" },
  },
  { timestamps: true },
);

ProcessingJobSchema.index({ userId: 1, createdAt: -1 });

export type ProcessingJobDoc = InferSchemaType<typeof ProcessingJobSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const ProcessingJob =
  mongoose.models.ProcessingJob || mongoose.model("ProcessingJob", ProcessingJobSchema);
