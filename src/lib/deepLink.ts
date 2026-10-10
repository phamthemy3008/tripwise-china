/**
 * Utility for opening custom app deep-links safely on iOS/Android.
 * Prevents "Safari cannot open page because address is invalid" modal on iOS
 * and NEVER redirects or closes the active TripWise tab away.
 */

export interface OpenAppOptions {
  /** Custom URL scheme (e.g., "metroman://", "iosamap://", "weixin://", "alipays://") */
  schemeUrl: string;
  /** Android intent fallback string if applicable */
  androidIntent?: string;
  /** Fallback Web URL if app is not installed or opened */
  fallbackWebUrl: string;
  /** Optional App Store URL specifically for iOS */
  appStoreUrl?: string;
}

export function openAppScheme({
  schemeUrl,
  androidIntent,
  fallbackWebUrl,
  appStoreUrl,
}: OpenAppOptions): void {
  if (typeof window === "undefined") return;

  const ua = navigator.userAgent || "";
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: boolean }).MSStream;
  const isAndroid = /Android/.test(ua);

  if (isIOS) {
    // MetroMan iOS app does not register a custom URL scheme 'metroman://' in its Info.plist.
    // Calling 'metroman://' on iOS causes Safari to show 'address is invalid'.
    if (schemeUrl.startsWith("metroman://")) {
      if (fallbackWebUrl) {
        window.open(fallbackWebUrl, "_blank", "noopener,noreferrer");
      } else if (appStoreUrl) {
        window.open(appStoreUrl, "_blank", "noopener,noreferrer");
      }
      return;
    }

    // For recognized schemes (iosamap://, alipays://, weixin://, ctrip://), trigger iOS scheme prompt
    window.location.href = schemeUrl;
  } else if (isAndroid) {
    const targetUri = androidIntent || schemeUrl;
    try {
      window.location.href = targetUri;
    } catch {
      if (fallbackWebUrl) {
        window.open(fallbackWebUrl, "_blank", "noopener,noreferrer");
      }
    }
  } else {
    if (fallbackWebUrl) {
      window.open(fallbackWebUrl, "_blank", "noopener,noreferrer");
    }
  }
}
