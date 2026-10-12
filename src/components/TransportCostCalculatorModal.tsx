import React, { useState, useEffect, useMemo } from "react";
import {
  Calculator,
  X,
  Check,
  Plane,
  Train,
  Car,
  Navigation,
  Calendar,
  Users,
  DollarSign,
  Sparkles,
  Luggage,
  Info,
  Layers,
  ArrowRight,
  Plus,
  Trash2,
  List,
  Edit3,
} from "lucide-react";
import { toast } from "sonner";
import { TripDocument, CustomExpenseItem } from "../types/itinerary";
import { DEFAULT_EXCHANGE_RATE, formatRmb, formatVnd } from "../lib/budgetUtils";

export type TransportType = "flight" | "train" | "didi" | "metro";

interface PassengerFlightItem {
  id: string;
  name: string;
  baseFareRmbStr: string;
  baggageRmbStr: string;
  seatInsuranceRmbStr: string;
}

interface TransportCostCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: TripDocument;
  onUpdateTrip: (updatedTrip: TripDocument) => void;
  initialType?: TransportType;
  initialDayNumber?: number;
}

export const TransportCostCalculatorModal: React.FC<TransportCostCalculatorModalProps> = ({
  isOpen,
  onClose,
  trip,
  onUpdateTrip,
  initialType = "flight",
  initialDayNumber = 1,
}) => {
  const [activeTab, setActiveTab] = useState<TransportType>(initialType);
  const totalDaysCount = trip.days ? trip.days.length : 1;
  const exchangeRate = trip.exchange_rate_rmb_vnd || DEFAULT_EXCHANGE_RATE;

  // Selected Day to apply transport cost (or general custom expense)
  const [targetDay, setTargetDay] = useState<number>(initialDayNumber || 1);
  const [allocationScope, setAllocationScope] = useState<"group_total" | "per_person">("group_total");

  // Scan existing transport items from itinerary for quick selection
  const existingTransports = useMemo(() => {
    const flights: { name: string; day: number; detail?: any }[] = [];
    const trains: { name: string; day: number; detail?: any }[] = [];
    const didis: { name: string; day: number; detail?: any }[] = [];
    const metros: { name: string; day: number; detail?: any }[] = [];

    if (trip && trip.days) {
      trip.days.forEach((day) => {
        day.events?.forEach((evt) => {
          const detail = evt.transport_detail;
          const mode = detail?.mode;
          const title = evt.activity_title || "";

          if (mode === "flight" || title.toLowerCase().includes("máy bay") || title.toLowerCase().includes("sân bay")) {
            flights.push({
              name: title || detail?.summary || "Chặng bay khứ hồi / nội địa",
              day: day.day_number,
              detail,
            });
          }
          if (mode === "train" || title.toLowerCase().includes("tàu cao tốc") || title.toLowerCase().includes("gaotie")) {
            trains.push({
              name: `${detail?.train_number ? `Tàu ${detail.train_number}: ` : ""}${detail?.train_departure_station_vn || "Ga đi"} ➔ ${detail?.train_arrival_station_vn || "Ga đến"}`,
              day: day.day_number,
              detail,
            });
          }
          if (mode === "taxi" || title.toLowerCase().includes("didi") || title.toLowerCase().includes("taxi")) {
            didis.push({
              name: title || detail?.summary || "Cuốc xe DiDi / Taxi",
              day: day.day_number,
              detail,
            });
          }
          if (mode === "metro" || title.toLowerCase().includes("tàu điện") || title.toLowerCase().includes("metro")) {
            metros.push({
              name: title || detail?.summary || "Chặng Tàu Điện Ngầm (Metro)",
              day: day.day_number,
              detail,
            });
          }
        });
      });
    }

    return { flights, trains, didis, metros };
  }, [trip]);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialType);
      setTargetDay(initialDayNumber || 1);
    }
  }, [isOpen, initialType, initialDayNumber]);

  // ==========================================
  // STATE & LOGIC: 1. FLIGHT (VÉ MÁY BAY)
  // ==========================================
  const [flightNameMode, setFlightNameMode] = useState<"select" | "manual">("select");
  const [selectedFlightIndex, setSelectedFlightIndex] = useState<number>(0);
  const [customFlightName, setCustomFlightName] = useState<string>("Vé Máy Bay Khứ Hồi Việt Nam - Trung Quốc");

  const [flightCalcMode, setFlightCalcMode] = useState<"total_group" | "passenger_breakdown">("passenger_breakdown");
  
  // Total Group Mode
  const [flightGroupTotalRmbStr, setFlightGroupTotalRmbStr] = useState<string>("3500");
  const [flightGroupPaxCount, setFlightGroupPaxCount] = useState<number>(4);

  // Breakdown Mode
  const [passengers, setPassengers] = useState<PassengerFlightItem[]>([
    { id: "p1", name: "Hành khách 1", baseFareRmbStr: "1200", baggageRmbStr: "200", seatInsuranceRmbStr: "50" },
    { id: "p2", name: "Hành khách 2", baseFareRmbStr: "1200", baggageRmbStr: "0", seatInsuranceRmbStr: "50" },
  ]);

  // Flight calculations
  const flightCalculations = useMemo(() => {
    if (flightCalcMode === "total_group") {
      const groupTotalRmb = parseFloat(flightGroupTotalRmbStr) || 0;
      const pax = Math.max(1, flightGroupPaxCount);
      const perPaxRmb = groupTotalRmb / pax;
      return {
        totalRmb: groupTotalRmb,
        totalVnd: groupTotalRmb * exchangeRate,
        paxCount: pax,
        perPaxRmb,
        perPaxVnd: perPaxRmb * exchangeRate,
      };
    } else {
      let totalRmb = 0;
      passengers.forEach((p) => {
        const base = parseFloat(p.baseFareRmbStr) || 0;
        const bag = parseFloat(p.baggageRmbStr) || 0;
        const extra = parseFloat(p.seatInsuranceRmbStr) || 0;
        totalRmb += base + bag + extra;
      });
      const pax = Math.max(1, passengers.length);
      const perPaxRmb = totalRmb / pax;
      return {
        totalRmb,
        totalVnd: totalRmb * exchangeRate,
        paxCount: pax,
        perPaxRmb,
        perPaxVnd: perPaxRmb * exchangeRate,
      };
    }
  }, [flightCalcMode, flightGroupTotalRmbStr, flightGroupPaxCount, passengers, exchangeRate]);

  // ==========================================
  // STATE & LOGIC: 2. TRAIN (TÀU CAO TỐC 12306)
  // ==========================================
  const [trainNameMode, setTrainNameMode] = useState<"select" | "manual">("select");
  const [selectedTrainIndex, setSelectedTrainIndex] = useState<number>(0);
  const [customTrainName, setCustomTrainName] = useState<string>("Vé Tàu Cao Tốc G2204 (Thành Đô ➔ Trùng Khánh)");
  
  const [seatClass, setSeatClass] = useState<"second" | "first" | "business">("second");
  const [ticketPricePerPersonRmbStr, setTicketPricePerPersonRmbStr] = useState<string>("154");
  const [bookingFeePerTicketRmbStr, setBookingFeePerTicketRmbStr] = useState<string>("20"); // Trip.com service fee
  const [trainPaxCount, setTrainPaxCount] = useState<number>(4);

  const trainCalculations = useMemo(() => {
    const baseTicketPrice = parseFloat(ticketPricePerPersonRmbStr) || 0;
    const fee = parseFloat(bookingFeePerTicketRmbStr) || 0;
    const perPaxRmb = baseTicketPrice + fee;
    const pax = Math.max(1, trainPaxCount);
    const totalRmb = perPaxRmb * pax;

    return {
      baseTicketPrice,
      fee,
      perPaxRmb,
      perPaxVnd: perPaxRmb * exchangeRate,
      paxCount: pax,
      totalRmb,
      totalVnd: totalRmb * exchangeRate,
    };
  }, [ticketPricePerPersonRmbStr, bookingFeePerTicketRmbStr, trainPaxCount, exchangeRate]);

  // ==========================================
  // STATE & LOGIC: 3. DIDI / TAXI / XE CỐ ĐỊNH
  // ==========================================
  const [didiNameMode, setDidiNameMode] = useState<"select" | "manual">("select");
  const [selectedDidiIndex, setSelectedDidiIndex] = useState<number>(0);
  const [customDidiName, setCustomDidiName] = useState<string>("Cuốc xe DiDi Express (Sân bay ➔ Khách sạn)");

  const [didiFareRmbStr, setDidiFareRmbStr] = useState<string>("85");
  const [didiTollParkingRmbStr, setDidiTollParkingRmbStr] = useState<string>("15"); // Cầu đường / đỗ xe
  const [didiPaxCount, setDidiPaxCount] = useState<number>(3); // 3-4 người đi chung xe

  const didiCalculations = useMemo(() => {
    const fare = parseFloat(didiFareRmbStr) || 0;
    const extra = parseFloat(didiTollParkingRmbStr) || 0;
    const totalRideRmb = fare + extra;
    const pax = Math.max(1, didiPaxCount);
    const perPaxRmb = totalRideRmb / pax;

    return {
      fare,
      extra,
      totalRideRmb,
      totalRideVnd: totalRideRmb * exchangeRate,
      paxCount: pax,
      perPaxRmb,
      perPaxVnd: perPaxRmb * exchangeRate,
    };
  }, [didiFareRmbStr, didiTollParkingRmbStr, didiPaxCount, exchangeRate]);

  // ==========================================
  // STATE & LOGIC: 4. METRO & BUS (TÀU ĐIỆN NGẦM)
  // ==========================================
  const [metroCalcMode, setMetroCalcMode] = useState<"day_pass" | "single_rides">("single_rides");
  
  // Single Rides mode
  const [avgRidesPerDay, setAvgRidesPerDay] = useState<number>(3);
  const [avgRideCostRmbStr, setAvgRideCostRmbStr] = useState<string>("4"); // ~4 RMB/lượt
  const [metroDaysCount, setMetroDaysCount] = useState<number>(Math.min(7, totalDaysCount));
  const [metroPaxCount, setMetroPaxCount] = useState<number>(4);

  // Day Pass mode
  const [dayPassPriceRmbStr, setDayPassPriceRmbStr] = useState<string>("20"); // 20 RMB/thẻ 1 ngày

  const metroCalculations = useMemo(() => {
    const pax = Math.max(1, metroPaxCount);
    const days = Math.max(1, metroDaysCount);

    if (metroCalcMode === "single_rides") {
      const rides = Math.max(1, avgRidesPerDay);
      const costPerRide = parseFloat(avgRideCostRmbStr) || 0;
      const dailyPerPaxRmb = rides * costPerRide;
      const totalPerPaxRmb = dailyPerPaxRmb * days;
      const totalAllPaxRmb = totalPerPaxRmb * pax;

      return {
        dailyPerPaxRmb,
        totalPerPaxRmb,
        totalPerPaxVnd: totalPerPaxRmb * exchangeRate,
        paxCount: pax,
        daysCount: days,
        totalAllPaxRmb,
        totalAllPaxVnd: totalAllPaxRmb * exchangeRate,
      };
    } else {
      const passPrice = parseFloat(dayPassPriceRmbStr) || 0;
      const totalPerPaxRmb = passPrice * days;
      const totalAllPaxRmb = totalPerPaxRmb * pax;

      return {
        dailyPerPaxRmb: passPrice,
        totalPerPaxRmb,
        totalPerPaxVnd: totalPerPaxRmb * exchangeRate,
        paxCount: pax,
        daysCount: days,
        totalAllPaxRmb,
        totalAllPaxVnd: totalAllPaxRmb * exchangeRate,
      };
    }
  }, [metroCalcMode, avgRidesPerDay, avgRideCostRmbStr, metroDaysCount, metroPaxCount, dayPassPriceRmbStr, exchangeRate]);

  // Helper passenger handlers for Flight
  const handleAddPassenger = () => {
    setPassengers((prev) => [
      ...prev,
      {
        id: `p_${Date.now()}`,
        name: `Hành khách ${prev.length + 1}`,
        baseFareRmbStr: "1200",
        baggageRmbStr: "0",
        seatInsuranceRmbStr: "0",
      },
    ]);
  };

  const handleRemovePassenger = (id: string) => {
    if (passengers.length <= 1) {
      toast.error("Cần ít nhất 1 hành khách!");
      return;
    }
    setPassengers((prev) => prev.filter((p) => p.id !== id));
  };

  const handleUpdatePassenger = (id: string, field: keyof PassengerFlightItem, value: string) => {
    setPassengers((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  // Get active calculated results based on active tab
  const activeCalculations = useMemo(() => {
    switch (activeTab) {
      case "flight":
        return {
          title: flightNameMode === "select" && existingTransports.flights[selectedFlightIndex]
            ? existingTransports.flights[selectedFlightIndex].name
            : customFlightName,
          category: "flight" as const,
          totalRmb: flightCalculations.totalRmb,
          perPaxRmb: flightCalculations.perPaxRmb,
          paxCount: flightCalculations.paxCount,
          note: allocationScope === "group_total"
            ? `Vé máy bay cả đoàn (${flightCalculations.paxCount} khách chia đều)`
            : `Vé máy bay cá nhân (${flightCalculations.paxCount} người đi)`,
        };

      case "train":
        return {
          title: trainNameMode === "select" && existingTransports.trains[selectedTrainIndex]
            ? existingTransports.trains[selectedTrainIndex].name
            : customTrainName,
          category: "transport" as const,
          totalRmb: trainCalculations.totalRmb,
          perPaxRmb: trainCalculations.perPaxRmb,
          paxCount: trainCalculations.paxCount,
          note: allocationScope === "group_total"
            ? `Tàu cao tốc cả đoàn (${trainCalculations.paxCount} người) - Ghế: ${
                seatClass === "second" ? "Nhị Đẳng" : seatClass === "first" ? "Nhất Đẳng" : "Thương Gia"
              }`
            : `Tàu cao tốc cá nhân (${trainCalculations.paxCount} người chia) - Ghế: ${
                seatClass === "second" ? "Nhị Đẳng" : seatClass === "first" ? "Nhất Đẳng" : "Thương Gia"
              }`,
        };

      case "didi":
        return {
          title: didiNameMode === "select" && existingTransports.didis[selectedDidiIndex]
            ? existingTransports.didis[selectedDidiIndex].name
            : customDidiName,
          category: "transport" as const,
          totalRmb: didiCalculations.totalRideRmb,
          perPaxRmb: didiCalculations.perPaxRmb,
          paxCount: didiCalculations.paxCount,
          note: allocationScope === "group_total"
            ? `Cuốc xe DiDi/Taxi cả xe (${didiCalculations.paxCount} người chia)`
            : `Chi phí DiDi 1 người trên xe (${didiCalculations.paxCount} người đi)`,
        };

      case "metro":
        return {
          title: `Tàu điện ngầm Metro / Bus (${metroCalculations.daysCount} ngày)`,
          category: "transport" as const,
          totalRmb: metroCalculations.totalAllPaxRmb,
          perPaxRmb: metroCalculations.totalPerPaxRmb,
          paxCount: metroCalculations.paxCount,
          note: allocationScope === "group_total"
            ? `Metro cả đoàn (${metroCalculations.paxCount} người x ${metroCalculations.daysCount} ngày)`
            : `Metro cá nhân (${metroCalculations.daysCount} ngày đi)`,
        };
    }
  }, [
    activeTab,
    flightNameMode,
    existingTransports,
    selectedFlightIndex,
    customFlightName,
    flightCalculations,
    trainNameMode,
    selectedTrainIndex,
    customTrainName,
    trainCalculations,
    seatClass,
    didiNameMode,
    selectedDidiIndex,
    customDidiName,
    didiCalculations,
    metroCalculations,
    allocationScope,
  ]);

  // Save calculated transport expense into Trip document
  const handleApplyToTrip = (e: React.FormEvent) => {
    e.preventDefault();

    const appliedRmb = allocationScope === "group_total" ? activeCalculations.totalRmb : activeCalculations.perPaxRmb;

    if (appliedRmb <= 0) {
      toast.error("Vui lòng kiểm tra lại số tiền (> 0 RMB)");
      return;
    }

    const appliedVnd = Math.round(appliedRmb * exchangeRate);

    // Construct new custom expense item
    const newExpense: CustomExpenseItem = {
      id: `exp_trans_${Date.now()}`,
      title: activeCalculations.title,
      category: activeCalculations.category,
      cost_rmb: Math.round(appliedRmb * 10) / 10,
      cost_vnd: appliedVnd,
      date: `Ngày ${targetDay}`,
      note: activeCalculations.note,
    };

    const updatedExpenses = [...(trip.custom_expenses || []), newExpense];

    const updatedTrip: TripDocument = {
      ...trip,
      custom_expenses: updatedExpenses,
    };

    onUpdateTrip(updatedTrip);
    toast.success(`Đã thêm chi phí ${activeCalculations.title} vào Ngân Sách (${formatRmb(appliedRmb)} ~ ${formatVnd(appliedVnd)})!`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base sm:text-lg flex items-center gap-2">
                Máy Tính Chia Tiền Di Chuyển
                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Đoàn & Cá Nhân
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Tính toán chính xác chi phí máy bay, tàu cao tốc, DiDi & metro theo số người
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Transport Type Tabs */}
        <div className="p-3 bg-slate-950/60 border-b border-slate-800 grid grid-cols-4 gap-1.5 sm:gap-2">
          <button
            onClick={() => setActiveTab("flight")}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === "flight"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-semibold"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Plane className="w-4 h-4 shrink-0" />
            <span>Máy Bay</span>
          </button>

          <button
            onClick={() => setActiveTab("train")}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === "train"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-semibold"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Train className="w-4 h-4 shrink-0" />
            <span>Tàu Gaotie</span>
          </button>

          <button
            onClick={() => setActiveTab("didi")}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === "didi"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-semibold"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Car className="w-4 h-4 shrink-0" />
            <span>DiDi / Taxi</span>
          </button>

          <button
            onClick={() => setActiveTab("metro")}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === "metro"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-semibold"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Navigation className="w-4 h-4 shrink-0" />
            <span>Metro / Bus</span>
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleApplyToTrip} className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* ======================================= */}
          {/* TAB 1: VÉ MÁY BAY                       */}
          {/* ======================================= */}
          {activeTab === "flight" && (
            <div className="space-y-4">
              {/* Select Flight from Schedule or Manual Input */}
              <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Plane className="w-4 h-4 text-indigo-400" /> Tên Chặng Bay
                  </label>
                  <div className="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-lg border border-slate-700">
                    <button
                      type="button"
                      onClick={() => setFlightNameMode("select")}
                      className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                        flightNameMode === "select"
                          ? "bg-indigo-600 text-white"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Từ Lịch Trình
                    </button>
                    <button
                      type="button"
                      onClick={() => setFlightNameMode("manual")}
                      className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                        flightNameMode === "manual"
                          ? "bg-indigo-600 text-white"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Nhập Thủ Công
                    </button>
                  </div>
                </div>

                {flightNameMode === "select" ? (
                  existingTransports.flights.length > 0 ? (
                    <select
                      value={selectedFlightIndex}
                      onChange={(e) => setSelectedFlightIndex(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {existingTransports.flights.map((f, idx) => (
                        <option key={idx} value={idx}>
                          [Ngày {f.day}] {f.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-xs text-amber-400 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                      Chưa tìm thấy chặng máy bay trong lịch trình. Đã chuyển sang nhập thủ công bên dưới.
                    </div>
                  )
                ) : (
                  <input
                    type="text"
                    value={customFlightName}
                    onChange={(e) => setCustomFlightName(e.target.value)}
                    placeholder="VD: Khứ hồi Hà Nội - Thành Đô (Air China)"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                )}
              </div>

              {/* Mode Switch: Group Bill vs Passenger Breakdown */}
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setFlightCalcMode("passenger_breakdown")}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    flightCalcMode === "passenger_breakdown"
                      ? "bg-slate-800 text-amber-300 border border-amber-500/30 shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  Chi Tiết Mỗi Người (+ Hành Lý)
                </button>

                <button
                  type="button"
                  onClick={() => setFlightCalcMode("total_group")}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    flightCalcMode === "total_group"
                      ? "bg-slate-800 text-amber-300 border border-amber-500/30 shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  Nhập Tổng Hóa Đơn Nhóm
                </button>
              </div>

              {flightCalcMode === "total_group" ? (
                <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/60 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Tổng Tiền Vé Cả Nhóm (RMB)
                      </label>
                      <input
                        type="number"
                        value={flightGroupTotalRmbStr}
                        onChange={(e) => setFlightGroupTotalRmbStr(e.target.value)}
                        placeholder="3500"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-amber-300 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Số Lượng Khách Đi Chung
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={flightGroupPaxCount}
                        onChange={(e) => setFlightGroupPaxCount(parseInt(e.target.value) || 1)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300">
                      Danh Sách Hành Khách & Hành Lý Ký Gửi Rẻ/Tự Chọn
                    </span>
                    <button
                      type="button"
                      onClick={handleAddPassenger}
                      className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20"
                    >
                      <Plus className="w-3.5 h-3.5" /> Thêm Khách
                    </button>
                  </div>

                  {passengers.map((p, idx) => (
                    <div
                      key={p.id}
                      className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/70 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={p.name}
                          onChange={(e) => handleUpdatePassenger(p.id, "name", e.target.value)}
                          className="bg-slate-900/80 border border-slate-700 rounded px-2.5 py-1 text-xs text-white font-medium focus:outline-none"
                        />
                        {passengers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemovePassenger(p.id)}
                            className="text-slate-400 hover:text-red-400 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-0.5">
                            Giá Vé Căn Bản (RMB)
                          </label>
                          <input
                            type="number"
                            value={p.baseFareRmbStr}
                            onChange={(e) =>
                              handleUpdatePassenger(p.id, "baseFareRmbStr", e.target.value)
                            }
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-amber-300 font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-400 mb-0.5 flex items-center gap-1">
                            <Luggage className="w-3 h-3 text-cyan-400" /> Hành Lý (RMB)
                          </label>
                          <input
                            type="number"
                            value={p.baggageRmbStr}
                            onChange={(e) =>
                              handleUpdatePassenger(p.id, "baggageRmbStr", e.target.value)
                            }
                            placeholder="0"
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-400 mb-0.5">
                            Phụ Phí/Chỗ (RMB)
                          </label>
                          <input
                            type="number"
                            value={p.seatInsuranceRmbStr}
                            onChange={(e) =>
                              handleUpdatePassenger(p.id, "seatInsuranceRmbStr", e.target.value)
                            }
                            placeholder="0"
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ======================================= */}
          {/* TAB 2: VÉ TÀU CAO TỐC (GAOTIE)          */}
          {/* ======================================= */}
          {activeTab === "train" && (
            <div className="space-y-4">
              <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Train className="w-4 h-4 text-indigo-400" /> Chọn Chặng Tàu Cao Tốc (12306)
                  </label>
                  <div className="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-lg border border-slate-700">
                    <button
                      type="button"
                      onClick={() => setTrainNameMode("select")}
                      className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                        trainNameMode === "select" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Từ Lịch Trình
                    </button>
                    <button
                      type="button"
                      onClick={() => setTrainNameMode("manual")}
                      className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                        trainNameMode === "manual" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Nhập Thủ Công
                    </button>
                  </div>
                </div>

                {trainNameMode === "select" ? (
                  existingTransports.trains.length > 0 ? (
                    <select
                      value={selectedTrainIndex}
                      onChange={(e) => setSelectedTrainIndex(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                    >
                      {existingTransports.trains.map((t, idx) => (
                        <option key={idx} value={idx}>
                          [Ngày {t.day}] {t.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-xs text-amber-400 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                      Chưa tìm thấy chuyến tàu gaotie trong lịch trình. Hãy nhập tên chuyến tàu bên dưới.
                    </div>
                  )
                ) : (
                  <input
                    type="text"
                    value={customTrainName}
                    onChange={(e) => setCustomTrainName(e.target.value)}
                    placeholder="VD: Tàu G2204 (Thành Đô Đông -> Trùng Khánh Bắc)"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                  />
                )}
              </div>

              {/* Hạng Ghế */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Hạng Ghế Tàu Cao Tốc</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSeatClass("second");
                      setTicketPricePerPersonRmbStr("154");
                    }}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 border transition-all ${
                      seatClass === "second"
                        ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                        : "bg-slate-800/40 border-slate-700 text-slate-400"
                    }`}
                  >
                    <span>Nhị Đẳng Tọa</span>
                    <span className="text-[10px] font-normal text-slate-400">Rẻ & phổ biến</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSeatClass("first");
                      setTicketPricePerPersonRmbStr("246");
                    }}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 border transition-all ${
                      seatClass === "first"
                        ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                        : "bg-slate-800/40 border-slate-700 text-slate-400"
                    }`}
                  >
                    <span>Nhất Đẳng Tọa</span>
                    <span className="text-[10px] font-normal text-slate-400">Rộng rãi 2+2</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSeatClass("business");
                      setTicketPricePerPersonRmbStr("480");
                    }}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 border transition-all ${
                      seatClass === "business"
                        ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                        : "bg-slate-800/40 border-slate-700 text-slate-400"
                    }`}
                  >
                    <span>Thương Gia</span>
                    <span className="text-[10px] font-normal text-slate-400">Ghế nằm VIP</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/60">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Giá Vé 1 Vé (RMB)
                  </label>
                  <input
                    type="number"
                    value={ticketPricePerPersonRmbStr}
                    onChange={(e) => setTicketPricePerPersonRmbStr(e.target.value)}
                    placeholder="154"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-amber-300 font-semibold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
                    <span>Phí Đặt Mua (RMB)</span>
                    <span className="text-[10px] text-slate-400">Trip/Klook</span>
                  </label>
                  <input
                    type="number"
                    value={bookingFeePerTicketRmbStr}
                    onChange={(e) => setBookingFeePerTicketRmbStr(e.target.value)}
                    placeholder="20"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Số Người Đặt
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={trainPaxCount}
                    onChange={(e) => setTrainPaxCount(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* TAB 3: DIDI / TAXI / XE RIÊNG           */}
          {/* ======================================= */}
          {activeTab === "didi" && (
            <div className="space-y-4">
              <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Car className="w-4 h-4 text-emerald-400" /> Tên Cuốc Xe DiDi / Taxi
                  </label>
                  <div className="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-lg border border-slate-700">
                    <button
                      type="button"
                      onClick={() => setDidiNameMode("select")}
                      className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                        didiNameMode === "select" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Từ Lịch Trình
                    </button>
                    <button
                      type="button"
                      onClick={() => setDidiNameMode("manual")}
                      className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                        didiNameMode === "manual" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Nhập Thủ Công
                    </button>
                  </div>
                </div>

                {didiNameMode === "select" ? (
                  existingTransports.didis.length > 0 ? (
                    <select
                      value={selectedDidiIndex}
                      onChange={(e) => setSelectedDidiIndex(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                    >
                      {existingTransports.didis.map((d, idx) => (
                        <option key={idx} value={idx}>
                          [Ngày {d.day}] {d.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-xs text-amber-400 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                      Chưa có cuốc xe DiDi trong lịch trình. Hãy nhập tự do bên dưới.
                    </div>
                  )
                ) : (
                  <input
                    type="text"
                    value={customDidiName}
                    onChange={(e) => setCustomDidiName(e.target.value)}
                    placeholder="VD: Cuốc DiDi Express từ Sân Bay Trùng Khánh về Khách Sạn"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                  />
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/60">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Tiền Cước Chuyến Xe (RMB)
                  </label>
                  <input
                    type="number"
                    value={didiFareRmbStr}
                    onChange={(e) => setDidiFareRmbStr(e.target.value)}
                    placeholder="85"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-amber-300 font-semibold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Phí Cầu Đường/Đỗ Xe (RMB)
                  </label>
                  <input
                    type="number"
                    value={didiTollParkingRmbStr}
                    onChange={(e) => setDidiTollParkingRmbStr(e.target.value)}
                    placeholder="15"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Số Người Đi Chung XE ĐÓ
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={didiPaxCount}
                    onChange={(e) => setDidiPaxCount(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* TAB 4: METRO & BUS                       */}
          {/* ======================================= */}
          {activeTab === "metro" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setMetroCalcMode("single_rides")}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                    metroCalcMode === "single_rides"
                      ? "bg-slate-800 text-cyan-300 border border-cyan-500/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Tính Theo Vé Lượt (~4-6 RMB)
                </button>

                <button
                  type="button"
                  onClick={() => setMetroCalcMode("day_pass")}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                    metroCalcMode === "day_pass"
                      ? "bg-slate-800 text-cyan-300 border border-cyan-500/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Tính Theo Thẻ Ngày (Day Pass)
                </button>
              </div>

              {metroCalcMode === "single_rides" ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/60">
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">Số Chặng/Ngày</label>
                    <input
                      type="number"
                      min="1"
                      value={avgRidesPerDay}
                      onChange={(e) => setAvgRidesPerDay(parseInt(e.target.value) || 1)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">Giá 1 Lượt (RMB)</label>
                    <input
                      type="number"
                      value={avgRideCostRmbStr}
                      onChange={(e) => setAvgRideCostRmbStr(e.target.value)}
                      placeholder="4"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-amber-300 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">Số Ngày Đi Metro</label>
                    <input
                      type="number"
                      min="1"
                      value={metroDaysCount}
                      onChange={(e) => setMetroDaysCount(parseInt(e.target.value) || 1)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">Số Người</label>
                    <input
                      type="number"
                      min="1"
                      value={metroPaxCount}
                      onChange={(e) => setMetroPaxCount(parseInt(e.target.value) || 1)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/60">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Giá Thẻ Ngày Day Pass (RMB)
                    </label>
                    <input
                      type="number"
                      value={dayPassPriceRmbStr}
                      onChange={(e) => setDayPassPriceRmbStr(e.target.value)}
                      placeholder="20"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-amber-300 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Số Ngày Sử Dụng</label>
                    <input
                      type="number"
                      min="1"
                      value={metroDaysCount}
                      onChange={(e) => setMetroDaysCount(parseInt(e.target.value) || 1)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Số Người Trong Đoàn</label>
                    <input
                      type="number"
                      min="1"
                      value={metroPaxCount}
                      onChange={(e) => setMetroPaxCount(parseInt(e.target.value) || 1)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================= */}
          {/* LIVE SUMMARY BANNER                     */}
          {/* ======================================= */}
          <div className="bg-gradient-to-br from-slate-950 via-indigo-950/40 to-slate-950 p-4 rounded-xl border border-indigo-500/30 space-y-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" /> Kết Quả Bảng Tính Chi Phí
              </span>
              <span className="text-xs font-medium text-indigo-300">Tỷ giá: 1 RMB ≈ {exchangeRate.toLocaleString("vi-VN")} VNĐ</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-0.5">Tổng Cho Cả Đoàn ({activeCalculations.paxCount} người)</span>
                <span className="text-lg font-bold text-amber-300 block">{formatRmb(activeCalculations.totalRmb)}</span>
                <span className="text-xs text-slate-400 block font-mono">{formatVnd(activeCalculations.totalRmb * exchangeRate)}</span>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-0.5">Giá Bình Quân / 1 Người</span>
                <span className="text-lg font-bold text-emerald-400 block">{formatRmb(activeCalculations.perPaxRmb)}</span>
                <span className="text-xs text-emerald-300/80 block font-mono">{formatVnd(activeCalculations.perPaxRmb * exchangeRate)}</span>
              </div>
            </div>
          </div>

          {/* Target Allocation Options */}
          <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/60 space-y-3">
            <label className="text-xs font-semibold text-slate-300 block">
              Ghi Khoản Chi Này Vào Bảng Quản Lý Chi Tiêu Sau Khi Tính
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Gắn Với Ngày Trong Lịch Trình</label>
                <select
                  value={targetDay}
                  onChange={(e) => setTargetDay(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                >
                  {Array.from({ length: totalDaysCount }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>
                      Ngày {d} ({trip.days[d - 1]?.date || `Ngày ${d}`})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Hình Thức Lưu Chi Phí</label>
                <select
                  value={allocationScope}
                  onChange={(e) => setAllocationScope(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-amber-300 font-medium focus:outline-none"
                >
                  <option value="group_total">Lưu Tổng Chi Phí Cả Đoàn ({formatRmb(activeCalculations.totalRmb)})</option>
                  <option value="per_person">Lưu Chi Phí Cá Nhân 1 Người ({formatRmb(activeCalculations.perPaxRmb)})</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30 hover:from-indigo-500 hover:to-purple-500 transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Ghi Vào Ngân Sách
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
