import mongoose, { Schema, type HydratedDocument } from "mongoose";
import type {
  BillingCycle,
  NoteLanguage,
  NoteLength,
  PlanId,
} from "@/lib/types";

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    passwordHash: { type: String, required: true },

    emailVerified: { type: Boolean, default: false },

    avatarUrl: { type: String },

    preferredLanguage: {
      type: String,
      enum: ["english", "easy-english", "urdu", "roman-urdu"],
      default: "english",
    } satisfies {
      type: StringConstructor;
      enum: NoteLanguage[];
      default: NoteLanguage;
    },

    preferredHandwritingStyle: {
      type: String,
      default: "clean-study",
    },

    preferredNoteLength: {
      type: String,
      enum: ["quick", "standard", "detailed"],
      default: "standard",
    } satisfies {
      type: StringConstructor;
      enum: NoteLength[];
      default: NoteLength;
    },

    timezone: { type: String, default: "UTC" },

    interfaceLanguage: {
      type: String,
      enum: ["en", "ur"],
      default: "en",
    },

    planId: {
      type: String,
      enum: ["free", "student", "pro"],
      default: "free",
    } satisfies {
      type: StringConstructor;
      enum: PlanId[];
      default: PlanId;
    },

    paddleCustomerId: {
      type: String,
      index: true,
      sparse: true,
    },

    paddleSubscriptionId: {
      type: String,
      index: true,
      sparse: true,
    },

    /** Active billing provider for this user (paddle kept for existing subscribers). */
    billingProvider: {
      type: String,
      enum: ["paddle", "polar"],
      sparse: true,
    },

    polarCustomerId: {
      type: String,
      index: true,
      sparse: true,
    },

    polarSubscriptionId: {
      type: String,
      index: true,
      sparse: true,
    },

    billingCycle: {
      type: String,
      enum: ["monthly", "annual"],
    } satisfies {
      type: StringConstructor;
      enum: BillingCycle[];
    },

    subscriptionStatus: {
      type: String,
      default: "free",
    },

    currentPeriodEnd: {
      type: Date,
    },

    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export type UserDoc = HydratedDocument<
  mongoose.InferSchemaType<typeof UserSchema>
>;

export const User =
  mongoose.models.User ||
  mongoose.model("User", UserSchema);