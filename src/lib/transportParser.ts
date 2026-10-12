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
    departureStationPinyin?: string;
    arrivalStationVn: string;
    arrivalStationZh: string;
    arrivalStationPinyin?: string;
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
 * Verified stations dictionary mapping keywords / Chinese names to standard Vietnamese & Pinyin
 */
export interface StationEntry {
  vn: string;
  zh: string;
  pinyin: string;
}

export const KNOWN_METRO_STATIONS: Record<string, StationEntry> = {
  // Trùng Khánh (Chongqing)
  xiaoshizi: { vn: "Ga Tiểu Thập Tự (Xiaoshizi)", zh: "小什字站", pinyin: "Xiaoshizi" },
  linjiangmen: { vn: "Ga Lâm Giang Môn (Linjiangmen)", zh: "临江门站", pinyin: "Linjiangmen" },
  jiaochangkou: { vn: "Ga Giác Trường Khẩu (Jiaochangkou)", zh: "较场口站", pinyin: "Jiaochangkou" },
  ciqikou: { vn: "Ga Từ Khí Khẩu (Ciqikou)", zh: "磁器口站", pinyin: "Ciqikou" },
  liziba: { vn: "Ga Lý Tử Bá (Liziba)", zh: "李子坝站", pinyin: "Liziba" },
  zengjiayan: { vn: "Ga Tăng Gia Nham (Zengjiayan)", zh: "曾家岩站", pinyin: "Zengjiayan" },
  chaotianmen: { vn: "Ga Triều Thiên Môn (Chaotianmen)", zh: "朝天门站", pinyin: "Chaotianmen" },
  qixinggang: { vn: "Ga Thất Tinh Cương (Qixinggang)", zh: "七星岗站", pinyin: "Qixinggang" },
  chongqingbei_subway: { vn: "Ga Trùng Khánh Bắc (Chongqing North Station South Square)", zh: "重庆北站南广场站", pinyin: "Chongqing North Station South Square" },
  chongqingbei_north_subway: { vn: "Ga Trùng Khánh Bắc (Chongqing North Station North Square)", zh: "重庆北站北广场站", pinyin: "Chongqing North Station North Square" },

  // Thành Đô (Chengdu)
  tianfu: { vn: "Ga Quảng trường Thiên Phủ (Tianfu Square)", zh: "天府广场站", pinyin: "Tianfu Square" },
  chunxi: { vn: "Ga Phố Xuân Hy (Chunxi Road)", zh: "春熙路站", pinyin: "Chunxi Road" },
  wenshu: { vn: "Ga Tu viện Văn Thù (Wenshu Monastery)", zh: "文殊院站", pinyin: "Wenshu Monastery" },
  panda: { vn: "Ga Đại lộ Gấu Trúc (Panda Avenue)", zh: "熊猫大道站", pinyin: "Panda Avenue" },
  caotang: { vn: "Ga Đường Thảo Đường Bắc (Caotang Road North)", zh: "草堂北路站", pinyin: "Caotang Road North" },
  kuanzhai: { vn: "Ga Ngõ Rộng Ngõ Hẹp (Kuanzhaixiangzi)", zh: "宽窄巷子站", pinyin: "Kuanzhaixiangzi" },
  renmin: { vn: "Ga Công viên Nhân Dân (People's Park)", zh: "人民公园站", pinyin: "People's Park" },
  xipu: { vn: "Ga Tây Phố (Xipu)", zh: "犀浦站", pinyin: "Xipu" },
  luomashi: { vn: "Ga Lừa Mã Thị (Luomashi)", zh: "骡马市站", pinyin: "Luomashi" },
  qingchengshan: { vn: "Ga Núi Thanh Thành (Qingchengshan)", zh: "青城山站", pinyin: "Qingchengshan" },
  liduigongyuan: { vn: "Ga Công viên Ly Đôi (Lidui Park)", zh: "离堆公园站", pinyin: "Lidui Park" },
  chengdunan_subway: { vn: "Ga Nam Thành Đô (Huoche Nanzhan)", zh: "火车南站", pinyin: "Huoche Nanzhan" },
  chengdudong_subway: { vn: "Ga Đông Thành Đô (Chengdu East Railway Station)", zh: "成都东客站", pinyin: "Chengdu East Railway Station" },
  tfu_airport: { vn: "Ga Sân bay Quốc tế Thiên Phủ T1/T2", zh: "天府机场1号2号航站楼站", pinyin: "Tianfu International Airport Terminal 1 & 2" },
  tfu_airport_north: { vn: "Ga Sân bay Thiên Phủ Bắc", zh: "天府机场北站", pinyin: "Tianfu Airport North" },
};

/**
 * High-Speed Train (Gaotie / 12306) Stations Dictionary
 */
export const KNOWN_TRAIN_STATIONS: Record<string, { vn: string; zh: string; pinyin: string }> = {
  zhangjiajiexi: { vn: "Ga Trương Gia Giới Tây", zh: "张家界西站", pinyin: "Zhangjiajie West" },
  zhangjiajie: { vn: "Ga Trương Gia Giới", zh: "张家界站", pinyin: "Zhangjiajie" },
  wulongnan: { vn: "Ga Vũ Long Nam", zh: "武隆南站", pinyin: "Wulong South" },
  wulong: { vn: "Ga Vũ Long", zh: "武隆站", pinyin: "Wulong" },
  chongqingbei: { vn: "Ga Trùng Khánh Bắc", zh: "重庆北站", pinyin: "Chongqing North" },
  chongqingxi: { vn: "Ga Trùng Khánh Tây", zh: "重庆西站", pinyin: "Chongqing West" },
  dazunan: { vn: "Ga Đại Túc Nam", zh: "大足南站", pinyin: "Dazu South" },
  chengdudong: { vn: "Ga Thành Đô Đông", zh: "成都东站", pinyin: "Chengdu East" },
  chengdunan: { vn: "Ga Thành Đô Nam", zh: "成都南站", pinyin: "Chengdu South" },
  leshan: { vn: "Ga Lạc Sơn", zh: "乐山站", pinyin: "Leshan" },
  emeishan: { vn: "Ga Núi Nga Mi", zh: "峨眉山站", pinyin: "Emeishan" },
  emei: { vn: "Ga Nga Mi", zh: "峨眉站", pinyin: "Emei" },
  xipu_rail: { vn: "Ga Tây Phố (Xipu)", zh: "犀浦站", pinyin: "Xipu" },
  qingchengshan_rail: { vn: "Ga Núi Thanh Thành", zh: "青城山站", pinyin: "Qingchengshan" },
  lidui_rail: { vn: "Ga Công viên Ly Đôi (Đô Giang Yển)", zh: "离堆公园站", pinyin: "Lidui Park" },
};

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

  const cityName = (city || "").toLowerCase();
  const isCityWithSubway =
    cityName.includes("thành đô") ||
    cityName.includes("chengdu") ||
    cityName.includes("trùng khánh") ||
    cityName.includes("chongqing") ||
    cityName.includes("bắc kinh") ||
    cityName.includes("beijing") ||
    cityName.includes("thượng hải") ||
    cityName.includes("shanghai") ||
    cityName.includes("quảng châu") ||
    cityName.includes("guangzhou");

  // Detect modes present in the hint
  const hasMetro =
    detail?.mode === "metro" ||
    Boolean(detail?.metro_line) ||
    Boolean(detail?.departure_station_vn && detail?.arrival_station_vn) ||
    (isCityWithSubway &&
      !/cáp treo|cableway/i.test(hint) &&
      (/metro|tàu điện ngầm|subway|line\s*\d+/i.test(hint) ||
        /ciqikou|zengjiayan|chaotianmen|wenshu|chunxi|panda avenue|tianfu square|caotang|kuanzhai|xipu|lý tử bá|liziba|tiểu thập tự|xiaoshizi|lâm giang môn|linjiangmen|giác trường khẩu|jiaochangkou|nam kiều|people's park/i.test(
          lowerHint
        )));

  const hasTrain =
    detail?.mode === "train" ||
    Boolean(detail?.train_number) ||
    Boolean(detail?.train_departure_station_vn) ||
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

  // Always provide Taxi as an alternative option
  if (!modes.includes("taxi")) {
    modes.push("taxi");
  }

  // --- 1. PARSE METRO INFO ---
  let metroInfo: ParsedTransport["metro"] = undefined;
  if (hasMetro || detail?.metro_line) {
    // Metro line
    let line = detail?.metro_line || "";
    if (!line) {
      const lineMatch = hint.match(
        /(?:Metro\s+)?(Line\s*\d+(?:\/\d+)?(?:\s+tàu\s+nhanh\s+Express)?|Tuyến\s*số\s*\d+|Tuyến\s*\d+)/i
      );
      if (lineMatch) {
        line = lineMatch[1];
      } else if (/line\s*18/i.test(hint)) {
        line = "Line 18 (Tàu nhanh Express)";
      } else if (/line\s*1/i.test(hint)) {
        line = "Line 1 (Tuyến số 1)";
      } else if (/line\s*2/i.test(hint)) {
        line = "Line 2 (Tuyến số 2)";
      } else if (/line\s*3/i.test(hint)) {
        line = "Line 3 (Tuyến số 3)";
      } else if (/line\s*4/i.test(hint)) {
        line = "Line 4 (Tuyến số 4)";
      } else {
        line = "Tuyến Metro đô thị";
      }
    }

    // Departure station
    let depVn = detail?.departure_station_vn || "";
    let depZh = detail?.departure_station_zh || "";
    if (!depVn || !depZh) {
      if (cityName.includes("thành đô") || cityName.includes("chengdu")) {
        if (/line\s*18/i.test(hint) || /sân bay thiên phủ|tfu/i.test(hint)) {
          depVn = "Ga Nam Thành Đô (Huoche Nanzhan)";
          depZh = "火车南站";
        } else {
          depVn = "Ga Quảng trường Thiên Phủ (Tianfu Square)";
          depZh = "天府广场站";
        }
      } else if (cityName.includes("trùng khánh") || cityName.includes("chongqing")) {
        if (/line\s*2/i.test(hint) || /lý tử bá|liziba/i.test(hint)) {
          depVn = "Ga Lâm Giang Môn (Linjiangmen - Giải Phóng Bối)";
          depZh = "临江门站";
        } else {
          depVn = "Ga Tiểu Thập Tự (Xiaoshizi)";
          depZh = "小什字站";
        }
      } else {
        depVn = "Ga trung tâm xuất phát";
        depZh = "中心站";
      }
    }

    // Arrival station
    let arrVn = detail?.arrival_station_vn || "";
    let arrZh = detail?.arrival_station_zh || "";
    if (!arrVn || !arrZh) {
      // Check known keyword matches
      if (/ciqikou|từ khí khẩu/i.test(lowerHint) || /磁器口/.test(event.place_zh)) {
        arrVn = KNOWN_METRO_STATIONS.ciqikou.vn;
        arrZh = KNOWN_METRO_STATIONS.ciqikou.zh;
      } else if (/liziba|lý tử bá/i.test(lowerHint) || /李子坝/.test(event.place_zh)) {
        arrVn = KNOWN_METRO_STATIONS.liziba.vn;
        arrZh = KNOWN_METRO_STATIONS.liziba.zh;
      } else if (/zengjiayan|tam hiệp/i.test(lowerHint) || /曾家岩/.test(event.place_zh)) {
        arrVn = KNOWN_METRO_STATIONS.zengjiayan.vn;
        arrZh = KNOWN_METRO_STATIONS.zengjiayan.zh;
      } else if (/chaotianmen|triều thiên môn/i.test(lowerHint) || /朝天门/.test(event.place_zh)) {
        arrVn = KNOWN_METRO_STATIONS.chaotianmen.vn;
        arrZh = KNOWN_METRO_STATIONS.chaotianmen.zh;
      } else if (/wenshu|văn thù/i.test(lowerHint) || /文殊院/.test(event.place_zh)) {
        arrVn = KNOWN_METRO_STATIONS.wenshu.vn;
        arrZh = KNOWN_METRO_STATIONS.wenshu.zh;
      } else if (/panda|gấu trúc/i.test(lowerHint) || /熊猫/.test(event.place_zh)) {
        arrVn = KNOWN_METRO_STATIONS.panda.vn;
        arrZh = KNOWN_METRO_STATIONS.panda.zh;
      } else if (/caotang|đỗ phủ/i.test(lowerHint) || /草堂|杜甫/.test(event.place_zh)) {
        arrVn = KNOWN_METRO_STATIONS.caotang.vn;
        arrZh = KNOWN_METRO_STATIONS.caotang.zh;
      } else if (/kuanzhai|ngõ rộng/i.test(lowerHint) || /宽窄/.test(event.place_zh)) {
        arrVn = KNOWN_METRO_STATIONS.kuanzhai.vn;
        arrZh = KNOWN_METRO_STATIONS.kuanzhai.zh;
      } else if (/people|nhân dân/i.test(lowerHint) || /人民公园/.test(event.place_zh)) {
        arrVn = KNOWN_METRO_STATIONS.renmin.vn;
        arrZh = KNOWN_METRO_STATIONS.renmin.zh;
      } else if (/chunxi|xuân hy|taikoo|ifs/i.test(lowerHint) || /春熙|IFS/.test(event.place_zh)) {
        arrVn = KNOWN_METRO_STATIONS.chunxi.vn;
        arrZh = KNOWN_METRO_STATIONS.chunxi.zh;
      } else if (/xipu|tây phố/i.test(lowerHint)) {
        arrVn = KNOWN_METRO_STATIONS.xipu.vn;
        arrZh = KNOWN_METRO_STATIONS.xipu.zh;
      } else if (/qingcheng|thanh thành/i.test(lowerHint)) {
        arrVn = KNOWN_METRO_STATIONS.qingchengshan.vn;
        arrZh = KNOWN_METRO_STATIONS.qingchengshan.zh;
      } else if (/lidui|ly đôi|đô giang yển|nam kiều/i.test(lowerHint)) {
        arrVn = KNOWN_METRO_STATIONS.liduigongyuan.vn;
        arrZh = KNOWN_METRO_STATIONS.liduigongyuan.zh;
      } else if (/tfu|thiên phủ.*airport|sân bay thiên phủ/i.test(lowerHint)) {
        arrVn = KNOWN_METRO_STATIONS.tfu_airport.vn;
        arrZh = KNOWN_METRO_STATIONS.tfu_airport.zh;
      } else if (/qixinggang|thất tinh cương/i.test(lowerHint) || /七星岗/.test(event.place_zh)) {
        arrVn = KNOWN_METRO_STATIONS.qixinggang.vn;
        arrZh = KNOWN_METRO_STATIONS.qixinggang.zh;
      } else if (/chongqingbei|trùng khánh bắc/i.test(lowerHint) || /重庆北/.test(event.place_zh)) {
        arrVn = KNOWN_METRO_STATIONS.chongqingbei_subway.vn;
        arrZh = KNOWN_METRO_STATIONS.chongqingbei_subway.zh;
      } else if (/chengdudong|đông thành đô|thành đô đông/i.test(lowerHint) || /成都东/.test(event.place_zh)) {
        arrVn = KNOWN_METRO_STATIONS.chengdudong_subway.vn;
        arrZh = KNOWN_METRO_STATIONS.chengdudong_subway.zh;
      } else if (/huoche nanzhan|nam thành đô|thành đô nam/i.test(lowerHint) || /火车南/.test(event.place_zh)) {
        arrVn = KNOWN_METRO_STATIONS.chengdunan_subway.vn;
        arrZh = KNOWN_METRO_STATIONS.chengdunan_subway.zh;
      } else if (/tianfu square|quảng trường thiên phủ/i.test(lowerHint) || /天府广场/.test(event.place_zh)) {
        arrVn = KNOWN_METRO_STATIONS.tianfu.vn;
        arrZh = KNOWN_METRO_STATIONS.tianfu.zh;
      } else if (event.place_zh) {
        const cleanZh = event.place_zh.replace(/站$/, "").trim();
        arrVn = `Ga ${event.place_name.replace(/^ga\s+/i, "")}`;
        arrZh = cleanZh ? `${cleanZh}站` : "目的地站";
      } else {
        arrVn = `Ga ${event.place_name.replace(/^ga\s+/i, "")}`;
        arrZh = "目的地地铁站";
      }
    }

    const depPinyin = getStationPinyin(depVn, depZh);
    const arrPinyin = getStationPinyin(arrVn, arrZh);

    metroInfo = {
      line,
      departureStationVn: depVn,
      departureStationZh: depZh,
      departureStationPinyin: depPinyin,
      arrivalStationVn: arrVn,
      arrivalStationZh: arrZh,
      arrivalStationPinyin: arrPinyin,
      durationEstimate: detail?.station_count || extractDuration(hint) || "~15 - 25 phút",
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
      if (trainNumber === "G2448" || /G2448/i.test(hint) || /trương gia giới.*vũ long/i.test(lowerHint)) {
        depStationVn = KNOWN_TRAIN_STATIONS.zhangjiajiexi.vn;
        depStationZh = KNOWN_TRAIN_STATIONS.zhangjiajiexi.zh;
        arrStationVn = KNOWN_TRAIN_STATIONS.wulongnan.vn;
        arrStationZh = KNOWN_TRAIN_STATIONS.wulongnan.zh;
      } else if (trainNumber === "G2436" || /G2436/i.test(hint) || /vũ long.*trùng khánh/i.test(lowerHint)) {
        depStationVn = KNOWN_TRAIN_STATIONS.wulong.vn;
        depStationZh = KNOWN_TRAIN_STATIONS.wulong.zh;
        arrStationVn = KNOWN_TRAIN_STATIONS.chongqingbei.vn;
        arrStationZh = KNOWN_TRAIN_STATIONS.chongqingbei.zh;
      } else if (trainNumber === "G8608" || /G8608/i.test(hint) || /trùng khánh.*thành đô/i.test(lowerHint)) {
        depStationVn = KNOWN_TRAIN_STATIONS.chongqingbei.vn;
        depStationZh = KNOWN_TRAIN_STATIONS.chongqingbei.zh;
        arrStationVn = KNOWN_TRAIN_STATIONS.chengdudong.vn;
        arrStationZh = KNOWN_TRAIN_STATIONS.chengdudong.zh;
      } else if (/thành đô.*lạc sơn|chengdudong.*leshan/i.test(lowerHint)) {
        depStationVn = KNOWN_TRAIN_STATIONS.chengdudong.vn;
        depStationZh = KNOWN_TRAIN_STATIONS.chengdudong.zh;
        arrStationVn = KNOWN_TRAIN_STATIONS.leshan.vn;
        arrStationZh = KNOWN_TRAIN_STATIONS.leshan.zh;
      } else if (/leshan.*emeishan|lạc sơn.*nga mi/i.test(lowerHint)) {
        depStationVn = KNOWN_TRAIN_STATIONS.leshan.vn;
        depStationZh = KNOWN_TRAIN_STATIONS.leshan.zh;
        arrStationVn = KNOWN_TRAIN_STATIONS.emeishan.vn;
        arrStationZh = KNOWN_TRAIN_STATIONS.emeishan.zh;
      } else if (/nga mi.*thành đô|emeishan.*chengdu/i.test(lowerHint)) {
        depStationVn = KNOWN_TRAIN_STATIONS.emeishan.vn;
        depStationZh = KNOWN_TRAIN_STATIONS.emeishan.zh;
        arrStationVn = KNOWN_TRAIN_STATIONS.chengdudong.vn;
        arrStationZh = KNOWN_TRAIN_STATIONS.chengdudong.zh;
      } else if (/xipu.*qingcheng|thanh thành/i.test(lowerHint)) {
        depStationVn = KNOWN_TRAIN_STATIONS.xipu_rail.vn;
        depStationZh = KNOWN_TRAIN_STATIONS.xipu_rail.zh;
        arrStationVn = KNOWN_TRAIN_STATIONS.qingchengshan_rail.vn;
        arrStationZh = KNOWN_TRAIN_STATIONS.qingchengshan_rail.zh;
      } else if (/lidui|ly đôi|đô giang yển.*xipu/i.test(lowerHint)) {
        depStationVn = KNOWN_TRAIN_STATIONS.lidui_rail.vn;
        depStationZh = KNOWN_TRAIN_STATIONS.lidui_rail.zh;
        arrStationVn = KNOWN_TRAIN_STATIONS.xipu_rail.vn;
        arrStationZh = KNOWN_TRAIN_STATIONS.xipu_rail.zh;
      } else if (/đại túc|dazu/i.test(lowerHint)) {
        depStationVn = KNOWN_TRAIN_STATIONS.chongqingbei.vn;
        depStationZh = KNOWN_TRAIN_STATIONS.chongqingbei.zh;
        arrStationVn = KNOWN_TRAIN_STATIONS.dazunan.vn;
        arrStationZh = KNOWN_TRAIN_STATIONS.dazunan.zh;
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

function extractDuration(text: string): string | null {
  const m =
    text.match(/\(([^)]*(?:phút|h|m|tiếng)[^)]*)\)/i) ||
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

/**
 * Extracts clean Pinyin / English station name for searching in MetroMan & Amap.
 */
export function getStationPinyin(stationVn: string, stationZh: string): string {
  if (stationZh) {
    const cleanZh = stationZh.replace(/站$/, "").trim();
    const zhToPinyinMap: Record<string, string> = {
      // Chongqing
      "小什字": "Xiaoshizi",
      "临江门": "Linjiangmen",
      "较场口": "Jiaochangkou",
      "磁器口": "Ciqikou",
      "李子坝": "Liziba",
      "曾家岩": "Zengjiayan",
      "朝天门": "Chaotianmen",
      "七星岗": "Qixinggang",
      "重庆北": "Chongqing North",
      "重庆北站": "Chongqing North Railway Station",
      "重庆北站南广场": "Chongqing North Station South Square",
      "重庆北站北广场": "Chongqing North Station North Square",
      "重庆西": "Chongqing West",
      "武隆": "Wulong",
      "武隆南": "Wulong South",
      "大足南": "Dazu South",

      // Chengdu
      "天府广场": "Tianfu Square",
      "春熙路": "Chunxi Road",
      "文殊院": "Wenshu Monastery",
      "熊猫大道": "Panda Avenue",
      "草堂北路": "Caotang Road North",
      "宽窄巷子": "Kuanzhaixiangzi",
      "人民公园": "People's Park",
      "犀浦": "Xipu",
      "骡马市": "Luomashi",
      "青城山": "Qingchengshan",
      "离堆公园": "Lidui Park",
      "火车南站": "Huoche Nanzhan",
      "成都东": "Chengdu East",
      "成都南": "Chengdu South",
      "成都东客": "Chengdu East Railway Station",
      "成都东客站": "Chengdu East Railway Station",
      "天府机场1号2号航站楼": "Tianfu International Airport Terminal 1 & 2",
      "天府机场北": "Tianfu Airport North",
      "天府机场": "Tianfu Airport",

      // Sichuan other
      "乐山": "Leshan",
      "峨眉山": "Emeishan",
      "峨眉": "Emei",
      "张家界西": "Zhangjiajie West",
      "张家界": "Zhangjiajie",

      // Common
      "人民广场": "People's Square",
      "南京东路": "Nanjing Road East",
      "陆家嘴": "Lujiazui",
      "豫园": "Yuyuan Garden",
    };

    if (zhToPinyinMap[cleanZh]) {
      return zhToPinyinMap[cleanZh];
    }
    for (const [key, val] of Object.entries(zhToPinyinMap)) {
      if (cleanZh.includes(key)) {
        return val;
      }
    }
  }

  if (stationVn) {
    const parenMatch = stationVn.match(/\(([^)]+)\)/);
    if (parenMatch) return parenMatch[1].trim();

    const cleaned = stationVn
      .replace(/^ga\s+/i, "")
      .replace(/^trạm\s+/i, "")
      .trim();
    if (cleaned) return cleaned;
  }

  return "Station";
}
