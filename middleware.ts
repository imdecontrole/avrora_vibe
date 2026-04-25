import { NextResponse, type NextRequest } from "next/server";

function randomHex(bytes: number) {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  if (!req.cookies.get("av_sid")) {
    res.cookies.set("av_sid", randomHex(24), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365 * 2,
    });
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/|favicon.ico).*)"],
};
