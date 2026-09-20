import mongoose, { Schema } from "mongoose";

const TokenSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true, index: true },
    usedAt: { type: Date },
  },
  { timestamps: true },
);

TokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PasswordResetToken =
  mongoose.models.PasswordResetToken || mongoose.model("PasswordResetToken", TokenSchema);

export const EmailVerificationToken =
  mongoose.models.EmailVerificationToken ||
  mongoose.model("EmailVerificationToken", TokenSchema);
