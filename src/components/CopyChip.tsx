import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface CopyChipProps {
  text: string;
  label?: string;
  className?: string;
  highlight?: boolean;
}

export const CopyChip: React.FC<CopyChipProps> = ({
  text,
  label,
  className = "",
  highlight = false,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(`Đã sao chép chữ Hán: "${text}"`, {
        description: "Có thể dán trực tiếp vào Amap, Baidu hoặc đưa tài xế taxi",
        duration: 2500,
        position: "top-center",
      });
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Không thể tự động sao chép. Vui lòng thử lại!");
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150 active:scale-95 cursor-pointer select-none border ${
        highlight
          ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border-amber-300 dark:bg-amber-400/10 dark:text-amber-200 dark:border-amber-700/50"
          : "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700"
      } ${className}`}
      title="Bấm 1 chạm để sao chép chữ Hán"
    >
      <span className="font-sans tracking-wide">{label || text}</span>
      {copied ? (
        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
      ) : (
        <Copy className="w-3 h-3 text-slate-400 dark:text-slate-400 shrink-0" />
      )}
    </button>
  );
};
