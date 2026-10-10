import React, { useState } from "react";
import {
  Utensils,
  Search,
  Globe,
  Store,
  MapPin,
  Sparkles,
  Navigation,
  Compass,
  Star,
  Tag,
  Loader2,
  ChevronDown,
  ChevronUp,
  Info,
  Check,
  Copy,
} from "lucide-react";
import { DishItem, RestaurantRecommendation } from "../types/itinerary";
import { CopyChip } from "./CopyChip";
import { toast } from "sonner";
import { openAppScheme } from "../lib/deepLink";

interface DishExplorerProps {
  dishes: DishItem[];
  cityName?: string;
  placeName?: string;
  placeZh?: string;
}

export const DishExplorer: React.FC<DishExplorerProps> = ({
  dishes,
  cityName,
  placeName,
  placeZh,
}) => {
  const [loadingDishIdx, setLoadingDishIdx] = useState<number | null>(null);
  const [extraRestaurantsByDish, setExtraRestaurantsByDish] = useState<
    Record<number, RestaurantRecommendation[]>
  >({});
  const [showGlobalAiSuggester, setShowGlobalAiSuggester] = useState<boolean>(false);
  const [globalAiLoading, setGlobalAiLoading] = useState<boolean>(false);
  const [globalRestaurants, setGlobalRestaurants] = useState<RestaurantRecommendation[]>([]);
  const [copiedInfo, setCopiedInfo] = useState<string | null>(null);

  if (!dishes || dishes.length === 0) return null;

  const openImageSearch = (keyword: string, provider: "google" | "baidu") => {
    const encoded = encodeURIComponent(keyword);
    const url =
      provider === "google"
        ? `https://www.google.com/search?tbm=isch&q=${encoded}`
        : `https://image.baidu.com/search/index?tn=baiduimage&word=${encoded}`;

    toast.info(
      provider === "google"
        ? "Đang mở Google Images..."
        : "Đang mở Baidu Images (hoạt động tốt khi không có VPN)...",
      { duration: 1800 }
    );
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const openAmapSearch = (keyword: string) => {
    const encoded = encodeURIComponent(keyword);

    if (navigator.clipboard) {
      navigator.clipboard.writeText(keyword).catch(() => {});
    }

    const iosPoiUrl = `iosamap://poi?sourceApplication=tripwise&name=${encoded}&keywords=${encoded}&dev=0`;
    const androidIntentUrl = `intent://poi?sourceApplication=tripwise&name=${encoded}&keywords=${encoded}&dev=0#Intent;scheme=androidamap;package=com.autonavi.minimap;end`;
    const webUrl = `https://uri.amap.com/search?keyword=${encoded}`;

    toast.info("Đang mở Bản đồ Amap...", {
      description: `"${keyword}" (Đã tự động sao chép tên chữ Hán)`,
      duration: 3500,
      action: {
        label: "Mở trên Web",
        onClick: () => window.open(webUrl, "_blank", "noopener,noreferrer"),
      },
    });

    openAppScheme({
      schemeUrl: iosPoiUrl,
      androidIntent: androidIntentUrl,
      fallbackWebUrl: webUrl,
      appStoreUrl: "https://apps.apple.com/app/amap-map-location-navigation/id461703219",
    });
  };

  const openDianpingSearch = (keyword: string) => {
    const encoded = encodeURIComponent(keyword);

    if (navigator.clipboard) {
      navigator.clipboard.writeText(keyword).catch(() => {});
    }

    const dianpingSchemeUrl = `dianping://searchshoplist?keyword=${encoded}`;
    const androidIntentUrl = `intent://searchshoplist?keyword=${encoded}#Intent;scheme=dianping;package=com.dianping.v1;end`;
    const mobileWebUrl = `https://m.dianping.com/search/keyword/0/0_${encoded}`;

    toast.info("Đang mở Dianping (Đại Chúng Điểm Bình)...", {
      description: `"${keyword}" (Đã tự động sao chép tên chữ Hán)`,
      duration: 4000,
      action: {
        label: "Mở trên Web",
        onClick: () => window.open(mobileWebUrl, "_blank", "noopener,noreferrer"),
      },
    });

    openAppScheme({
      schemeUrl: dianpingSchemeUrl,
      androidIntent: androidIntentUrl,
      fallbackWebUrl: mobileWebUrl,
      appStoreUrl: "https://apps.apple.com/app/dianping-find-food-deals/id351421652",
    });
  };

  const copyTaxiNote = async (restaurantName: string, nameZh: string, address?: string) => {
    const textToCopy = `${nameZh} (${address || "请带我去这里"})`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedInfo(nameZh);
      toast.success(`Đã sao chép để đưa tài xế taxi:`, {
        description: textToCopy,
        duration: 3500,
        position: "top-center",
      });
      setTimeout(() => setCopiedInfo(null), 2500);
    } catch {
      toast.error("Không thể tự động sao chép. Vui lòng thử lại!");
    }
  };

  // Fetch AI recommended restaurants for a single dish
  const handleFetchRestaurantsForDish = async (dish: DishItem, index: number) => {
    if (loadingDishIdx !== null) return;
    setLoadingDishIdx(index);
    const toastId = toast.loading(`Đang tìm quán ăn ngon cho món "${dish.dish_name_vn}"...`);
    try {
      const response = await fetch("/api/suggest-restaurants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dishName: dish.dish_name_vn,
          dishZh: dish.dish_name_zh,
          city: cityName || "Trung Quốc",
          placeName: placeName,
          placeZh: placeZh,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Không thể lấy gợi ý quán ăn");
      }

      setExtraRestaurantsByDish((prev) => ({
        ...prev,
        [index]: result.data || [],
      }));

      toast.success(`Đã tìm thấy ${result.data?.length || 0} quán ăn gợi ý uy tín!`, {
        id: toastId,
        duration: 2500,
      });
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi tìm quán ăn", { id: toastId });
    } finally {
      setLoadingDishIdx(null);
    }
  };

  // Fetch AI recommended restaurants for the overall place / city
  const handleFetchGlobalRestaurants = async () => {
    if (globalAiLoading) return;
    setGlobalAiLoading(true);
    setShowGlobalAiSuggester(true);
    const toastId = toast.loading(`Đang tìm các quán ăn đặc sản quanh ${placeName || cityName || "khu vực này"}...`);
    try {
      const response = await fetch("/api/suggest-restaurants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: cityName || "Trung Quốc",
          placeName: placeName,
          placeZh: placeZh,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Không thể lấy gợi ý quán ăn");
      }

      setGlobalRestaurants(result.data || []);
      toast.success(`Đã tìm thấy ${result.data?.length || 0} quán ăn bản địa nổi bật!`, {
        id: toastId,
        duration: 2500,
      });
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi tìm quán ăn", { id: toastId });
    } finally {
      setGlobalAiLoading(false);
    }
  };

  // Helper to extract restaurant info from dish object (supports both structured and flat properties)
  const getDishRestaurant = (dish: DishItem): RestaurantRecommendation | null => {
    if (dish.restaurant && dish.restaurant.name_vn) {
      return dish.restaurant;
    }
    if (dish.restaurant_name) {
      return {
        name_vn: dish.restaurant_name,
        name_zh: dish.restaurant_zh || dish.dish_name_zh,
        address_hint: dish.restaurant_address,
        amap_query: dish.restaurant_zh || dish.restaurant_name,
        price_range: dish.price_range || "~40 - 70 ¥/người",
        note: dish.restaurant_note,
      };
    }
    return null;
  };

  return (
    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-2 mb-2.5 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-400">
          <Utensils className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" />
          <span>Gợi ý ẩm thực &amp; Quán ăn bản địa:</span>
        </div>

        <button
          type="button"
          onClick={handleFetchGlobalRestaurants}
          disabled={globalAiLoading}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 text-[11px] font-semibold transition-all cursor-pointer active:scale-95 no-print"
          title="Dùng AI tìm thêm quán ăn đặc sản quanh điểm đến này"
        >
          {globalAiLoading ? (
            <Loader2 className="w-3 h-3 text-amber-600 animate-spin" />
          ) : (
            <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
          )}
          <span>Gợi ý thêm quán ăn AI</span>
        </button>
      </div>

      {/* Global AI Restaurant Suggestions Banner if loaded */}
      {showGlobalAiSuggester && globalRestaurants.length > 0 && (
        <div className="mb-3 p-3 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-500/10 dark:from-amber-950/40 dark:to-orange-950/20 rounded-xl border border-amber-300 dark:border-amber-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300">
              <Store className="w-3.5 h-3.5 text-amber-600" />
              <span>Quán ăn đề xuất quanh {placeName || cityName || "khu vực"}:</span>
            </div>
            <button
              type="button"
              onClick={() => setShowGlobalAiSuggester(false)}
              className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            >
              Thu gọn
            </button>
          </div>

          <div className="space-y-2">
            {globalRestaurants.map((resto, rIdx) => (
              <div
                key={rIdx}
                className="bg-white/90 dark:bg-slate-900/80 p-2.5 rounded-lg border border-amber-200/80 dark:border-amber-900/60 text-xs shadow-2xs space-y-1.5"
              >
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {resto.name_vn}
                    </span>
                    <CopyChip text={resto.name_zh} highlight />
                  </div>
                  <div className="flex items-center gap-1.5">
                    {resto.rating && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                        <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                        {resto.rating}
                      </span>
                    )}
                    {resto.price_range && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200/60 dark:border-emerald-800/40">
                        {resto.price_range}
                      </span>
                    )}
                  </div>
                </div>

                {resto.address_hint && (
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                    <span>{resto.address_hint}</span>
                  </p>
                )}

                {resto.recommended_dish && (
                  <p className="text-[11px] text-amber-800 dark:text-amber-300">
                    <span className="font-semibold">Món đặc sắc:</span> {resto.recommended_dish}
                  </p>
                )}

                {resto.specialty_note && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                    💡 {resto.specialty_note}
                  </p>
                )}

                <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                  <button
                    type="button"
                    onClick={() => openAmapSearch(resto.amap_query || resto.name_zh)}
                    className="flex-1 min-w-[90px] flex items-center justify-center gap-1 py-1 px-2 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-700 dark:text-blue-300 rounded text-[11px] font-medium border border-blue-200 dark:border-blue-800 cursor-pointer"
                  >
                    <Navigation className="w-3 h-3 text-blue-600" />
                    <span>Amap</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openDianpingSearch(resto.name_zh)}
                    className="flex-1 min-w-[90px] flex items-center justify-center gap-1 py-1 px-2 bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 text-orange-700 dark:text-orange-300 rounded text-[11px] font-medium border border-orange-200 dark:border-orange-800 cursor-pointer"
                  >
                    <Star className="w-3 h-3 text-orange-500" />
                    <span>Dianping</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => copyTaxiNote(resto.name_vn, resto.name_zh, resto.address_hint)}
                    className="flex items-center justify-center gap-1 py-1 px-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded text-[11px] font-medium cursor-pointer"
                    title="Sao chép tên quán chữ Hán để đưa tài xế taxi"
                  >
                    {copiedInfo === resto.name_zh ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3 text-slate-500" />
                    )}
                    <span>Đưa Taxi</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* List of Dishes */}
      <div className="grid grid-cols-1 gap-3">
        {dishes.map((dish, idx) => {
          const directRestaurant = getDishRestaurant(dish);
          const extraRestaurants = extraRestaurantsByDish[idx] || [];
          const isSearchingThisDish = loadingDishIdx === idx;

          return (
            <div
              key={idx}
              className="bg-amber-50/60 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-200/70 dark:border-amber-900/50 flex flex-col gap-2.5 transition-all"
            >
              {/* Dish Title & Chinese name */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {dish.dish_name_vn}
                  </span>
                </div>
                <CopyChip text={dish.dish_name_zh} highlight />
              </div>

              {/* Photo Search Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    openImageSearch(
                      dish.google_img_keyword || dish.dish_name_zh,
                      "google"
                    )
                  }
                  className="flex-1 flex items-center justify-center gap-1.5 py-1 px-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-medium border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs cursor-pointer"
                  title="Xem hình ảnh món ăn trên Google"
                >
                  <Search className="w-3 h-3 text-red-500" />
                  <span>Google Ảnh</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    openImageSearch(
                      dish.baidu_img_keyword || dish.dish_name_zh,
                      "baidu"
                    )
                  }
                  className="flex-1 flex items-center justify-center gap-1.5 py-1 px-2 bg-blue-50/80 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-lg text-[11px] font-medium border border-blue-200 dark:border-blue-800 transition-colors shadow-2xs cursor-pointer"
                  title="Xem hình ảnh trên Baidu (không cần bật VPN)"
                >
                  <Globe className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  <span>Baidu Ảnh (Nội địa)</span>
                </button>
              </div>

              {/* Direct Restaurant Card if specified */}
              {directRestaurant && (
                <div className="mt-1 p-2.5 rounded-xl bg-white dark:bg-slate-900/90 border border-amber-200/90 dark:border-amber-900/70 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span className="p-1 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400">
                        <Store className="w-3.5 h-3.5 text-amber-600" />
                      </span>
                      <span className="text-[11px] font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wide">
                        Quán ăn gợi ý:
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {directRestaurant.rating && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                          <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                          {directRestaurant.rating}
                        </span>
                      )}
                      {directRestaurant.price_range && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200/60 dark:border-emerald-800/40">
                          {directRestaurant.price_range}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Restaurant Name & Chinese Name */}
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="font-bold text-xs text-slate-900 dark:text-slate-100">
                      {directRestaurant.name_vn}
                    </div>
                    <CopyChip text={directRestaurant.name_zh} highlight />
                  </div>

                  {/* Address */}
                  {directRestaurant.address_hint && (
                    <div className="flex items-start gap-1 text-[11px] text-slate-600 dark:text-slate-400">
                      <MapPin className="w-3 h-3 text-red-500 shrink-0 mt-0.5" />
                      <span>{directRestaurant.address_hint}</span>
                    </div>
                  )}

                  {/* Note / Special dish */}
                  {(directRestaurant.note || directRestaurant.recommended_dish) && (
                    <div className="p-1.5 rounded-lg bg-amber-50/50 dark:bg-amber-950/30 text-[11px] text-amber-950 dark:text-amber-200 leading-snug">
                      {directRestaurant.recommended_dish && (
                        <div className="font-semibold text-amber-800 dark:text-amber-300 mb-0.5">
                          Món nên gọi: {directRestaurant.recommended_dish}
                        </div>
                      )}
                      {directRestaurant.note && (
                        <div className="text-slate-600 dark:text-slate-400">
                          💡 {directRestaurant.note}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons for this restaurant */}
                  <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() =>
                        openAmapSearch(
                          directRestaurant.amap_query || directRestaurant.name_zh
                        )
                      }
                      className="flex-1 min-w-[85px] flex items-center justify-center gap-1 py-1 px-2 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-lg text-[11px] font-medium border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
                      title="Mở chỉ đường và vị trí quán trên Gaode Amap"
                    >
                      <Navigation className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      <span>Mở Amap</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openDianpingSearch(directRestaurant.name_zh)}
                      className="flex-1 min-w-[85px] flex items-center justify-center gap-1 py-1 px-2 bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 dark:hover:bg-orange-900/60 text-orange-700 dark:text-orange-300 rounded-lg text-[11px] font-medium border border-orange-200 dark:border-orange-800 transition-colors cursor-pointer"
                      title="Mở Đại Chúng Điểm Bình (Dianping) xem review & menu"
                    >
                      <Star className="w-3 h-3 text-orange-500" />
                      <span>Dianping</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        copyTaxiNote(
                          directRestaurant.name_vn,
                          directRestaurant.name_zh,
                          directRestaurant.address_hint
                        )
                      }
                      className="flex items-center justify-center gap-1 py-1 px-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
                      title="Sao chép tên và địa chỉ chữ Hán đưa cho tài xế taxi / Didi"
                    >
                      {copiedInfo === directRestaurant.name_zh ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3 text-slate-500" />
                      )}
                      <span>Đưa Taxi</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Action to find more restaurants for this specific dish */}
              {!directRestaurant && extraRestaurants.length === 0 && (
                <div className="pt-0.5">
                  <button
                    type="button"
                    onClick={() => handleFetchRestaurantsForDish(dish, idx)}
                    disabled={isSearchingThisDish}
                    className="w-full py-1.5 px-2.5 bg-white/80 dark:bg-slate-900/60 hover:bg-amber-100/60 dark:hover:bg-slate-800 text-amber-900 dark:text-amber-300 rounded-lg border border-dashed border-amber-300 dark:border-amber-800/80 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-95"
                  >
                    {isSearchingThisDish ? (
                      <>
                        <Loader2 className="w-3 h-3 text-amber-600 animate-spin" />
                        <span>Đang tìm quán ăn ngon cho {dish.dish_name_vn}...</span>
                      </>
                    ) : (
                      <>
                        <Store className="w-3 h-3 text-amber-600" />
                        <span>
                          Gợi ý quán ăn gần {placeName ? placeName : "vị trí này"}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Extra AI Recommended Restaurants for this dish */}
              {extraRestaurants.length > 0 && (
                <div className="mt-1 space-y-2 border-t border-amber-200/50 dark:border-amber-900/40 pt-2">
                  <div className="text-[11px] font-bold text-amber-900 dark:text-amber-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>
                      Quán ngon gần {placeName || "vị trí này"} cho món {dish.dish_name_vn}:
                    </span>
                  </div>

                  {extraRestaurants.map((resto, rIdx) => (
                    <div
                      key={rIdx}
                      className="p-2.5 rounded-xl bg-white dark:bg-slate-900/90 border border-amber-200 dark:border-amber-900/60 text-xs space-y-1.5 shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="font-bold text-slate-900 dark:text-slate-100">
                          {resto.name_vn}
                        </div>
                        <CopyChip text={resto.name_zh} highlight />
                      </div>

                      {resto.address_hint && (
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                          <span>{resto.address_hint}</span>
                        </p>
                      )}

                      <div className="flex items-center gap-2 flex-wrap text-[11px]">
                        {resto.price_range && (
                          <span className="font-medium text-emerald-700 dark:text-emerald-400">
                            Giá: {resto.price_range}
                          </span>
                        )}
                        {resto.rating && (
                          <span className="text-amber-600 dark:text-amber-400 font-medium">
                            • {resto.rating}
                          </span>
                        )}
                      </div>

                      {resto.specialty_note && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                          💡 {resto.specialty_note}
                        </p>
                      )}

                      <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                        <button
                          type="button"
                          onClick={() => openAmapSearch(resto.amap_query || resto.name_zh)}
                          className="flex-1 min-w-[80px] flex items-center justify-center gap-1 py-1 px-2 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-700 dark:text-blue-300 rounded text-[11px] font-medium border border-blue-200 dark:border-blue-800 cursor-pointer"
                        >
                          <Navigation className="w-3 h-3 text-blue-600" />
                          <span>Amap</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openDianpingSearch(resto.name_zh)}
                          className="flex-1 min-w-[80px] flex items-center justify-center gap-1 py-1 px-2 bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 text-orange-700 dark:text-orange-300 rounded text-[11px] font-medium border border-orange-200 dark:border-orange-800 cursor-pointer"
                        >
                          <Star className="w-3 h-3 text-orange-500" />
                          <span>Dianping</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => copyTaxiNote(resto.name_vn, resto.name_zh, resto.address_hint)}
                          className="flex items-center justify-center gap-1 py-1 px-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded text-[11px] font-medium cursor-pointer"
                          title="Sao chép tên quán chữ Hán đưa cho tài xế taxi"
                        >
                          {copiedInfo === resto.name_zh ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3 text-slate-500" />
                          )}
                          <span>Đưa Taxi</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
