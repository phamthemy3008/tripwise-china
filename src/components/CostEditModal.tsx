import React, { useState } from "react";
import { DollarSign, X, Check, Calculator, Tag, FileText } from "lucide-react";
import { toast } from "sonner";
import { DEFAULT_EXCHANGE_RATE, formatVnd } from "../lib/budgetUtils";

interface CostEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  initialRmb?: number;
  initialVnd?: number;
  initialCategory?: "flight" | "visa" | "esim" | "insurance" | "shopping" | "hotel" | "ticket" | "other";
  initialNote?: string;
  exchangeRate?: number;
  onSave: (costRmb: number | undefined, costVnd: number | undefined, category: string, note?: string) => void;
}

export const CostEditModal: React.FC<CostEditModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  initialRmb,
  initialVnd,
  initialCategory = "ticket",
  initialNote = "",
  exchangeRate = DEFAULT_EXCHANGE_RATE,
  onSave,
}) => {
  const [rmbStr, setRmbStr] = useState<string>(initialRmb !== undefined && initialRmb !== null ? String(initialRmb) : "");
  const [vndStr, setVndStr] = useState<string>(initialVnd !== undefined && initialVnd !== null ? String(initialVnd) : "");
  const [category, setCategory] = useState<string>(initialCategory);
  const [note, setNote] = useState<string>(initialNote);

  if (!isOpen) return null;

  const handleRmbChange = (val: string) => {
    setRmbStr(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      setVndStr(String(Math.round(num * exchangeRate)));
    } else if (val === "") {
      setVndStr("");
    }
  };

  const handleVndChange = (val: string) => {
    setVndStr(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      setRmbStr((num / exchangeRate).toFixed(1));
    } else if (val === "") {
      setRmbStr("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rmbNum = rmbStr !== "" ? parseFloat(rmbStr) : undefined;
    const vndNum = vndStr !== "" ? parseFloat(vndStr) : undefined;

    if (rmbNum !== undefined && (isNaN(rmbNum) || rmbNum < 0)) {
      toast.error("Chi phí RMB không hợp lệ");
      return;
    }

    onSave(
      rmbNum !== undefined && !isNaN(rmbNum) ? rmbNum : undefined,
      vndNum !== undefined && !isNaN(vndNum) ? vndNum : undefined,
      category,
      note.trim() || undefined
    );
    toast.success("Đã cập nhật chi phí thành công!");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">{title}</h3>
              {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* RMB Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Chi phí RMB (Tệ - ¥)
            </label>

            <div className="relative flex items-center">
              <span className="absolute left-3 font-bold text-amber-400 text-sm">¥</span>
              <input
                type="number"
                step="any"
                min="0"
                placeholder="Ví dụ: 55"
                value={rmbStr}
                onChange={(e) => handleRmbChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-8 pr-4 py-2.5 text-sm text-white font-semibold outline-none transition-colors"
              />
            </div>
          </div>

          {/* VND Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Quy đổi VND (Việt Nam Đồng - ₫)
              </label>
              <span className="text-[10px] text-amber-400 font-medium">
                Tỷ giá: 1 RMB = {exchangeRate.toLocaleString("vi-VN")} ₫
              </span>
            </div>
            <div className="relative flex items-center">
              <input
                type="number"
                step="any"
                min="0"
                placeholder="Tự động tính theo tỷ giá"
                value={vndStr}
                onChange={(e) => handleVndChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm text-slate-200 font-medium outline-none transition-colors"
              />
              <span className="absolute right-3 text-xs text-slate-400 font-bold">VND</span>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" /> Phân loại khoản chi
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none cursor-pointer"
            >
              <option value="ticket">Vé tham quan & Hoạt động</option>
              <option value="hotel">Khách sạn & Lưu trú</option>
              <option value="flight">Máy bay & Tàu hỏa</option>
              <option value="shopping">Ăn uống & Mua sắm</option>
              <option value="esim">SIM / eSIM / Internet</option>
              <option value="visa">Visa & Thủ tục</option>
              <option value="insurance">Bảo hiểm du lịch</option>
              <option value="other">Khác</option>
            </select>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" /> Ghi chú thêm
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Đã bao gồm bao tay & vé cáp treo"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
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
              <span>Lưu Chi Phí</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
