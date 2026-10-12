import React, { useState, useEffect } from "react";
import {
  X,
  Smartphone,
  Globe,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Settings,
  Info,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import {
  AppDiagnosticManager,
  openAppScheme,
  AppDiagnosticResult,
} from "../lib/deepLink.js";
import { toast } from "sonner";

interface AppDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AppInfo {
  id: string;
  name: string;
  icon: string;
  scheme: string;
  androidIntent?: string;
  webUrl: string;
  appStoreUrl: string;
  description: string;
  notes?: string;
}

const APPS_LIST: AppInfo[] = [
  {
    id: "metroman",
    name: "MetroMan (Tàu điện ngầm)",
    icon: "🚇",
    scheme: "metroman://",
    androidIntent: "intent://#Intent;scheme=metroman;package=cn.metroman;end",
    webUrl: "https://map.amap.com/subway/index.html",
    appStoreUrl: "https://apps.apple.com/app/metroman-china-subway/id466351037",
    description: "Tra cứu tuyến tàu điện ngầm Trung Quốc offline & online.",
    notes: "iOS: App không khai báo URL scheme. Hệ thống tự chọn Web Subway Map để tránh báo lỗi Safari.",
  },
  {
    id: "amap",
    name: "Amap / Gaode (Cao Đức Bản Đồ)",
    icon: "🗺️",
    scheme: "iosamap://",
    androidIntent: "androidamap://",
    webUrl: "https://ditu.amap.com",
    appStoreUrl: "https://apps.apple.com/app/amap-gaode-maps/id292003949",
    description: "Bản đồ vệ tinh & chỉ đường chính xác nhất tại Trung Quốc.",
  },
  {
    id: "alipay",
    name: "Alipay (Chi Phó Bảo)",
    icon: "💙",
    scheme: "alipays://platformapi/startapp",
    webUrl: "https://www.alipay.com",
    appStoreUrl: "https://apps.apple.com/app/alipay-simplify-your-life/id333206289",
    description: "Thanh toán QR, gọi taxi DiDi mini-app, đi metro bus.",
  },
  {
    id: "didi",
    name: "DiDi (Gọi xe công nghệ)",
    icon: "🚖",
    scheme: "alipays://platformapi/startapp?appId=20000778",
    webUrl: "https://common.diditaxi.com.cn",
    appStoreUrl: "https://apps.apple.com/app/didi-rider/id1062002765",
    description: "Gọi xe Taxi / Ride-hailing tại Trung Quốc.",
  },
  {
    id: "wechat",
    name: "WeChat (Vi Tín)",
    icon: "🟢",
    scheme: "weixin://",
    webUrl: "https://weixin.qq.com",
    appStoreUrl: "https://apps.apple.com/app/wechat/id414117885",
    description: "Nhắn tin, quét mã QR thanh toán & Mini-programs.",
  },
  {
    id: "12306",
    name: "12306 (Tàu cao tốc Gaotie)",
    icon: "🚄",
    scheme: "rail12306://",
    webUrl: "https://www.12306.cn",
    appStoreUrl: "https://apps.apple.com/app/china-railway-12306/id564818799",
    description: "Đặt vé tàu cao tốc chính thức của Đường sắt Trung Quốc.",
  },
  {
    id: "trip",
    name: "Trip.com (Đặt phòng & Vé)",
    icon: "✈️",
    scheme: "ctrip://",
    webUrl: "https://www.trip.com",
    appStoreUrl: "https://apps.apple.com/app/trip-com-book-hotels-flights/id681888990",
    description: "Đặt vé máy bay, khách sạn, vé tham quan quốc tế.",
  },
];

export const AppDiagnosticModal: React.FC<AppDiagnosticModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [results, setResults] = useState<Record<string, AppDiagnosticResult>>({});
  const [testingAppId, setTestingAppId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setResults(AppDiagnosticManager.getAllResults());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestApp = (app: AppInfo) => {
    setTestingAppId(app.id);
    toast.info(`Đang kiểm tra chẩn đoán ứng dụng ${app.name}...`);

    openAppScheme({
      appName: app.id,
      schemeUrl: app.scheme,
      androidIntent: app.androidIntent,
      fallbackWebUrl: app.webUrl,
      appStoreUrl: app.appStoreUrl,
      onDiagnosticResult: (res) => {
        setTestingAppId(null);
        setResults((prev) => ({ ...prev, [app.id]: res }));

        if (res.status === "app_launched") {
          toast.success(`Ứng dụng ${app.name} đã được phát hiện và khởi chạy thành công!`);
        } else if (res.status === "ios_unregistered_scheme") {
          toast.info(`Đã tối ưu hóa cho ${app.name}: Mở bản Web an toàn không bị Safari báo lỗi.`);
        } else if (res.status === "web_fallback_used") {
          toast.info(`Đã chuyển hướng mở phiên bản Web của ${app.name}.`);
        } else {
          toast.warning(`Chưa phát hiện ứng dụng ${app.name} trên máy (Đã sẵn sàng đường dẫn Web/App Store).`);
        }
      },
    });
  };

  const handleSetPreference = (
    appId: string,
    pref: "auto" | "always_app" | "always_web"
  ) => {
    AppDiagnosticManager.setPreference(appId, pref);
    toast.success(`Đã cập nhật ưu tiên mở app cho ${appId}: ${pref.toUpperCase()}`);
    setResults(AppDiagnosticManager.getAllResults());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                Chẩn đoán & Kiểm tra App Liên Kết
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Xác minh sự tồn tại của ứng dụng di động & ngăn chặn lỗi Safari / Web Redirect
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-3">
          <div className="bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/30 p-3 rounded-xl text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <div className="space-y-1 text-[11px] leading-relaxed">
              <p>
                <strong>Trình kiểm tra thông minh:</strong> Nhấn nút <strong>"Chẩn đoán"</strong> để kiểm tra xem hệ điều hành điện thoại của bạn có tự động chuyển sang app tương ứng không.
              </p>
              <p>
                Trình duyệt sẽ đo phản hồi tiêu điểm (Focus/Blur Probe) để ghi nhớ trạng thái cài đặt app mà không gây tràn Safari popup hay chuyển hướng nhầm sang trang web.
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {APPS_LIST.map((app) => {
              const res = results[app.id];
              const currentPref = AppDiagnosticManager.getPreference(app.id);

              return (
                <div
                  key={app.id}
                  className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/60 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{app.icon}</span>
                      <div>
                        <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                          {app.name}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {app.scheme}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleTestApp(app)}
                      disabled={testingAppId === app.id}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      {testingAppId === app.id ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Đang đo...</span>
                        </>
                      ) : (
                        <>
                          <Smartphone className="w-3 h-3" />
                          <span>Chẩn đoán</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {app.description}
                  </p>

                  {app.notes && (
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-950/30 p-1.5 rounded border border-amber-200/50">
                      💡 {app.notes}
                    </p>
                  )}

                  {/* Status Banner if tested */}
                  {res && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/40 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        {res.status === "app_launched" ? (
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Đã phát hiện App</span>
                          </span>
                        ) : res.status === "ios_unregistered_scheme" ? (
                          <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400 font-medium">
                            <Globe className="w-3.5 h-3.5" />
                            <span>Tối ưu cho iOS (Mở Web)</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                            <span>Chưa mở app (Sẵn sàng Web/AppStore)</span>
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] text-slate-400">
                        {new Date(res.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}

                  {/* Preference control */}
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-slate-400">Ưu tiên mở:</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleSetPreference(app.id, "auto")}
                        className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                          currentPref === "auto"
                            ? "bg-blue-600 text-white"
                            : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        Tự động
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetPreference(app.id, "always_app")}
                        className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                          currentPref === "always_app"
                            ? "bg-blue-600 text-white"
                            : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        App
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetPreference(app.id, "always_web")}
                        className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                          currentPref === "always_web"
                            ? "bg-blue-600 text-white"
                            : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        Web
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
