import React, { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";
import { TripDocument, ActivityEvent } from "./types/itinerary";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LoginScreen } from "./components/LoginScreen";
import {
  getUserTrips,
  saveUserTrip,
  deleteUserTrip,
  resetTripsToFullSample,
  upgradeTripsWithFullSample,
} from "./lib/firestoreTrips";
import { SAMPLE_TRIPS } from "./data/sampleTrips";
import { DayTabs, checkIsToday } from "./components/DayTabs";
import { TimelineCard } from "./components/TimelineCard";
import { HotelCard } from "./components/HotelCard";
import { FileDropzone } from "./components/FileDropzone";
import { ChinaSurvivalGuide } from "./components/ChinaSurvivalGuide";
import { SuggestActivitiesModal } from "./components/SuggestActivitiesModal";
import { WeatherWidget } from "./components/WeatherWidget";
import { ShareModal } from "./components/ShareModal";
import { fetchSharedTrip } from "./lib/shareService";
import {
  Compass,
  Plus,
  Share2,
  Download,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  FolderOpen,
  WifiOff,
  Printer,
  X,
  Sparkles,
  BookOpen,
  LogOut,
  User,
  Loader2,
  RefreshCw,
  Link2,
  ExternalLink,
  Eye,
  BookmarkPlus,
  AlertTriangle,
  ArrowLeft,
  Check,
  RotateCcw,
} from "lucide-react";

function MainApp() {
  const { user, loading: authLoading, signOut, signInWithGoogle, googleAccessToken } = useAuth();
  const [trips, setTrips] = useState<TripDocument[]>(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("tripwise_anonymous_trips");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const { upgraded, hasChanges } = upgradeTripsWithFullSample(parsed);
            if (hasChanges) {
              localStorage.setItem("tripwise_anonymous_trips", JSON.stringify(upgraded));
            }
            return upgraded;
          }
        } catch {}
      }
    }
    return SAMPLE_TRIPS;
  });
  const [currentTripId, setCurrentTripId] = useState<string>(SAMPLE_TRIPS[0]?.id || "");
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);
  const [viewMode, setViewMode] = useState<"single" | "all">("single");
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isTripsDrawerOpen, setIsTripsDrawerOpen] = useState<boolean>(false);
  const [isSurvivalGuideOpen, setIsSurvivalGuideOpen] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isLoadingTrips, setIsLoadingTrips] = useState<boolean>(false);
  const [isSyncingGoogleDoc, setIsSyncingGoogleDoc] = useState<boolean>(false);
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState<boolean>(false);

  // Sharing states
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [tripToShare, setTripToShare] = useState<TripDocument | null>(null);

  // Shared trip guest viewing states
  const [sharedTrip, setSharedTrip] = useState<TripDocument | null>(null);
  const [isLoadingSharedTrip, setIsLoadingSharedTrip] = useState<boolean>(false);
  const [sharedTripError, setSharedTripError] = useState<string | null>(null);
  const [shareParam, setShareParam] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("share") || params.get("trip") || null;
    }
    return null;
  });
  const isGuestMode = Boolean(shareParam);

  // Load shared trip if share parameter exists in URL (No login required!)
  useEffect(() => {
    if (!shareParam) {
      setSharedTrip(null);
      return;
    }

    let isMounted = true;
    setIsLoadingSharedTrip(true);
    setSharedTripError(null);

    fetchSharedTrip(shareParam)
      .then((data) => {
        if (!isMounted) return;
        if (data) {
          setSharedTrip(data);
          const todayMatch = data.days?.find((d) => checkIsToday(d.date))?.day_number;
          setSelectedDayNumber(todayMatch || 1);
        } else {
          setSharedTripError("Không tìm thấy lịch trình được chia sẻ hoặc liên kết đã hết hạn.");
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Error loading shared trip:", err);
        setSharedTripError("Lỗi kết nối khi tải lịch trình được chia sẻ.");
      })
      .finally(() => {
        if (isMounted) setIsLoadingSharedTrip(false);
      });

    return () => {
      isMounted = false;
    };
  }, [shareParam]);

  // Load user-specific trips whenever user changes
  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    setIsLoadingTrips(true);

    getUserTrips(user.uid)
      .then((userTrips) => {
        if (!isMounted) return;
        setTrips(userTrips);
        if (userTrips.length > 0 && !isGuestMode) {
          setCurrentTripId(userTrips[0].id || "");
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingTrips(false);
      });

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    return () => {
      isMounted = false;
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [user, isGuestMode]);

  // Active current trip: prioritize shared trip in guest mode, else active user trip
  const currentTrip =
    isGuestMode && sharedTrip
      ? sharedTrip
      : trips.find((t) => t.id === currentTripId) || trips[0];

  // Auto-detect which day corresponds to Today
  const detectedTodayNumber =
    currentTrip?.days?.find((d) => checkIsToday(d.date))?.day_number || null;

  // Auto-select Today on initial trip load (called unconditionally before returns)
  useEffect(() => {
    if (detectedTodayNumber) {
      setSelectedDayNumber(detectedTodayNumber);
    }
  }, [currentTripId, detectedTodayNumber]);

  // Loading state for shared trip in guest mode
  if (isGuestMode && isLoadingSharedTrip) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 text-center">
        <div className="w-14 h-14 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4 animate-pulse">
          <Compass className="w-7 h-7 animate-spin" />
        </div>
        <h2 className="text-base sm:text-lg font-bold text-white mb-1.5">
          Đang mở lịch trình được chia sẻ...
        </h2>
        <p className="text-xs text-slate-400 max-w-xs">
          Không yêu cầu đăng nhập • Đang tải thông tin địa điểm và hành trình
        </p>
      </div>
    );
  }

  // Error state for shared trip in guest mode
  if (isGuestMode && sharedTripError) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 text-center">
        <div className="max-w-sm w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Không tìm thấy lịch trình</h2>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">{sharedTripError}</p>
          <button
            type="button"
            onClick={() => {
              window.location.href = window.location.pathname;
            }}
            className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold transition-all shadow-md cursor-pointer"
          >
            Về Trang Chủ / Đăng Nhập
          </button>
        </div>
      </div>
    );
  }

  // If auth is still checking and NOT viewing a shared link
  if (authLoading && !isGuestMode) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-3" />
        <p className="text-xs text-slate-400 font-medium">Đang kiểm tra phiên đăng nhập...</p>
      </div>
    );
  }

  // Mandatory Login Gate ONLY applies if NOT viewing a shared trip
  if (!user && !isGuestMode) {
    return <LoginScreen />;
  }

  const activeDayPlan =
    currentTrip?.days?.find((d) => d.day_number === selectedDayNumber) ||
    currentTrip?.days?.[0];

  const handleSelectTrip = (id: string) => {
    setCurrentTripId(id);
    const target = trips.find((t) => t.id === id);
    const todayMatch = target?.days?.find((d) => checkIsToday(d.date))?.day_number;
    setSelectedDayNumber(todayMatch || 1);
    setIsTripsDrawerOpen(false);
    toast.info(
      todayMatch
        ? `Đã mở lịch trình - Tự động chọn Hôm nay (Ngày ${todayMatch})`
        : "Đã chuyển sang lịch trình mới"
    );
  };

  const handleAddEventToActiveDay = async (newEvent: ActivityEvent) => {
    if (!currentTrip || !activeDayPlan || !user) return;
    const updatedDays = currentTrip.days.map((day) => {
      if (day.day_number === activeDayPlan.day_number) {
        return {
          ...day,
          events: [...day.events, newEvent],
        };
      }
      return day;
    });

    const updatedTrip: TripDocument = {
      ...currentTrip,
      days: updatedDays,
    };

    try {
      const updatedTrips = await saveUserTrip(user.uid, updatedTrip);
      setTrips(updatedTrips);
    } catch {
      toast.error("Không thể lưu địa điểm mới.");
    }
  };

  const handleImportParsed = async (newTrip: TripDocument) => {
    if (!user) {
      toast.info("Vui lòng đăng nhập để lưu lịch trình vào tài khoản cá nhân!");
      return;
    }
    try {
      const updated = await saveUserTrip(user.uid, newTrip);
      setTrips(updated);
      setCurrentTripId(newTrip.id || "");
      setSelectedDayNumber(1);
      setIsImportModalOpen(false);
      toast.success("Đã lưu lịch trình vào tài khoản cá nhân!");
    } catch {
      toast.error("Không thể lưu lịch trình. Vui lòng thử lại!");
    }
  };

  const handleSelectSample = async (sampleId: string) => {
    if (!user) {
      toast.info("Vui lòng đăng nhập để thêm lịch trình mẫu vào tài khoản cá nhân!");
      return;
    }
    const sample = SAMPLE_TRIPS.find((s) => s.id === sampleId);
    if (sample) {
      const updated = await saveUserTrip(user.uid, sample);
      setTrips(updated);
      setCurrentTripId(sample.id || "");
      setSelectedDayNumber(1);
      setIsImportModalOpen(false);
      toast.success(`Đã thêm lịch trình: ${sample.trip_title}`);
    }
  };

  const handleResetAndClearCache = async () => {
    try {
      const freshTrips = await resetTripsToFullSample(user?.uid);
      setTrips(freshTrips);
      setCurrentTripId(freshTrips[0]?.id || "");
      setSelectedDayNumber(1);
      toast.success("Đã xóa cache & cập nhật đủ 16 ngày lịch trình!", {
        description: "Lịch trình du lịch Trung Quốc 16 ngày 15 đêm đã được cập nhật bản chuẩn mới nhất.",
      });
    } catch {
      toast.error("Lỗi khi làm mới cache. Vui lòng thử lại!");
    }
  };

  const handleDeleteCurrentTrip = async (tripId: string) => {
    if (!user) return;
    if (trips.length <= 1) {
      toast.warning("Bạn cần giữ lại ít nhất một lịch trình du lịch");
      return;
    }
    try {
      const updated = await deleteUserTrip(user.uid, tripId);
      setTrips(updated);
      setCurrentTripId(updated[0]?.id || "");
      setSelectedDayNumber(1);
      toast.success("Đã xóa lịch trình khỏi tài khoản");
    } catch {
      toast.error("Lỗi khi xóa lịch trình");
    }
  };

  const handleExportJSON = () => {
    if (!currentTrip) return;
    const blob = new Blob([JSON.stringify(currentTrip, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentTrip.trip_title.replace(/\s+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Đã tải xuống file JSON lịch trình!");
  };

  const handleShareSummary = () => {
    if (!currentTrip) return;
    const summary = `✈️ LỊCH TRÌNH DU LỊCH: ${currentTrip.trip_title} (${currentTrip.duration})\n\n${currentTrip.days
      .map(
        (d) =>
          `📅 Ngày ${d.day_number} (${d.city}): ${d.title}\n` +
          d.events
            .map(
              (e) => ` • [${e.time_slot}] ${e.activity_title} (${e.place_zh})`
            )
            .join("\n")
      )
      .join("\n\n")}`;

    navigator.clipboard
      .writeText(summary)
      .then(() => {
        toast.success("Đã sao chép tóm tắt lịch trình để gửi Zalo / WeChat!");
      })
      .catch(() => {
        toast.error("Không thể sao chép");
      });
  };

  const handleOpenShare = (tripToShareParam?: TripDocument) => {
    const target = tripToShareParam || currentTrip;
    if (!target) return;
    setTripToShare(target);
    setIsShareModalOpen(true);
  };

  const handleSaveSharedTripToAccount = async () => {
    if (!currentTrip) return;
    if (!user) {
      toast.info("Vui lòng đăng nhập với tài khoản Google để lưu lịch trình vào tài khoản cá nhân!");
      try {
        await signInWithGoogle();
      } catch {
        // ignore
      }
      return;
    }

    try {
      const clonedTrip: TripDocument = {
        ...currentTrip,
        id: `trip_${Date.now()}`,
        created_at: Date.now(),
        trip_title: currentTrip.trip_title.includes("(Bản sao)")
          ? currentTrip.trip_title
          : `${currentTrip.trip_title} (Bản sao)`,
      };
      const updated = await saveUserTrip(user.uid, clonedTrip);
      setTrips(updated);
      setCurrentTripId(clonedTrip.id || "");
      toast.success("Đã lưu bản sao lịch trình vào tài khoản cá nhân của bạn!", {
        description: "Bây giờ bạn có thể chỉnh sửa và quản lý lịch trình này độc lập.",
      });
      handleExitSharedView();
    } catch (err: any) {
      toast.error("Không thể lưu: " + err.message);
    }
  };

  const handleExitSharedView = () => {
    window.history.replaceState({}, document.title, window.location.pathname);
    setShareParam(null);
    setSharedTrip(null);
    if (trips.length > 0) {
      setCurrentTripId(trips[0].id || "");
    }
  };

  const handleSyncGoogleDoc = async () => {
    if (!currentTrip?.source_doc_url || !user) return;
    setIsSyncingGoogleDoc(true);
    const toastId = toast.loading("Đang đồng bộ nội dung mới nhất từ Google Docs...");
    try {
      const response = await fetch("/api/sync-google-doc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docUrl: currentTrip.source_doc_url,
          tripId: currentTrip.id,
          existingTrip: currentTrip,
          accessToken: googleAccessToken || undefined,
        }),
      });
      const resJson = await response.json();
      if (!response.ok || !resJson.success) {
        throw new Error(resJson.error || "Không thể đồng bộ Google Docs");
      }
      const updated = await saveUserTrip(user.uid, resJson.data);
      setTrips(updated);
      if (resJson.data?.id) {
        setCurrentTripId(resJson.data.id);
      }
      toast.success("Đồng bộ Google Docs thành công! Lịch trình đã được cập nhật.", {
        id: toastId,
      });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Lỗi khi đồng bộ Google Docs", { id: toastId });
    } finally {
      setIsSyncingGoogleDoc(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Header / App Bar */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-sm no-print">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 h-16 flex items-center justify-between gap-2">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 shadow-md shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white">
                  TripWise <span className="text-amber-400">China</span>
                </span>
                {isGuestMode ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <Eye className="w-3 h-3 text-amber-400" /> Xem Chia Sẻ
                  </span>
                ) : (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" /> Cloud Sync
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 -mt-0.5 hidden xs:block truncate max-w-[180px]">
                {user ? (user.email || user.displayName) : "Khách xem lịch trình"}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Survival Guide */}
            <button
              type="button"
              onClick={() => setIsSurvivalGuideOpen(true)}
              className="flex items-center gap-1.5 py-1.5 px-2.5 sm:px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              title="Cẩm nang du lịch Trung Quốc (Alipay, Amap, 12306, VPN)"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Cẩm Nang</span>
            </button>

            {/* Quick Share button in Header */}
            {currentTrip && (
              <button
                type="button"
                onClick={() => handleOpenShare(currentTrip)}
                className="flex items-center gap-1.5 py-1.5 px-2.5 sm:px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                title="Tạo liên kết chia sẻ cho người khác xem không cần đăng nhập"
              >
                <Share2 className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Chia Sẻ</span>
              </button>
            )}

            {/* Trips Switcher (only for logged-in users) */}
            {user && (
              <button
                type="button"
                onClick={() => setIsTripsDrawerOpen(true)}
                className="flex items-center gap-1.5 py-1.5 px-2.5 sm:px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                title="Quản lý các chuyến đi đã lưu"
              >
                <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden md:inline">Chuyến Đi ({trips.length})</span>
              </button>
            )}

            {/* New / Import Button */}
            {user ? (
              <button
                type="button"
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Nhập File / AI</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={signInWithGoogle}
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Tạo Lịch Trình</span>
              </button>
            )}

            {/* User Profile / Logout or Sign In */}
            <div className="relative flex items-center pl-1 sm:pl-2 border-l border-slate-800">
              {user ? (
                <button
                  type="button"
                  onClick={signOut}
                  className="flex items-center gap-1.5 p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                  title={`Đăng xuất (${user.email || user.displayName})`}
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || "Avatar"}
                      className="w-7 h-7 rounded-full border border-slate-700"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 border border-slate-700">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <LogOut className="w-3.5 h-3.5 hidden sm:block" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={signInWithGoogle}
                  className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-extrabold transition-all shadow-sm cursor-pointer"
                  title="Đăng nhập với Google để lưu và đồng bộ lịch trình"
                >
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <span>Đăng Nhập</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Guest Mode Banner (No login required view notification) */}
      {isGuestMode && currentTrip && (
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 px-3 sm:px-4 py-2 text-xs shadow-md no-print border-b border-amber-400/40">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-slate-950 text-amber-400 shrink-0">
                <Eye className="w-3.5 h-3.5" />
              </span>
              <div className="leading-tight">
                <span className="font-extrabold">Đang xem lịch trình chia sẻ:</span>{" "}
                <span className="font-semibold underline underline-offset-2">{currentTrip.trip_title}</span>
                <span className="hidden md:inline ml-2 text-slate-900/80 font-medium text-[11px]">
                  &bull; Xem đầy đủ không cần đăng nhập
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              {user ? (
                <button
                  type="button"
                  onClick={handleSaveSharedTripToAccount}
                  className="py-1 px-3 rounded-lg bg-slate-950 hover:bg-slate-900 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <BookmarkPlus className="w-3.5 h-3.5 text-amber-400" />
                  <span>Lưu bản sao vào tài khoản</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSaveSharedTripToAccount}
                  className="py-1 px-3 rounded-lg bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <BookmarkPlus className="w-3.5 h-3.5 text-amber-400" />
                  <span>Đăng nhập để lưu bản sao</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleOpenShare(currentTrip)}
                className="py-1 px-2.5 rounded-lg bg-white/20 hover:bg-white/30 text-slate-950 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                title="Lấy link hoặc mã QR để gửi tiếp cho người khác"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Chia sẻ link</span>
              </button>

              {user && (
                <button
                  type="button"
                  onClick={handleExitSharedView}
                  className="py-1 px-2 rounded-lg bg-slate-950/20 hover:bg-slate-950/30 text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Về lịch trình của tôi
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Offline Alert Banner if disconnected */}
      {!isOnline && (
        <div className="bg-amber-600 text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2 no-print">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Bạn đang ở chế độ Ngoại Tuyến (Offline). Lịch trình cá nhân đã lưu trên máy vẫn tra cứu bình thường!</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto pb-16">
        {isLoadingTrips ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-3" />
            <p className="text-xs text-slate-500">Đang đồng bộ lịch trình cá nhân...</p>
          </div>
        ) : currentTrip ? (
          <div>
            {/* Trip Hero Banner */}
            <div className="bg-gradient-to-b from-slate-900 to-slate-800 text-white px-4 pt-6 pb-5 border-b border-slate-800 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      <Clock className="w-3 h-3" />
                      {currentTrip.duration}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      <Calendar className="w-3 h-3" />
                      {currentTrip.days.length} ngày lịch trình
                    </span>
                  </div>

                  <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight">
                    {currentTrip.trip_title}
                  </h1>
                </div>

                {/* Quick actions for current trip */}
                <div className="flex items-center gap-2 shrink-0 no-print">
                  <button
                    type="button"
                    onClick={() => handleOpenShare(currentTrip)}
                    className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                    title="Tạo liên kết gửi cho người khác xem không cần đăng nhập"
                  >
                    <Share2 className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span className="text-[11px]">Chia sẻ link</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportJSON}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Tải file JSON dự phòng"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-[11px]">Xuất file</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="In lịch trình / Lưu PDF"
                  >
                    <Printer className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[11px]">In / PDF</span>
                  </button>
                </div>
              </div>

              {/* Google Docs Source & Live Sync Bar */}
              {currentTrip.source_doc_url && (
                <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between gap-3 flex-wrap no-print">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold">
                      <Link2 className="w-3.5 h-3.5 text-blue-400" />
                      Nguồn: Google Docs
                    </span>
                    {currentTrip.last_synced_at && (
                      <span className="text-[11px] text-slate-400 hidden sm:inline">
                        Đã đồng bộ: {new Date(currentTrip.last_synced_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={currentTrip.source_doc_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                      <span>Mở Google Doc</span>
                    </a>

                    <button
                      type="button"
                      disabled={isSyncingGoogleDoc}
                      onClick={handleSyncGoogleDoc}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                      title="Tải lại nội dung mới nhất từ Google Docs"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncingGoogleDoc ? "animate-spin" : ""}`} />
                      <span>{isSyncingGoogleDoc ? "Đang đồng bộ..." : "Đồng bộ từ Google Doc"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Outdated Trip Warning Banner (if phone stored old 2-day version in cache) */}
            {currentTrip.days.length < 16 && (
              <div className="mb-4 p-3 sm:p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between gap-3 text-xs shadow-md">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 animate-pulse" />
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                      Thiết bị đang lưu bản cache cũ ({currentTrip.days.length} ngày)
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Lịch trình chuẩn có đủ 16 ngày (14/11 – 29/11). Bấm để tải lại bản đầy đủ.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleResetAndClearCache}
                  className="shrink-0 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Tải đủ 16 ngày</span>
                </button>
              </div>
            )}

            {/* Sticky Day Tabs Navigation */}
            <DayTabs
              days={currentTrip.days}
              selectedDay={selectedDayNumber}
              todayDayNumber={detectedTodayNumber}
              viewMode={viewMode}
              onToggleViewMode={setViewMode}
              onResetCache={handleResetAndClearCache}
              onSelectDay={(dayNum) => {
                setSelectedDayNumber(dayNum);
                if (viewMode === "all") {
                  const targetEl = document.getElementById(`day-section-${dayNum}`);
                  if (targetEl) {
                    targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
                    return;
                  }
                }
                window.scrollTo({ top: 120, behavior: "smooth" });
              }}
            />

            {/* View Mode: ALL DAYS CONTINUOUS VIEW (Cực kỳ tiện lợi trên iPhone / Mobile) */}
            {viewMode === "all" ? (
              <div className="px-3 sm:px-4 pt-5 space-y-10">
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between text-xs text-amber-900 dark:text-amber-300">
                  <span>
                    Đang hiển thị <strong>toàn bộ {currentTrip.days.length} ngày</strong> lịch trình. Bấm thẻ ngày ở trên để nhảy nhanh đến ngày đó.
                  </span>
                  <button
                    type="button"
                    onClick={() => setViewMode("single")}
                    className="font-bold underline text-amber-600 dark:text-amber-400 hover:text-amber-500 shrink-0 ml-2 cursor-pointer"
                  >
                    Xem từng ngày
                  </button>
                </div>

                {currentTrip.days.map((dayPlan) => (
                  <section
                    key={dayPlan.day_number}
                    id={`day-section-${dayPlan.day_number}`}
                    className="scroll-mt-28 pb-8 border-b border-slate-200 dark:border-slate-800 last:border-b-0 space-y-4"
                  >
                    {/* Day Header */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 dark:border-slate-800">
                      <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
                        <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          Ngày {dayPlan.day_number}: {dayPlan.date || ""}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg">
                          <MapPin className="w-3.5 h-3.5 text-red-500" />
                          {dayPlan.city}
                        </span>
                      </div>

                      <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
                        {dayPlan.title}
                      </h2>
                    </div>

                    {/* Weather & Hotel */}
                    <WeatherWidget
                      city={dayPlan.city}
                      dayNumber={dayPlan.day_number}
                      date={dayPlan.date}
                    />
                    {dayPlan.hotel && <HotelCard hotel={dayPlan.hotel} />}

                    {/* Timeline Events Section */}
                    <div>
                      <div className="flex items-center justify-between mb-3 px-1">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Lịch trình Ngày {dayPlan.day_number} ({dayPlan.events.length} hoạt động)
                        </h3>
                      </div>

                      <div className="space-y-1">
                        {dayPlan.events.map((event, idx) => (
                          <TimelineCard
                            key={idx}
                            event={event}
                            index={idx}
                            cityName={dayPlan.city}
                            hotel={dayPlan.hotel}
                            previousEvent={idx > 0 ? dayPlan.events[idx - 1] : undefined}
                          />
                        ))}
                      </div>
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              /* View Mode: SINGLE ACTIVE DAY */
              activeDayPlan && (
                <div className="px-3 sm:px-4 pt-5">
                  {/* Active Day Header */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 dark:border-slate-800 mb-4">
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {activeDayPlan.date || `Ngày ${activeDayPlan.day_number}`}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg">
                        <MapPin className="w-3.5 h-3.5 text-red-500" />
                        {activeDayPlan.city}
                      </span>
                    </div>

                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
                      {activeDayPlan.title}
                    </h2>
                  </div>

                  {/* Real-time Weather Widget for active day's city */}
                  <WeatherWidget
                    city={activeDayPlan.city}
                    dayNumber={activeDayPlan.day_number}
                    date={activeDayPlan.date}
                  />

                  {/* Hotel Card if hotel info is present */}
                  {activeDayPlan.hotel && <HotelCard hotel={activeDayPlan.hotel} />}

                  {/* Timeline Events Section */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-4 px-1 flex-wrap gap-2">
                      <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Lịch trình chi tiết trong ngày ({activeDayPlan.events.length} hoạt động)
                      </h3>

                      <button
                        type="button"
                        onClick={() => setIsSuggestModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 text-xs font-black shadow-xs hover:brightness-105 transition-all cursor-pointer active:scale-95 no-print"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Gợi ý thêm điểm đến</span>
                      </button>
                    </div>

                    <div className="space-y-1">
                      {activeDayPlan.events.map((event, idx) => (
                        <TimelineCard
                          key={idx}
                          event={event}
                          index={idx}
                          cityName={activeDayPlan.city}
                          hotel={activeDayPlan.hotel}
                          previousEvent={idx > 0 ? activeDayPlan.events[idx - 1] : undefined}
                        />
                      ))}
                    </div>

                    {/* Add more activity prompt banner at bottom */}
                    <div className="mt-4 pt-1 no-print">
                      <button
                        type="button"
                        onClick={() => setIsSuggestModalOpen(true)}
                        className="w-full p-4 rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-700/60 bg-amber-50/50 dark:bg-amber-950/15 hover:bg-amber-100/60 dark:hover:bg-amber-950/30 text-amber-900 dark:text-amber-200 transition-all text-xs font-bold flex items-center justify-center gap-2 cursor-pointer group"
                      >
                        <Sparkles className="w-4 h-4 text-amber-500 group-hover:rotate-12 transition-transform" />
                        <span>Bạn muốn khám phá thêm điểm nào tại <strong>{activeDayPlan.city}</strong>? Bấm để AI gợi ý!</span>
                      </button>
                    </div>
                  </div>

                  {/* Day Navigation Buttons */}
                  <div className="flex items-center justify-between gap-3 pt-6 pb-8 border-t border-slate-200 dark:border-slate-800 mt-6 no-print">
                    <button
                      type="button"
                      disabled={activeDayPlan.day_number <= 1}
                      onClick={() => {
                        setSelectedDayNumber((prev) => Math.max(1, prev - 1));
                        window.scrollTo({ top: 120, behavior: "smooth" });
                      }}
                      className="flex-1 py-3 px-4 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Ngày trước</span>
                    </button>

                    <span className="text-xs font-mono font-bold text-slate-400">
                      {activeDayPlan.day_number} / {currentTrip.days.length}
                    </span>

                    <button
                      type="button"
                      disabled={activeDayPlan.day_number >= currentTrip.days.length}
                      onClick={() => {
                        setSelectedDayNumber((prev) =>
                          Math.min(currentTrip.days.length, prev + 1)
                        );
                        window.scrollTo({ top: 120, behavior: "smooth" });
                      }}
                      className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-white dark:text-slate-950 text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                    >
                      <span>Ngày tiếp theo</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          /* Empty State if no trips */
          <div className="p-8 text-center max-w-md mx-auto my-12">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-4">
              <Compass className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Chưa có lịch trình nào được lưu
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Tải lên file Word (.docx), Markdown hoặc dán văn bản để Gemini AI trích xuất lịch trình thông minh.
            </p>
            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="py-3 px-6 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
            >
              Nhập Lịch Trình Ngay
            </button>
          </div>
        )}
      </main>

      {/* Floating Bottom Quick Bar for Mobile */}
      <div className="fixed bottom-3 inset-x-0 mx-auto max-w-sm px-3 z-30 sm:hidden no-print">
        <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-2 shadow-2xl border border-slate-700/80 flex items-center justify-around">
          <button
            type="button"
            onClick={() => setIsSurvivalGuideOpen(true)}
            className="flex flex-col items-center gap-1 text-[10px] text-amber-400 p-1.5 font-medium"
          >
            <BookOpen className="w-4 h-4" />
            <span>Cẩm Nang</span>
          </button>

          <button
            type="button"
            onClick={() => setIsTripsDrawerOpen(true)}
            className="flex flex-col items-center gap-1 text-[10px] text-slate-300 p-1.5 font-medium"
          >
            <FolderOpen className="w-4 h-4" />
            <span>Chuyến Đi</span>
          </button>

          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Nhập Mới</span>
          </button>
        </div>
      </div>

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsImportModalOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <FileDropzone
              onParsedSuccess={handleImportParsed}
              onSelectSample={handleSelectSample}
            />
          </div>
        </div>
      )}

      {/* Trips Drawer / Modal */}
      {isTripsDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Lịch Trình Của Bạn ({trips.length})
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Tài khoản: {user ? (user.email || user.displayName) : "Chưa đăng nhập"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsTripsDrawerOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto space-y-3">
              {trips.map((trip) => {
                const isSelected = trip.id === currentTripId;
                return (
                  <div
                    key={trip.id}
                    onClick={() => handleSelectTrip(trip.id || "")}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-amber-500/10 border-amber-500/50 shadow-xs"
                        : "bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                          {trip.duration}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          &bull; {trip.days.length} ngày
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {trip.trip_title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenShare(trip);
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer"
                        title="Chia sẻ liên kết lịch trình này"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCurrentTrip(trip.id || "");
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                        title="Xóa lịch trình này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setIsTripsDrawerOpen(false);
                  setIsImportModalOpen(true);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Lịch Trình Mới</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* China Survival Guide Modal */}
      <ChinaSurvivalGuide
        isOpen={isSurvivalGuideOpen}
        onClose={() => setIsSurvivalGuideOpen(false)}
      />

      {/* Suggest Activities Modal */}
      {activeDayPlan && (
        <SuggestActivitiesModal
          isOpen={isSuggestModalOpen}
          onClose={() => setIsSuggestModalOpen(false)}
          city={activeDayPlan.city}
          dayNumber={activeDayPlan.day_number}
          existingPlaces={activeDayPlan.events.map((e) => e.place_name)}
          onAddEventToDay={handleAddEventToActiveDay}
        />
      )}

      {/* Share Itinerary Modal */}
      {tripToShare && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          trip={tripToShare}
        />
      )}

      {/* Global Toast Container */}
      <Toaster position="top-center" richColors />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
