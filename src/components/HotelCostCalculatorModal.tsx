import React, { useState, useEffect, useMemo } from "react";
import {
  Calculator,
  X,
  Check,
  Building2,
  Calendar,
  Users,
  DollarSign,
  Sparkles,
  List,
  Edit3,
  Plus,
  Trash2,
  Layers,
  BedDouble,
} from "lucide-react";
import { toast } from "sonner";
import { TripDocument } from "../types/itinerary";
import { DEFAULT_EXCHANGE_RATE, formatRmb, formatVnd } from "../lib/budgetUtils";

interface RoomTypeItem {
  id: string;
  name: string;
  pricePerNightRmbStr: string;
  quantity: number;
  guestsPerRoom: number;
}

interface HotelCostCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: TripDocument;
  onUpdateTrip: (updatedTrip: TripDocument) => void;
  initialStartDay?: number;
}

export const HotelCostCalculatorModal: React.FC<HotelCostCalculatorModalProps> = ({
  isOpen,
  onClose,
  trip,
  onUpdateTrip,
  initialStartDay = 1,
}) => {
  const totalDaysCount = trip.days ? trip.days.length : 1;

  // Extract existing hotels from trip schedule
  const existingHotels = useMemo(() => {
    const map = new Map<string, { name: string; startDay: number; endDay: number }>();

    if (trip && trip.days) {
      trip.days.forEach((d) => {
        const hName = d.hotel?.name_vn?.trim();
        if (hName && !hName.startsWith("Khách sạn (Ngày")) {
          if (!map.has(hName)) {
            map.set(hName, { name: hName, startDay: d.day_number, endDay: d.day_number + 1 });
          } else {
            const item = map.get(hName)!;
            item.endDay = Math.max(item.endDay, d.day_number + 1);
          }
        }
      });
    }

    return Array.from(map.values());
  }, [trip]);

  // Mode 1: Hotel Name Selection
  const [hotelInputMode, setHotelInputMode] = useState<"select" | "manual">("select");
  const [hotelName, setHotelName] = useState<string>("");

  // Mode 2: Pricing Input Mode
  const [priceInputMode, setPriceInputMode] = useState<"total_bill" | "per_room_type">("total_bill");

  // Mode A Inputs: Total Bill
  const [totalCostRmbStr, setTotalCostRmbStr] = useState<string>("1200");
  const [singleRoomCount, setSingleRoomCount] = useState<number>(1);
  const [singleGuestsPerRoom, setSingleGuestsPerRoom] = useState<number>(2);

  // Mode B Inputs: Room Types
  const [roomTypes, setRoomTypes] = useState<RoomTypeItem[]>([
    {
      id: "room_1",
      name: "Phòng Đôi Standard",
      pricePerNightRmbStr: "350",
      quantity: 1,
      guestsPerRoom: 2,
    },
  ]);

  // Stay duration
  const [startDay, setStartDay] = useState<number>(initialStartDay || 1);
  const [endDay, setEndDay] = useState<number>(Math.min((initialStartDay || 1) + 3, totalDaysCount));

  // Allocation mode in budget
  const [allocationMode, setAllocationMode] = useState<"room_total" | "per_person">("room_total");

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      const defaultStart = initialStartDay || 1;
      setStartDay(defaultStart);
      setEndDay(Math.min(defaultStart + 3, totalDaysCount));

      const dayIndex = defaultStart - 1;
      const existingHotelOnDay = trip.days && trip.days[dayIndex]?.hotel;

      if (existingHotels.length > 0) {
        setHotelInputMode("select");
        if (
          existingHotelOnDay &&
          existingHotelOnDay.name_vn &&
          !existingHotelOnDay.name_vn.startsWith("Khách sạn (Ngày")
        ) {
          setHotelName(existingHotelOnDay.name_vn);
          const matched = existingHotels.find((h) => h.name === existingHotelOnDay.name_vn);
          if (matched) {
            setStartDay(matched.startDay);
            setEndDay(matched.endDay);
          }
        } else {
          setHotelName(existingHotels[0].name);
          setStartDay(existingHotels[0].startDay);
          setEndDay(existingHotels[0].endDay);
        }
      } else {
        setHotelInputMode("manual");
        if (existingHotelOnDay && existingHotelOnDay.name_vn) {
          setHotelName(existingHotelOnDay.name_vn);
        } else {
          setHotelName("Khách sạn ở từ Ngày " + defaultStart);
        }
      }
    }
  }, [isOpen, initialStartDay, totalDaysCount, trip.days, existingHotels]);

  if (!isOpen) return null;

  const exchangeRate = trip.exchange_rate_rmb_vnd || DEFAULT_EXCHANGE_RATE;
  const numberOfNights = Math.max(1, endDay - startDay);

  // Dynamic Calculations based on priceInputMode
  let grandTotalRmb = 0;
  let dailyTotalAllRoomsRmb = 0;
  let totalRoomsCount = 1;
  let totalGuestsCount = 2;
  let costPerPersonPerNightRmb = 0;

  if (priceInputMode === "total_bill") {
    const rawTotal = parseFloat(totalCostRmbStr) || 0;
    grandTotalRmb = rawTotal;
    dailyTotalAllRoomsRmb = numberOfNights > 0 ? rawTotal / numberOfNights : 0;
    totalRoomsCount = Math.max(1, singleRoomCount);
    totalGuestsCount = totalRoomsCount * Math.max(1, singleGuestsPerRoom);
    costPerPersonPerNightRmb = totalGuestsCount > 0 ? dailyTotalAllRoomsRmb / totalGuestsCount : 0;
  } else {
    // Per room type mode
    dailyTotalAllRoomsRmb = roomTypes.reduce((acc, r) => {
      const price = parseFloat(r.pricePerNightRmbStr) || 0;
      const qty = Math.max(1, r.quantity);
      return acc + price * qty;
    }, 0);

    grandTotalRmb = dailyTotalAllRoomsRmb * numberOfNights;
    totalRoomsCount = roomTypes.reduce((acc, r) => acc + Math.max(1, r.quantity), 0);
    totalGuestsCount = roomTypes.reduce(
      (acc, r) => acc + Math.max(1, r.quantity) * Math.max(1, r.guestsPerRoom),
      0
    );
    costPerPersonPerNightRmb = totalGuestsCount > 0 ? dailyTotalAllRoomsRmb / totalGuestsCount : 0;
  }

  // Cost applied to each night in budget
  const appliedCostPerNightRmb =
    allocationMode === "room_total" ? dailyTotalAllRoomsRmb : costPerPersonPerNightRmb;

  // Handlers for room types in Mode B
  const handleAddRoomType = () => {
    const newId = "room_" + Date.now();
    setRoomTypes([
      ...roomTypes,
      {
        id: newId,
        name: `Loại phòng ${roomTypes.length + 1}`,
        pricePerNightRmbStr: "300",
        quantity: 1,
        guestsPerRoom: 2,
      },
    ]);
  };

  const handleUpdateRoomType = (id: string, field: keyof RoomTypeItem, value: any) => {
    setRoomTypes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleRemoveRoomType = (id: string) => {
    if (roomTypes.length <= 1) {
      toast.error("Phải có ít nhất 1 loại phòng!");
      return;
    }
    setRoomTypes((prev) => prev.filter((r) => r.id !== id));
  };

  const handleApplyToTrip = (e: React.FormEvent) => {
    e.preventDefault();

    if (grandTotalRmb <= 0) {
      toast.error("Vui lòng nhập số tiền phòng hợp lệ (> 0 RMB)");
      return;
    }

    if (startDay >= endDay) {
      toast.error("Ngày trả phòng (Đến ngày) phải lớn hơn Ngày nhận phòng (Từ ngày)");
      return;
    }

    const startIdx = Math.max(0, startDay - 1);
    const endIdx = Math.min(trip.days.length, endDay - 1);

    const updatedDays = [...trip.days];
    let updatedNightsCount = 0;

    const roomDetailsSummary =
      priceInputMode === "total_bill"
        ? `${totalRoomsCount} phòng (${totalGuestsCount} người)`
        : roomTypes.map((r) => `${r.quantity}x ${r.name}`).join(", ");

    for (let i = startIdx; i < endIdx; i++) {
      const day = { ...updatedDays[i] };
      const currentHotel = day.hotel || {
        name_vn: hotelName.trim() || `Khách sạn (Ngày ${day.day_number})`,
        name_zh: "酒店",
      };

      const modeText =
        allocationMode === "room_total"
          ? `Tổng ${totalRoomsCount} phòng: ${formatRmb(
              dailyTotalAllRoomsRmb
            )}/đêm (${roomDetailsSummary})`
          : `Chi phí 1 người: ${formatRmb(
              costPerPersonPerNightRmb
            )}/đêm (${totalGuestsCount} người chia, ${totalRoomsCount} phòng)`;

      day.hotel = {
        ...currentHotel,
        name_vn: hotelName.trim() || currentHotel.name_vn,
        cost_rmb: Math.round(appliedCostPerNightRmb * 10) / 10,
        cost_vnd: Math.round(appliedCostPerNightRmb * exchangeRate),
        cost_note: modeText,
      };

      updatedDays[i] = day;
      updatedNightsCount++;
    }

    const updatedTrip: TripDocument = {
      ...trip,
      days: updatedDays,
      updated_at: new Date().toISOString(),
    };

    onUpdateTrip(updatedTrip);
    toast.success(
      `🎉 Đã tính & chia ${formatRmb(grandTotalRmb)} (${totalRoomsCount} phòng, ${totalGuestsCount} người) thành ${formatRmb(
        appliedCostPerNightRmb
      )}/đêm cho ${updatedNightsCount} đêm khách sạn!`
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl text-slate-100 flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Calculator className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                🧮 Máy Tính Chia Tiền Khách Sạn & Loại Phòng
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Tính toán chi phí cho nhiều phòng, loại phòng & số lượng người ở
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleApplyToTrip} className="p-5 space-y-4 overflow-y-auto max-h-[80vh]">
          {/* Hotel Name Input / Select */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-1">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" /> Tên Khách Sạn
              </label>

              {/* Mode Switcher */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    setHotelInputMode("select");
                    if (existingHotels.length > 0) {
                      const matched =
                        existingHotels.find((h) => h.name === hotelName) || existingHotels[0];
                      setHotelName(matched.name);
                      setStartDay(matched.startDay);
                      setEndDay(matched.endDay);
                    }
                  }}
                  disabled={existingHotels.length === 0}
                  className={`px-2 py-0.5 rounded-md transition-all font-semibold flex items-center gap-1 cursor-pointer ${
                    hotelInputMode === "select"
                      ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                      : "text-slate-400 hover:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
                  }`}
                  title={
                    existingHotels.length === 0
                      ? "Chưa có danh sách khách sạn trong lịch trình"
                      : "Chọn từ lịch trình"
                  }
                >
                  <List className="w-3 h-3" />
                  <span>Chọn từ lịch trình ({existingHotels.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setHotelInputMode("manual")}
                  className={`px-2 py-0.5 rounded-md transition-all font-semibold flex items-center gap-1 cursor-pointer ${
                    hotelInputMode === "manual"
                      ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Tự nhập</span>
                </button>
              </div>
            </div>

            {hotelInputMode === "select" && existingHotels.length > 0 ? (
              <div>
                <select
                  value={hotelName}
                  onChange={(e) => {
                    const selectedName = e.target.value;
                    setHotelName(selectedName);
                    const matched = existingHotels.find((h) => h.name === selectedName);
                    if (matched) {
                      setStartDay(matched.startDay);
                      setEndDay(matched.endDay);
                      toast.info(
                        `Đã chọn Ngày ${matched.startDay} ➔ Ngày ${matched.endDay} cho "${selectedName}"`
                      );
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-bold cursor-pointer"
                >
                  {existingHotels.map((h) => (
                    <option key={"h_opt_" + h.name} value={h.name}>
                      🏨 {h.name} (Lịch trình: Ngày {h.startDay} ➔ Ngày {h.endDay})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  placeholder="VD: Khách sạn Atour Thượng Hải"
                  value={hotelName}
                  onChange={(e) => setHotelName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-semibold"
                />
              </div>
            )}
          </div>

          {/* Date Range Selection (Start Day to End Day) */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-400" /> Chọn thời gian lưu trú
            </label>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">Ở từ ngày:</span>
                <select
                  value={startDay}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setStartDay(val);
                    if (val >= endDay) setEndDay(val + 1);
                  }}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-2.5 py-2 text-xs text-white font-bold cursor-pointer"
                >
                  {trip.days.map((d) => (
                    <option key={"start_d_" + d.day_number} value={d.day_number}>
                      Ngày {d.day_number} ({d.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block mb-1">Đến ngày (Trả phòng):</span>
                <select
                  value={endDay}
                  onChange={(e) => setEndDay(parseInt(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-2.5 py-2 text-xs text-white font-bold cursor-pointer"
                >
                  {trip.days.map((d) => (
                    <option
                      key={"end_d_" + d.day_number}
                      value={d.day_number}
                      disabled={d.day_number <= startDay}
                    >
                      Ngày {d.day_number} ({d.city})
                    </option>
                  ))}
                  <option value={totalDaysCount + 1}>Ngày {totalDaysCount + 1} (Trả phòng)</option>
                </select>
              </div>
            </div>

            <div className="text-[11px] font-bold text-blue-300 pt-1 flex items-center justify-between">
              <span>⏱ Số đêm lưu trú:</span>
              <span className="bg-blue-500/20 px-2 py-0.5 rounded border border-blue-500/30 text-white font-extrabold">
                {numberOfNights} đêm (Đêm Ngày {startDay} ➔ {endDay - 1})
              </span>
            </div>
          </div>

          {/* Pricing Input Mode Toggle: Total Bill vs Per Room Type */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" /> Tùy chọn cách nhập giá tiền phòng
            </label>

            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => setPriceInputMode("total_bill")}
                className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  priceInputMode === "total_bill"
                    ? "bg-amber-500 text-slate-950 shadow-md font-extrabold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Nhập Tổng Hóa Đơn</span>
              </button>

              <button
                type="button"
                onClick={() => setPriceInputMode("per_room_type")}
                className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  priceInputMode === "per_room_type"
                    ? "bg-amber-500 text-slate-950 shadow-md font-extrabold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <BedDouble className="w-3.5 h-3.5" />
                <span>Nhập Theo Loại Phòng</span>
              </button>
            </div>
          </div>

          {/* MODE A: Total Bill Form */}
          {priceInputMode === "total_bill" && (
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-amber-400" /> Tổng tiền toàn bộ hóa đơn phòng (RMB)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 font-extrabold text-amber-400 text-sm">¥</span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="VD: 2400"
                    value={totalCostRmbStr}
                    onChange={(e) => setTotalCostRmbStr(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl pl-8 pr-3 py-2.5 text-sm text-white font-extrabold outline-none"
                    required
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  ~ {formatVnd(grandTotalRmb * exchangeRate)}
                </span>
              </div>

              {/* Number of Rooms & Guests Per Room */}
              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-800">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1">
                    <BedDouble className="w-3 h-3 text-indigo-400" /> Số lượng phòng
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={singleRoomCount}
                    onChange={(e) => setSingleRoomCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white font-extrabold text-center outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1">
                    <Users className="w-3 h-3 text-emerald-400" /> Số người / 1 phòng
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={singleGuestsPerRoom}
                    onChange={(e) => setSingleGuestsPerRoom(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white font-extrabold text-center outline-none"
                  />
                </div>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center justify-between font-semibold pt-1">
                <span>👥 Tổng số người ở toàn bộ nhóm:</span>
                <span className="text-emerald-400 font-extrabold">
                  {totalGuestsCount} người ({singleRoomCount} phòng x {singleGuestsPerRoom} người)
                </span>
              </div>
            </div>
          )}

          {/* MODE B: Per Room Type Form */}
          {priceInputMode === "per_room_type" && (
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <BedDouble className="w-3.5 h-3.5 text-amber-400" /> Danh sách các loại phòng đặt
                </span>
                <button
                  type="button"
                  onClick={handleAddRoomType}
                  className="px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Thêm loại phòng</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {roomTypes.map((room, idx) => (
                  <div
                    key={room.id}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2 relative group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30 shrink-0">
                        Phòng {idx + 1}
                      </span>
                      <input
                        type="text"
                        placeholder="Tên loại phòng (VD: Phòng Deluxe King)"
                        value={room.name}
                        onChange={(e) => handleUpdateRoomType(room.id, "name", e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold outline-none"
                      />

                      {roomTypes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRoomType(room.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0 cursor-pointer"
                          title="Xóa loại phòng này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {/* Price / Night */}
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">Giá 1 đêm / phòng:</span>
                        <div className="relative flex items-center">
                          <span className="absolute left-2 text-amber-400 text-xs font-bold">¥</span>
                          <input
                            type="number"
                            step="any"
                            min="0"
                            placeholder="350"
                            value={room.pricePerNightRmbStr}
                            onChange={(e) =>
                              handleUpdateRoomType(room.id, "pricePerNightRmbStr", e.target.value)
                            }
                            className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg pl-5 pr-2 py-1.5 text-xs text-white font-extrabold outline-none"
                          />
                        </div>
                      </div>

                      {/* Room Quantity */}
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">Số lượng phòng:</span>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={room.quantity}
                          onChange={(e) =>
                            handleUpdateRoomType(room.id, "quantity", Math.max(1, parseInt(e.target.value) || 1))
                          }
                          className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-2 py-1.5 text-xs text-white font-extrabold text-center outline-none"
                        />
                      </div>

                      {/* Guests / Room */}
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">Số người / 1 phòng:</span>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={room.guestsPerRoom}
                          onChange={(e) =>
                            handleUpdateRoomType(
                              room.id,
                              "guestsPerRoom",
                              Math.max(1, parseInt(e.target.value) || 1)
                            )
                          }
                          className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-2 py-1.5 text-xs text-white font-extrabold text-center outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-300">
                <span>📊 Tổng cộng theo loại phòng:</span>
                <span className="text-amber-300 font-extrabold">
                  {formatRmb(dailyTotalAllRoomsRmb)} / đêm ({totalRoomsCount} phòng, {totalGuestsCount} người)
                </span>
              </div>
            </div>
          )}

          {/* Real-time Calculation Breakdown Results */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 border border-amber-500/30 space-y-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Kết Quả Tự Động Quy Đổi
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1">
              <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Tổng hóa đơn ({numberOfNights} đêm):</span>
                <span className="text-sm font-extrabold text-amber-300">
                  {formatRmb(grandTotalRmb)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  ~ {formatVnd(grandTotalRmb * exchangeRate)}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Tiền 1 đêm (Tất cả {totalRoomsCount} phòng):</span>
                <span className="text-sm font-extrabold text-indigo-300">
                  {formatRmb(dailyTotalAllRoomsRmb)} / đêm
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  ~ {formatVnd(dailyTotalAllRoomsRmb * exchangeRate)}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Giá 1 người / 1 đêm ({totalGuestsCount} người):</span>
                <span className="text-sm font-extrabold text-emerald-400">
                  {formatRmb(costPerPersonPerNightRmb)} / người / đêm
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  ~ {formatVnd(costPerPersonPerNightRmb * exchangeRate)}
                </span>
              </div>
            </div>
          </div>

          {/* Choose How To Record Into Trip Budget */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              Bạn muốn ghi số tiền nào vào Ngân Sách từng ngày?
            </label>

            <div className="grid grid-cols-1 gap-2 text-xs">
              <label
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                  allocationMode === "room_total"
                    ? "bg-amber-500/15 border-amber-500 text-white font-bold"
                    : "bg-slate-950 border-slate-800 text-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="allocMode"
                  checked={allocationMode === "room_total"}
                  onChange={() => setAllocationMode("room_total")}
                  className="mt-0.5 accent-amber-500"
                />
                <div>
                  <div>Ghi tổng tiền tất cả các phòng: {formatRmb(dailyTotalAllRoomsRmb)} / đêm</div>
                  <div className="text-[10px] font-normal text-slate-400 mt-0.5">
                    (Dành cho trưởng đoàn đại diện tính tổng ngân sách lưu trú toàn nhóm)
                  </div>
                </div>
              </label>

              <label
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                  allocationMode === "per_person"
                    ? "bg-amber-500/15 border-amber-500 text-white font-bold"
                    : "bg-slate-950 border-slate-800 text-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="allocMode"
                  checked={allocationMode === "per_person"}
                  onChange={() => setAllocationMode("per_person")}
                  className="mt-0.5 accent-amber-500"
                />
                <div>
                  <div>Ghi phần tiền cá nhân 1 người: {formatRmb(costPerPersonPerNightRmb)} / đêm</div>
                  <div className="text-[10px] font-normal text-slate-400 mt-0.5">
                    (Dành cho cá nhân muốn ghi nhận đúng phần chi tiêu riêng của mình)
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Hủy
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Áp Dụng Cho {numberOfNights} Đêm Khách Sạn</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
