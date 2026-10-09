import React from "react";
import { Utensils, Search, Globe } from "lucide-react";
import { DishItem } from "../types/itinerary";
import { CopyChip } from "./CopyChip";
import { toast } from "sonner";

interface DishExplorerProps {
  dishes: DishItem[];
}

export const DishExplorer: React.FC<DishExplorerProps> = ({ dishes }) => {
  if (!dishes || dishes.length === 0) return null;

  const openImageSearch = (keyword: string, provider: "google" | "baidu") => {
    const encoded = encodeURIComponent(keyword);
    const url =
      provider === "google"
        ? `https://www.google.com/search?tbm=isch&q=${encoded}`
        : `https://image.baidu.com/search/index?tn=baiduimage&word=${encoded}`;

    toast.info(
      provider === "google"
        ? "Đang mở Google Images..."
        : "Đang mở Baidu Images (hoạt động tốt khi không có VPN)...",
      { duration: 1800 }
    );
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-400 mb-2">
        <Utensils className="w-3.5 h-3.5 text-amber-600" />
        <span>Gợi ý ẩm thực bản địa:</span>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {dishes.map((dish, idx) => (
          <div
            key={idx}
            className="bg-amber-50/50 dark:bg-amber-950/20 p-2.5 rounded-xl border border-amber-200/60 dark:border-amber-900/40 flex flex-col gap-2"
          >
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {dish.dish_name_vn}
              </span>
              <CopyChip text={dish.dish_name_zh} highlight />
            </div>

            <div className="flex items-center gap-2 pt-0.5">
              <button
                type="button"
                onClick={() =>
                  openImageSearch(
                    dish.google_img_keyword || dish.dish_name_zh,
                    "google"
                  )
                }
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-medium border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs cursor-pointer"
                title="Xem hình ảnh món ăn trên Google"
              >
                <Search className="w-3 h-3 text-red-500" />
                <span>Google Ảnh</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  openImageSearch(
                    dish.baidu_img_keyword || dish.dish_name_zh,
                    "baidu"
                  )
                }
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-blue-50/80 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-lg text-[11px] font-medium border border-blue-200 dark:border-blue-800 transition-colors shadow-2xs cursor-pointer"
                title="Xem hình ảnh trên Baidu (không cần bật VPN)"
              >
                <Globe className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                <span>Baidu Ảnh (Nội địa)</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
