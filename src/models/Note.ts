import mongoose, { Schema, type InferSchemaType } from "mongoose";

const NoteSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    folderId: { type: Schema.Types.ObjectId, ref: "Folder", index: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    sourceType: {
      type: String,
      enum: ["text", "youtube", "pdf", "image", "diagram"],
      required: true,
    },
    originalSource: { type: Schema.Types.Mixed, default: {} },
    structuredContent: { type: Schema.Types.Mixed, required: true },
    pages: { type: Schema.Types.Mixed, required: true },
    handwritingStyle: { type: String, required: true },
    paperStyleId: { type: String },
    language: { type: String, required: true },
    noteLength: { type: String, required: true },
    subject: { type: String, required: true },
    pageCount: { type: Number, required: true, min: 1 },
    options: { type: Schema.Types.Mixed, required: true },
    favorite: { type: Boolean, default: false },
    archived: { type: Boolean, default: false },
    searchText: { type: String, default: "", index: "text" },
  },
  { timestamps: true },
);

NoteSchema.index({ userId: 1, createdAt: -1 });
NoteSchema.index({ userId: 1, updatedAt: -1 });
NoteSchema.index({ userId: 1, title: 1 });
NoteSchema.index({ userId: 1, subject: 1 });
NoteSchema.index({ userId: 1, folderId: 1 });

export type NoteDoc = InferSchemaType<typeof NoteSchema> & { _id: mongoose.Types.ObjectId };

export const Note = mongoose.models.Note || mongoose.model("Note", NoteSchema);
