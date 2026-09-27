import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, AuthError } from "@/lib/auth";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const existing = await db.referrer.findUnique({
      where: { id },
      select: { id: true, code: true },
    });
    if (!existing) {
      return NextResponse.json({ ok: false, error: "معرف پیدا نشد." }, { status: 404 });
    }
    // Note: leads referencing this referrer keep their referralCode (string),
    // so they remain visible; only the referrer account is removed.
    await db.referrer.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: err.status });
    }
    console.error("[admin/referrers DELETE] error", err);
    return NextResponse.json({ ok: false, error: "خطای سرور" }, { status: 500 });
  }
}
