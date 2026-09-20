import { connectDb } from "@/lib/db";
import { json, handleRouteError } from "@/lib/http";

export async function GET() {
  try {
    await connectDb();
    return json({ ok: true });
  } catch (e) {
    return handleRouteError(e);
  }
}
