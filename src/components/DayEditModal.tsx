import React, { useState } from "react";
import {
  X,
  Check,
  Calendar,
  MapPin,
  Building2,
  Phone,
  DollarSign,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { DayPlan, HotelInfo } from "../types/itinerary.js";
import { DEFAULT_EXCHANGE_RATE } from "../lib/budgetUtils.js";

interface DayEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayPlan: DayPlan;
  exchangeRate?: number;
  onSave: (updated: Partial<DayPlan>) => void;
}

export const DayEditModal: React.FC<DayEditModalProps> = ({
  isOpen,
  onClose,
  dayPlan,
  exchangeRate = DEFAULT_EXCHANGE_RATE,
  onSave,
}) => {
  const [title, setTitle] = useState(dayPlan.title || "");
  const [city, setCity] = useState(dayPlan.city || "");
  const [date, setDate] = useState(dayPlan.date || "");

  // Hotel fields
  const [hasHotel, setHasHotel] = useState(Boolean(dayPlan.hotel));
  const [hotelNameVn, setHotelNameVn] = useState(dayPlan.hotel?.name_vn || "");
  const [hotelNameZh, setHotelNameZh] = useState(dayPlan.hotel?.name_zh || "");
  const [hotelAddress, setHotelAddress] = useState(dayPlan.hotel?.address || "");
  const [hotelPhone, setHotelPhone] = useState(dayPlan.hotel?.phone || "");
  const [hotelCostRmb, setHotelCostRmb] = useState<string>(
    dayPlan.hotel?.cost_rmb !== undefined && dayPlan.hotel?.cost_rmb !== null
      ? String(dayPlan.hotel.cost_rmb)
      : ""
  );
  const [hotelCostVnd, setHotelCostVnd] = useState<string>(
    dayPlan.hotel?.cost_vnd !== undefined && dayPlan.hotel?.cost_vnd !== null
      ? String(dayPlan.hotel.cost_vnd)
      : ""
  );
  const [hotelNote, setHotelNote] = useState(dayPlan.hotel?.cost_note || "");

  if (!isOpen) return null;

  const handleRmbChange = (val: string) => {
    setHotelCostRmb(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      setHotelCostVnd(String(Math.round(num * exchangeRate)));
    } else if (val === "") {
      setHotelCostVnd("");
    }
  };

  const handleVndChange = (val: string) => {
    setHotelCostVnd(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      setHotelCostRmb((num / exchangeRate).toFixed(1));
    } else if (val === "") {
      setHotelCostRmb("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Vui lòng nhập tiêu đề cho ngày này");
      return;
    }

    if (!city.trim()) {
      toast.error("Vui lòng nhập thành phố");
      return;
    }

    let updatedHotel: HotelInfo | undefined = undefined;
    if (hasHotel && hotelNameVn.trim()) {
      const rmb = hotelCostRmb !== "" ? parseFloat(hotelCostRmb) : undefined;
      const vnd = hotelCostVnd !== "" ? parseFloat(hotelCostVnd) : undefined;
      updatedHotel = {
        name_vn: hotelNameVn.trim(),
        name_zh: hotelNameZh.trim() || hotelNameVn.trim(),
        address: hotelAddress.trim() || undefined,
        phone: hotelPhone.trim() || undefined,
        cost_rmb: rmb !== undefined && !isNaN(rmb) ? rmb : undefined,
        cost_vnd: vnd !== undefined && !isNaN(vnd) ? vnd : undefined,
        cost_note: hotelNote.trim() || undefined,
      };
    }

    onSave({
      title: title.trim(),
      city: city.trim(),
      date: date.trim(),
      hotel: updatedHotel,
    });

    toast.success(`Đã cập nhật thông tin Ngày ${dayPlan.day_number}!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white">
                Chỉnh Sửa Thông Tin Ngày {dayPlan.day_number}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Cập nhật tiêu đề ngày, thành phố và khách sạn lưu trú
              </p>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Day overview */}
          <div className="space-y-3.5 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/80">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 block">
              1. Thông tin chung về ngày
            </span>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Tiêu đề ngày <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Khám phá Thành Đô: Quảng trường Thiên Phủ & Ngõ Rộng Ngõ Hẹp"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-white font-medium outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-red-400" /> Thành phố <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Thành Đô"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" /> Ngày / Thứ
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: 14/11/2026 (Thứ Sáu)"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Hotel Information */}
          <div className="space-y-3.5 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" /> 2. Khách sạn lưu trú đêm nay
              </span>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasHotel}
                  onChange={(e) => setHasHotel(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500 h-4 w-4"
                />
                <span>Có khách sạn</span>
              </label>
            </div>

            {hasHotel && (
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Tên khách sạn (Tiếng Việt)
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Khách sạn Holiday Inn Express Thành Đô"
                      value={hotelNameVn}
                      onChange={(e) => setHotelNameVn(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Tên Chữ Hán (đưa lễ tân / tài xế taxi)
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: 成都智选假日酒店"
                      value={hotelNameZh}
                      onChange={(e) => setHotelNameZh(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-amber-300 font-semibold outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Địa chỉ chi tiết (Chữ Hán hoặc Tiếng Anh)
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: 四川省成都市锦江区东大街99号"
                    value={hotelAddress}
                    onChange={(e) => setHotelAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" /> Số điện thoại khách sạn
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: +86 28 8888 8888"
                    value={hotelPhone}
                    onChange={(e) => setHotelPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                  />
                </div>

                {/* Hotel Room Cost */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-800/80">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Tiền phòng RMB (Tệ - ¥)
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 font-bold text-amber-400 text-sm">¥</span>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        placeholder="Ví dụ: 350"
                        value={hotelCostRmb}
                        onChange={(e) => handleRmbChange(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-8 pr-3 py-2 text-xs text-white font-semibold outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Quy đổi VND (₫)
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        placeholder="Tự tính theo tỷ giá"
                        value={hotelCostVnd}
                        onChange={(e) => handleVndChange(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                      />
                      <span className="absolute right-3 text-xs text-slate-400 font-bold">VND</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Lưu Thông Tin Ngày</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
