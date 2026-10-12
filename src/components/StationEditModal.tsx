import React, { useState } from "react";
import {
  X,
  Check,
  Train,
  ArrowRight,
  Sparkles,
  MapPin,
  Clock,
  Compass,
  Repeat,
} from "lucide-react";
import { toast } from "sonner";
import { ActivityEvent, TransportDetail } from "../types/itinerary.js";
import { parseTransportEvent, getStationPinyin } from "../lib/transportParser.js";

interface StationEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: ActivityEvent;
  cityName?: string;
  onSaveStations: (
    updatedTransportDetail: TransportDetail,
    updatedHint?: string
  ) => void;
}

export const StationEditModal: React.FC<StationEditModalProps> = ({
  isOpen,
  onClose,
  event,
  cityName = "",
  onSaveStations,
}) => {
  if (!isOpen) return null;

  const parsed = parseTransportEvent(event, undefined, cityName);

  const initialMode =
    event.transport_detail?.mode ||
    (parsed.train ? "train" : "metro");

  const [mode, setMode] = useState<"metro" | "train">(
    initialMode === "train" ? "train" : "metro"
  );

  // Metro Form Fields
  const [metroLine, setMetroLine] = useState(
    event.transport_detail?.metro_line || parsed.metro?.line || "Line 1 (Tuyến số 1)"
  );
  const [metroDepVn, setMetroDepVn] = useState(
    event.transport_detail?.departure_station_vn ||
      parsed.metro?.departureStationVn ||
      ""
  );
  const [metroDepZh, setMetroDepZh] = useState(
    event.transport_detail?.departure_station_zh ||
      parsed.metro?.departureStationZh ||
      ""
  );
  const [metroArrVn, setMetroArrVn] = useState(
    event.transport_detail?.arrival_station_vn ||
      parsed.metro?.arrivalStationVn ||
      ""
  );
  const [metroArrZh, setMetroArrZh] = useState(
    event.transport_detail?.arrival_station_zh ||
      parsed.metro?.arrivalStationZh ||
      ""
  );
  const [metroDuration, setMetroDuration] = useState(
    event.transport_detail?.station_count ||
      parsed.metro?.durationEstimate ||
      "~15 - 25 phút"
  );

  // Train (Gaotie / CRH / 12306) Form Fields
  const [trainNumber, setTrainNumber] = useState(
    event.transport_detail?.train_number ||
      parsed.train?.trainNumber ||
      "G2436"
  );
  const [trainDepVn, setTrainDepVn] = useState(
    event.transport_detail?.train_departure_station_vn ||
      parsed.train?.departureStationVn ||
      ""
  );
  const [trainDepZh, setTrainDepZh] = useState(
    event.transport_detail?.train_departure_station_zh ||
      parsed.train?.departureStationZh ||
      ""
  );
  const [trainArrVn, setTrainArrVn] = useState(
    event.transport_detail?.train_arrival_station_vn ||
      parsed.train?.arrivalStationVn ||
      ""
  );
  const [trainArrZh, setTrainArrZh] = useState(
    event.transport_detail?.train_arrival_station_zh ||
      parsed.train?.arrivalStationZh ||
      ""
  );
  const [trainDuration, setTrainDuration] = useState(
    event.transport_detail?.train_duration ||
      parsed.train?.duration ||
      "Tra cứu trên 12306"
  );

  // Quick swap departure & arrival
  const handleSwapStations = () => {
    if (mode === "metro") {
      const tempVn = metroDepVn;
      const tempZh = metroDepZh;
      setMetroDepVn(metroArrVn);
      setMetroDepZh(metroArrZh);
      setMetroArrVn(tempVn);
      setMetroArrZh(tempZh);
      toast.info("Đã hoán đổi Ga đi ⇄ Ga đến");
    } else {
      const tempVn = trainDepVn;
      const tempZh = trainDepZh;
      setTrainDepVn(trainArrVn);
      setTrainDepZh(trainArrZh);
      setTrainArrVn(tempVn);
      setTrainArrZh(tempZh);
      toast.info("Đã hoán đổi Ga đi ⇄ Ga đến");
    }
  };

  const handleApplyPreset = (
    stationVn: string,
    stationZh: string,
    target: "dep" | "arr"
  ) => {
    if (mode === "metro") {
      if (target === "dep") {
        setMetroDepVn(stationVn);
        setMetroDepZh(stationZh);
        toast.success(`Đã chọn Ga đi: ${stationVn} (${stationZh})`);
      } else {
        setMetroArrVn(stationVn);
        setMetroArrZh(stationZh);
        toast.success(`Đã chọn Ga đến: ${stationVn} (${stationZh})`);
      }
    } else {
      if (target === "dep") {
        setTrainDepVn(stationVn);
        setTrainDepZh(stationZh);
        toast.success(`Đã chọn Ga đi: ${stationVn} (${stationZh})`);
      } else {
        setTrainArrVn(stationVn);
        setTrainArrZh(stationZh);
        toast.success(`Đã chọn Ga đến: ${stationVn} (${stationZh})`);
      }
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "metro") {
      if (!metroArrVn.trim() && !metroArrZh.trim()) {
        toast.error("Vui lòng nhập tên Ga đến của tuyến Metro!");
        return;
      }

      const updatedDetail: TransportDetail = {
        ...event.transport_detail,
        mode: "metro",
        metro_line: metroLine.trim() || "Metro",
        departure_station_vn: metroDepVn.trim() || undefined,
        departure_station_zh: metroDepZh.trim() || undefined,
        arrival_station_vn: metroArrVn.trim() || undefined,
        arrival_station_zh: metroArrZh.trim() || undefined,
        station_count: metroDuration.trim() || undefined,
        summary: `Đón Metro ${metroLine.trim()} từ ${metroDepVn.trim() || "ga khởi hành"} đến ${metroArrVn.trim() || "ga đến"}`,
      };

      const updatedHint = `Metro ${metroLine.trim()}: ${metroDepVn.trim()} ➔ ${metroArrVn.trim()}`;
      onSaveStations(updatedDetail, updatedHint);
      toast.success("Đã cập nhật ga Metro thành công!");
    } else {
      if (!trainArrVn.trim() && !trainArrZh.trim()) {
        toast.error("Vui lòng nhập tên Ga đến của chuyến tàu!");
        return;
      }

      const updatedDetail: TransportDetail = {
        ...event.transport_detail,
        mode: "train",
        train_number: trainNumber.trim() || undefined,
        train_departure_station_vn: trainDepVn.trim() || undefined,
        train_departure_station_zh: trainDepZh.trim() || undefined,
        train_arrival_station_vn: trainArrVn.trim() || undefined,
        train_arrival_station_zh: trainArrZh.trim() || undefined,
        train_duration: trainDuration.trim() || undefined,
        summary: `Tàu cao tốc ${trainNumber.trim()} từ ${trainDepVn.trim()} đến ${trainArrVn.trim()}`,
      };

      const updatedHint = `Tàu cao tốc ${trainNumber.trim()} (${trainDuration.trim()}): ${trainDepVn.trim()} ➔ ${trainArrVn.trim()}`;
      onSaveStations(updatedDetail, updatedHint);
      toast.success("Đã cập nhật ga tàu cao tốc thành công!");
    }

    onClose();
  };

  // Popular stations lists
  const chongqingStations = [
    { vn: "Ga Tiểu Thập Tự", zh: "小什字站" },
    { vn: "Ga Từ Khí Khẩu", zh: "磁器口站" },
    { vn: "Ga Lý Tử Bá", zh: "李子坝站" },
    { vn: "Ga Lâm Giang Môn", zh: "临江门站" },
    { vn: "Ga Tăng Gia Nham", zh: "曾家岩站" },
    { vn: "Ga Triều Thiên Môn", zh: "朝天门站" },
    { vn: "Ga Thất Tinh Cương", zh: "七星岗站" },
    { vn: "Ga Trùng Khánh Bắc (Nam Quảng Trường)", zh: "重庆北站南广场站" },
    { vn: "Ga Giác Trường Khẩu", zh: "较场口站" },
  ];

  const chengduStations = [
    { vn: "Ga Quảng trường Thiên Phủ", zh: "天府广场站" },
    { vn: "Ga Phố Xuân Hy", zh: "春熙路站" },
    { vn: "Ga Tu viện Văn Thù", zh: "文殊院站" },
    { vn: "Ga Đại lộ Gấu Trúc", zh: "熊猫大道站" },
    { vn: "Ga Đường Thảo Đường Bắc", zh: "草堂北路站" },
    { vn: "Ga Ngõ Rộng Ngõ Hẹp", zh: "宽窄巷子站" },
    { vn: "Ga Công viên Nhân Dân", zh: "人民公园站" },
    { vn: "Ga Tây Phố (Xipu)", zh: "犀浦站" },
    { vn: "Ga Núi Thanh Thành", zh: "青城山站" },
    { vn: "Ga Công viên Ly Đôi", zh: "离堆公园站" },
    { vn: "Ga Nam Thành Đô (Huoche Nanzhan)", zh: "火车南站" },
    { vn: "Ga Đông Thành Đô (Chengdu East)", zh: "成都东客站" },
    { vn: "Ga Sân bay Quốc tế Thiên Phủ T1/T2", zh: "天府机场1号2号航站楼站" },
  ];

  const trainStations = [
    { vn: "Ga Trương Gia Giới Tây", zh: "张家界西站" },
    { vn: "Ga Vũ Long", zh: "武隆站" },
    { vn: "Ga Vũ Long Nam", zh: "武隆南站" },
    { vn: "Ga Trùng Khánh Bắc", zh: "重庆北站" },
    { vn: "Ga Trùng Khánh Tây", zh: "重庆西站" },
    { vn: "Ga Đại Túc Nam", zh: "大足南站" },
    { vn: "Ga Thành Đô Đông", zh: "成都东站" },
    { vn: "Ga Thành Đô Nam", zh: "成都南站" },
    { vn: "Ga Lạc Sơn", zh: "乐山站" },
    { vn: "Ga Núi Nga Mi", zh: "峨眉山站" },
    { vn: "Ga Tây Phố (Xipu)", zh: "犀浦站" },
    { vn: "Ga Núi Thanh Thành", zh: "青城山站" },
    { vn: "Ga Công viên Ly Đôi (Đô Giang Yển)", zh: "离堆公园站" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Train className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white">
                Sửa Tên Ga Đi &amp; Ga Đến
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[280px] sm:max-w-md">
                Hoạt động: <strong className="text-amber-400">{event.activity_title}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Mode Switcher */}
          <div className="flex items-center gap-2 p-1 bg-slate-950 border border-slate-800 rounded-2xl">
            <button
              type="button"
              onClick={() => setMode("metro")}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === "metro"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>🚇</span>
              <span>Metro / Tàu Điện Ngầm</span>
            </button>
            <button
              type="button"
              onClick={() => setMode("train")}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === "train"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>🚄</span>
              <span>Tàu Cao Tốc (12306)</span>
            </button>
          </div>

          {/* Mode: METRO */}
          {mode === "metro" ? (
            <div className="space-y-3.5">
              {/* Line & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tên Tuyến Metro <span className="text-blue-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Line 1 (Tuyến số 1), Line 18..."
                    value={metroLine}
                    onChange={(e) => setMetroLine(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Thời lượng / Số ga ước tính
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: 14 ga (~28 phút)"
                    value={metroDuration}
                    onChange={(e) => setMetroDuration(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-slate-300 outline-none"
                  />
                </div>
              </div>

              {/* Station Swap Action Bar */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Lộ trình hai đầu ga
                </span>
                <button
                  type="button"
                  onClick={handleSwapStations}
                  className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-950/40 hover:bg-blue-900/60 px-2 py-1 rounded-lg border border-blue-800/40 cursor-pointer"
                  title="Đổi chiều ga đi và ga đến"
                >
                  <Repeat className="w-3 h-3" />
                  <span>Đổi chiều Ga Đi ⇄ Ga Đến</span>
                </button>
              </div>

              {/* GA ĐI (DEPARTURE) */}
              <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wide">
                      Ga Đi (Ga Khởi Hành)
                    </span>
                  </div>
                  {(metroDepVn || metroDepZh) && (
                    <span className="text-[10px] font-mono font-medium text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                      Pinyin: {getStationPinyin(metroDepVn, metroDepZh)}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Tên ga (Tiếng Việt / Pinyin)
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Ga Tiểu Thập Tự (Xiaoshizi)"
                      value={metroDepVn}
                      onChange={(e) => setMetroDepVn(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/80 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Chữ Hán chuẩn (để tra MetroMan / Amap)
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: 小什字站"
                      value={metroDepZh}
                      onChange={(e) => setMetroDepZh(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/80 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-emerald-300 font-bold outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* GA ĐẾN (ARRIVAL) */}
              <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                    <span className="text-xs font-extrabold text-red-400 uppercase tracking-wide">
                      Ga Đến (Ga Điểm Đến)
                    </span>
                  </div>
                  {(metroArrVn || metroArrZh) && (
                    <span className="text-[10px] font-mono font-medium text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                      Pinyin: {getStationPinyin(metroArrVn, metroArrZh)}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Tên ga (Tiếng Việt / Pinyin) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Ga Từ Khí Khẩu (Ciqikou)"
                      value={metroArrVn}
                      onChange={(e) => setMetroArrVn(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/80 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Chữ Hán chuẩn (để tra MetroMan / Amap) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: 磁器口站"
                      value={metroArrZh}
                      onChange={(e) => setMetroArrZh(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/80 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-amber-300 font-bold outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Mode: TRAIN (GAOTIE) */
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Số hiệu Tàu Cao Tốc <span className="text-purple-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: G2436, G8608, C6101..."
                    value={trainNumber}
                    onChange={(e) => setTrainNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs text-white font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Thời gian chạy dự kiến
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: 43 phút hoặc 1h 04m"
                    value={trainDuration}
                    onChange={(e) => setTrainDuration(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs text-slate-300 outline-none"
                  />
                </div>
              </div>

              {/* Train Dep */}
              <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wide">
                    Ga Tàu Khởi Hành (Ga Đi)
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Tên Ga (Tiếng Việt)
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Ga Vũ Long"
                      value={trainDepVn}
                      onChange={(e) => setTrainDepVn(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Chữ Hán chuẩn (App 12306)
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: 武隆站"
                      value={trainDepZh}
                      onChange={(e) => setTrainDepZh(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-purple-300 font-bold outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Train Arr */}
              <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                  <span className="text-xs font-extrabold text-red-400 uppercase tracking-wide">
                    Ga Tàu Điểm Đến (Ga Đến)
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Tên Ga (Tiếng Việt) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Ga Trùng Khánh Bắc"
                      value={trainArrVn}
                      onChange={(e) => setTrainArrVn(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Chữ Hán chuẩn (App 12306) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: 重庆北站"
                      value={trainArrZh}
                      onChange={(e) => setTrainArrZh(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-amber-300 font-bold outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Station Suggestions */}
          <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Gợi ý ga nhanh chuẩn xác (Bấm để gán vào ô):
              </span>
              <span className="text-[10px] text-slate-400">Tự động điền cả Tiếng Việt &amp; Chữ Hán</span>
            </div>

            {mode === "metro" ? (
              <div className="space-y-2">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 block mb-1">
                    Thành Đô (Chengdu Metro):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {chengduStations.map((s, idx) => (
                      <div
                        key={idx}
                        className="inline-flex items-center text-[10px] bg-slate-900 border border-slate-800 rounded-lg overflow-hidden"
                      >
                        <span className="px-2 py-0.5 text-slate-300 font-medium">{s.vn}</span>
                        <button
                          type="button"
                          onClick={() => handleApplyPreset(s.vn, s.zh, "dep")}
                          className="px-1.5 py-0.5 bg-emerald-950/60 text-emerald-400 hover:bg-emerald-900 text-[9px] font-bold border-l border-slate-800 cursor-pointer"
                          title={`Gán làm Ga Đi: ${s.vn}`}
                        >
                          Đi
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyPreset(s.vn, s.zh, "arr")}
                          className="px-1.5 py-0.5 bg-red-950/60 text-red-400 hover:bg-red-900 text-[9px] font-bold border-l border-slate-800 cursor-pointer"
                          title={`Gán làm Ga Đến: ${s.vn}`}
                        >
                          Đến
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-slate-400 block mb-1">
                    Trùng Khánh (Chongqing Metro):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {chongqingStations.map((s, idx) => (
                      <div
                        key={idx}
                        className="inline-flex items-center text-[10px] bg-slate-900 border border-slate-800 rounded-lg overflow-hidden"
                      >
                        <span className="px-2 py-0.5 text-slate-300 font-medium">{s.vn}</span>
                        <button
                          type="button"
                          onClick={() => handleApplyPreset(s.vn, s.zh, "dep")}
                          className="px-1.5 py-0.5 bg-emerald-950/60 text-emerald-400 hover:bg-emerald-900 text-[9px] font-bold border-l border-slate-800 cursor-pointer"
                          title={`Gán làm Ga Đi: ${s.vn}`}
                        >
                          Đi
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyPreset(s.vn, s.zh, "arr")}
                          className="px-1.5 py-0.5 bg-red-950/60 text-red-400 hover:bg-red-900 text-[9px] font-bold border-l border-slate-800 cursor-pointer"
                          title={`Gán làm Ga Đến: ${s.vn}`}
                        >
                          Đến
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <span className="text-[10px] font-semibold text-slate-400 block mb-1">
                  Ga Tàu Cao Tốc Chính (Gaotie / CRH):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {trainStations.map((s, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center text-[10px] bg-slate-900 border border-slate-800 rounded-lg overflow-hidden"
                    >
                      <span className="px-2 py-0.5 text-slate-300 font-medium">{s.vn}</span>
                      <button
                        type="button"
                        onClick={() => handleApplyPreset(s.vn, s.zh, "dep")}
                        className="px-1.5 py-0.5 bg-emerald-950/60 text-emerald-400 hover:bg-emerald-900 text-[9px] font-bold border-l border-slate-800 cursor-pointer"
                        title={`Gán làm Ga Tàu Đi: ${s.vn}`}
                      >
                        Đi
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyPreset(s.vn, s.zh, "arr")}
                        className="px-1.5 py-0.5 bg-red-950/60 text-red-400 hover:bg-red-900 text-[9px] font-bold border-l border-slate-800 cursor-pointer"
                        title={`Gán làm Ga Tàu Đến: ${s.vn}`}
                      >
                        Đến
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-extrabold text-slate-950 bg-amber-500 hover:bg-amber-400 shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Lưu Tên Ga Lịch Trình</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
