import mongoose, { Schema, type InferSchemaType } from "mongoose";

const FolderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
  },
  { timestamps: true },
);

FolderSchema.index({ userId: 1, name: 1 }, { unique: true });

export type FolderDoc = InferSchemaType<typeof FolderSchema> & { _id: mongoose.Types.ObjectId };

export const Folder = mongoose.models.Folder || mongoose.model("Folder", FolderSchema);
