import React from "react";
import { Navigation, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface AmapButtonProps {
  query: string;
  label?: string;
  className?: string;
}

export const AmapButton: React.FC<AmapButtonProps> = ({
  query,
  label = "Mở Bản đồ Amap (高德地图)",
  className = "",
}) => {
  const handleAmapOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    const encoded = encodeURIComponent(query);
    // Deep link scheme for mobile Amap app + fallback web URI
    const webAmapUrl = `https://uri.amap.com/search?keyword=${encoded}`;

    toast.info("Đang mở bản đồ Amap Cao Đức...", {
      description: `Tìm kiếm địa danh: "${query}"`,
      duration: 2000,
    });

    window.open(webAmapUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      type="button"
      onClick={handleAmapOpen}
      className={`w-full flex items-center justify-center gap-2 py-2 px-3.5 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 dark:text-blue-300 rounded-xl text-xs font-semibold transition-all duration-150 border border-blue-200 dark:border-blue-800 active:scale-[0.98] cursor-pointer shadow-xs ${className}`}
      title="Mở định vị chỉ đường bằng Amap"
    >
      <Navigation className="w-3.5 h-3.5 fill-blue-600 text-blue-600 dark:fill-blue-400 dark:text-blue-400" />
      <span>{label}</span>
      <ExternalLink className="w-3 h-3 text-blue-400 opacity-60 ml-auto" />
    </button>
  );
};
