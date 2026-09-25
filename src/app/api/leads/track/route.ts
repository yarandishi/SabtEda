import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { normalizeTrackingCode } from "@/lib/tracking";

// Pipeline stages in order
const STAGES = ["new", "contacted", "service", "completed"] as const;
type Stage = (typeof STAGES)[number];

const STAGE_LABELS: Record<Stage, { label: string; desc: string }> = {
  new: {
    label: "ثبت درخواست",
    desc: "درخواست شما دریافت شد و در انتظار بررسی اولیه است.",
  },
  contacted: {
    label: "تماس گرفته شد",
    desc: "تیم راهنمایی با شما تماس گرفت و وضعیت را بررسی کرد.",
  },
  service: {
    label: "در حال انجام خدمت",
    desc: "مراحل خدمت (در صورت درخواست شما) در حال انجام است.",
  },
  completed: {
    label: "تکمیل شد",
    desc: "فرایند به پایان رسید.",
  },
};

const CANCELLED_LABEL = {
  label: "لغو شد",
  desc: "این درخواست لغو شده است. برای اطلاعات بیشتر تماس بگیرید.",
};

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const raw = url.searchParams.get("code") ?? "";
  const code = normalizeTrackingCode(raw);

  if (!code) {
    return NextResponse.json(
      { ok: false, error: "کد رهگیری معتبر نیست. مثال: KK-7A3F9X" },
      { status: 422 }
    );
  }

  const lead = await db.lead.findUnique({
    where: { trackingCode: code },
    select: {
      trackingCode: true,
      fullName: true,
      requestType: true,
      city: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!lead) {
    return NextResponse.json(
      { ok: false, error: "درخواستی با این کد رهگیری پیدا نشد." },
      { status: 404 }
    );
  }

  const isCancelled = lead.status === "cancelled";
  const currentStageIndex = isCancelled
    ? -1
    : STAGES.indexOf(lead.status as Stage);

  const timeline = isCancelled
    ? [
        {
          stage: "new",
          label: STAGE_LABELS.new.label,
          desc: STAGE_LABELS.new.desc,
          done: true,
          current: false,
        },
        {
          stage: "cancelled",
          label: CANCELLED_LABEL.label,
          desc: CANCELLED_LABEL.desc,
          done: false,
          current: true,
        },
      ]
    : STAGES.map((stage, idx) => ({
        stage,
        label: STAGE_LABELS[stage].label,
        desc: STAGE_LABELS[stage].desc,
        done: idx < currentStageIndex,
        current: idx === currentStageIndex,
      }));

  const requestTypeLabels: Record<string, string> = {
    claim: "ثبت ادعا",
    question: "فقط سؤال دارم",
    assistance: "کمک در انجام کار",
  };

  return NextResponse.json({
    ok: true,
    lead: {
      trackingCode: lead.trackingCode,
      fullName: lead.fullName,
      requestTypeLabel: requestTypeLabels[lead.requestType] ?? lead.requestType,
      city: lead.city,
      status: lead.status,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
    },
    timeline,
    isCancelled,
    isCompleted: lead.status === "completed",
  });
}
