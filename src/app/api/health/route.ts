import { connectDb } from "@/lib/db";
import { authSecretConfigured } from "@/lib/auth-secret";
import { json, handleRouteError } from "@/lib/http";

export async function GET() {
  try {
    await connectDb();
    return json({
      ok: true,
      // Boolean only — never include secret values or lengths here.
      authConfigured: authSecretConfigured(),
    });
  } catch (e) {
    return handleRouteError(e);
  }
}
