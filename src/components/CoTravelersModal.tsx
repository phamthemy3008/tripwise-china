import React, { useState, useEffect } from "react";
import {
  X,
  Users,
  UserPlus,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  Shield,
  Trash2,
  Mail,
  Lock,
  Unlock,
  AlertCircle,
  ExternalLink,
  Edit3,
} from "lucide-react";
import { TripDocument, CoTraveler } from "../types/itinerary";
import { shareTrip } from "../lib/shareService";
import { toast } from "sonner";

interface CoTravelersModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: TripDocument;
  onUpdateTrip: (updatedTrip: TripDocument) => void;
}

export const CoTravelersModal: React.FC<CoTravelersModalProps> = ({
  isOpen,
  onClose,
  trip,
  onUpdateTrip,
}) => {
  const [copiedCollabUrl, setCopiedCollabUrl] = useState(false);
  const [collabUrl, setCollabUrl] = useState<string>("");
  const [collabKey, setCollabKey] = useState<string>("");
  const [isLoadingUrl, setIsLoadingUrl] = useState(true);

  // New companion form
  const [newCompanionName, setNewCompanionName] = useState("");
  const [newCompanionEmail, setNewCompanionEmail] = useState("");
  const [travelersSummary, setTravelersSummary] = useState(trip.travelers_summary || "");

  useEffect(() => {
    if (!isOpen) return;

    setIsLoadingUrl(true);
    setCopiedCollabUrl(false);
    setTravelersSummary(trip.travelers_summary || "");

    shareTrip(trip)
      .then((res) => {
        setCollabUrl(res.collabUrl);
        setCollabKey(res.collabKey);
      })
      .catch((err) => {
        console.error("Failed to generate collab link:", err);
        const fallbackKey = trip.collab_key || `collab_${trip.id || "trip"}`;
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        setCollabUrl(`${origin}/?share=${encodeURIComponent(trip.id || "")}&collab=${encodeURIComponent(fallbackKey)}`);
        setCollabKey(fallbackKey);
      })
      .finally(() => {
        setIsLoadingUrl(false);
      });
  }, [isOpen, trip]);

  if (!isOpen) return null;

  const handleCopyCollabLink = () => {
    if (!collabUrl) return;
    navigator.clipboard
      .writeText(collabUrl)
      .then(() => {
        setCopiedCollabUrl(true);
        toast.success("Đã sao chép liên kết Mời Người Đi Cùng!", {
          description: "Người có link này sẽ được xem và SỬA TRỰC TIẾP lên lịch trình chung.",
        });
        setTimeout(() => setCopiedCollabUrl(false), 3000);
      })
      .catch(() => {
        toast.error("Không thể sao chép liên kết.");
      });
  };

  const handleAddCompanion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanionName.trim()) {
      toast.error("Vui lòng nhập tên người đi cùng.");
      return;
    }

    const newCoTraveler: CoTraveler = {
      id: `traveler_${Date.now()}`,
      name: newCompanionName.trim(),
      email: newCompanionEmail.trim() || undefined,
      role: "companion",
      added_at: Date.now(),
    };

    const currentList = trip.co_travelers || [];
    const updatedList = [...currentList, newCoTraveler];

    // Update travelers summary string
    const updatedSummary =
      updatedList.map((t) => t.name).join(", ") || travelersSummary;

    const updatedTrip: TripDocument = {
      ...trip,
      co_travelers: updatedList,
      travelers_summary: updatedSummary,
    };

    onUpdateTrip(updatedTrip);
    setNewCompanionName("");
    setNewCompanionEmail("");
    setTravelersSummary(updatedSummary);
    toast.success(`Đã thêm ${newCoTraveler.name} vào danh sách người đi cùng!`);
  };

  const handleRemoveCompanion = (idToRemove: string) => {
    const currentList = trip.co_travelers || [];
    const updatedList = currentList.filter((t) => t.id !== idToRemove);
    const updatedSummary = updatedList.map((t) => t.name).join(", ");

    const updatedTrip: TripDocument = {
      ...trip,
      co_travelers: updatedList,
      travelers_summary: updatedSummary,
    };

    onUpdateTrip(updatedTrip);
    setTravelersSummary(updatedSummary);
    toast.success("Đã xóa thành viên khỏi danh sách.");
  };

  const handleSaveTravelersSummary = () => {
    const updatedTrip: TripDocument = {
      ...trip,
      travelers_summary: travelersSummary.trim(),
    };
    onUpdateTrip(updatedTrip);
    toast.success("Đã cập nhật danh sách người đi!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-100 max-h-[92vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Mời người đi cùng
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Quyền Xem & Sửa Chung
                </span>
              </h2>
              <p className="text-xs text-slate-400 truncate max-w-xs sm:max-w-sm">
                Mọi người cùng sửa và cập nhật trực tiếp lên lịch trình này
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

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Key Feature Explanation Banner */}
          <div className="p-4 rounded-2xl bg-indigo-950/50 border border-indigo-500/30 text-xs text-indigo-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-white text-sm">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Khác biệt giữa Chia Sẻ Xem & Mời Đi Cùng:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] leading-relaxed">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="font-bold text-emerald-400 block mb-1 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> 1. Link Chia Sẻ (Public View)
                </span>
                <p className="text-slate-300">
                  Chỉ cho xem, <strong>tự động ẩn mã booking, loại phòng, tên khách</strong>. Muốn sửa phải copy về tài khoản riêng.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-indigo-900/60 border border-indigo-500/40">
                <span className="font-bold text-indigo-300 block mb-1 flex items-center gap-1">
                  <Unlock className="w-3 h-3 text-amber-400" /> 2. Link Mời Đi Cùng (Collab)
                </span>
                <p className="text-indigo-100">
                  <strong>Được quyền Xem & Sửa trực tiếp</strong>. Xem đầy đủ thông tin bí mật (Mã vé, loại phòng) để cùng đi tour.
                </p>
              </div>
            </div>
          </div>

          {/* Collaborator Link Box */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <label className="block text-xs font-bold text-white flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-amber-400" />
              <span>Liên kết Mời Đồng Hành (Cấp quyền Chỉnh Sửa Chung)</span>
            </label>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={isLoadingUrl ? "Đang tạo liên kết mời..." : collabUrl}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 font-mono select-all focus:outline-none focus:border-indigo-500"
              />

              <button
                type="button"
                onClick={handleCopyCollabLink}
                disabled={isLoadingUrl || !collabUrl}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                  copiedCollabUrl
                    ? "bg-emerald-600 text-white"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md font-extrabold"
                }`}
              >
                {copiedCollabUrl ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Đã Chép Link</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Sao Chép Link Mời</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Gửi liên kết này cho bạn bè/thành viên trong đoàn. Họ mở link là có thể sửa trực tiếp lịch trình cùng bạn.
            </p>
          </div>

          {/* Add Companion Form */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>Thêm Thành Viên Trong Đoàn (Danh Sách Khách)</span>
            </h3>

            <form onSubmit={handleAddCompanion} className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              <input
                type="text"
                placeholder="Tên thành viên (vd: Anh Nam, Vy...)"
                value={newCompanionName}
                onChange={(e) => setNewCompanionName(e.target.value)}
                className="sm:col-span-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <input
                type="email"
                placeholder="Email (không bắt buộc)"
                value={newCompanionEmail}
                onChange={(e) => setNewCompanionEmail(e.target.value)}
                className="sm:col-span-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-400 border border-slate-700 flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Thêm</span>
              </button>
            </form>

            {/* List of Co-Travelers */}
            <div className="space-y-2 mt-3">
              {/* Trip Creator / Lead */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/30">
                    👑
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Trưởng Đoàn / Chủ Lịch Trình</span>
                    <span className="text-[11px] text-slate-400">Toàn quyền quản lý & mời đồng hành</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Chủ Chuyến Đi
                </span>
              </div>

              {/* Added Co-Travelers */}
              {(trip.co_travelers || []).map((traveler) => (
                <div
                  key={traveler.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs border border-indigo-500/30">
                      👤
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">{traveler.name}</span>
                      {traveler.email && (
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-500" />
                          {traveler.email}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      Đồng Hành (Sửa Chung)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCompanion(traveler.id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                      title="Xóa thành viên"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Note Summary */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="block text-xs font-medium text-slate-300">
              Ghi chú nhanh danh sách đoàn (sẽ tự động hiển thị trong thông tin chung)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={travelersSummary}
                onChange={(e) => setTravelersSummary(e.target.value)}
                placeholder="Vd: 4 người (Anh Nam, Chị Lan, Đức, Vy)"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleSaveTravelersSummary}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-colors cursor-pointer"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <a
            href={collabUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition-colors"
          >
            <span>Thử mở dưới quyền Người Đi Cùng</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            Hoàn Tất
          </button>
        </div>
      </div>
    </div>
  );
};
