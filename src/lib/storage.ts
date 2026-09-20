import { mkdir, writeFile, readFile, unlink } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";
import { safeFileName } from "./utils";

const root = () => path.resolve(process.env.UPLOAD_DIR || "./uploads");

export async function storeUpload(
  buffer: Buffer,
  originalName: string,
  subdir: string,
): Promise<{ storedName: string; path: string }> {
  const dir = path.join(root(), subdir);
  await mkdir(dir, { recursive: true });
  const storedName = `${Date.now()}-${randomBytes(8).toString("hex")}-${safeFileName(originalName)}`;
  const full = path.join(dir, storedName);
  await writeFile(full, buffer);
  return { storedName, path: full };
}

export async function readUpload(fullPath: string): Promise<Buffer> {
  return readFile(fullPath);
}

export async function removeUpload(fullPath: string) {
  try {
    await unlink(fullPath);
  } catch {
    /* ignore */
  }
}

export function isPathInsideUploads(fullPath: string) {
  const resolved = path.resolve(fullPath);
  return resolved.startsWith(root());
}
