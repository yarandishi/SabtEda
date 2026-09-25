import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, AuthError } from "@/lib/auth";

const ALLOWED_STATUSES = new Set([
  "new",
  "contacted",
  "service",
  "completed",
  "cancelled",
]);

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ ok: false, error: "درخواست نامعتبر" }, { status: 400 });
    }

    const data: { status?: string; adminNote?: string | null } = {};
    if (body.status !== undefined) {
      const status = String(body.status);
      if (!ALLOWED_STATUSES.has(status)) {
        return NextResponse.json(
          { ok: false, error: "وضعیت نامعتبر است." },
          { status: 422 }
        );
      }
      data.status = status;
    }
    if (body.adminNote !== undefined) {
      data.adminNote = body.adminNote ? String(body.adminNote).slice(0, 1000) : null;
    }

    const updated = await db.lead.update({
      where: { id },
      data,
      select: { id: true, status: true, adminNote: true },
    });

    return NextResponse.json({ ok: true, lead: updated });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: err.status });
    }
    console.error("[admin/leads/status] error", err);
    return NextResponse.json({ ok: false, error: "خطای سرور" }, { status: 500 });
  }
}
