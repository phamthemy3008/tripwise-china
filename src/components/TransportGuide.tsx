import React, { useState } from "react";
import {
  Train,
  Car,
  Compass,
  ExternalLink,
  Copy,
  Check,
  Navigation,
  ChevronDown,
  ChevronUp,
  MapPin,
  ArrowRight,
  Sparkles,
  Smartphone,
  Eye,
  X,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";
import { ActivityEvent, HotelInfo } from "../types/itinerary.js";
import { parseTransportEvent, ParsedTransport } from "../lib/transportParser.js";
import { CopyChip } from "./CopyChip.js";
import { openAppScheme } from "../lib/deepLink.js";

interface TransportGuideProps {
  event: ActivityEvent;
  hotel?: HotelInfo;
  cityName?: string;
  previousEvent?: ActivityEvent;
}

export const TransportGuide: React.FC<TransportGuideProps> = ({
  event,
  hotel,
  cityName,
  previousEvent,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDriverCard, setShowDriverCard] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const parsed: ParsedTransport = parseTransportEvent(
    event,
    hotel,
    cityName,
    previousEvent
  );

  // Active sub-tab when user wants to switch between Metro / Taxi / Train
  const initialMode =
    parsed.primaryMode === "train"
      ? "train"
      : parsed.primaryMode === "metro"
      ? "metro"
      : parsed.primaryMode === "taxi"
      ? "taxi"
      : parsed.metro
      ? "metro"
      : "taxi";

  const [activeTab, setActiveTab] = useState<"metro" | "taxi" | "train">(initialMode);

  // Helper copy text
  const copyToClipboard = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
    toast.success(`Đã sao chép: "${text}"`);
  };

  // --- ACTIONS: METROMAN ---
  const handleOpenMetroMan = (e: React.MouseEvent) => {
    e.stopPropagation();
    const stationZh = parsed.metro?.arrivalStationZh || `${event.place_zh}站`;
    const line = parsed.metro?.line || "Metro";
    
    // Copy destination station in Chinese
    if (navigator.clipboard) {
      navigator.clipboard.writeText(stationZh).catch(() => {});
    }

    const metroScheme = "metroman://";
    const androidIntent = "intent://#Intent;scheme=metroman;package=cn.metroman;end";
    const amapSubwayUrl = "https://map.amap.com/subway/index.html";
    const appStoreUrl = "https://apps.apple.com/app/metroman-china-subway/id466351037";

    toast.info("Đang mở MetroMan / Bản đồ Subway...", {
      description: `Ga đến: "${stationZh}" (${line}) - Đã tự động sao chép chữ Hán`,
      duration: 4000,
      action: {
        label: "Bản đồ Subway Web",
        onClick: () => window.open(amapSubwayUrl, "_blank", "noopener,noreferrer"),
      },
    });

    openAppScheme({
      schemeUrl: metroScheme,
      androidIntent,
      fallbackWebUrl: amapSubwayUrl,
      appStoreUrl,
    });
  };

  // --- ACTIONS: DIDI / ALIPAY DIDI ---
  const handleOpenDidiInAlipay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const destinationZh = parsed.taxi?.dropoffZh || event.place_zh || event.place_name;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(destinationZh).catch(() => {});
    }

    const alipayDidiScheme = "alipays://platformapi/startapp?appId=20000778";
    const fallbackWeb = "https://common.diditaxi.com.cn";

    toast.info("Đang mở DiDi trên Alipay...", {
      description: `Điểm đến: "${destinationZh}" (Đã tự động sao chép chữ Hán)`,
      duration: 4000,
      action: {
        label: "Mở DiDi Web",
        onClick: () => window.open(fallbackWeb, "_blank", "noopener,noreferrer"),
      },
    });

    openAppScheme({
      schemeUrl: alipayDidiScheme,
      fallbackWebUrl: fallbackWeb,
      appStoreUrl: "https://apps.apple.com/app/alipay-simplify-your-life/id333206289",
    });
  };

  const handleOpenDidiStandalone = (e: React.MouseEvent) => {
    e.stopPropagation();
    const destinationZh = parsed.taxi?.dropoffZh || event.place_zh || event.place_name;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(destinationZh).catch(() => {});
    }

    const didiScheme = "diditaxi://";
    const didiAndroidIntent = "intent://#Intent;scheme=diditaxi;package=com.sdu.didi.psnger;end";
    const didiWeb = "https://www.didiglobal.com";

    toast.info("Đang mở ứng dụng DiDi...", {
      description: `Điểm đến: "${destinationZh}" (Đã tự động sao chép chữ Hán)`,
      duration: 3500,
    });

    openAppScheme({
      schemeUrl: didiScheme,
      androidIntent: didiAndroidIntent,
      fallbackWebUrl: didiWeb,
      appStoreUrl: "https://apps.apple.com/app/didi-rider-easy-fast-travel/id1362300063",
    });
  };

  // --- ACTIONS: HIGH-SPEED TRAIN 12306 ---
  const handleOpen12306 = (e: React.MouseEvent) => {
    e.stopPropagation();
    const trainNum = parsed.train?.trainNumber || "Tàu cao tốc";
    const fromStation = parsed.train?.departureStationZh || "";
    const toStation = parsed.train?.arrivalStationZh || "";

    if (navigator.clipboard) {
      navigator.clipboard.writeText(trainNum).catch(() => {});
    }

    const app12306Scheme = "mobile12306://";
    const tripTrainWeb = `https://vn.trip.com/trains/china?search=${encodeURIComponent(trainNum)}`;

    toast.info(`Đang mở tra cứu vé tàu ${trainNum}...`, {
      description: `Lộ trình: ${fromStation} ➔ ${toStation} (Đã sao chép mã chuyến tàu)`,
      duration: 4500,
      action: {
        label: "Mở Trip.com Web",
        onClick: () => window.open(tripTrainWeb, "_blank", "noopener,noreferrer"),
      },
    });

    openAppScheme({
      schemeUrl: app12306Scheme,
      fallbackWebUrl: tripTrainWeb,
      appStoreUrl: "https://apps.apple.com/app/12306/id564817461",
    });
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 shadow-xs overflow-hidden transition-all duration-200">
      {/* Top Main Bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-3 sm:p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {parsed.primaryMode === "train" ? (
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0 border border-purple-200 dark:border-purple-800">
              <Train className="w-4 h-4" />
            </div>
          ) : parsed.primaryMode === "metro" ? (
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800">
              <Train className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-800">
              <Car className="w-4 h-4" />
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {parsed.primaryMode === "train"
                  ? "Tàu cao tốc (12306)"
                  : parsed.primaryMode === "metro"
                  ? "Di chuyển / Metro"
                  : "Di chuyển / Taxi & DiDi"}
              </span>

              {parsed.train?.trainNumber && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-bold bg-purple-600 text-white shadow-xs">
                  Chuyến {parsed.train.trainNumber}
                </span>
              )}

              {parsed.metro?.line && parsed.primaryMode === "metro" && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-600 text-white shadow-xs">
                  {parsed.metro.line}
                </span>
              )}
            </div>

            <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate mt-0.5">
              {parsed.summary}
            </p>
          </div>
        </div>

        {/* Right side toggle indicator */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hidden sm:inline">
            {isExpanded ? "Thu gọn" : "Chi tiết trạm & App"}
          </span>
          <button
            type="button"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            aria-label="Toggle details"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Interactive Navigation Hub */}
      {isExpanded && (
        <div className="border-t border-slate-100 dark:border-slate-800/80 p-3 sm:p-4 bg-slate-50/50 dark:bg-slate-900/40 space-y-3.5">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 dark:bg-slate-800/60 rounded-xl max-w-fit">
            {parsed.train && (
              <button
                type="button"
                onClick={() => setActiveTab("train")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "train"
                    ? "bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <Train className="w-3.5 h-3.5" />
                <span>Tàu cao tốc {parsed.train.trainNumber}</span>
              </button>
            )}

            {parsed.metro && (
              <button
                type="button"
                onClick={() => setActiveTab("metro")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "metro"
                    ? "bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <Train className="w-3.5 h-3.5" />
                <span>Metro / Tàu điện</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveTab("taxi")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "taxi"
                  ? "bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-300 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>Taxi / DiDi</span>
            </button>
          </div>

          {/* TAB CONTENT: 1. METRO & METROMAN */}
          {activeTab === "metro" && parsed.metro && (
            <div className="bg-white dark:bg-slate-800/90 rounded-xl p-3.5 border border-blue-100 dark:border-blue-900/30 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-xs tracking-wide">
                    {parsed.metro.line}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Thời gian: {parsed.metro.durationEstimate}
                  </span>
                </div>

                <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                  Hỗ trợ tra cứu MetroMan & Amap
                </span>
              </div>

              {/* Station Route visualization */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-blue-50/50 dark:bg-blue-950/20 p-3 rounded-xl border border-blue-100/80 dark:border-blue-900/20">
                {/* Ga cần đi */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                    Ga cần đi (Khởi hành)
                  </span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                      {parsed.metro.departureStationVn}
                    </span>
                  </div>
                  {parsed.metro.departureStationZh && (
                    <div className="flex items-center gap-1 pl-3.5">
                      <span className="font-mono text-xs font-bold text-blue-700 dark:text-blue-300">
                        {parsed.metro.departureStationZh}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(
                            parsed.metro!.departureStationZh,
                            "depStation"
                          )
                        }
                        className="p-1 text-slate-400 hover:text-blue-600"
                        title="Sao chép tên ga chữ Hán"
                      >
                        {copiedKey === "depStation" ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Ga đến */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                    Ga đến (Điểm đến)
                  </span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                    <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                      {parsed.metro.arrivalStationVn}
                    </span>
                  </div>
                  {parsed.metro.arrivalStationZh && (
                    <div className="flex items-center gap-1 pl-3.5">
                      <span className="font-mono text-xs font-bold text-red-600 dark:text-red-400">
                        {parsed.metro.arrivalStationZh}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(
                            parsed.metro!.arrivalStationZh,
                            "arrStation"
                          )
                        }
                        className="p-1 text-slate-400 hover:text-red-500"
                        title="Sao chép tên ga chữ Hán"
                      >
                        {copiedKey === "arrStation" ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Metro Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleOpenMetroMan}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
                  title="Mở trực tiếp ứng dụng MetroMan (Tự động sao chép tên ga chữ Hán)"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mở app MetroMan (Tra ga & Tuyến)</span>
                  <ExternalLink className="w-3 h-3 opacity-70 ml-auto" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      `${parsed.metro!.arrivalStationZh}`,
                      "copyStationForMetro"
                    )
                  }
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/60 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-blue-500" />
                  <span>Copy ga chữ Hán: {parsed.metro.arrivalStationZh}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB CONTENT: 2. TAXI & DIDI / ALIPAY */}
          {activeTab === "taxi" && parsed.taxi && (
            <div className="bg-white dark:bg-slate-800/90 rounded-xl p-3.5 border border-amber-100 dark:border-amber-900/30 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-white font-bold text-xs">
                    Taxi / DiDi Chuxing
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {parsed.taxi.durationEstimate} • Giá ước tính: {parsed.taxi.fareEstimate}
                  </span>
                </div>
              </div>

              {/* Pickup & Dropoff overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-amber-50/50 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-100/80 dark:border-amber-900/20">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                    Điểm đón (Khách sạn / Vị trí)
                  </span>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {parsed.taxi.pickupVn}
                  </p>
                  <span className="font-mono text-xs text-amber-700 dark:text-amber-300 block truncate">
                    {parsed.taxi.pickupZh}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                    Điểm đến (Đưa bác tài / Nhập DiDi)
                  </span>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {parsed.taxi.dropoffVn}
                  </p>
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-xs font-bold text-red-600 dark:text-red-400 truncate">
                      {parsed.taxi.dropoffZh}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(parsed.taxi!.dropoffZh, "dropoffZh")
                      }
                      className="p-1 text-slate-400 hover:text-red-500 shrink-0"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons for DiDi & Alipay */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleOpenDidiInAlipay}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-sky-500 hover:bg-sky-600 active:scale-[0.98] text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
                  title="Mở Mini-App DiDi trực tiếp trong ứng dụng Alipay (Thanh toán thẻ quốc tế tiện nhất)"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>DiDi trong Alipay</span>
                  <ExternalLink className="w-3 h-3 opacity-70 ml-auto" />
                </button>

                <button
                  type="button"
                  onClick={handleOpenDidiStandalone}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
                  title="Mở ứng dụng DiDi độc lập"
                >
                  <Car className="w-3.5 h-3.5" />
                  <span>Mở app DiDi</span>
                  <ExternalLink className="w-3 h-3 opacity-70 ml-auto" />
                </button>

                <button
                  type="button"
                  onClick={() => setShowDriverCard(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  title="Hiển thị thẻ chữ to cho bác tài taxi"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-500" />
                  <span>Thẻ đưa tài xế</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB CONTENT: 3. HIGH-SPEED RAIL 12306 */}
          {activeTab === "train" && parsed.train && (
            <div className="bg-white dark:bg-slate-800/90 rounded-xl p-3.5 border border-purple-100 dark:border-purple-900/30 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-purple-600 text-white font-bold text-xs tracking-wider">
                    Chuyến tàu: {parsed.train.trainNumber}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Thời gian chạy: {parsed.train.duration}
                  </span>
                </div>

                <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">
                  Hệ thống đường sắt Trung Quốc (铁路12306)
                </span>
              </div>

              {/* Departure & Arrival station cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-purple-50/50 dark:bg-purple-950/20 p-3 rounded-xl border border-purple-100/80 dark:border-purple-900/20">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                    Ga khởi hành (Ga đi)
                  </span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                      {parsed.train.departureStationVn}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 pl-3.5">
                    <span className="font-mono text-xs font-bold text-purple-700 dark:text-purple-300">
                      {parsed.train.departureStationZh}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          parsed.train!.departureStationZh,
                          "trainDep"
                        )
                      }
                      className="p-1 text-slate-400 hover:text-purple-600"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                    Ga đến (Điểm đến)
                  </span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                    <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                      {parsed.train.arrivalStationVn}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 pl-3.5">
                    <span className="font-mono text-xs font-bold text-red-600 dark:text-red-400">
                      {parsed.train.arrivalStationZh}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          parsed.train!.arrivalStationZh,
                          "trainArr"
                        )
                      }
                      className="p-1 text-slate-400 hover:text-red-500"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* 12306 Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleOpen12306}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
                  title="Mở ứng dụng 12306 để tra cứu đúng chuyến tàu"
                >
                  <Train className="w-3.5 h-3.5" />
                  <span>Mở app 12306 (Chuyến {parsed.train.trainNumber})</span>
                  <ExternalLink className="w-3 h-3 opacity-70 ml-auto" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      `${parsed.train!.trainNumber} ${parsed.train!.departureStationZh} ➔ ${parsed.train!.arrivalStationZh}`,
                      "copyTrainCode"
                    )
                  }
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-purple-500" />
                  <span>Sao chép mã tàu: {parsed.train.trainNumber}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* DRIVER CARD MODAL (THẺ ĐƯA TÀI XẾ CHỮ TO) */}
      {showDriverCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <Car className="w-5 h-5" />
                <h3 className="font-bold text-base">Thẻ đưa tài xế Taxi xem</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDriverCard(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/40 p-5 rounded-2xl border border-amber-200 dark:border-amber-800/50 space-y-3 text-center">
              <span className="text-xs uppercase tracking-wider font-bold text-amber-700 dark:text-amber-400">
                师傅，请带我去：(Bác tài, làm ơn đưa tôi đến:)
              </span>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono leading-tight py-2">
                {parsed.taxi?.dropoffZh || event.place_zh}
              </p>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                {parsed.taxi?.dropoffVn || event.place_name}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl text-center space-y-1 text-xs text-slate-600 dark:text-slate-400">
              <p className="font-medium text-slate-800 dark:text-slate-200">
                Câu giao tiếp cần thiết:
              </p>
              <p className="font-mono text-sm text-blue-600 dark:text-blue-400 font-bold">
                请打表 (Qǐng dǎbiǎo - Làm ơn bật đồng hồ tính cước)
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  copyToClipboard(
                    parsed.taxi?.dropoffZh || event.place_zh,
                    "modalCopy"
                  );
                  setShowDriverCard(false);
                }}
                className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm shadow-sm transition-all cursor-pointer"
              >
                Sao chép chữ Hán
              </button>
              <button
                type="button"
                onClick={() => setShowDriverCard(false)}
                className="py-3 px-5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 rounded-xl font-semibold text-sm transition-all cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
