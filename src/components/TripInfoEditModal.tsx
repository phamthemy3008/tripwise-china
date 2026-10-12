import React, { useState } from "react";
import { X, Check, Compass, Clock, Type } from "lucide-react";
import { toast } from "sonner";
import { TripDocument } from "../types/itinerary.js";

interface TripInfoEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: TripDocument;
  onSave: (tripTitle: string, duration: string) => void;
}

export const TripInfoEditModal: React.FC<TripInfoEditModalProps> = ({
  isOpen,
  onClose,
  trip,
  onSave,
}) => {
  const [tripTitle, setTripTitle] = useState(trip.trip_title || "");
  const [duration, setDuration] = useState(trip.duration || "");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripTitle.trim()) {
      toast.error("Vui lòng nhập tên chuyến đi");
      return;
    }
    onSave(tripTitle.trim(), duration.trim() || `${trip.days.length} Ngày`);
    toast.success("Đã cập nhật tên chuyến đi!");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl text-slate-100">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Chỉnh Sửa Tên Chuyến Đi</h3>
              <p className="text-xs text-slate-400 mt-0.5">Cập nhật tiêu đề &amp; thời lượng chuyến đi</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-amber-400" /> Tên chuyến đi <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Du Lịch Tự Túc Tứ Xuyên - Trùng Khánh"
              value={tripTitle}
              onChange={(e) => setTripTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-white font-medium outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" /> Thời lượng chuyến đi
            </label>
            <input
              type="text"
              placeholder="Ví dụ: 16 Ngày 15 Đêm"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-xs text-slate-200 outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Lưu</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
