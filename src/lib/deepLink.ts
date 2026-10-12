/**
 * Deep Link Diagnostic Utility & Custom URL Scheme Handler Wrapper
 * 
 * Verifies app launch behavior using window focus/visibility probes
 * to detect native app presence before resorting to web fallbacks,
 * avoiding invalid Safari popups and unwanted tab redirects.
 */

export interface OpenAppOptions {
  /** Identifier of the target app (e.g. "metroman", "amap", "alipay", "didi", "12306", "wechat", "trip") */
  appName?: string;
  /** Custom URL scheme (e.g., "metroman://", "iosamap://", "weixin://", "alipays://") */
  schemeUrl: string;
  /** Android intent fallback string if applicable */
  androidIntent?: string;
  /** Fallback Web URL if app is not installed or opened */
  fallbackWebUrl: string;
  /** Optional App Store URL specifically for iOS */
  appStoreUrl?: string;
  /** Callback fired when app launch attempt completes with diagnostic result */
  onDiagnosticResult?: (result: AppDiagnosticResult) => void;
  /** Callback when app is detected as not installed or scheme unhandled */
  onAppNotFound?: () => void;
}

export interface AppDiagnosticResult {
  appName: string;
  scheme: string;
  status: 'app_launched' | 'app_not_found' | 'ios_unregistered_scheme' | 'web_fallback_used';
  timestamp: number;
  platform: 'ios' | 'android' | 'desktop';
  durationMs: number;
  message: string;
}

const STORAGE_KEY_DIAGNOSTICS = "tripwise_app_diagnostics";
const STORAGE_KEY_PREFERENCES = "tripwise_app_preferences";

/**
 * Diagnostic Manager for Third-Party Travel Apps
 */
export class AppDiagnosticManager {
  private static resultsCache: Record<string, AppDiagnosticResult> = {};

  static init() {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_DIAGNOSTICS);
      if (stored) {
        this.resultsCache = JSON.parse(stored);
      }
    } catch {
      // Ignore JSON parse errors
    }
  }

  static saveResult(result: AppDiagnosticResult) {
    this.resultsCache[result.appName] = result;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY_DIAGNOSTICS, JSON.stringify(this.resultsCache));
      } catch {
        // Ignore storage errors
      }
    }
  }

  static getResult(appName: string): AppDiagnosticResult | null {
    return this.resultsCache[appName] || null;
  }

  static getAllResults(): Record<string, AppDiagnosticResult> {
    return { ...this.resultsCache };
  }

  static getPreference(appName: string): 'auto' | 'always_app' | 'always_web' {
    if (typeof window === "undefined") return 'auto';
    try {
      const prefs = JSON.parse(localStorage.getItem(STORAGE_KEY_PREFERENCES) || "{}");
      return prefs[appName] || 'auto';
    } catch {
      return 'auto';
    }
  }

  static setPreference(appName: string, pref: 'auto' | 'always_app' | 'always_web') {
    if (typeof window === "undefined") return;
    try {
      const prefs = JSON.parse(localStorage.getItem(STORAGE_KEY_PREFERENCES) || "{}");
      prefs[appName] = pref;
      localStorage.setItem(STORAGE_KEY_PREFERENCES, JSON.stringify(prefs));
    } catch {
      // Ignore
    }
  }
}

// Initialize on module load
AppDiagnosticManager.init();

/**
 * Primary Wrapper for Launching Custom App Schemes with Presence Diagnostics
 */
export function openAppScheme({
  appName = "app",
  schemeUrl,
  androidIntent,
  fallbackWebUrl,
  appStoreUrl,
  onDiagnosticResult,
  onAppNotFound,
}: OpenAppOptions): void {
  if (typeof window === "undefined") return;

  const ua = navigator.userAgent || "";
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: boolean }).MSStream;
  const isAndroid = /Android/.test(ua);
  const platform = isIOS ? 'ios' : isAndroid ? 'android' : 'desktop';

  const userPref = AppDiagnosticManager.getPreference(appName);

  // If user explicitly chose always web
  if (userPref === 'always_web') {
    if (fallbackWebUrl) {
      window.open(fallbackWebUrl, "_blank", "noopener,noreferrer");
    }
    const result: AppDiagnosticResult = {
      appName,
      scheme: schemeUrl,
      status: 'web_fallback_used',
      timestamp: Date.now(),
      platform,
      durationMs: 0,
      message: "Người dùng chọn ưu tiên mở bản Web",
    };
    AppDiagnosticManager.saveResult(result);
    onDiagnosticResult?.(result);
    return;
  }

  // --- iOS SAFARI HANDLING ---
  if (isIOS) {
    // Special diagnostic check for schemes known not to be registered in iOS Info.plist (e.g. MetroMan)
    if (schemeUrl.startsWith("metroman://")) {
      const result: AppDiagnosticResult = {
        appName,
        scheme: schemeUrl,
        status: 'ios_unregistered_scheme',
        timestamp: Date.now(),
        platform: 'ios',
        durationMs: 0,
        message: "MetroMan trên iOS không đăng ký URI scheme. Chuyển sang Web/App Store an toàn.",
      };
      AppDiagnosticManager.saveResult(result);
      onDiagnosticResult?.(result);

      if (fallbackWebUrl) {
        window.open(fallbackWebUrl, "_blank", "noopener,noreferrer");
      } else if (appStoreUrl) {
        window.open(appStoreUrl, "_blank", "noopener,noreferrer");
      }
      return;
    }

    // Diagnostic Probe: Monitor page focus/visibility
    let appOpened = false;
    const startTime = Date.now();

    const handleBlurOrHide = () => {
      appOpened = true;
    };

    window.addEventListener("blur", handleBlurOrHide, { once: true });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        appOpened = true;
      }
    }, { once: true });

    // Attempt trigger
    window.location.href = schemeUrl;

    setTimeout(() => {
      window.removeEventListener("blur", handleBlurOrHide);
      const durationMs = Date.now() - startTime;

      if (appOpened) {
        const result: AppDiagnosticResult = {
          appName,
          scheme: schemeUrl,
          status: 'app_launched',
          timestamp: Date.now(),
          platform: 'ios',
          durationMs,
          message: "Ứng dụng đã phản hồi và khởi chạy thành công trên iOS",
        };
        AppDiagnosticManager.saveResult(result);
        onDiagnosticResult?.(result);
      } else {
        const result: AppDiagnosticResult = {
          appName,
          scheme: schemeUrl,
          status: 'app_not_found',
          timestamp: Date.now(),
          platform: 'ios',
          durationMs,
          message: "Ứng dụng chưa mở hoặc chưa được cài đặt trên thiết bị",
        };
        AppDiagnosticManager.saveResult(result);
        onDiagnosticResult?.(result);

        if (onAppNotFound) {
          onAppNotFound();
        }
      }
    }, 1500);

    return;
  }

  // --- ANDROID HANDLING ---
  if (isAndroid) {
    const targetUri = androidIntent || schemeUrl;
    let appOpened = false;
    const startTime = Date.now();

    const handleBlurOrHide = () => {
      appOpened = true;
    };

    window.addEventListener("blur", handleBlurOrHide, { once: true });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        appOpened = true;
      }
    }, { once: true });

    try {
      window.location.href = targetUri;
    } catch {
      // Fallback
    }

    setTimeout(() => {
      window.removeEventListener("blur", handleBlurOrHide);
      const durationMs = Date.now() - startTime;

      if (appOpened) {
        const result: AppDiagnosticResult = {
          appName,
          scheme: targetUri,
          status: 'app_launched',
          timestamp: Date.now(),
          platform: 'android',
          durationMs,
          message: "Ứng dụng đã phản hồi và khởi chạy thành công trên Android",
        };
        AppDiagnosticManager.saveResult(result);
        onDiagnosticResult?.(result);
      } else {
        const result: AppDiagnosticResult = {
          appName,
          scheme: targetUri,
          status: 'app_not_found',
          timestamp: Date.now(),
          platform: 'android',
          durationMs,
          message: "Ứng dụng chưa được cài đặt trên thiết bị Android",
        };
        AppDiagnosticManager.saveResult(result);
        onDiagnosticResult?.(result);

        if (onAppNotFound) {
          onAppNotFound();
        } else if (fallbackWebUrl) {
          window.open(fallbackWebUrl, "_blank", "noopener,noreferrer");
        }
      }
    }, 1500);

    return;
  }

  // --- DESKTOP BROWSER ---
  if (fallbackWebUrl) {
    window.open(fallbackWebUrl, "_blank", "noopener,noreferrer");
  }
  const result: AppDiagnosticResult = {
    appName,
    scheme: schemeUrl,
    status: 'web_fallback_used',
    timestamp: Date.now(),
    platform: 'desktop',
    durationMs: 0,
    message: "Trình duyệt máy tính: Đã mở phiên bản Web trên tab mới",
  };
  AppDiagnosticManager.saveResult(result);
  onDiagnosticResult?.(result);
}
