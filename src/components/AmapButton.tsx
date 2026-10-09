import React from "react";
import { MapPin, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface AmapButtonProps {
  query: string;
  label?: string;
  className?: string;
}

export const AmapButton: React.FC<AmapButtonProps> = ({
  query,
  label = "Xem vị trí Amap (高德地图)",
  className = "",
}) => {
  const handleAmapOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    const encoded = encodeURIComponent(query);
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isAndroid = /Android/.test(ua);
    const isMobile = isIOS || isAndroid;

    // 1. POI View Map scheme (Chỉ mở ghim vị trí địa danh trên bản đồ, KHÔNG vẽ lộ trình dẫn đường)
    // iOS: iosamap://viewMap?sourceApplication=tripwise&poiname=...
    const iosViewMapUrl = `iosamap://viewMap?sourceApplication=tripwise&poiname=${encoded}&dev=0`;

    // Android: androidamap://viewMap?sourceApplication=tripwise&poiname=...
    const androidViewMapUrl = `androidamap://viewMap?sourceApplication=tripwise&poiname=${encoded}&dev=0`;
    const androidIntentUrl = `intent://viewMap?sourceApplication=tripwise&poiname=${encoded}&dev=0#Intent;scheme=androidamap;package=com.autonavi.minimap;end`;

    // 2. Official Universal Web URL with callnative=1 (Tự động đánh thức App Amap vào trang tìm kiếm địa điểm)
    const webAmapNativeUrl = `https://uri.amap.com/search?keyword=${encoded}&src=tripwise&callnative=1`;
    const webAmapStandardUrl = `https://uri.amap.com/search?keyword=${encoded}`;

    // Auto-copy Chinese keyword to clipboard
    if (navigator.clipboard) {
      navigator.clipboard.writeText(query).catch(() => {});
    }

    if (isMobile) {
      toast.info("Đang mở vị trí trên Bản đồ Amap Cao Đức...", {
        description: `Địa danh: "${query}" (Đã tự động copy chữ Hán)`,
        duration: 2500,
      });

      const startTime = Date.now();

      // Launch native app to ONLY view the location on map
      if (isIOS) {
        window.location.href = iosViewMapUrl;
      } else if (isAndroid) {
        try {
          window.location.href = androidViewMapUrl;
        } catch {
          window.location.href = androidIntentUrl;
        }
      } else {
        window.location.href = webAmapNativeUrl;
      }

      // If user doesn't have Amap app installed or viewMap didn't trigger, fallback to official web search with callnative
      setTimeout(() => {
        if (!document.hidden && Date.now() - startTime < 3000) {
          window.location.href = webAmapNativeUrl;
        }
      }, 1600);
    } else {
      // Desktop PC: Open browser web version
      toast.info("Đang mở bản đồ Amap trên trình duyệt...", {
        description: `Tìm kiếm địa danh: "${query}"`,
        duration: 2000,
      });
      window.open(webAmapStandardUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <button
      type="button"
      onClick={handleAmapOpen}
      className={`w-full flex items-center justify-center gap-2 py-2 px-3.5 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 dark:text-blue-300 rounded-xl text-xs font-semibold transition-all duration-150 border border-blue-200 dark:border-blue-800 active:scale-[0.98] cursor-pointer shadow-xs ${className}`}
      title="Mở ghim vị trí địa danh trên Bản đồ Amap Cao Đức"
    >
      <MapPin className="w-3.5 h-3.5 text-red-500 fill-red-500 shrink-0" />
      <span>{label}</span>
      <ExternalLink className="w-3 h-3 text-blue-400 opacity-60 ml-auto" />
    </button>
  );
};
