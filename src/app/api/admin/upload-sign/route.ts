import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { signUpload } from "@/lib/cloudinary";

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { folder = "avrora" } = await req.json().catch(() => ({}));
  const payload = signUpload({ folder });
  return NextResponse.json(payload);
}
