import React from "react";
import { MapPin, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { openAppScheme } from "../lib/deepLink.js";

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

    const iosPoiUrl = `iosamap://poi?sourceApplication=tripwise&name=${encoded}&keywords=${encoded}&dev=0`;
    const androidIntentUrl = `intent://poi?sourceApplication=tripwise&name=${encoded}&keywords=${encoded}&dev=0#Intent;scheme=androidamap;package=com.autonavi.minimap;end`;
    const webAmapStandardUrl = `https://uri.amap.com/search?keyword=${encoded}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(query).catch(() => {});
    }

    toast.info("Đang mở Bản đồ Amap...", {
      description: `Địa danh: "${query}" (Đã tự động sao chép chữ Hán)`,
      duration: 3500,
      action: {
        label: "Mở trên Web",
        onClick: () => window.open(webAmapStandardUrl, "_blank", "noopener,noreferrer"),
      },
    });

    openAppScheme({
      schemeUrl: iosPoiUrl,
      androidIntent: androidIntentUrl,
      fallbackWebUrl: webAmapStandardUrl,
      appStoreUrl: "https://apps.apple.com/app/amap-map-location-navigation/id461703219",
    });
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
