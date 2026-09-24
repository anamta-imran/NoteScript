import mongoose, { Schema, type InferSchemaType } from "mongoose";

const SubscriptionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    billingProvider: {
      type: String,
      enum: ["paddle", "polar"],
      default: "paddle",
      index: true,
    },

    paddleCustomerId: {
      type: String,
      index: true,
      sparse: true,
    },

    paddleSubscriptionId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    polarCustomerId: {
      type: String,
      index: true,
      sparse: true,
    },

    polarSubscriptionId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    planId: {
      type: String,
      enum: ["free", "student", "pro"],
      required: true,
    },

    billingCycle: {
      type: String,
      enum: ["monthly", "annual"],
      required: true,
    },

    status: {
      type: String,
      required: true,
    },

    currentPeriodEnd: {
      type: Date,
    },

    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },

    priceId: {
      type: String,
    },
  },
  { timestamps: true },
);

export type SubscriptionDoc = InferSchemaType<typeof SubscriptionSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Subscription =
  mongoose.models.Subscription ||
  mongoose.model("Subscription", SubscriptionSchema);

const InvoiceSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    paddleTransactionId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    polarOrderId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    amountPaid: {
      type: Number,
      default: 0,
    },

    currency: {
      type: String,
      default: "USD",
    },

    status: {
      type: String,
      required: true,
    },

    hostedInvoiceUrl: {
      type: String,
    },

    description: {
      type: String,
    },
  },
  { timestamps: true },
);

export const Invoice =
  mongoose.models.Invoice || mongoose.model("Invoice", InvoiceSchema);
