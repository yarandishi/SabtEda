"use client";

import { useEffect, useState, useRef } from "react";
import QRCode from "qrcode";
import { QrCode, Printer, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QrInviteProps {
  /** The full invite URL, e.g. https://katebkar.ir/?ref=K1024 */
  url: string;
  /** Compact mode for inline display in dashboards */
  compact?: boolean;
}

/**
 * Renders a QR code for the referrer's invite link with print & copy actions.
 */
export function QrInvite({ url, compact = false }: QrInviteProps) {
  const { toast } = useToast();
  const [dataUrl, setDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const printRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    QRCode.toDataURL(url, {
      width: 320,
      margin: 2,
      color: { dark: "#1e3a5f", light: "#ffffff" },
      errorCorrectionLevel: "M",
    })
      .then(setDataUrl)
      .catch(() => setDataUrl(""));
  }, [url]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({ title: "کپی شد", description: "لینک دعوت کپی شد." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "کپی ناموفق" });
    }
  }

  function print() {
    const win = window.open("", "_blank", "width=480,height=640");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html><html dir="rtl" lang="fa"><head><meta charset="utf-8">
      <title>QR لینک دعوت کاتب‌کار</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;600;700&display=swap');
        *{font-family:'Vazirmatn',sans-serif;box-sizing:border-box}
        body{margin:0;padding:32px;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#fff}
        .card{text-align:center;padding:24px;border:2px dashed #1e3a5f;border-radius:20px;max-width:360px}
        img{width:280px;height:280px;display:block;margin:0 auto}
        h1{color:#1e3a5f;font-size:20px;margin:16px 0 8px}
        p{color:#555;font-size:13px;margin:4px 0;line-height:1.8}
        .url{direction:ltr;font-family:monospace;font-size:11px;color:#888;word-break:break-all;margin-top:12px;padding:8px;background:#f5f7fb;border-radius:8px}
        .brand{margin-top:16px;color:#1f9d6b;font-weight:700;font-size:14px}
      </style></head>
      <body><div class="card">
        <img src="${dataUrl}" alt="QR" />
        <h1>لینک دعوت کاتب‌کار</h1>
        <p>این QR را اسکن کنید تا وارد صفحه ثبت درخواست شوید.</p>
        <div class="url">${url}</div>
        <div class="brand">کاتب‌کار</div>
      </div>
      <script>window.onload=function(){setTimeout(function(){window.print()},300)}</script>
      </body></html>
    `);
    win.document.close();
  }

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        {dataUrl && (
          <img src={dataUrl} alt="QR لینک دعوت" className="h-20 w-20 rounded-lg border border-border" />
        )}
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={print}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-navy transition-colors hover:bg-mist"
          >
            <Printer className="h-3.5 w-3.5" />
            چاپ QR
          </button>
          <button
            type="button"
            onClick={copyLink}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-navy transition-colors hover:bg-mist"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-forest" /> : <Copy className="h-3.5 w-3.5" />}
            کپی لینک
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={printRef} className="rounded-2xl border border-border bg-card p-5 text-center shadow-sm">
      <div className="mb-3 flex items-center justify-center gap-1.5 text-sm font-bold text-navy">
        <QrCode className="h-4 w-4" />
        QR لینک دعوت
      </div>
      {dataUrl ? (
        <img src={dataUrl} alt="QR لینک دعوت" className="mx-auto h-44 w-44 rounded-xl" />
      ) : (
        <div className="mx-auto h-44 w-44 animate-pulse rounded-xl bg-mist" />
      )}
      <p className="kk-num mt-3 break-all text-[10px] text-muted-foreground" dir="ltr">{url}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">این QR را اسکن کنید تا وارد صفحه ثبت درخواست شوید.</p>
      <div className="mt-3 flex justify-center gap-2">
        <button
          type="button"
          onClick={print}
          className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-navy-dark"
        >
          <Printer className="h-3.5 w-3.5" />
          چاپ QR
        </button>
        <button
          type="button"
          onClick={copyLink}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-navy transition-colors hover:bg-mist"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-forest" /> : <Copy className="h-3.5 w-3.5" />}
          کپی لینک
        </button>
      </div>
    </div>
  );
}
