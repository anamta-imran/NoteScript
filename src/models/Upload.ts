import mongoose, { Schema } from "mongoose";

const UploadSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    storedName: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    kind: { type: String, enum: ["pdf", "image", "avatar"], required: true },
    path: { type: String, required: true },
  },
  { timestamps: true },
);

export const Upload = mongoose.models.Upload || mongoose.model("Upload", UploadSchema);
