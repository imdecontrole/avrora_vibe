import { cookies } from "next/headers";

const SESSION_COOKIE = "av_sid";

export async function readSessionId(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

// Route handlers can write cookies; pages/layouts cannot. Middleware creates
// the cookie on first request, so by the time any code runs the cookie exists.
export async function getSessionId(): Promise<string> {
  const id = await readSessionId();
  if (id) return id;
  // Fallback (should be rare — middleware covers /api routes too).
  const { randomBytes } = await import("crypto");
  const fresh = randomBytes(24).toString("hex");
  const store = await cookies();
  try {
    store.set(SESSION_COOKIE, fresh, {
      httpOnly: true, sameSite: "lax", path: "/",
      maxAge: 60 * 60 * 24 * 365 * 2,
    });
  } catch {
    // set() throws outside route handlers — ignore, caller still gets an ID
  }
  return fresh;
}
