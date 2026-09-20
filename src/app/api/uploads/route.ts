import { NextRequest } from "next/server";
import sharp from "sharp";
import { requireUser } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { Upload } from "@/models/Upload";
import { storeUpload } from "@/lib/storage";
import { handleRouteError, json, limit } from "@/lib/http";
import { AppError, ForbiddenError } from "@/lib/errors";
import { getPlan } from "@/lib/plans";
import type { PlanId } from "@/lib/types";
import { extractImageOcr } from "@/lib/extractors/ocr";

const PDF = "application/pdf";
const IMAGES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

export async function POST(req: NextRequest) {
  try {
    limit(req, "upload", 15, 60_000);
    const user = await requireUser();
    const plan = getPlan(user.planId as PlanId);
    const form = await req.formData();
    const file = form.get("file");
    const kind = String(form.get("kind") || "");
    if (!(file instanceof File)) throw new AppError("Choose a file to upload.");
    if (file.size > plan.maxUploadBytes) {
      throw new AppError("This file is larger than your plan allows.", 400, "FILE_TOO_LARGE");
    }
    const buf = Buffer.from(await file.arrayBuffer());
    if (kind === "pdf") {
      if (!plan.allowedSources.includes("pdf")) {
        throw new ForbiddenError("PDF uploads require Student or Pro.");
      }
      if (file.type !== PDF && !file.name.toLowerCase().endsWith(".pdf")) {
        throw new AppError("Upload a PDF file.");
      }
      if (buf.slice(0, 5).toString() !== "%PDF-") {
        throw new AppError("This file is not a valid PDF.");
      }
      await connectDb();
      const stored = await storeUpload(buf, file.name, String(user._id));
      const upload = await Upload.create({
        userId: user._id,
        storedName: stored.storedName,
        originalName: file.name,
        mimeType: PDF,
        size: file.size,
        kind: "pdf",
        path: stored.path,
      });
      return json({ fileId: String(upload._id), name: file.name });
    }
    if (kind === "image" || kind === "avatar") {
      if (kind === "image" && !plan.allowedSources.includes("image") && !plan.allowedSources.includes("diagram")) {
        throw new ForbiddenError("Image uploads for notes require Student or Pro.");
      }
      if (!IMAGES.has(file.type) && !/\.(png|jpe?g|webp)$/i.test(file.name)) {
        throw new AppError("Upload a JPG, PNG, or WEBP image.");
      }
      const meta = await sharp(buf).metadata();
      if (!meta.width || !meta.height) throw new AppError("This image could not be read.");
      if (meta.width > 8000 || meta.height > 8000) {
        throw new AppError("Image dimensions are too large.");
      }
      await connectDb();
      const stored = await storeUpload(buf, file.name, String(user._id));
      const upload = await Upload.create({
        userId: user._id,
        storedName: stored.storedName,
        originalName: file.name,
        mimeType: file.type || "image/jpeg",
        size: file.size,
        kind: kind === "avatar" ? "avatar" : "image",
        path: stored.path,
      });
      let ocrText: string | undefined;
      let warnings: string[] = [];
      if (kind === "image") {
        try {
          const extracted = await extractImageOcr(buf, file.name);
          ocrText = extracted.text;
          warnings = extracted.warnings;
        } catch (e) {
          warnings = [e instanceof Error ? e.message : "OCR failed."];
        }
      }
      return json({
        fileId: String(upload._id),
        name: file.name,
        url: `/api/uploads/${upload._id}`,
        ocrText,
        warnings,
        width: meta.width,
        height: meta.height,
      });
    }
    throw new AppError("Unsupported upload type.");
  } catch (e) {
    return handleRouteError(e);
  }
}
