import { ActivityEvent, HotelInfo, TransportDetail } from "../types/itinerary.js";

export interface ParsedTransport {
  primaryMode: "metro" | "taxi" | "train" | "flight" | "cableway" | "walk" | "bus" | "other";
  modes: Array<"metro" | "taxi" | "train">;
  summary: string;
  
  // Metro details
  metro?: {
    line: string;
    departureStationVn: string;
    departureStationZh: string;
    arrivalStationVn: string;
    arrivalStationZh: string;
    durationEstimate?: string;
  };

  // High-speed train (Gaotie / 12306)
  train?: {
    trainNumber: string;
    departureStationVn: string;
    departureStationZh: string;
    arrivalStationVn: string;
    arrivalStationZh: string;
    duration?: string;
  };

  // Taxi / DiDi
  taxi?: {
    pickupVn: string;
    pickupZh: string;
    dropoffVn: string;
    dropoffZh: string;
    durationEstimate?: string;
    fareEstimate?: string;
  };
}

/**
 * Intelligent parser that extracts Metro stations, Train numbers, and DiDi destinations
 * from activity events, transport hints, city, and hotel context.
 */
export function parseTransportEvent(
  event: ActivityEvent,
  hotel?: HotelInfo,
  city?: string,
  previousEvent?: ActivityEvent
): ParsedTransport {
  const hint = (event.transport_hint || "").trim();
  const lowerHint = hint.toLowerCase();
  const detail = event.transport_detail;

  // Detect modes present in the hint
  const hasMetro =
    detail?.mode === "metro" ||
    /metro|tàu điện ngầm|subway|line\s*\d+|ga\s+[a-zà-ỹ]/i.test(hint) ||
    /ga\s+ciqikou|ga\s+zengjiayan|ga\s+chaotianmen|ga\s+wenshu|ga\s+chunxi|ga\s+panda|ga\s+tianfu|ga\s+caotang|ga\s+kuanzhai|ga\s+xipu|ga\s+people/i.test(
      lowerHint
    );

  const hasTrain =
    detail?.mode === "train" ||
    detail?.train_number !== undefined ||
    /\b([GDC]\d{2,4})\b/i.test(hint) ||
    /tàu cao tốc|gaotie|đường sắt|c-train|tàu g|tàu c|tàu d/i.test(lowerHint);

  const hasTaxi =
    detail?.mode === "taxi" ||
    /taxi|didi|xe đón|xe riêng|xe đưa đón|xe công nghệ/i.test(lowerHint) ||
    (!hasMetro && !hasTrain && /phút.*về|phút.*đến|di chuyển/i.test(lowerHint));

  // Determine primary mode
  let primaryMode: ParsedTransport["primaryMode"] = "other";
  if (detail?.mode) {
    primaryMode = detail.mode;
  } else if (hasTrain) {
    primaryMode = "train";
  } else if (hasMetro) {
    primaryMode = "metro";
  } else if (hasTaxi) {
    primaryMode = "taxi";
  } else if (/cáp treo|cableway/i.test(lowerHint)) {
    primaryMode = "cableway";
  } else if (/máy bay|chuyến bay|flight/i.test(lowerHint)) {
    primaryMode = "flight";
  } else if (/đi bộ|dạo bộ|walk/i.test(lowerHint)) {
    primaryMode = "walk";
  } else if (/xe buýt|bus/i.test(lowerHint)) {
    primaryMode = "bus";
  }

  const modes: Array<"metro" | "taxi" | "train"> = [];
  if (hasMetro) modes.push("metro");
  if (hasTaxi) modes.push("taxi");
  if (hasTrain) modes.push("train");

  // Always make Taxi available as an alternative when travelling
  if (!modes.includes("taxi")) {
    modes.push("taxi");
  }

  // --- 1. PARSE METRO INFO ---
  let metroInfo: ParsedTransport["metro"] = undefined;
  if (hasMetro || detail?.metro_line) {
    // Metro line
    let line = detail?.metro_line || "";
    if (!line) {
      const lineMatch = hint.match(/(?:Metro\s+)?(Line\s*\d+(?:\/\d+)?(?:\s+tàu\s+nhanh\s+Express)?|Tuyến\s*số\s*\d+|Tuyến\s*\d+)/i);
      if (lineMatch) {
        line = lineMatch[1];
      } else {
        line = "Tuyến Metro đô thị";
      }
    }

    // Departure station
    let depVn = detail?.departure_station_vn || "";
    let depZh = detail?.departure_station_zh || "";
    if (!depVn || !depZh) {
      if (previousEvent && previousEvent.place_name) {
        depVn = `Ga gần ${previousEvent.place_name}`;
        depZh = previousEvent.place_zh ? `${previousEvent.place_zh}站` : "";
      } else if (hotel?.name_vn) {
        depVn = `Ga gần khách sạn (${hotel.name_vn.split("(")[0].trim()})`;
        depZh = hotel.name_zh ? `${hotel.name_zh}站` : "酒店附近地铁站";
      } else if (city?.includes("Thành Đô") || city?.includes("Chengdu")) {
        depVn = "Ga Quảng trường Thiên Phủ";
        depZh = "天府广场站";
      } else if (city?.includes("Trùng Khánh") || city?.includes("Chongqing")) {
        depVn = "Ga Tiểu Thập Tự (Giải Phóng Bối)";
        depZh = "小什字站";
      } else {
        depVn = "Ga Trung tâm khởi hành";
        depZh = "市中心站";
      }
    }

    // Arrival station
    let arrVn = detail?.arrival_station_vn || "";
    let arrZh = detail?.arrival_station_zh || "";
    if (!arrVn || !arrZh) {
      const gaMatch = hint.match(/ga\s+([A-Za-z\s'’]+?)(?:\s+đổi|\s+về|\s+ra|\s+đón|\s*[;,.]|$)/i);
      if (gaMatch) {
        const rawGa = gaMatch[1].trim();
        arrVn = `Ga ${rawGa}`;
        arrZh = mapStationNameToZh(rawGa, event.place_zh);
      } else if (event.place_zh) {
        arrVn = `Ga ${event.place_name}`;
        arrZh = `${event.place_zh}站`;
      } else {
        arrVn = `Ga ${event.place_name}`;
        arrZh = "目的地地铁站";
      }
    }

    metroInfo = {
      line,
      departureStationVn: depVn,
      departureStationZh: depZh,
      arrivalStationVn: arrVn,
      arrivalStationZh: arrZh,
      durationEstimate: extractDuration(hint) || "~15 - 25 phút",
    };
  }

  // --- 2. PARSE HIGH-SPEED TRAIN (12306) INFO ---
  let trainInfo: ParsedTransport["train"] = undefined;
  if (hasTrain || detail?.train_number) {
    let trainNumber = detail?.train_number || "";
    if (!trainNumber) {
      const trainMatch = hint.match(/\b([GDC]\d{2,4})\b/i);
      if (trainMatch) {
        trainNumber = trainMatch[1].toUpperCase();
      } else if (/c-train/i.test(hint)) {
        trainNumber = "Tàu liên đô thị C-Train (C6101)";
      } else {
        trainNumber = "Tàu Gaotie CRH";
      }
    }

    let depStationVn = detail?.train_departure_station_vn || "";
    let depStationZh = detail?.train_departure_station_zh || "";
    let arrStationVn = detail?.train_arrival_station_vn || "";
    let arrStationZh = detail?.train_arrival_station_zh || "";

    if (!depStationVn || !arrStationVn) {
      // Smart station inference based on itinerary text
      if (trainNumber === "G2448" || /G2448/i.test(hint)) {
        depStationVn = "Ga Trương Gia Giới Tây / Trùng Khánh";
        depStationZh = "张家界西站 / 重庆北站";
        arrStationVn = "Ga Vũ Long";
        arrStationZh = "武隆站";
      } else if (trainNumber === "G2436" || /G2436/i.test(hint)) {
        depStationVn = "Ga Vũ Long";
        depStationZh = "武隆站";
        arrStationVn = "Ga Trùng Khánh Bắc";
        arrStationZh = "重庆北站";
      } else if (trainNumber === "G8608" || /G8608/i.test(hint)) {
        depStationVn = "Ga Trùng Khánh Bắc";
        depStationZh = "重庆北站";
        arrStationVn = "Ga Thành Đô Đông";
        arrStationZh = "成都东站";
      } else if (/thành đô.*lạc sơn|chengdudong.*leshan/i.test(hint)) {
        depStationVn = "Ga Thành Đô Đông";
        depStationZh = "成都东站";
        arrStationVn = "Ga Lạc Sơn";
        arrStationZh = "乐山站";
      } else if (/leshan.*emeishan|lạc sơn.*nga mi/i.test(hint)) {
        depStationVn = "Ga Lạc Sơn";
        depStationZh = "乐山站";
        arrStationVn = "Ga Nga Mi Sơn";
        arrStationZh = "峨眉山站";
      } else if (/nga mi.*thành đô|emeishan.*chengdu/i.test(hint)) {
        depStationVn = "Ga Nga Mi Sơn";
        depStationZh = "峨眉山站";
        arrStationVn = "Ga Thành Đô Đông";
        arrStationZh = "成都东站";
      } else if (/xipu.*qingcheng/i.test(hint)) {
        depStationVn = "Ga Tây Phố (Xipu)";
        depStationZh = "犀浦站";
        arrStationVn = "Ga Núi Thanh Thành (Qingchengshan)";
        arrStationZh = "青城山站";
      } else {
        depStationVn = `Ga trung tâm ${city || "Khởi hành"}`;
        depStationZh = `${city || "城市"}火车站`;
        arrStationVn = `Ga đến ${event.place_name}`;
        arrStationZh = `${event.place_zh || "目的地"}站`;
      }
    }

    trainInfo = {
      trainNumber,
      departureStationVn: depStationVn,
      departureStationZh: depStationZh,
      arrivalStationVn: arrStationVn,
      arrivalStationZh: arrStationZh,
      duration: detail?.train_duration || extractDuration(hint) || "Tra cứu trên 12306",
    };
  }

  // --- 3. PARSE TAXI / DIDI INFO ---
  const pickupVn =
    detail?.pickup_name_vn ||
    (previousEvent ? previousEvent.place_name : hotel ? hotel.name_vn : "Vị trí hiện tại của bạn");
  const pickupZh =
    detail?.pickup_name_zh ||
    (previousEvent ? previousEvent.place_zh : hotel ? hotel.name_zh : "当前位置");

  const dropoffVn = detail?.dropoff_name_vn || event.place_name;
  const dropoffZh = detail?.dropoff_name_zh || event.place_zh || event.place_name;

  const taxiDuration = detail?.estimated_duration || extractDuration(hint) || "~15 - 20 phút";
  const fare = detail?.estimated_fare || estimateFare(taxiDuration);

  const taxiInfo = {
    pickupVn,
    pickupZh,
    dropoffVn,
    dropoffZh,
    durationEstimate: taxiDuration,
    fareEstimate: fare,
  };

  return {
    primaryMode,
    modes,
    summary: hint || "Di chuyển thuận tiện",
    metro: metroInfo,
    train: trainInfo,
    taxi: taxiInfo,
  };
}

/**
 * Maps known station names in Vietnamese or Pinyin to exact simplified Chinese characters.
 */
function mapStationNameToZh(stationPinyin: string, fallbackZh: string): string {
  const p = stationPinyin.toLowerCase().trim();
  const map: Record<string, string> = {
    ciqikou: "磁器口站",
    zengjiayan: "曾家岩站",
    chaotianmen: "朝天门站",
    wenshu: "文殊院站",
    "wenshu monastery": "文殊院站",
    chunxi: "春熙路站",
    "chunxi road": "春熙路站",
    panda: "熊猫大道站",
    "panda avenue": "熊猫大道站",
    tianfu: "天府广场站",
    "tianfu square": "天府广场站",
    caotang: "草堂北路站",
    "caotang road north": "草堂北路站",
    kuanzhai: "宽窄巷子站",
    kuanzhaixiangzi: "宽窄巷子站",
    xipu: "犀浦站",
    "lidui park": "离堆公园站",
    qingcheng: "青城山站",
    qingchengshan: "青城山站",
    qingchengtrail: "青城山站",
    leshan: "乐山站",
    emeishan: "峨眉山站",
    "people's park": "人民公园站",
    people: "人民公园站",
    tfu: "天府机场站",
    "chengdudong": "成都东站",
    "chengdunan": "成都南站",
    "chongqingbei": "重庆北站",
    wulong: "武隆站",
  };

  for (const [key, zh] of Object.entries(map)) {
    if (p.includes(key)) return zh;
  }

  if (fallbackZh) {
    return `${fallbackZh}站`;
  }
  return `${stationPinyin}站`;
}

function extractDuration(text: string): string | null {
  const m = text.match(/\(([^)]*(?:phút|h|m|tiếng)[^)]*)\)/i) ||
            text.match(/(\d+\s*(?:phút|h\s*\d*m|tiếng))/i);
  return m ? m[1].trim() : null;
}

function estimateFare(durationStr: string): string {
  if (durationStr.includes("45")) return "~65 - 90 ¥";
  if (durationStr.includes("30")) return "~45 - 60 ¥";
  if (durationStr.includes("20")) return "~25 - 35 ¥";
  if (durationStr.includes("12") || durationStr.includes("15")) return "~18 - 25 ¥";
  if (durationStr.includes("5") || durationStr.includes("10")) return "~12 - 16 ¥";
  return "~20 - 35 ¥";
}
