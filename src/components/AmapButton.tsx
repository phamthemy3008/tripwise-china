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
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isAndroid = /Android/.test(ua);
    const isMobile = isIOS || isAndroid;

    // Native App Deep Links
    // iOS: iosamap://viewMap or iosamap://poi
    const iosDeepLink = `iosamap://poi?sourceApplication=tripwise&keywords=${encoded}&dev=0`;
    // Android: androidamap://viewMap or intent
    const androidDeepLink = `androidamap://poi?sourceApplication=tripwise&keywords=${encoded}&dev=0`;
    const androidIntent = `intent://poi?sourceApplication=tripwise&keywords=${encoded}&dev=0#Intent;scheme=androidamap;package=com.autonavi.minimap;end`;

    // Official Mobile Web Fallback URL
    const webAmapUrl = `https://uri.amap.com/search?keyword=${encoded}`;

    // Auto-copy Chinese keyword to clipboard
    if (navigator.clipboard) {
      navigator.clipboard.writeText(query).catch(() => {});
    }

    if (isMobile) {
      toast.info("Đang đánh thức ứng dụng Amap (高德地图)...", {
        description: `Đã tự động sao chép chữ Hán: "${query}"`,
        duration: 2500,
      });

      const startTime = Date.now();

      // Trigger app launch
      if (isIOS) {
        window.location.href = iosDeepLink;
      } else if (isAndroid) {
        // Use androidamap scheme first, fallback to intent
        try {
          window.location.href = androidDeepLink;
        } catch {
          window.location.href = androidIntent;
        }
      } else {
        window.location.href = webAmapUrl;
      }

      // If user doesn't have Amap app installed, fallback to web version after 1.8s
      setTimeout(() => {
        // If still on page and document is visible
        if (!document.hidden && Date.now() - startTime < 3000) {
          window.location.href = webAmapUrl;
        }
      }, 1800);
    } else {
      // Desktop PC: Open browser web version
      toast.info("Đang mở bản đồ Amap trên trình duyệt...", {
        description: `Tìm kiếm địa danh: "${query}"`,
        duration: 2000,
      });
      window.open(webAmapUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <button
      type="button"
      onClick={handleAmapOpen}
      className={`w-full flex items-center justify-center gap-2 py-2 px-3.5 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 dark:text-blue-300 rounded-xl text-xs font-semibold transition-all duration-150 border border-blue-200 dark:border-blue-800 active:scale-[0.98] cursor-pointer shadow-xs ${className}`}
      title="Mở ứng dụng hoặc web bản đồ Amap Cao Đức"
    >
      <Navigation className="w-3.5 h-3.5 fill-blue-600 text-blue-600 dark:fill-blue-400 dark:text-blue-400" />
      <span>{label}</span>
      <ExternalLink className="w-3 h-3 text-blue-400 opacity-60 ml-auto" />
    </button>
  );
};
