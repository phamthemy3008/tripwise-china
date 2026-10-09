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

    // Official Gaode Amap POI Search scheme:
    // iosamap://poi?sourceApplication=tripwise&name=...&keywords=...
    // androidamap://poi?sourceApplication=tripwise&name=...&keywords=...
    const iosPoiUrl = `iosamap://poi?sourceApplication=tripwise&name=${encoded}&keywords=${encoded}&dev=0`;
    const androidPoiUrl = `androidamap://poi?sourceApplication=tripwise&name=${encoded}&keywords=${encoded}&dev=0`;
    const androidIntentUrl = `intent://poi?sourceApplication=tripwise&name=${encoded}&keywords=${encoded}&dev=0#Intent;scheme=androidamap;package=com.autonavi.minimap;end`;

    // Standard Web Search URL for desktop or manual fallback
    const webAmapStandardUrl = `https://uri.amap.com/search?keyword=${encoded}`;

    // Auto-copy Chinese keyword to clipboard
    if (navigator.clipboard) {
      navigator.clipboard.writeText(query).catch(() => {});
    }

    if (isMobile) {
      toast.info("Đang mở ứng dụng Bản đồ Amap...", {
        description: `Địa danh: "${query}" (Đã tự động copy chữ Hán)`,
        duration: 3500,
        action: {
          label: "Mở trên Web",
          onClick: () => window.open(webAmapStandardUrl, "_blank", "noopener,noreferrer"),
        },
      });

      // Launch native app ONLY - DO NOT force browser redirect to avoid double-opening uri.amap.com
      if (isIOS) {
        window.location.href = iosPoiUrl;
      } else if (isAndroid) {
        try {
          window.location.href = androidPoiUrl;
        } catch {
          window.location.href = androidIntentUrl;
        }
      } else {
        window.open(webAmapStandardUrl, "_blank", "noopener,noreferrer");
      }
    } else {
      // Desktop PC: Open browser web version in a new tab
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
