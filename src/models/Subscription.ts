import mongoose, { Schema, type InferSchemaType } from "mongoose";

const SubscriptionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    paddleCustomerId: {
      type: String,
      required: true,
      index: true,
    },

    paddleSubscriptionId: {
      type: String,
      required: true,
      unique: true,
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
