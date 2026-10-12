import React from "react";
import { HotelInfo } from "../types/itinerary";
import { CopyChip } from "./CopyChip";
import { AmapButton } from "./AmapButton";
import { Building2, Phone, MapPin, Sparkles, Calculator, Edit2 } from "lucide-react";
import { formatRmb } from "../lib/budgetUtils";

interface HotelCardProps {
  hotel: HotelInfo;
  onOpenCostEdit?: () => void;
  onEditHotel?: () => void;
  onOpenCalculator?: () => void;
  isPublicView?: boolean;
}

export const HotelCard: React.FC<HotelCardProps> = ({
  hotel,
  onOpenCostEdit,
  onEditHotel,
  onOpenCalculator,
  isPublicView = false,
}) => {
  return (
    <div className="bg-gradient-to-br from-indigo-900/90 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-indigo-700/40 my-4">
      <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-600/30 rounded-xl border border-indigo-500/30">
            <Building2 className="w-4 h-4 text-indigo-300" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 block">
              Khách Sạn Lưu Trú Đêm Nay
            </span>
            <h4 className="text-base sm:text-lg font-bold text-white">
              {hotel.name_vn}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {!isPublicView && onOpenCalculator && (
            <button
              type="button"
              onClick={onOpenCalculator}
              className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 px-2.5 py-1 rounded-full border border-amber-500/30 transition-all cursor-pointer shadow-xs"
              title="Máy tính tự động chia tiền nhiều đêm & chia theo số người"
            >
              <Calculator className="w-3.5 h-3.5 text-amber-400" />
              <span>🧮 Chia tiền phòng</span>
            </button>
          )}

          {!isPublicView && onEditHotel && (
            <button
              type="button"
              onClick={onEditHotel}
              className="inline-flex items-center gap-1 text-[11px] font-semibold bg-indigo-500/30 text-indigo-200 hover:bg-indigo-500/50 hover:text-white px-2.5 py-1 rounded-full border border-indigo-400/40 transition-all cursor-pointer"
              title="Chỉnh sửa thông tin khách sạn (Tên, Chữ Hán, Địa chỉ, Số điện thoại)"
            >
              <Edit2 className="w-3 h-3 text-indigo-300" />
              <span>Sửa Khách Sạn</span>
            </button>
          )}

          {typeof hotel.cost_rmb === "number" && hotel.cost_rmb > 0 ? (
            <button
              type="button"
              onClick={isPublicView ? undefined : onOpenCostEdit}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 ${
                isPublicView ? "cursor-default" : "hover:bg-emerald-500/30 cursor-pointer"
              }`}
            >
              <Calculator className="w-3.5 h-3.5 text-emerald-400" />
              <span>{formatRmb(hotel.cost_rmb)}</span>
              {!isPublicView && <Edit2 className="w-3 h-3 text-emerald-300 opacity-70" />}
            </button>
          ) : !isPublicView && onOpenCostEdit ? (
            <button
              type="button"
              onClick={onOpenCostEdit}
              className="inline-flex items-center gap-1 text-[11px] font-semibold bg-indigo-500/20 text-indigo-200 hover:bg-indigo-500/30 px-2.5 py-1 rounded-full border border-indigo-500/30 transition-all cursor-pointer"
            >
              <Calculator className="w-3 h-3 text-amber-400" />
              <span>+ Tiền phòng</span>
            </button>
          ) : null}

          <span className="inline-flex items-center gap-1 text-[11px] bg-indigo-500/20 text-indigo-200 px-2.5 py-1 rounded-full border border-indigo-500/30">
            <Sparkles className="w-3 h-3 text-amber-400" /> Hotel Check-in
          </span>
        </div>
      </div>

      {/* Booking Code & Room Type Privacy Badge Box */}
      {(hotel.room_type || hotel.booking_code || isPublicView) && (
        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-indigo-500/20 mb-3 flex items-center justify-between gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            <div>
              <span className="text-[10px] text-slate-400 block">Loại phòng:</span>
              <span className="font-semibold text-indigo-200">
                {isPublicView
                  ? "*** (Đã ẩn loại phòng khi chia sẻ)"
                  : hotel.room_type || "Chưa cập nhật"}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 block">Mã đặt phòng:</span>
              <span className="font-semibold text-emerald-300 font-mono">
                {isPublicView
                  ? "*** (Đã ẩn mã booking)"
                  : hotel.booking_code || "Chưa cập nhật"}
              </span>
            </div>
          </div>

          {isPublicView && (
            <span className="text-[10px] text-amber-300 font-medium bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              🔒 Ẩn thông tin riêng tư
            </span>
          )}
        </div>
      )}

      {/* Chinese Hotel Name */}
      <div className="bg-slate-950/50 p-3 rounded-xl border border-indigo-500/20 mb-3 flex items-center justify-between gap-2 flex-wrap">
        <div>
          <span className="text-[11px] text-slate-400 block mb-0.5">
            Tên chữ Hán (đưa lễ tân / tài xế taxi):
          </span>
          <span className="text-sm font-bold text-amber-300 font-sans">
            {hotel.name_zh}
          </span>
        </div>
        <CopyChip text={hotel.name_zh} highlight />
      </div>

      {/* Address */}
      {hotel.address && (
        <div className="bg-slate-950/40 p-3 rounded-xl border border-indigo-500/20 mb-3">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1">
                <MapPin className="w-3 h-3 text-indigo-400 shrink-0" />
                <span>Địa chỉ chi tiết:</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {hotel.address}
              </p>
            </div>
            <CopyChip text={hotel.address} label="Sao chép địa chỉ" />
          </div>
        </div>
      )}

      {/* Action buttons: Phone & Amap */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
        {hotel.phone && (
          <a
            href={`tel:${hotel.phone}`}
            className="flex items-center justify-center gap-2 py-2 px-3 bg-slate-800/90 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Gọi khách sạn: {hotel.phone}</span>
          </a>
        )}

        <div className={!hotel.phone ? "sm:col-span-2" : ""}>
          <AmapButton
            query={hotel.name_zh || hotel.address || hotel.name_vn}
            label="Định vị Amap đến Khách sạn"
          />
        </div>
      </div>
    </div>
  );
};
