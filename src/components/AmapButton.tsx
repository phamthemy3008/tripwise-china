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

    // Official Gaode Amap POI Search scheme using exact "name" parameter:
    // iosamap://poi?sourceApplication=...&name=...&keywords=...
    // androidamap://poi?sourceApplication=...&name=...&keywords=...
    const iosPoiUrl = `iosamap://poi?sourceApplication=tripwise&name=${encoded}&keywords=${encoded}&dev=0`;
    const androidPoiUrl = `androidamap://poi?sourceApplication=tripwise&name=${encoded}&keywords=${encoded}&dev=0`;
    const androidIntentUrl = `intent://poi?sourceApplication=tripwise&name=${encoded}&keywords=${encoded}&dev=0#Intent;scheme=androidamap;package=com.autonavi.minimap;end`;

    // Universal Amap URL with callnative=1
    const webAmapNativeUrl = `https://uri.amap.com/search?keyword=${encoded}&src=tripwise&callnative=1`;
    const webAmapStandardUrl = `https://uri.amap.com/search?keyword=${encoded}`;

    // Auto-copy Chinese keyword to clipboard
    if (navigator.clipboard) {
      navigator.clipboard.writeText(query).catch(() => {});
    }

    if (isMobile) {
      toast.info("Đang tìm vị trí trên Bản đồ Amap Cao Đức...", {
        description: `Tìm kiếm: "${query}" (Đã tự động copy chữ Hán)`,
        duration: 2500,
      });

      const startTime = Date.now();

      // Launch native app to search & pin the exact POI location
      if (isIOS) {
        window.location.href = iosPoiUrl;
      } else if (isAndroid) {
        try {
          window.location.href = androidPoiUrl;
        } catch {
          window.location.href = androidIntentUrl;
        }
      } else {
        window.location.href = webAmapNativeUrl;
      }

      // If user doesn't have Amap app installed, fallback to web
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
      title="Mở tìm kiếm và ghim vị trí địa danh trên Bản đồ Amap Cao Đức"
    >
      <MapPin className="w-3.5 h-3.5 text-red-500 fill-red-500 shrink-0" />
      <span>{label}</span>
      <ExternalLink className="w-3 h-3 text-blue-400 opacity-60 ml-auto" />
    </button>
  );
};
