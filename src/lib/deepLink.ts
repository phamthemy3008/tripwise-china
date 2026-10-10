/**
 * Utility for opening custom app deep-links safely on iOS/Android.
 * On iOS Safari, setting `window.location.href = customScheme` throws a fatal
 * "Safari cannot open page because address is invalid" popup if the app is not installed.
 *
 * This utility uses a hidden iframe trick on iOS so Safari silently suppresses
 * unregistered scheme errors, and seamlessly falls back to Web or App Store.
 */

export interface OpenAppOptions {
  /** Custom URL scheme (e.g., "metroman://", "weixin://", "alipays://") */
  schemeUrl: string;
  /** Android intent fallback if applicable */
  androidIntent?: string;
  /** Fallback Web URL or App Store URL if app is not installed or opened */
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
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isAndroid = /Android/.test(ua);
  const isMobile = isIOS || isAndroid;

  // Desktop: direct open web URL
  if (!isMobile) {
    if (fallbackWebUrl) {
      window.open(fallbackWebUrl, "_blank", "noopener,noreferrer");
    }
    return;
  }

  if (isIOS) {
    // Hidden iframe trick on iOS Safari to prevent "Safari cannot open page because address is invalid" modal
    const start = Date.now();
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = schemeUrl;
    document.body.appendChild(iframe);

    // Timeout to check if user switched to the native app or stayed on page
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
      // If user is still on the web page after 1.2s, app was likely not opened
      const elapsed = Date.now() - start;
      if (elapsed < 2200) {
        const targetUrl = fallbackWebUrl || appStoreUrl;
        if (targetUrl) {
          window.open(targetUrl, "_blank", "noopener,noreferrer");
        }
      }
    }, 1200);
  } else if (isAndroid) {
    // Android intent handling
    try {
      window.location.href = schemeUrl;
    } catch {
      if (androidIntent) {
        window.location.href = androidIntent;
      }
    }
    // Fallback if app doesn't launch
    setTimeout(() => {
      if (fallbackWebUrl) {
        window.open(fallbackWebUrl, "_blank", "noopener,noreferrer");
      }
    }, 1500);
  } else {
    if (fallbackWebUrl) {
      window.open(fallbackWebUrl, "_blank", "noopener,noreferrer");
    }
  }
}
