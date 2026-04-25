import { NextResponse } from "next/server";
import { loginAdmin } from "@/lib/admin";

export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({ password: "" }));
  const ok = await loginAdmin(password ?? "");
  if (!ok) return NextResponse.json({ error: "invalid" }, { status: 401 });
  return NextResponse.json({ ok: true });
}
