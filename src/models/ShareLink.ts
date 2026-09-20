import mongoose, { Schema, type InferSchemaType } from "mongoose";

const ShareLinkSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    noteId: { type: Schema.Types.ObjectId, ref: "Note", required: true, unique: true },
    token: { type: String, required: true, unique: true, index: true },
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type ShareLinkDoc = InferSchemaType<typeof ShareLinkSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const ShareLink = mongoose.models.ShareLink || mongoose.model("ShareLink", ShareLinkSchema);
