/**
 * Utility for opening custom app deep-links safely on iOS/Android.
 * Handles iOS Safari, Android Chrome, and Web browser fallbacks gracefully
 * without getting blocked by mobile popup blockers.
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
  const isMobile = isIOS || isAndroid;

  // Desktop: direct open fallback web URL in new tab
  if (!isMobile) {
    if (fallbackWebUrl) {
      window.open(fallbackWebUrl, "_blank", "noopener,noreferrer");
    }
    return;
  }

  // Record initial time & visibility state
  const start = Date.now();
  let hasNavigated = false;

  const handleVisibilityChange = () => {
    if (document.hidden) {
      hasNavigated = true;
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange, { once: true });

  if (isAndroid) {
    // Android: Prefer intent URL if present, otherwise direct scheme
    const targetUri = androidIntent || schemeUrl;
    try {
      window.location.href = targetUri;
    } catch {
      if (fallbackWebUrl) {
        window.location.href = fallbackWebUrl;
      }
    }

    // Fallback timer if app isn't installed and page remains in focus
    setTimeout(() => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      const elapsed = Date.now() - start;
      if (!hasNavigated && !document.hidden && elapsed < 3000) {
        const target = fallbackWebUrl || appStoreUrl;
        if (target) {
          window.location.href = target;
        }
      }
    }, 2000);
  } else if (isIOS) {
    // iOS: Navigate directly to schemeUrl so Safari triggers native OS app prompt ("Open in 'App'?")
    try {
      window.location.href = schemeUrl;
    } catch {
      const target = fallbackWebUrl || appStoreUrl;
      if (target) {
        window.location.href = target;
      }
    }

    // Fallback timer if app isn't installed and user stays on page
    setTimeout(() => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      const elapsed = Date.now() - start;
      if (!hasNavigated && !document.hidden && elapsed < 3000) {
        const target = fallbackWebUrl || appStoreUrl;
        if (target) {
          window.location.href = target;
        }
      }
    }, 2200);
  } else {
    // Other mobile browsers
    if (fallbackWebUrl) {
      window.location.href = fallbackWebUrl;
    }
  }
}
