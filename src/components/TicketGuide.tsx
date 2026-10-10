import React, { useState } from "react";
import { Ticket, ExternalLink, Copy, Check, Calendar, ShieldCheck, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { ActivityEvent } from "../types/itinerary.js";
import { openAppScheme } from "../lib/deepLink.js";

interface TicketGuideProps {
  event: ActivityEvent;
  cityName?: string;
}

export const TicketGuide: React.FC<TicketGuideProps> = ({ event, cityName }) => {
  const [copied, setCopied] = useState(false);

  const ticketHint = (event.ticket_hint || "").trim();
  const lowerHint = ticketHint.toLowerCase();

  // Detect if ticket mentions WeChat
  const hasWeChat = /wechat|weixin|vi tín|mini-program|mini app|tiểu trình tự|小程序|公众号/i.test(lowerHint);

  // --- ACTION: OPEN WECHAT ---
  const handleOpenWeChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    const query = event.place_zh || event.place_name;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(query).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    const wechatScheme = "weixin://";
    const androidWechatIntent = "intent://#Intent;scheme=weixin;package=com.tencent.mm;end";

    toast.info("Đang mở ứng dụng WeChat (微信)...", {
      description: `Đã tự động sao chép: "${query}" để tìm Mini-App / Công Chúng Hào đặt vé`,
      duration: 4000,
    });

    openAppScheme({
      schemeUrl: wechatScheme,
      androidIntent: androidWechatIntent,
      fallbackWebUrl: "https://weixin.qq.com",
      appStoreUrl: "https://apps.apple.com/app/wechat/id414478124",
    });
  };

  // --- ACTION: OPEN TRIP.COM ---
  const handleOpenTrip = (e: React.MouseEvent) => {
    e.stopPropagation();
    const query = event.place_zh || event.place_name;
    const encoded = encodeURIComponent(query);

    // Auto copy place name
    if (navigator.clipboard) {
      navigator.clipboard.writeText(query).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    // Trip.com app schemes & links
    const tripAppScheme = "trip://";
    const androidTripIntent = `intent://things-to-do?keyword=${encoded}#Intent;scheme=trip;package=com.trip.android;end`;
    const tripWebUrl = `https://vn.trip.com/things-to-do/search/?keyword=${encoded}`;

    toast.info("Đang mở ứng dụng Trip.com...", {
      description: `Tìm vé: "${query}" (Đã tự động sao chép tên điểm đến)`,
      duration: 4000,
      action: {
        label: "Mở Trip Web",
        onClick: () => window.open(tripWebUrl, "_blank", "noopener,noreferrer"),
      },
    });

    openAppScheme({
      schemeUrl: tripAppScheme,
      androidIntent: androidTripIntent,
      fallbackWebUrl: tripWebUrl,
      appStoreUrl: "https://apps.apple.com/app/trip-com-book-flights-hotels/id681880144",
    });
  };

  if (!event.ticket_hint) return null;

  return (
    <div className="rounded-2xl border border-emerald-200/80 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 sm:p-3.5 space-y-2.5 shadow-xs">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
            <Ticket className="w-4 h-4" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-[11px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Vé tham quan / Đặt trước
              </span>

              {hasWeChat && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-green-600 text-white shadow-xs">
                  <MessageCircle className="w-2.5 h-2.5" />
                  Đặt qua WeChat
                </span>
              )}

              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-200/80 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                <ShieldCheck className="w-2.5 h-2.5" />
                Cần hộ chiếu
              </span>
            </div>

            <p className="text-xs font-medium text-emerald-950 dark:text-emerald-200 mt-0.5">
              {event.ticket_hint}
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
        {hasWeChat ? (
          <>
            <button
              type="button"
              onClick={handleOpenWeChat}
              className="flex items-center justify-center gap-2 py-2 px-3 bg-green-600 hover:bg-green-700 active:scale-[0.98] text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
              title="Mở app WeChat để tìm Mini-App / Official Account đặt vé"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Mở WeChat (微信 đặt vé)</span>
              <ExternalLink className="w-3 h-3 opacity-70 ml-auto" />
            </button>

            <button
              type="button"
              onClick={handleOpenTrip}
              className="flex items-center justify-center gap-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
              title="Mở app Trip.com làm phương án dự phòng"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Mở app Trip.com</span>
              <ExternalLink className="w-3 h-3 opacity-70 ml-auto" />
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={handleOpenTrip}
              className="flex items-center justify-center gap-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
              title="Mở app Trip.com để đặt vé trực tiếp kèm hỗ trợ hộ chiếu"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Mở app Trip (Đặt vé & Hoạt động)</span>
              <ExternalLink className="w-3 h-3 opacity-70 ml-auto" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(event.place_zh || event.place_name).catch(() => {});
                }
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
                toast.success(`Đã sao chép: "${event.place_zh || event.place_name}"`);
              }}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold border border-emerald-200/80 dark:border-emerald-800 transition-all cursor-pointer"
              title="Sao chép tên điểm đến"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Sao chép tên điểm đến chữ Hán</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
