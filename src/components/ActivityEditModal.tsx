import React, { useState } from "react";
import {
  X,
  Check,
  MapPin,
  Clock,
  Compass,
  Tag,
  DollarSign,
  Trash2,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Info,
  Car,
  Ticket,
  UtensilsCrossed,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { ActivityEvent, DishItem } from "../types/itinerary.js";
import { DEFAULT_EXCHANGE_RATE, formatVnd } from "../lib/budgetUtils.js";

interface ActivityEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayNumber: number;
  cityName: string;
  eventIndex: number | null; // null if adding new event
  initialEvent?: ActivityEvent;
  exchangeRate?: number;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onSave: (event: ActivityEvent) => void;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const ActivityEditModal: React.FC<ActivityEditModalProps> = ({
  isOpen,
  onClose,
  dayNumber,
  cityName,
  eventIndex,
  initialEvent,
  exchangeRate = DEFAULT_EXCHANGE_RATE,
  canMoveUp = false,
  canMoveDown = false,
  onSave,
  onDelete,
  onMoveUp,
  onMoveDown,
}) => {
  const isEditing = eventIndex !== null;

  // Form State
  const [activityTitle, setActivityTitle] = useState(initialEvent?.activity_title || "");
  const [timeSlot, setTimeSlot] = useState(initialEvent?.time_slot || "Sáng");
  const [timeRange, setTimeRange] = useState(initialEvent?.time_range || "");
  const [durationHint, setDurationHint] = useState(initialEvent?.duration_hint || "");
  const [placeName, setPlaceName] = useState(initialEvent?.place_name || "");
  const [placeZh, setPlaceZh] = useState(initialEvent?.place_zh || "");
  const [amapQuery, setAmapQuery] = useState(initialEvent?.amap_query || "");
  const [transportHint, setTransportHint] = useState(initialEvent?.transport_hint || "");
  const [ticketHint, setTicketHint] = useState(initialEvent?.ticket_hint || "");
  const [description, setDescription] = useState(initialEvent?.description || "");
  const [tips, setTips] = useState(initialEvent?.tips || "");

  // Detailed Transport / Station States
  const [transportMode, setTransportMode] = useState<string>(
    initialEvent?.transport_detail?.mode ||
      (initialEvent?.transport_hint?.toLowerCase().includes("tàu cao tốc") ||
      initialEvent?.transport_hint?.toLowerCase().includes("gaotie")
        ? "train"
        : initialEvent?.transport_hint?.toLowerCase().includes("metro") ||
          initialEvent?.transport_hint?.toLowerCase().includes("line ")
        ? "metro"
        : initialEvent?.transport_hint?.toLowerCase().includes("taxi") ||
          initialEvent?.transport_hint?.toLowerCase().includes("didi")
        ? "taxi"
        : "other")
  );
  const [metroLine, setMetroLine] = useState(initialEvent?.transport_detail?.metro_line || "");
  const [depStationVn, setDepStationVn] = useState(
    initialEvent?.transport_detail?.departure_station_vn || ""
  );
  const [depStationZh, setDepStationZh] = useState(
    initialEvent?.transport_detail?.departure_station_zh || ""
  );
  const [arrStationVn, setArrStationVn] = useState(
    initialEvent?.transport_detail?.arrival_station_vn || ""
  );
  const [arrStationZh, setArrStationZh] = useState(
    initialEvent?.transport_detail?.arrival_station_zh || ""
  );
  const [stationCount, setStationCount] = useState(
    initialEvent?.transport_detail?.station_count || ""
  );

  const [trainNumber, setTrainNumber] = useState(initialEvent?.transport_detail?.train_number || "");
  const [trainDepVn, setTrainDepVn] = useState(
    initialEvent?.transport_detail?.train_departure_station_vn || ""
  );
  const [trainDepZh, setTrainDepZh] = useState(
    initialEvent?.transport_detail?.train_departure_station_zh || ""
  );
  const [trainArrVn, setTrainArrVn] = useState(
    initialEvent?.transport_detail?.train_arrival_station_vn || ""
  );
  const [trainArrZh, setTrainArrZh] = useState(
    initialEvent?.transport_detail?.train_arrival_station_zh || ""
  );
  const [trainDuration, setTrainDuration] = useState(
    initialEvent?.transport_detail?.train_duration || ""
  );

  // Budget State
  const [costRmb, setCostRmb] = useState<string>(
    initialEvent?.cost_rmb !== undefined && initialEvent?.cost_rmb !== null
      ? String(initialEvent.cost_rmb)
      : ""
  );
  const [costVnd, setCostVnd] = useState<string>(
    initialEvent?.cost_vnd !== undefined && initialEvent?.cost_vnd !== null
      ? String(initialEvent.cost_vnd)
      : ""
  );
  const [costCategory, setCostCategory] = useState<string>(
    initialEvent?.cost_category || "ticket"
  );
  const [costNote, setCostNote] = useState(initialEvent?.cost_note || "");

  // Food / Dishes state
  const [dishes, setDishes] = useState<DishItem[]>(initialEvent?.dishes || []);
  const [showDishSection, setShowDishSection] = useState(
    (initialEvent?.dishes && initialEvent.dishes.length > 0) || false
  );
  const [newDishVn, setNewDishVn] = useState("");
  const [newDishZh, setNewDishZh] = useState("");
  const [newRestaurantVn, setNewRestaurantVn] = useState("");

  if (!isOpen) return null;

  const handleRmbChange = (val: string) => {
    setCostRmb(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      setCostVnd(String(Math.round(num * exchangeRate)));
    } else if (val === "") {
      setCostVnd("");
    }
  };

  const handleVndChange = (val: string) => {
    setCostVnd(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      setCostRmb((num / exchangeRate).toFixed(1));
    } else if (val === "") {
      setCostRmb("");
    }
  };

  const handleAddDish = () => {
    if (!newDishVn.trim() && !newDishZh.trim()) {
      toast.error("Vui lòng nhập tên món ăn");
      return;
    }
    const newDish: DishItem = {
      dish_name_vn: newDishVn.trim() || newDishZh.trim(),
      dish_name_zh: newDishZh.trim() || newDishVn.trim(),
      restaurant_name: newRestaurantVn.trim() || undefined,
    };
    setDishes([...dishes, newDish]);
    setNewDishVn("");
    setNewDishZh("");
    setNewRestaurantVn("");
    toast.success("Đã thêm món ăn vào gợi ý");
  };

  const handleRemoveDish = (index: number) => {
    setDishes(dishes.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!activityTitle.trim()) {
      toast.error("Vui lòng nhập tên hoạt động");
      return;
    }

    if (!placeName.trim()) {
      toast.error("Vui lòng nhập địa điểm tiếng Việt");
      return;
    }

    const rmbNum = costRmb !== "" ? parseFloat(costRmb) : undefined;
    const vndNum = costVnd !== "" ? parseFloat(costVnd) : undefined;

    const hasTransportDetail =
      metroLine.trim() ||
      depStationVn.trim() ||
      arrStationVn.trim() ||
      trainNumber.trim() ||
      trainDepVn.trim() ||
      trainArrVn.trim() ||
      (transportMode !== "other" && transportMode !== "");

    let transportDetail: any = undefined;
    if (hasTransportDetail) {
      transportDetail = {
        ...initialEvent?.transport_detail,
        mode: (transportMode as any) || undefined,
        metro_line: metroLine.trim() || undefined,
        departure_station_vn: depStationVn.trim() || undefined,
        departure_station_zh: depStationZh.trim() || undefined,
        arrival_station_vn: arrStationVn.trim() || undefined,
        arrival_station_zh: arrStationZh.trim() || undefined,
        station_count: stationCount.trim() || undefined,
        train_number: trainNumber.trim() || undefined,
        train_departure_station_vn: trainDepVn.trim() || undefined,
        train_departure_station_zh: trainDepZh.trim() || undefined,
        train_arrival_station_vn: trainArrVn.trim() || undefined,
        train_arrival_station_zh: trainArrZh.trim() || undefined,
        train_duration: trainDuration.trim() || undefined,
      };
    }

    const updatedEvent: ActivityEvent = {
      ...initialEvent,
      activity_title: activityTitle.trim(),
      time_slot: timeSlot.trim() || "Sáng",
      time_range: timeRange.trim() || undefined,
      duration_hint: durationHint.trim() || undefined,
      place_name: placeName.trim(),
      place_zh: placeZh.trim() || placeName.trim(),
      amap_query: amapQuery.trim() || undefined,
      transport_hint: transportHint.trim() || undefined,
      transport_detail: transportDetail,
      ticket_hint: ticketHint.trim() || undefined,
      description: description.trim() || undefined,
      tips: tips.trim() || undefined,
      cost_rmb: rmbNum !== undefined && !isNaN(rmbNum) ? rmbNum : undefined,
      cost_vnd: vndNum !== undefined && !isNaN(vndNum) ? vndNum : undefined,
      cost_category: (costCategory as any) || undefined,
      cost_note: costNote.trim() || undefined,
      dishes: dishes.length > 0 ? dishes : undefined,
    };

    onSave(updatedEvent);
    toast.success(isEditing ? "Đã cập nhật hoạt động thành công!" : "Đã thêm hoạt động mới!");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white">
                {isEditing ? "Chỉnh Sửa Hoạt Động Lịch Trình" : "Thêm Hoạt Động Mới"}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Ngày {dayNumber} &bull; Thành phố: <strong className="text-amber-400">{cityName}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {isEditing && (
              <>
                {canMoveUp && onMoveUp && (
                  <button
                    type="button"
                    onClick={onMoveUp}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Chuyển lên trước"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                )}
                {canMoveDown && onMoveDown && (
                  <button
                    type="button"
                    onClick={onMoveDown}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Chuyển xuống sau"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Bạn có chắc chắn muốn xóa hoạt động này khỏi lịch trình không?")) {
                        onDelete();
                        onClose();
                      }
                    }}
                    className="p-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 transition-colors cursor-pointer"
                    title="Xóa hoạt động này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Section 1: Basic Info (Title, Slot, Time) */}
          <div className="space-y-4 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/80">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 block">
              1. Tiêu đề &amp; Thời gian
            </span>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Tên hoạt động / Điểm đến <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Tham quan Quảng trường Thiên Phủ & Bảo tàng Tứ Xuyên"
                value={activityTitle}
                onChange={(e) => setActivityTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-white font-medium outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Buổi trong ngày
                </label>
                <div className="flex gap-1">
                  {["Sáng", "Chiều", "Tối"].map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTimeSlot(slot)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                        timeSlot === slot
                          ? "bg-amber-500 text-slate-950 shadow-sm"
                          : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Khung giờ
                </label>
                <input
                  type="text"
                  placeholder="08:30 - 11:30"
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Thời lượng dự kiến
                </label>
                <input
                  type="text"
                  placeholder="2 - 3 tiếng"
                  value={durationHint}
                  onChange={(e) => setDurationHint(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Location & Chinese Search (Amap / Taxi / Locals) */}
          <div className="space-y-4 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> 2. Tên địa điểm &amp; Chữ Hán (Amap / Taxi)
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                Cực kỳ quan trọng để tra bản đồ nội địa
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Tên địa điểm (Tiếng Việt) <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Quảng trường Thiên Phủ"
                  value={placeName}
                  onChange={(e) => setPlaceName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-medium outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Tên Chữ Hán chuẩn (đưa tài xế / tra Amap)
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: 天府广场"
                  value={placeZh}
                  onChange={(e) => setPlaceZh(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-amber-300 font-semibold outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Từ khóa tìm kiếm trên bản đồ Amap (Tùy chọn)
              </label>
              <input
                type="text"
                placeholder="Ví dụ: 成都市天府广场 (nếu để trống sẽ dùng tên chữ Hán)"
                value={amapQuery}
                onChange={(e) => setAmapQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none"
              />
            </div>
          </div>

          {/* Section 3: Transport & Stations Editor */}
          <div className="space-y-4 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-blue-400" /> 3. Phương tiện di chuyển &amp; Chi tiết Ga tàu
              </span>
              <span className="text-[10px] text-slate-400">
                Cho phép sửa chính xác Ga đi, Ga đến &amp; Chữ Hán
              </span>
            </div>

            {/* Mode Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "metro", label: "Metro (Tàu điện)", icon: "🚇" },
                { id: "train", label: "Tàu cao tốc (12306)", icon: "🚄" },
                { id: "taxi", label: "Taxi / DiDi", icon: "🚖" },
                { id: "other", label: "Khác / Cáp treo / Đi bộ", icon: "🚶" },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setTransportMode(m.id)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
                    transportMode === m.id
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  <span>{m.icon}</span>
                  <span className="truncate">{m.label}</span>
                </button>
              ))}
            </div>

            {/* 3A. METRO DETAILED EDIT */}
            {transportMode === "metro" && (
              <div className="space-y-3.5 p-3.5 bg-blue-950/20 border border-blue-900/40 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-400">Chi tiết tuyến &amp; Ga Metro</span>
                  <span className="text-[10px] text-slate-400">Đồng bộ với MetroMan &amp; Amap</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tên Tuyến Metro
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Line 1 (Tuyến số 1) hoặc Line 18 (Tàu nhanh Express)"
                    value={metroLine}
                    onChange={(e) => setMetroLine(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>

                {/* Departure Station */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Ga Khởi hành (Tiếng Việt)
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Ga Tiểu Thập Tự"
                      value={depStationVn}
                      onChange={(e) => setDepStationVn(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Ga Khởi hành (Chữ Hán)
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: 小什字站"
                      value={depStationZh}
                      onChange={(e) => setDepStationZh(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-blue-300 font-semibold outline-none"
                    />
                  </div>
                </div>

                {/* Arrival Station */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Ga Đến (Tiếng Việt)
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Ga Từ Khí Khẩu"
                      value={arrStationVn}
                      onChange={(e) => setArrStationVn(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Ga Đến (Chữ Hán)
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: 磁器口站"
                      value={arrStationZh}
                      onChange={(e) => setArrStationZh(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-blue-300 font-semibold outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Thời lượng / Số ga ước tính
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: 14 ga (~28 phút)"
                    value={stationCount}
                    onChange={(e) => setStationCount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 outline-none"
                  />
                </div>

                {/* Quick Station Selection Chips */}
                <div className="pt-1 border-t border-blue-900/30">
                  <span className="text-[10px] text-slate-400 block mb-1.5 font-medium">
                    Chọn nhanh ga đến chuẩn (Bấm để điền):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { vn: "Ga Tiểu Thập Tự", zh: "小什字站" },
                      { vn: "Ga Từ Khí Khẩu", zh: "磁器口站" },
                      { vn: "Ga Lý Tử Bá", zh: "李子坝站" },
                      { vn: "Ga Lâm Giang Môn", zh: "临江门站" },
                      { vn: "Ga Tăng Gia Nham", zh: "曾家岩站" },
                      { vn: "Ga Triều Thiên Môn", zh: "朝天门站" },
                      { vn: "Ga Quảng trường Thiên Phủ", zh: "天府广场站" },
                      { vn: "Ga Phố Xuân Hy", zh: "春熙路站" },
                      { vn: "Ga Tu viện Văn Thù", zh: "文殊院站" },
                      { vn: "Ga Đại lộ Gấu Trúc", zh: "熊猫大道站" },
                      { vn: "Ga Đường Thảo Đường Bắc", zh: "草堂北路站" },
                      { vn: "Ga Ngõ Rộng Ngõ Hẹp", zh: "宽窄巷子站" },
                      { vn: "Ga Công viên Nhân Dân", zh: "人民公园站" },
                      { vn: "Ga Tây Phố (Xipu)", zh: "犀浦站" },
                      { vn: "Ga Nam Thành Đô", zh: "火车南站" },
                      { vn: "Ga Sân bay Thiên Phủ T1/T2", zh: "天府机场1号2号航站楼站" },
                    ].map((st, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setArrStationVn(st.vn);
                          setArrStationZh(st.zh);
                          toast.info(`Đã điền Ga Đến: ${st.vn}`);
                        }}
                        className="px-2 py-1 bg-slate-900 hover:bg-blue-600 hover:text-white text-slate-300 border border-slate-700/80 rounded-md text-[10px] font-medium transition-colors cursor-pointer"
                      >
                        {st.vn} ({st.zh.replace("站", "")})
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 3B. HIGH-SPEED TRAIN DETAILED EDIT */}
            {transportMode === "train" && (
              <div className="space-y-3.5 p-3.5 bg-amber-950/20 border border-amber-900/40 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400">Chi tiết Tàu Cao Tốc (12306)</span>
                  <span className="text-[10px] text-slate-400">Đồng bộ với Gaotie / Ga xe lửa</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Số hiệu tàu (Gaotie / C-train)
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: G8608, G2448, G2436, C6101"
                      value={trainNumber}
                      onChange={(e) => setTrainNumber(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Thời gian chạy tàu
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: 1h 04m (09:13 - 10:17)"
                      value={trainDuration}
                      onChange={(e) => setTrainDuration(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none"
                    />
                  </div>
                </div>

                {/* Train Departure Station */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Ga Tàu Khởi hành (Tiếng Việt)
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Ga Trùng Khánh Bắc"
                      value={trainDepVn}
                      onChange={(e) => setTrainDepVn(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Ga Tàu Khởi hành (Chữ Hán)
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: 重庆北站"
                      value={trainDepZh}
                      onChange={(e) => setTrainDepZh(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-amber-300 font-semibold outline-none"
                    />
                  </div>
                </div>

                {/* Train Arrival Station */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Ga Tàu Đến (Tiếng Việt)
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Ga Thành Đô Đông"
                      value={trainArrVn}
                      onChange={(e) => setTrainArrVn(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Ga Tàu Đến (Chữ Hán)
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: 成都东站"
                      value={trainArrZh}
                      onChange={(e) => setTrainArrZh(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-amber-300 font-semibold outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* General Hints & Ticket */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-blue-400" /> Hướng dẫn di chuyển chung (Tùy chọn)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ví dụ: Đi Metro Line 1 hoặc Taxi ~15 ¥ về khách sạn"
                  value={transportHint}
                  onChange={(e) => setTransportHint(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Ticket className="w-3.5 h-3.5 text-amber-400" /> Hướng dẫn vé &amp; Đặt chỗ
                </label>
                <textarea
                  rows={2}
                  placeholder="Ví dụ: 80 ¥/người, nên đặt trước qua WeChat Mini-app trước 3 ngày"
                  value={ticketHint}
                  onChange={(e) => setTicketHint(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Details & Travel Tips */}
          <div className="space-y-4 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/80">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 block">
              4. Chi tiết &amp; Mẹo thực tế
            </span>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Mô tả hoạt động / Lịch trình chi tiết
              </label>
              <textarea
                rows={3}
                placeholder="Mô tả các điểm nhấn, lộ trình tham quan chi tiết..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-3 text-xs text-slate-200 outline-none resize-none leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-amber-400" /> Mẹo &amp; Lưu ý thực tế
              </label>
              <textarea
                rows={2}
                placeholder="Ví dụ: Mang theo hộ chiếu gốc khi vào cổng, tránh đi vào giờ cao điểm..."
                value={tips}
                onChange={(e) => setTips(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-3 text-xs text-slate-200 outline-none resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Section 5: Budget & Cost (Integrated) */}
          <div className="space-y-4 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" /> 5. Quản lý chi phí (Tùy chọn)
              </span>
              <span className="text-[10px] text-amber-400 font-semibold">
                Tỷ giá: 1 ¥ ≈ {exchangeRate.toLocaleString("vi-VN")} ₫
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Chi phí RMB (Tệ - ¥)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 font-bold text-amber-400 text-sm">¥</span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="Ví dụ: 80"
                    value={costRmb}
                    onChange={(e) => handleRmbChange(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-8 pr-3 py-2 text-xs text-white font-semibold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Chi phí VND (₫)
                </label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="Tự động tính theo tỷ giá"
                    value={costVnd}
                    onChange={(e) => handleVndChange(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                  />
                  <span className="absolute right-3 text-xs text-slate-400 font-bold">VND</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-slate-400" /> Phân loại chi phí
                </label>
                <select
                  value={costCategory}
                  onChange={(e) => setCostCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none cursor-pointer"
                >
                  <option value="ticket">Vé tham quan &amp; Hoạt động</option>
                  <option value="food">Ăn uống &amp; Ẩm thực</option>
                  <option value="transport">Di chuyển (Metro / Taxi / Tàu)</option>
                  <option value="shopping">Mua sắm &amp; Quà lưu niệm</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Ghi chú chi phí
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Đã bao gồm vé cáp treo khứ hồi"
                  value={costNote}
                  onChange={(e) => setCostNote(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 6: Recommended Dishes / Food Explorer (Collapsible) */}
          <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/80">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowDishSection(!showDishSection)}
                className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
              >
                <UtensilsCrossed className="w-3.5 h-3.5" />
                <span>6. Gợi ý món ngon &amp; Quán ăn ({dishes.length} món)</span>
              </button>
              <button
                type="button"
                onClick={() => setShowDishSection(!showDishSection)}
                className="text-xs text-slate-400 hover:text-white"
              >
                {showDishSection ? "Thu gọn" : "Mở rộng"}
              </button>
            </div>

            {showDishSection && (
              <div className="mt-3 pt-3 border-t border-slate-800 space-y-3">
                {dishes.map((dish, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-2 p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-xs"
                  >
                    <div>
                      <span className="font-bold text-white">{dish.dish_name_vn}</span>
                      {dish.dish_name_zh && (
                        <span className="text-amber-300 ml-1.5 font-semibold">({dish.dish_name_zh})</span>
                      )}
                      {dish.restaurant_name && (
                        <span className="text-slate-400 block text-[11px] mt-0.5">
                          Quán: {dish.restaurant_name}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDish(i)}
                      className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/20"
                      title="Xóa món này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {/* Add new dish row */}
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-2">
                  <span className="text-[11px] font-semibold text-slate-300 block">Thêm món ăn:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Tên món (Tiếng Việt)"
                      value={newDishVn}
                      onChange={(e) => setNewDishVn(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Tên Chữ Hán (để gọi món)"
                      value={newDishZh}
                      onChange={(e) => setNewDishZh(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-amber-300 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Tên quán đề xuất"
                      value={newRestaurantVn}
                      onChange={(e) => setNewRestaurantVn(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddDish}
                    className="w-full py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/30 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm món vào danh sách</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{isEditing ? "Lưu Thay Đổi Hoạt Động" : "Thêm Hoạt Động Vào Ngày"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
