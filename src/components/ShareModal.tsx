import React, { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import {
  X,
  Share2,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  Send,
  MessageSquare,
  Mail,
  Globe,
  Sparkles,
  Download,
} from "lucide-react";
import { TripDocument } from "../types/itinerary";
import { generateShareSummaryText, shareTrip } from "../lib/shareService";
import { toast } from "sonner";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: TripDocument;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  trip,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>("");
  const [isLoadingUrl, setIsLoadingUrl] = useState(true);
  const [activeTab, setActiveTab] = useState<"link" | "qr">("link");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate public share link when modal opens
  useEffect(() => {
    if (!isOpen) return;

    setIsLoadingUrl(true);
    setCopiedLink(false);
    setCopiedSummary(false);

    shareTrip(trip)
      .then((res) => {
        setShareUrl(res.shareUrl);
      })
      .catch((err) => {
        console.error("Failed to generate share URL:", err);
        const fallbackUrl = `${window.location.origin}/?share=${encodeURIComponent(trip.id || "sample")}`;
        setShareUrl(fallbackUrl);
      })
      .finally(() => {
        setIsLoadingUrl(false);
      });
  }, [isOpen, trip]);

  // Render QR Code onto canvas
  useEffect(() => {
    if (!shareUrl || !canvasRef.current || activeTab !== "qr") return;

    QRCode.toCanvas(
      canvasRef.current,
      shareUrl,
      {
        width: 200,
        margin: 2,
        color: {
          dark: "#090d16",
          light: "#ffffff",
        },
        errorCorrectionLevel: "M",
      },
      (err) => {
        if (err) console.error("QR Code generation error:", err);
      }
    );
  }, [shareUrl, activeTab]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        setCopiedLink(true);
        toast.success("Đã sao chép liên kết chia sẻ!", {
          description: "Gửi link này cho bạn bè, họ có thể xem ngay mà không cần đăng nhập.",
        });
        setTimeout(() => setCopiedLink(false), 3000);
      })
      .catch(() => {
        toast.error("Không thể sao chép liên kết.");
      });
  };

  const handleCopySummaryWithLink = () => {
    const summary = generateShareSummaryText(trip, shareUrl);
    navigator.clipboard
      .writeText(summary)
      .then(() => {
        setCopiedSummary(true);
        toast.success("Đã sao chép tóm tắt lịch trình kèm link!", {
          description: "Nội dung sẵn sàng để dán vào Zalo, WeChat hoặc tin nhắn nhóm.",
        });
        setTimeout(() => setCopiedSummary(false), 3000);
      })
      .catch(() => {
        toast.error("Không thể sao chép văn bản.");
      });
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Lịch trình: ${trip.trip_title}`,
          text: `Xem lịch trình du lịch "${trip.trip_title}" (${trip.duration}) trên TripWise China:`,
          url: shareUrl,
        });
      } catch (err: any) {
        if (err.name !== "AbortError") {
          toast.error("Chia sẻ không thành công.");
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleShareZalo = () => {
    handleCopyLink();
    toast.info("Đã chép link! Bạn có thể dán trực tiếp vào cửa sổ chat Zalo.");
  };

  const handleShareTelegram = () => {
    const text = encodeURIComponent(
      `Lịch trình ${trip.trip_title} (${trip.duration}): ${shareUrl}`
    );
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${text}`, "_blank");
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Xem lịch trình du lịch: ${trip.trip_title}\n${shareUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(`Lịch trình du lịch: ${trip.trip_title}`);
    const body = encodeURIComponent(generateShareSummaryText(trip, shareUrl));
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  };

  const handleDownloadQr = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `QRCode-LichTrinh-${trip.trip_title.replace(/\s+/g, "_")}.png`;
    a.click();
    toast.success("Đã tải xuống mã QR hình ảnh!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-100 max-h-[92vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Chia Sẻ Lịch Trình
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Không Cần Đăng Nhập
                </span>
              </h2>
              <p className="text-xs text-slate-400 truncate max-w-xs sm:max-w-sm">
                {trip.trip_title}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="px-5 sm:px-6 pt-4 pb-2 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("link")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "link"
                ? "bg-amber-500 text-slate-950 shadow-md font-extrabold"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Liên Kết Chia Sẻ (Link)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("qr")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "qr"
                ? "bg-amber-500 text-slate-950 shadow-md font-extrabold"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Mã QR Cho Điện Thoại</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Key Benefit Banner */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">Người nhận xem trực tiếp ngay lập tức:</p>
              <p className="text-amber-200/80 mt-0.5 leading-relaxed">
                Người mở link không cần đăng ký tài khoản. Họ có thể duyệt lịch trình từng ngày, xem bản đồ Amap, tra cứu tiếng Trung phiên âm và thời tiết tự do.
              </p>
            </div>
          </div>

          {activeTab === "link" ? (
            <div className="space-y-4">
              {/* URL Box */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Đường dẫn xem lịch trình công khai
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      readOnly
                      value={isLoadingUrl ? "Đang tạo liên kết chia sẻ..." : shareUrl}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 font-mono select-all focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyLink}
                    disabled={isLoadingUrl || !shareUrl}
                    className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                      copiedLink
                        ? "bg-emerald-600 text-white"
                        : "bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold"
                    }`}
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Đã Chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Sao Chép</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div className="space-y-2">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Gửi nhanh qua các ứng dụng
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {typeof navigator !== "undefined" && "share" in navigator && (
                    <button
                      type="button"
                      onClick={handleNativeShare}
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white flex flex-col items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Share2 className="w-4 h-4 text-amber-400" />
                      <span className="text-[11px]">Chia Sẻ Máy</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleShareZalo}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white flex flex-col items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-blue-400" />
                    <span className="text-[11px]">Zalo / Chat</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShareTelegram}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white flex flex-col items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Send className="w-4 h-4 text-sky-400" />
                    <span className="text-[11px]">Telegram</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white flex flex-col items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <span className="text-[11px]">WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShareEmail}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white flex flex-col items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Mail className="w-4 h-4 text-rose-400" />
                    <span className="text-[11px]">Email</span>
                  </button>
                </div>
              </div>

              {/* Copy Summary Option */}
              <div className="pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleCopySummaryWithLink}
                  className={`w-full py-2.5 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                    copiedSummary
                      ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-300"
                      : "bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-200"
                  }`}
                >
                  {copiedSummary ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Đã chép tóm tắt & liên kết vào Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-amber-400" />
                      <span>Sao chép tóm tắt đầy đủ kèm link (Gửi nhóm tour)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center py-2 space-y-4">
              <div className="p-3 bg-white rounded-2xl shadow-xl inline-block border-4 border-amber-500">
                <canvas ref={canvasRef} className="block w-[200px] h-[200px]" />
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold text-white">
                  Quét mã QR bằng Camera hoặc Zalo
                </p>
                <p className="text-[11px] text-slate-400 max-w-xs">
                  Thành viên trong đoàn chỉ cần mở ứng dụng camera trên điện thoại để quét và mở lịch trình tức thì.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadQr}
                  className="py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-blue-400" />
                  <span>Tải ảnh QR</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-amber-400" />
                  <span>Chép link</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 transition-colors"
          >
            <span>Mở xem thử (Chế độ khách)</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
