import { Usage } from "@/models/Usage";
import { Folder } from "@/models/Folder";
import type { UserDoc } from "@/models/User";
import { getPlan, normalizeHandwritingStyle } from "./plans";
import { AppError, ForbiddenError } from "./errors";
import type { GenerationOptions, PlanId, SourceType, UsageSnapshot } from "./types";
import { endOfUtcMonth, startOfUtcMonth } from "./utils";
import mongoose from "mongoose";

export function periodForUser(user: UserDoc): { start: Date; end: Date } {
  if (user.currentPeriodEnd && user.planId !== "free") {
    const end = new Date(user.currentPeriodEnd);
    const start = new Date(end);
    if (user.billingCycle === "annual") {
      start.setUTCFullYear(start.getUTCFullYear() - 1);
    } else {
      start.setUTCMonth(start.getUTCMonth() - 1);
    }
    if (start <= new Date() && end > new Date()) return { start, end };
  }
  return { start: startOfUtcMonth(), end: endOfUtcMonth() };
}

/** Lifetime bucket for Free plan text totals */
function lifetimePeriod(user: UserDoc): { start: Date; end: Date } {
  const created = user.createdAt ? new Date(user.createdAt) : new Date(0);
  return { start: created, end: new Date("2099-01-01T00:00:00.000Z") };
}

async function getOrCreateUsage(user: UserDoc, start: Date, end: Date) {
  return Usage.findOneAndUpdate(
    { userId: user._id, periodStart: start },
    {
      $setOnInsert: {
        userId: user._id,
        periodStart: start,
        periodEnd: end,
        generations: 0,
        textGenerations: 0,
        imageGenerations: 0,
        diagramGenerations: 0,
      },
    },
    { upsert: true, new: true },
  );
}

export async function getUsage(user: UserDoc): Promise<UsageSnapshot & { used: number; limit: number; remaining: number }> {
  const plan = getPlan(user.planId as PlanId);
  const monthly = periodForUser(user);
  const monthlyDoc = await getOrCreateUsage(user, monthly.start, monthly.end);

  let textUsed = monthlyDoc.textGenerations || monthlyDoc.generations || 0;
  let textPeriod = monthly;

  if (plan.textLimitIsLifetime) {
    textPeriod = lifetimePeriod(user);
    const life = await getOrCreateUsage(user, textPeriod.start, textPeriod.end);
    textUsed = life.textGenerations || life.generations || 0;
  }

  const textLimit = plan.textGenerations;
  const imageLimit = plan.imageGenerationsPerMonth;
  const diagramLimit = plan.diagramGenerationsPerMonth;

  const imageUsed = monthlyDoc.imageGenerations || 0;
  const diagramUsed = monthlyDoc.diagramGenerations || 0;

  // Backward-compatible fields for older UI
  const used = textUsed;
  const limit = textLimit === null ? Number.POSITIVE_INFINITY : textLimit;
  const remaining = textLimit === null ? Number.POSITIVE_INFINITY : Math.max(0, textLimit - textUsed);

  return {
    planId: plan.id,
    textUsed,
    textLimit,
    imageUsed,
    imageLimit,
    diagramUsed,
    diagramLimit,
    periodStart: monthly.start.toISOString(),
    periodEnd: monthly.end.toISOString(),
    used,
    limit,
    remaining,
  };
}

function remainingOrNull(used: number, limit: number | null): number | null {
  if (limit === null) return null;
  return Math.max(0, limit - used);
}

export async function assertCanGenerate(
  user: UserDoc,
  sourceType: SourceType,
  options: GenerationOptions,
  inputChars: number,
  uploadBytes = 0,
) {
  if (!user.emailVerified && process.env.AUTH_SKIP_EMAIL_VERIFICATION !== "true") {
    throw new ForbiddenError("Verify your email before generating notes.");
  }

  const plan = getPlan(user.planId as PlanId);
  const style = normalizeHandwritingStyle(options.handwritingStyle);

  if (!plan.allowedSources.includes(sourceType)) {
    const hint =
      sourceType === "youtube"
        ? "YouTube-to-notes is a Pro feature."
        : sourceType === "diagram"
          ? "Diagrams require Student or Pro."
          : `The ${plan.name} plan does not include ${sourceType} notes. Upgrade to unlock this source.`;
    throw new ForbiddenError(hint);
  }

  if (!plan.handwritingStyles.includes(style) && !plan.handwritingStyles.includes(options.handwritingStyle)) {
    throw new ForbiddenError("That handwriting style is not included in your plan.");
  }
  if (!plan.noteLengths.includes(options.noteLength)) {
    throw new ForbiddenError("That note length is not included in your plan.");
  }
  if (!plan.languages.includes(options.language)) {
    throw new ForbiddenError("That language is not included in your plan.");
  }
  if (options.smartHighlighting && !plan.smartHighlighting) {
    throw new ForbiddenError("Smart highlighting is available on Student and Pro.");
  }
  if (options.chapterDetection && !plan.chapterDetection) {
    throw new ForbiddenError("Chapter detection is available on Student and Pro.");
  }
  if ((options.diagrams || sourceType === "diagram") && !plan.diagrams) {
    throw new ForbiddenError("Diagrams are available on Student and Pro.");
  }
  if (inputChars > plan.maxInputChars) {
    throw new AppError(
      `This input is too long for the ${plan.name} plan (${plan.maxInputChars.toLocaleString()} character limit).`,
      400,
      "INPUT_TOO_LONG",
    );
  }
  if (uploadBytes > plan.maxUploadBytes) {
    throw new AppError("This file is larger than your plan allows.", 400, "FILE_TOO_LARGE");
  }

  const usage = await getUsage(user);

  if (sourceType === "text" || sourceType === "youtube" || sourceType === "pdf") {
    const rem = remainingOrNull(usage.textUsed, usage.textLimit);
    if (rem !== null && rem <= 0) {
      throw new AppError(
        plan.textLimitIsLifetime
          ? `You've used your ${plan.textGenerations} free text generations.`
          : "You've reached your text generation limit for this period.",
        402,
        "USAGE_LIMIT",
      );
    }
  }

  if (sourceType === "image") {
    const rem = remainingOrNull(usage.imageUsed, usage.imageLimit);
    if (usage.imageLimit === 0 || (rem !== null && rem <= 0)) {
      throw new AppError(
        usage.imageLimit === 0
          ? "Image-to-notes is not included in your plan. Upgrade to Student or Pro."
          : "You've used your 3 image-to-notes generations this month. Upgrade to Pro for unlimited images.",
        402,
        "USAGE_LIMIT",
      );
    }
  }

  if (sourceType === "diagram") {
    const rem = remainingOrNull(usage.diagramUsed, usage.diagramLimit);
    if (usage.diagramLimit === 0 || (rem !== null && rem <= 0)) {
      throw new AppError(
        usage.diagramLimit === 0
          ? "Diagrams are not included in the Free plan. Upgrade to Student or Pro."
          : "You've used your 3 diagram generations this month. Upgrade to Pro for unlimited diagrams.",
        402,
        "USAGE_LIMIT",
      );
    }
  }
}

export async function incrementUsage(
  userId: mongoose.Types.ObjectId,
  user: UserDoc,
  sourceType: SourceType,
) {
  const plan = getPlan(user.planId as PlanId);
  const monthly = periodForUser(user);

  if (sourceType === "image") {
    await Usage.updateOne(
      { userId, periodStart: monthly.start },
      {
        $inc: { imageGenerations: 1 },
        $setOnInsert: {
          periodEnd: monthly.end,
          generations: 0,
          textGenerations: 0,
          diagramGenerations: 0,
        },
      },
      { upsert: true },
    );
    return;
  }

  if (sourceType === "diagram") {
    await Usage.updateOne(
      { userId, periodStart: monthly.start },
      {
        $inc: { diagramGenerations: 1 },
        $setOnInsert: {
          periodEnd: monthly.end,
          generations: 0,
          textGenerations: 0,
          imageGenerations: 0,
        },
      },
      { upsert: true },
    );
    return;
  }

  // text / youtube / pdf count as text generations
  const period = plan.textLimitIsLifetime ? lifetimePeriod(user) : monthly;
  await Usage.updateOne(
    { userId, periodStart: period.start },
    {
      $inc: { textGenerations: 1, generations: 1 },
      $setOnInsert: {
        periodEnd: period.end,
        imageGenerations: 0,
        diagramGenerations: 0,
      },
    },
    { upsert: true },
  );
}

export async function assertCanCreateFolder(user: UserDoc) {
  const plan = getPlan(user.planId as PlanId);
  const count = await Folder.countDocuments({ userId: user._id });
  if (count >= plan.maxFolders) {
    throw new ForbiddenError(
      plan.id === "free"
        ? "The Free plan includes a limited number of folders. Upgrade for unlimited folders."
        : "Folder limit reached.",
    );
  }
}

export function effectivePlan(user: UserDoc): PlanId {
  const status = user.subscriptionStatus;
  if (user.planId !== "free" && ["active", "trialing", "past_due"].includes(status)) {
    if (user.currentPeriodEnd && user.currentPeriodEnd < new Date() && status !== "past_due") {
      return "free";
    }
    return user.planId as PlanId;
  }
  if (user.cancelAtPeriodEnd && user.currentPeriodEnd && user.currentPeriodEnd > new Date()) {
    return user.planId as PlanId;
  }
  return user.planId === "free" ? "free" : status === "active" ? (user.planId as PlanId) : "free";
}
