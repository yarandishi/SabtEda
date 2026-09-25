import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  const s = await getSession();
  if (!s || s.kind !== "admin") {
    return NextResponse.json({ ok: false, authenticated: false }, { status: 200 });
  }
  return NextResponse.json({
    ok: true,
    authenticated: true,
    admin: { username: s.username },
  });
}
