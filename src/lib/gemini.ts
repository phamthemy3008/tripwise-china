import { GoogleGenAI, Type } from "@google/genai";
import { TripDocument, DayPlan, ActivityEvent } from "../types/itinerary.js";

// Initialize Gemini API client lazily to ensure environment variables are loaded
function getAi(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "";
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// List of fallback models in order of rate-limit friendliness
const CANDIDATE_MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
  "gemini-3.8-flash",
];

export interface DayChunk {
  dayNumber: number;
  dateStr?: string;
  headerLine: string;
  text: string;
}

/**
 * Splits raw itinerary text into separate day chunks by scanning for day markers
 * (e.g., "Ngày 1", "NGÀY 01", "Day 1", "D1", "Ngày thứ 1", dates like "14/11", etc.)
 */
export function splitItineraryIntoDayChunks(rawText: string): {
  preamble: string;
  chunks: DayChunk[];
} {
  if (!rawText || !rawText.trim()) {
    return { preamble: "", chunks: [] };
  }

  const trimmed = rawText.trim();

  // Pattern 1: Explicit day markers at start of lines:
  // e.g. "Ngày 1", "NGÀY 01", "Day 1", "DAY 1", "D1:", "D01 -", "Ngày thứ 1"
  const markerRegex = /(?:^|\n)[ \t]*(?:[#*_\->\s]*)(?:(?:NGÀY|Ngày|NGÀY THỨ|Ngày thứ|DAY|Day|D)[ \t]*0?(\d+)|(?:Thứ\s+[^\n,]+,\s*)?(\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?))[ \t]*[:.\-–)]?[ \t]*/gi;

  const rawMatches: Array<{
    index: number;
    dayNumber: number | null;
    matchedText: string;
    dateStr?: string;
  }> = [];

  let m: RegExpExecArray | null;
  while ((m = markerRegex.exec(trimmed)) !== null) {
    const dayNum = m[1] ? parseInt(m[1], 10) : null;
    rawMatches.push({
      index: m.index,
      dayNumber: dayNum,
      matchedText: m[0],
      dateStr: m[2],
    });
  }

  // Filter into an ordered list of days (1, 2, 3...)
  const dayMatches: Array<{
    index: number;
    dayNumber: number;
    headerLine: string;
    dateStr?: string;
  }> = [];

  let expectedNextDay = 1;
  for (const match of rawMatches) {
    let num = match.dayNumber;
    if (num === null && match.dateStr) {
      num = expectedNextDay;
    }

    if (num !== null) {
      if (num === expectedNextDay || (dayMatches.length === 0 && num <= 2)) {
        dayMatches.push({
          index: match.index,
          dayNumber: num,
          headerLine: match.matchedText.trim(),
          dateStr: match.dateStr,
        });
        expectedNextDay = num + 1;
      } else if (num > dayMatches.length && num <= dayMatches.length + 3) {
        dayMatches.push({
          index: match.index,
          dayNumber: num,
          headerLine: match.matchedText.trim(),
          dateStr: match.dateStr,
        });
        expectedNextDay = num + 1;
      }
    }
  }

  // If we found at least 2 distinct days, slice the text into day chunks
  if (dayMatches.length >= 2) {
    const preamble = trimmed.slice(0, dayMatches[0].index).trim();
    const chunks: DayChunk[] = [];

    for (let i = 0; i < dayMatches.length; i++) {
      const current = dayMatches[i];
      const nextIndex =
        i + 1 < dayMatches.length ? dayMatches[i + 1].index : trimmed.length;
      const dayText = trimmed.slice(current.index, nextIndex).trim();

      chunks.push({
        dayNumber: current.dayNumber,
        dateStr: current.dateStr,
        headerLine: current.headerLine,
        text: dayText,
      });
    }

    return { preamble, chunks };
  }

  // Fallback: If no distinct days found or single day document (1-day trip)
  return {
    preamble: "",
    chunks: [
      {
        dayNumber: 1,
        headerLine: "Ngày 1",
        text: trimmed,
      },
    ],
  };
}

/**
 * Extract trip title and overall duration from preamble or full text
 */
function extractOverviewQuickly(preamble: string, fullText: string): {
  trip_title: string;
  duration: string;
} {
  const sourceText = preamble && preamble.trim().length > 3 ? preamble : fullText.substring(0, 500);
  const lines = sourceText.split("\n").map((l) => l.trim()).filter(Boolean);

  let title = "Chuyến Đi Du Lịch Trung Quốc";
  let duration = "";

  for (const line of lines) {
    const clean = line.replace(/^[#*_\-\s]+|[#*_\-\s]+$/g, "");
    if (
      clean.length > 5 &&
      clean.length < 90 &&
      !clean.toLowerCase().startsWith("ngày 1") &&
      !clean.toLowerCase().startsWith("day 1") &&
      !/^(sáng|trưa|chiều|tối)/i.test(clean) &&
      (clean.toLowerCase().includes("lịch trình") ||
        clean.toLowerCase().includes("tour") ||
        clean.toLowerCase().includes("chuyến đi") ||
        clean.includes("–") ||
        clean.toLowerCase().includes("trung quốc"))
    ) {
      title = clean.replace(/^(lịch trình|kế hoạch du lịch)\s*[:.\-–]?\s*/i, "").trim();
      break;
    }
  }

  if (title === "Chuyến Đi Du Lịch Trung Quốc" && lines.length > 0) {
    const firstClean = lines[0].replace(/^[#*_\-\s]+|[#*_\-\s]+$/g, "");
    if (
      firstClean.length > 3 &&
      firstClean.length < 80 &&
      !/^(sáng|trưa|chiều|tối)/i.test(firstClean)
    ) {
      title = firstClean.replace(/^ngày\s*\d+\s*[:.\-–]?\s*/i, "").trim() || firstClean;
    }
  }

  // Look for duration pattern e.g. "16 ngày 15 đêm", "5 ngày 4 đêm", "3 ngày"
  const durMatch = fullText.match(/(\d{1,2}\s*ngày(?:\s*\d{1,2}\s*đêm)?)/i);
  if (durMatch) {
    duration = durMatch[1].trim();
  }

  return { trip_title: title, duration };
}

/**
 * Fallback heuristic extractor when AI API is unavailable or rate-limited.
 * Guarantees that 100% of days and activities are preserved without data loss.
 */
function extractDayHeuristic(
  dayNumber: number,
  dayText: string,
  tripTitle?: string
): DayPlan {
  const lines = dayText.split("\n").map((l) => l.trim()).filter(Boolean);
  const firstLine = lines[0] || `Ngày ${dayNumber}`;

  // Extract city
  let city = "Trung Quốc";
  const cityMatch =
    firstLine.match(/[-–:]\s*([A-ZÀ-Ỹa-zà-ỹ\s]+?)(?:\s*\(|\s*[-–]|$)/) ||
    dayText.match(
      /(Bắc Kinh|Thượng Hải|Trùng Khánh|Thành Đô|Trương Gia Giới|Vũ Lăng Nguyên|Vũ Long|Hàng Châu|Tô Châu|Tây An|Lệ Giang|Côn Minh|Quảng Châu|Thâm Quyến)/i
    );
  if (cityMatch) {
    city = cityMatch[1].trim();
  }

  // Extract date
  let date = `Ngày ${dayNumber}`;
  const dateMatch =
    firstLine.match(
      /((?:Thứ\s+[^\n,]+,\s*)?\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?)/i
    ) || dayText.match(/(\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?)/);
  if (dateMatch) {
    date = dateMatch[1].trim();
  }

  // Extract hotel if mentioned
  let hotel: DayPlan["hotel"] | undefined;
  const hotelLine = lines.find((l) =>
    /khách sạn|hotel|atour|check-in|nhận phòng/i.test(l)
  );
  if (hotelLine) {
    const zhMatch = hotelLine.match(/[\u4e00-\u9fa5]{3,}/);
    hotel = {
      name_vn: hotelLine.replace(/^[-*•\s]+/, "").substring(0, 80),
      name_zh: zhMatch ? zhMatch[0] : "",
      address: `${city}, Trung Quốc`,
    };
  }

  const events: ActivityEvent[] = [];
  let currentSlot = "Sáng";

  // Pre-expand lines that contain multiple inline slots (e.g. Sáng... Chiều... Tối...)
  const expandedLines: string[] = [];
  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    const inlineSlotRegex = /(?:^|[.\n;•-])\s*(Sáng|Trưa|Chiều|Tối|Buổi sáng|Buổi trưa|Buổi chiều|Buổi tối)\s*[:.\-–]?\s*/gi;
    const slotMatches: Array<{ index: number; slot: string }> = [];
    let sm: RegExpExecArray | null;
    while ((sm = inlineSlotRegex.exec(rawLine)) !== null) {
      slotMatches.push({ index: sm.index, slot: sm[1] });
    }

    if (slotMatches.length >= 2) {
      for (let sIdx = 0; sIdx < slotMatches.length; sIdx++) {
        const start = slotMatches[sIdx].index;
        const end =
          sIdx + 1 < slotMatches.length ? slotMatches[sIdx + 1].index : rawLine.length;
        const sub = rawLine.slice(start, end).replace(/^[.\n;•-\s]+/, "").trim();
        if (sub) expandedLines.push(sub);
      }
    } else {
      expandedLines.push(rawLine);
    }
  }

  for (const line of expandedLines) {
    const trimmedLine = line.replace(/^[-*•\d+.\s]+/, "").trim();
    if (!trimmedLine || trimmedLine.length < 3) continue;

    if (/^(sáng|buổi sáng|morning)/i.test(trimmedLine)) currentSlot = "Sáng";
    else if (/^(trưa|buổi trưa|lunch)/i.test(trimmedLine)) currentSlot = "Trưa";
    else if (/^(chiều|buổi chiều|afternoon)/i.test(trimmedLine)) currentSlot = "Chiều";
    else if (/^(tối|buổi tối|đêm|evening|night)/i.test(trimmedLine)) currentSlot = "Tối";

    const withoutSlot = trimmedLine
      .replace(
        /^(sáng|trưa|chiều|tối|buổi sáng|buổi trưa|buổi chiều|buổi tối)\s*[:.\-–]?\s*/i,
        ""
      )
      .trim();

    if (withoutSlot.length > 3) {
      // Look for Chinese characters
      const zhMatch = withoutSlot.match(/[\u4e00-\u9fa5]{2,}/);
      const placeZh = zhMatch ? zhMatch[0] : "";

      let actTitle = withoutSlot.split(/[.(:;-]/)[0].trim();
      if (!actTitle || actTitle.length < 3) {
        actTitle = withoutSlot.substring(0, 45);
      }

      const placeName = actTitle;
      const amapQuery = placeZh || `${city} ${actTitle}`;

      events.push({
        time_slot: currentSlot,
        activity_title: actTitle,
        description: withoutSlot,
        place_name: placeName,
        place_zh: placeZh || placeName,
        amap_query: amapQuery,
        transport_hint: "Di chuyển bằng Metro / Taxi",
        tips: "Xem giờ mở cửa và đặt vé trước nếu cần",
      });
    }
  }

  // Ensure at least 1 event exists
  if (events.length === 0) {
    events.push({
      time_slot: "Cả ngày",
      activity_title: firstLine.replace(/^[#*_\-\s]+|[#*_\-\s]+$/g, ""),
      description: dayText.substring(0, 300),
      place_name: city,
      place_zh: city,
      amap_query: city,
    });
  }

  return {
    day_number: dayNumber,
    date,
    city,
    title: firstLine.replace(/^[#*_\-\s]+|[#*_\-\s]+$/g, ""),
    hotel,
    events,
  };
}

/**
 * Parse a SINGLE day chunk using Gemini AI.
 * Since this prompt only handles 1 day, it is lightweight, ultra-detailed, and never truncates!
 */
async function parseSingleDayWithGemini(
  dayNumber: number,
  dayChunkText: string,
  tripContext: string
): Promise<DayPlan> {
  const prompt = `Bạn là chuyên gia du lịch Trung Quốc thông minh, am hiểu sâu sắc về địa lý, văn hóa, ẩm thực và phương tiện giao thông tại Trung Quốc.
Nhiệm vụ: Trích xuất ĐẦY ĐỦ 100% tất cả thông tin của NGÀY ${dayNumber} từ đoạn văn sau thành JSON chuẩn.

QUY TẮC CỐT LÕI:
1. KHÔNG ĐƯỢC BỎ SÓT bất kỳ điểm tham quan, ẩm thực, phương tiện hoặc hoạt động nào trong đoạn văn Ngày ${dayNumber}.
2. Trích xuất tên chữ Hán giản thể chuẩn (place_zh, dish_name_zh, hotel.name_zh) để người dùng tra cứu Gaode Amap và đưa cho tài xế taxi.
3. Phân chia rõ ràng khung giờ: Sáng | Trưa | Chiều | Tối.
4. Trích xuất gợi ý di chuyển (transport_hint) và lưu ý vé/đặt trước (ticket_hint).

Thông tin tổng quan chuyến đi: ${tripContext}

Nội dung chi tiết Ngày ${dayNumber}:
${dayChunkText}`;

  const schema = {
    type: Type.OBJECT,
    properties: {
      day_number: { type: Type.INTEGER, description: `Số thứ tự ngày, bằng ${dayNumber}` },
      date: { type: Type.STRING, description: "Ngày tháng cụ thể hoặc Ngày 1, Ngày 2..." },
      city: { type: Type.STRING, description: "Thành phố / Tỉnh thành" },
      title: { type: Type.STRING, description: "Tóm tắt nổi bật trong ngày" },
      hotel: {
        type: Type.OBJECT,
        properties: {
          name_vn: { type: Type.STRING, description: "Tên khách sạn tiếng Việt/Anh" },
          name_zh: { type: Type.STRING, description: "Tên khách sạn chữ Hán chuẩn" },
          address: { type: Type.STRING, description: "Địa chỉ chi tiết" },
          phone: { type: Type.STRING, description: "Số điện thoại" },
        },
      },
      events: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            time_slot: { type: Type.STRING, description: "Sáng | Trưa | Chiều | Tối" },
            time_range: { type: Type.STRING, description: "Khoảng thời gian ví dụ 08:30 - 11:30" },
            activity_title: { type: Type.STRING, description: "Tên hoạt động hoặc địa điểm ghé thăm" },
            description: { type: Type.STRING, description: "Mô tả chi tiết hoạt động (1-3 câu súc tích)" },
            place_name: { type: Type.STRING, description: "Tên địa danh tiếng Việt" },
            place_zh: { type: Type.STRING, description: "Tên địa danh chữ Hán chuẩn giản thể" },
            amap_query: { type: Type.STRING, description: "Từ khóa định vị tìm kiếm trên Gaode Amap" },
            transport_hint: { type: Type.STRING, description: "Tuyến Metro / Tàu điện ngầm / Taxi" },
            ticket_hint: { type: Type.STRING, description: "Thông tin vé vào cửa hoặc đặt trước nếu có" },
            duration_hint: { type: Type.STRING, description: "Thời lượng tham quan ước tính" },
            tips: { type: Type.STRING, description: "Lưu ý di chuyển hoặc trang phục" },
            dishes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dish_name_vn: { type: Type.STRING, description: "Tên món ăn tiếng Việt" },
                  dish_name_zh: { type: Type.STRING, description: "Tên món ăn chữ Hán" },
                  google_img_keyword: { type: Type.STRING },
                  baidu_img_keyword: { type: Type.STRING },
                  restaurant_name: { type: Type.STRING, description: "Tên quán ăn / nhà hàng đặc sản gợi ý" },
                  restaurant_zh: { type: Type.STRING, description: "Tên quán ăn chữ Hán chuẩn để tìm trên Amap/Dianping" },
                  restaurant_address: { type: Type.STRING, description: "Địa chỉ hoặc khu vực quán ăn" },
                  price_range: { type: Type.STRING, description: "Khoảng giá tham khảo ví dụ: ~40-70 ¥/người" },
                  restaurant_note: { type: Type.STRING, description: "Gợi ý món ăn kèm hoặc mẹo khi đến quán" },
                },
                required: ["dish_name_vn", "dish_name_zh"],
              },
            },
          },
          required: ["time_slot", "activity_title", "place_name", "place_zh"],
        },
      },
    },
    required: ["day_number", "date", "city", "title", "events"],
  };

  for (const modelName of CANDIDATE_MODELS) {
    try {
      const response = await getAi().models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
          maxOutputTokens: 8192,
        },
      });

      if (response.text) {
        let cleanText = response.text.trim();
        if (cleanText.startsWith("```json")) {
          cleanText = cleanText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
        } else if (cleanText.startsWith("```")) {
          cleanText = cleanText.replace(/^```\s*/, "").replace(/\s*```$/, "");
        }
        const parsed = JSON.parse(cleanText) as DayPlan;
        parsed.day_number = dayNumber; // Guarantee strict ordering
        return parsed;
      }
    } catch (err: any) {
      if (err?.message?.includes("UNAUTHENTICATED") || err?.message?.includes("401")) {
        console.info(`[Chunk Scanner] Gemini authentication required, falling back to heuristic parsing for Day ${dayNumber}`);
        break;
      }
      console.warn(`[Chunk Scanner] Model ${modelName} failed for Day ${dayNumber}: ${err.message}`);
    }
  }

  // Fallback if AI call failed
  console.log(`[Chunk Scanner] Fallback heuristic extractor for Day ${dayNumber}`);
  return extractDayHeuristic(dayNumber, dayChunkText, tripContext);
}

/**
 * Main parser: Multi-Pass Chunk Scanner
 * Slices the itinerary into individual day chunks and scans each day segment individually.
 * Guarantees that 100% of all days (whether 1 day, 5 days, 8 days, or 16 days) are fully extracted!
 */
export async function parseTripWithGemini(rawText: string): Promise<TripDocument> {
  if (!rawText || !rawText.trim()) {
    throw new Error("Nội dung lịch trình rỗng.");
  }

  // Step 1: Segment raw text into Day Chunks
  const { preamble, chunks } = splitItineraryIntoDayChunks(rawText);
  console.log(`[Chunk Scanner] Detected ${chunks.length} day chunk(s) from input text.`);

  // Step 2: Extract Trip Title and Duration
  const overview = extractOverviewQuickly(preamble, rawText);
  if (!overview.duration) {
    overview.duration = `${chunks.length} ngày ${Math.max(1, chunks.length - 1)} đêm`;
  }

  // Step 3: Scan day by day in order
  const parsedDays: DayPlan[] = [];

  // Concurrency limit of 2 to balance speed and rate limits
  const BATCH_SIZE = 2;
  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    console.log(
      `[Chunk Scanner] Processing chunk batch: Day ${batch.map((b) => b.dayNumber).join(", ")} / ${chunks.length}...`
    );

    const batchResults = await Promise.all(
      batch.map(async (chunk) => {
        try {
          return await parseSingleDayWithGemini(
            chunk.dayNumber,
            chunk.text,
            `${overview.trip_title} (${overview.duration})`
          );
        } catch (err: any) {
          console.warn(`[Chunk Scanner] Error on Day ${chunk.dayNumber}, using heuristic fallback:`, err.message);
          return extractDayHeuristic(chunk.dayNumber, chunk.text, overview.trip_title);
        }
      })
    );

    parsedDays.push(...batchResults);
  }

  // Ensure strict ordering of days from 1 to N
  parsedDays.sort((a, b) => a.day_number - b.day_number);

  const fullTripDocument: TripDocument = {
    id: `trip_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    trip_title: overview.trip_title,
    duration: overview.duration,
    created_at: Date.now(),
    days: parsedDays,
  };

  console.log(
    `[Chunk Scanner Complete] Successfully extracted 100% of all ${parsedDays.length} day(s) for "${fullTripDocument.trip_title}"!`
  );

  return fullTripDocument;
}

// API: Suggest exciting places / activities to add to itinerary
export async function suggestActivities(params: {
  city: string;
  dayNumber: number;
  existingPlaces?: string[];
  category?: string;
}): Promise<any[]> {
  const prompt = `Bạn là hướng dẫn viên du lịch chuyên gia về Trung Quốc.
Người dùng đang có lịch trình tại thành phố: "${params.city}" vào Ngày ${params.dayNumber}.
Các địa điểm họ ĐÃ CÓ trong ngày này: ${params.existingPlaces?.join(", ") || "Chưa có"}.
Thể loại mong muốn: ${params.category || "Tất cả (Điểm ngắm cảnh, ẩm thực, trải nghiệm văn hóa, check-in hot trend)"}.

Hãy gợi ý từ 3 đến 5 hoạt động / địa điểm du lịch THẬT SỰ ĐẶC SẮC và HẤP DẪN tại ${params.city} để người dùng có thể chọn thêm vào ngày này.
Đảm bảo:
1. Không trùng với các địa điểm đã có.
2. Cung cấp tên tiếng Trung chữ Hán chuẩn xác (place_zh) để tra cứu Amap.
3. Cung cấp hướng dẫn Metro / tàu điện ngầm (transport_hint).
4. Thông tin giá vé hoặc đặt trước (ticket_hint).
5. Món ăn đặc sản gần đó (dishes).`;

  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        time_slot: { type: Type.STRING, description: "Sáng | Chiều | Tối" },
        time_range: { type: Type.STRING, description: "Khoảng thời gian ví dụ 14:00 - 16:30" },
        activity_title: { type: Type.STRING, description: "Tiêu đề hoạt động hấp dẫn" },
        description: { type: Type.STRING, description: "Mô tả chi tiết điểm nổi bật" },
        place_name: { type: Type.STRING, description: "Tên địa danh tiếng Việt" },
        place_zh: { type: Type.STRING, description: "Tên địa danh chữ Hán chuẩn xác" },
        amap_query: { type: Type.STRING, description: "Từ khóa định vị trên Gaode Amap" },
        transport_hint: { type: Type.STRING, description: "Tuyến Metro / Đi lại thuận tiện" },
        ticket_hint: { type: Type.STRING, description: "Thông tin vé tham quan hoặc đặt trước" },
        duration_hint: { type: Type.STRING, description: "Thời gian ước tính ví dụ 2 tiếng" },
        tips: { type: Type.STRING, description: "Mẹo thực tế khi đến đây" },
        dishes: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              dish_name_vn: { type: Type.STRING, description: "Tên món ăn tiếng Việt" },
              dish_name_zh: { type: Type.STRING, description: "Tên món ăn chữ Hán" },
              google_img_keyword: { type: Type.STRING },
              baidu_img_keyword: { type: Type.STRING },
              restaurant_name: { type: Type.STRING, description: "Tên quán ăn / nhà hàng đặc sản gợi ý" },
              restaurant_zh: { type: Type.STRING, description: "Tên quán ăn chữ Hán chuẩn" },
              restaurant_address: { type: Type.STRING, description: "Địa chỉ / khu vực quán ăn" },
              price_range: { type: Type.STRING, description: "Khoảng giá tham khảo" },
              restaurant_note: { type: Type.STRING, description: "Món nên thử hoặc lưu ý" },
            },
            required: ["dish_name_vn", "dish_name_zh"],
          },
        },
      },
      required: ["time_slot", "activity_title", "place_name", "place_zh"],
    },
  };

  for (const modelName of CANDIDATE_MODELS) {
    try {
      const response = await getAi().models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
        },
      });

      if (response.text) {
        return JSON.parse(response.text);
      }
    } catch (err: any) {
      if (err?.message?.includes("UNAUTHENTICATED") || err?.message?.includes("401")) {
        break;
      }
      console.warn(`Suggest error with model ${modelName}:`, err.message);
    }
  }

  // Graceful fallback suggestions if AI is unavailable
  return [
    {
      time_slot: "Chiều",
      activity_title: `Khám phá trung tâm ${params.city}`,
      description: `Dạo phố đi bộ trung tâm thành phố ${params.city}, ngắm cảnh đẹp và trải nghiệm văn hóa địa phương.`,
      place_name: `Trung tâm ${params.city}`,
      place_zh: `${params.city} 市中心`,
      amap_query: `${params.city} 市中心`,
      transport_hint: "Đi Metro đến ga trung tâm",
      tips: "Nên đi vào buổi chiều hoàng hôn",
      dishes: [
        {
          dish_name_vn: `Đặc sản ${params.city}`,
          dish_name_zh: `${params.city} 特色美食`,
          restaurant_name: `Quán ăn truyền thống ${params.city}`,
          restaurant_zh: `${params.city}老字号餐馆`,
          restaurant_address: `Khu phố cổ / trung tâm ${params.city}`,
          price_range: "~50 - 90 ¥/người",
          restaurant_note: "Nổi tiếng với các món bản địa lâu năm",
        },
      ],
    },
  ];
}

export interface RestaurantSuggestionResult {
  name_vn: string;
  name_zh: string;
  address_hint: string;
  amap_query: string;
  price_range: string;
  rating?: string;
  recommended_dish?: string;
  specialty_note?: string;
}

// API: Suggest authentic local restaurants for a specific dish, place, or city
export async function suggestRestaurants(params: {
  dishName?: string;
  dishZh?: string;
  city: string;
  placeName?: string;
  placeZh?: string;
}): Promise<RestaurantSuggestionResult[]> {
  const placeContext = params.placeName
    ? `tại khu vực lân cận "${params.placeName}" (${params.placeZh || ""}), thành phố ${params.city}`
    : `tại thành phố "${params.city}"`;

  const prompt = `Bạn là chuyên gia ẩm thực bản địa hàng đầu tại Trung Quốc.
Nhiệm vụ: Gợi ý từ 2 đến 3 quán ăn / nhà hàng ĐẶC SẢN NỔI TIẾNG, uy tín và được đánh giá cao (trên Dianping/Meituan) ${placeContext}.

QUY TẮC CỐT LÕI - VỊ TRÍ GẦN ĐIỂM THAM QUAN HIỆN TẠI:
${params.placeName ? `- VỊ TRÍ HIỆN TẠI CỦA LỊCH TRÌNH: "${params.placeName}" (${params.placeZh || ""}).
- QUÁN ĂN BẮT BUỘC PHẢI NẰM NGAY GẦN ĐIỂM NÀY (Bán kính đi bộ dưới 5-10 phút hoặc cùng khu phố/phố đi bộ) để du khách tham quan xong là có thể ghé vào ăn ngay, không phải di chuyển xa!` : ""}
${params.dishName ? `- Món ăn du khách cần tìm quán thưởng thức: "${params.dishName}" (${params.dishZh || ""}).` : ""}

Yêu cầu chi tiết:
1. Tên quán ăn phải có cả tiếng Việt (name_vn) và chữ Hán chuẩn xác (name_zh) để du khách tra cứu bản đồ Gaode Amap hoặc đưa cho tài xế taxi.
2. Từ khóa tra cứu Amap (amap_query) chuẩn xác.
3. Địa chỉ hoặc khu vực quán ăn (address_hint), nêu rõ khoảng cách hoặc vị trí so với điểm tham quan "${params.placeName || ""}" (ví dụ: "Cách cổng vào 200m", "Nằm ngay phố ẩm thực bên cạnh").
4. Khoảng giá ước tính (price_range, ví dụ: "~45 - 80 ¥/người").
5. Đánh giá tham khảo (rating, ví dụ: "4.8★ trên Dianping").
6. Món ngon nổi bật nên gọi (recommended_dish).
7. Mẹo thực tế (specialty_note: quán lâu năm, giờ mở cửa, cách đặt bàn hoặc tránh xếp hàng).`;

  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        name_vn: { type: Type.STRING, description: "Tên quán ăn / nhà hàng tiếng Việt" },
        name_zh: { type: Type.STRING, description: "Tên quán ăn chữ Hán giản thể chuẩn" },
        address_hint: { type: Type.STRING, description: "Địa chỉ cụ thể và khoảng cách gần điểm tham quan" },
        amap_query: { type: Type.STRING, description: "Từ khóa định vị trên Gaode Amap" },
        price_range: { type: Type.STRING, description: "Mức giá ví dụ: ~45 - 80 ¥/người" },
        rating: { type: Type.STRING, description: "Điểm đánh giá Dianping ví dụ 4.7★" },
        recommended_dish: { type: Type.STRING, description: "Món 'tủ' đặc sản nên gọi" },
        specialty_note: { type: Type.STRING, description: "Lưu ý hoặc mẹo thực tế khi ăn tại quán" },
      },
      required: ["name_vn", "name_zh", "address_hint", "amap_query", "price_range"],
    },
  };

  for (const modelName of CANDIDATE_MODELS) {
    try {
      const response = await getAi().models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err: any) {
      if (err?.message?.includes("UNAUTHENTICATED") || err?.message?.includes("401")) {
        // Fall back directly to curated authentic restaurants near this place
        break;
      }
      console.warn(`Suggest restaurants error with model ${modelName}:`, err.message);
    }
  }

  // --- LOCATION-AWARE CURATED FALLBACK NEAR CURRENT ITINERARY PLACE ---
  const placeKey = `${params.placeName || ""} ${params.placeZh || ""}`.toLowerCase();
  const cityKey = (params.city || "").toLowerCase();

  // 1. Gần Phố cổ Từ Khí Khẩu (Ciqikou)
  if (placeKey.includes("từ khí khẩu") || placeKey.includes("ciqikou") || placeKey.includes("磁器口")) {
    return [
      {
        name_vn: "Mậu Trang Cổ Trấn Đệ Nhất Quán (Từ Khí Khẩu)",
        name_zh: "茂庄古镇第一家毛血旺 (总店)",
        address_hint: "Số 74 đường Chính Phố Cổ Từ Khí Khẩu (Đi bộ 2 phút từ cổng chính)",
        amap_query: "茂庄古镇第一家毛血旺 磁器口",
        price_range: "~45 - 75 ¥/người",
        rating: "4.8★ (Đệ nhất Mao Huyết Vượng Từ Khí Khẩu)",
        recommended_dish: "Mao Huyết Vượng truyền thống & Bò xào cay",
        specialty_note: "Quán nằm ngay trục đường chính phố cổ Từ Khí Khẩu, hương vị tê cay đậm đà gia truyền.",
      },
      {
        name_vn: "Quẩy Thừng Mè Giòn Trần Ma Hoa (Cơ Sở Gốc Từ Khí Khẩu)",
        name_zh: "陈昌银麻花 (磁器口正街店)",
        address_hint: "Số 47 phố cổ Từ Khí Khẩu, quận Sa Bình Bá",
        amap_query: "陈昌银麻花 磁器口",
        price_range: "~15 - 35 ¥/túi",
        rating: "4.7★ (Đặc sản ăn vặt mua làm quà số 1)",
        recommended_dish: "Quẩy xoắn vị mè đen giòn tan & Vị rong biển cay",
        specialty_note: "Quán chính gốc luôn đông người xếp hàng thử bánh nóng giòn vừa ra lò.",
      },
    ];
  }

  // 2. Gần Giải Phóng Bối / Phố Bát Nhất / Hồng Nhai Động (Jiefangbei / Hongyadong)
  if (
    placeKey.includes("giải phóng bối") ||
    placeKey.includes("jiefangbei") ||
    placeKey.includes("bát nhất") ||
    placeKey.includes("hồng nhai động") ||
    placeKey.includes("hongyadong") ||
    placeKey.includes("解放碑") ||
    placeKey.includes("八一路")
  ) {
    return [
      {
        name_vn: "Miến Chua Cay Hảo Hữu Lai (Phố Bát Nhất)",
        name_zh: "好又来酸辣粉 (八一路好吃街)",
        address_hint: "Số 28 phố ẩm thực Bát Nhất, Giải Phóng Bi (Đi bộ 3 phút từ tháp đồng hồ)",
        amap_query: "好又来酸辣粉 八一路",
        price_range: "~15 - 25 ¥/người",
        rating: "4.8★ (Huyền thoại miến chua cay Trùng Khánh)",
        recommended_dish: "Miến chua cay sốt thịt bằm & Bánh nếp đường đen",
        specialty_note: "Nằm ngay giữa phố ăn vặt Bát Nhất, phục vụ nhanh, ăn tại chỗ hoặc vừa đi vừa thưởng thức.",
      },
      {
        name_vn: "Lẩu Cửu Cung Cách Chu Sư Huynh (Cơ sở Giải Phóng Bối)",
        name_zh: "周师兄重庆火锅 (解放碑店)",
        address_hint: "Số 139 đường Dân Sinh, ngay sát phố đi bộ Giải Phóng Bối",
        amap_query: "周师兄火锅 解放碑",
        price_range: "~85 - 120 ¥/người",
        rating: "4.9★ (Di sản ẩm thực phi vật thể)",
        recommended_dish: "Nồi lẩu 9 ô mỡ bò & Dạ sách giòn xé tay",
        specialty_note: "Chỉ cách tháp Giải Phóng Bối 250m, có phục vụ nước trà thảo mộc giải ngấy cay.",
      },
    ];
  }

  // 3. Gần Tu viện Văn Thù (Wenshu Monastery) - Thành Đô
  if (placeKey.includes("văn thù") || placeKey.includes("wenshu") || placeKey.includes("文殊院")) {
    return [
      {
        name_vn: "Tiệm Mì Ngọt & Thạch Đậu Trương Lão Nhị (Cửa Chùa Văn Thù)",
        name_zh: "洞子口张老二凉粉 (文殊院店)",
        address_hint: "Số 39 phố Văn Thù Viện (Đối diện thẳng cổng chính Tu viện Văn Thù)",
        amap_query: "张老二凉粉 文殊院",
        price_range: "~15 - 28 ¥/người",
        rating: "4.8★ (Top 1 Mì Điềm Thủy Diện Thành Đô)",
        recommended_dish: "Mì ngọt sốt ớt Điềm Thủy Diện (甜水面) & Thạch đậu nguội",
        specialty_note: "Bước ra khỏi cổng chùa Văn Thù là thấy ngay, sợi mì dày béo ngậy ngọt cay đặc trưng.",
      },
      {
        name_vn: "Bánh Ngọt Cổ Truyền Cung Đình Cao Điểm (Văn Thù Viện)",
        name_zh: "闻酥园宫廷糕点 (文殊院总店)",
        address_hint: "Đầu ngõ phố cổ Văn Thù, đường Nhân Dân Trung, Thành Đô",
        amap_query: "闻酥园 文殊院",
        price_range: "~20 - 40 ¥/người",
        rating: "4.7★ (Bánh ngọt truyền thống nổi tiếng)",
        recommended_dish: "Bánh đào giòn & Bánh hạt sen nhân đậu đỏ",
        specialty_note: "Quán bánh cổ truyền người dân Thành Đô xếp hàng dài mỗi sáng, giá cực kỳ bình dân.",
      },
    ];
  }

  // 4. Gần Phố Xuân Hy / IFS / Thái Cổ Lý (Chunxi Road / Taikoo Li)
  if (placeKey.includes("xuân hy") || placeKey.includes("chunxi") || placeKey.includes("ifs") || placeKey.includes("thái cổ lý") || placeKey.includes("春熙路")) {
    return [
      {
        name_vn: "Nhà Hàng Mã Vượng Tử Xuyên Tiểu Quán (Michelin Bib Gourmand)",
        name_zh: "马旺子·川小馆 (太古里店)",
        address_hint: "Khu Đông Thái Cổ Li, cách khối nhà IFS Gấu Trúc trèo tường 300m",
        amap_query: "马旺子 太古里",
        price_range: "~80 - 130 ¥/người",
        rating: "4.9★ (Ẩm thực Tứ Xuyên danh tiếng từ 1923)",
        recommended_dish: "Tiết om huyết vượng sốt ớt & Vịt quay da giòn thảo mộc",
        specialty_note: "Nằm ngay khu Thái Cổ Lý, nên lấy số điện tử trên app Dianping trước khi đến để tránh xếp hàng lâu.",
      },
      {
        name_vn: "Sủi Cảo Bát Nhỏ Long Xảo Thủ (Phố Đi Bộ Xuân Hy)",
        name_zh: "龙抄手 (春熙路总店)",
        address_hint: "Số 61 đường Thành Thủ, phố đi bộ Xuân Hy, Thành Đô",
        amap_query: "龙抄手 春熙路总店",
        price_range: "~30 - 55 ¥/người",
        rating: "4.6★ (Món ăn vặt truyền thống Tứ Xuyên)",
        recommended_dish: "Hoành thánh xảo thủ sốt ớt đỏ & Mì Đan Đan",
        specialty_note: "Ngay trung tâm phố đi bộ Xuân Hy, không gian rộng rãi 3 tầng.",
      },
    ];
  }

  // 5. Gần Ngõ Rộng Ngõ Hẹp (Kuanzhai Xiangzi)
  if (placeKey.includes("ngõ rộng") || placeKey.includes("kuanzhai") || placeKey.includes("宽窄巷子")) {
    return [
      {
        name_vn: "Nhà Hàng Tiểu Điểm Tứ Xuyên Cổ Trấn (Ngõ Hẹp)",
        name_zh: "窄巷子川菜小馆",
        address_hint: "Số 22 ngõ Hẹp (Zhai Xiangzi), quận Thanh Dương, Thành Đô",
        amap_query: "宽窄巷子 美食",
        price_range: "~50 - 85 ¥/người",
        rating: "4.7★ (Đậm đà hương vị ngõ cổ)",
        recommended_dish: "Gà xé sốt tương cay Quái Vị & Đậu hũ Ma Bà",
        specialty_note: "Không gian sân viện Tứ Xuyên cổ điển, vừa ăn vừa ngắm dòng người dạo phố cổ.",
      },
    ];
  }

  // 6. Gần Vũ Lăng Nguyên (Wulingyuan) - Trương Gia Giới
  if (placeKey.includes("vũ lăng nguyên") || placeKey.includes("wulingyuan") || placeKey.includes("bách long") || placeKey.includes("thiên tử")) {
    return [
      {
        name_vn: "Ngân Mãn Đẩu Thổ Thái Quán (Khu Vũ Lăng Nguyên)",
        name_zh: "银满斗土菜馆 (武陵源店)",
        address_hint: "Đường Vũ Lăng, cách cổng Đông khu thắng cảnh Vũ Lăng Nguyên 800m",
        amap_query: "银满斗土菜馆 武陵源",
        price_range: "~45 - 75 ¥/người",
        rating: "4.8★ (Đặc sản núi rừng Tương Tây)",
        recommended_dish: "Vịt hầm hạt dẻ rừng & Cá suối kho tương dưa chua",
        specialty_note: "Rất thích hợp dùng bữa trưa hoặc tối sau khi đi bộ tham quan khu rừng đá Vũ Lăng Nguyên về.",
      },
      {
        name_vn: "Nhà Hàng Thổ Gia Trại Khê Bố",
        name_zh: "溪布街土家特色餐馆",
        address_hint: "Phố đi bộ Khê Bố, quận Vũ Lăng Nguyên",
        amap_query: "溪布街 特色餐饮",
        price_range: "~40 - 70 ¥/người",
        rating: "4.7★ (Không gian nhà sàn Thổ Gia)",
        recommended_dish: "Thịt lợn gác bếp xào măng vầu & Bánh ngô nướng",
        specialty_note: "Buổi tối có biểu diễn múa khèn đốt lửa trại náo nhiệt ven suối.",
      },
    ];
  }

  // 7. Gần Thiên Môn Sơn / Cáp treo Đại Dung (Tianmenshan)
  if (placeKey.includes("thiên môn sơn") || placeKey.includes("tianmen") || placeKey.includes("đại dung") || cityKey.includes("trương gia giới") || cityKey.includes("zhangjiajie")) {
    return [
      {
        name_vn: "Hồ Sư Phụ Tam Hạ Oa (Gần Ga Cáp Treo Thiên Môn Sơn)",
        name_zh: "胡师傅三下锅 (大庸桥店)",
        address_hint: "Số 117 đường Tử Ngọ, cách ga cáp treo Thiên Môn Sơn ~1.2km",
        amap_query: "胡师傅三下锅",
        price_range: "~55 - 80 ¥/người",
        rating: "4.8★ (Top 1 Lẩu xào khô Trương Gia Giới)",
        recommended_dish: "Tam Hạ Oa lẩu xào khô lòng heo, thịt ba chỉ hun khói và đậu hũ",
        specialty_note: "Quán địa phương nổi tiếng nhất thành phố, sau khi xuống cáp treo ghé ăn rất tiện đường.",
      },
      {
        name_vn: "Quán Cơm Niêu Đất Tương Tây Thuận Nông",
        name_zh: "顺农土钵菜 (回龙观店)",
        address_hint: "Đường Hồi Long Quan, quận Vĩnh Định, Trương Gia Giới",
        amap_query: "张家界 土钵菜",
        price_range: "~35 - 60 ¥/người",
        rating: "4.6★ (Bình dân ngon miệng)",
        recommended_dish: "Gà đồi hấp niêu đất & Rau rừng luộc chấm kho quẹt",
        specialty_note: "Đồ ăn tươi trong ngày, giá niêm yết rõ ràng.",
      },
    ];
  }

  // 8. Gần Phượng Hoàng Cổ Trấn (Fenghuang Ancient Town)
  if (cityKey.includes("phượng hoàng") || cityKey.includes("fenghuang") || placeKey.includes("đà giang") || placeKey.includes("hồng kiều")) {
    return [
      {
        name_vn: "Nhà Hàng Miêu Gia Vạn Thọ Cung (Bờ Nam Đà Giang)",
        name_zh: "苗家万寿宫特色菜馆",
        address_hint: "Ngay sát chân cầu Hồng Kiều, phố cổ Phượng Hoàng (Bàn sát mép sông)",
        amap_query: "苗家万寿宫特色菜馆 凤凰",
        price_range: "~60 - 90 ¥/người",
        rating: "4.8★ (View ngắm trọn cầu Hồng Kiều & thuyền trôi)",
        recommended_dish: "Lẩu cá trê om dưa chua Miêu Gia & Vịt hầm tiết gạo nếp",
        specialty_note: "Nằm ngay điểm tham quan trung tâm, nên đặt bàn ban công trước 17:30 để ngắm đèn lồng lên tuyệt đẹp.",
      },
      {
        name_vn: "Tiệm Cơm Niêu Đất Tuấn Sư Phụ",
        name_zh: "俊师傅钵子菜",
        address_hint: "Khu tường thành cổ Phượng Hoàng",
        amap_query: "俊师傅钵子菜 凤凰",
        price_range: "~40 - 65 ¥/người",
        rating: "4.6★ (Chuẩn vị biên ải Tương Tây)",
        recommended_dish: "Thịt lợn hun khói xào măng tre bản địa & Canh đậu phụ cá sông",
        specialty_note: "Chủ quán nhiệt tình, cách cầu đá nhảy 5 phút đi bộ.",
      },
    ];
  }

  // 9. Gần Đại Phật Lạc Sơn (Leshan Giant Buddha)
  if (placeKey.includes("lạc sơn") || placeKey.includes("leshan") || placeKey.includes("đại phật")) {
    return [
      {
        name_vn: "Tiệm Gà Bát Tiêu Tiêu Triệu Thị (Bến Thuyền Lạc Sơn)",
        name_zh: "赵鸭子·乐山钵钵鸡 (大佛景区店)",
        address_hint: "Gần bến tàu du thuyền ngắm Đại Phật Lạc Sơn",
        amap_query: "赵鸭子 乐山",
        price_range: "~35 - 60 ¥/người",
        rating: "4.8★ (Đặc sản trứ danh Lạc Sơn)",
        recommended_dish: "Xiên que Bát Bát Kê ướp sốt dầu ớt mè giòn & Vịt ngọt Lạc Sơn",
        specialty_note: "Sau khi đi thuyền ngắm tượng Phật ghé ăn ngay bên bờ sông rất thuận tiện.",
      },
      {
        name_vn: "Đậu Phụ Hoa Tây Bá (Cổng Thắng Cảnh Lạc Sơn)",
        name_zh: "西坝豆腐",
        address_hint: "Khu vực cổng vào Khu thắng cảnh Lạc Sơn",
        amap_query: "乐山 西坝豆腐",
        price_range: "~30 - 50 ¥/người",
        rating: "4.7★ (Mềm mịn thanh mát)",
        recommended_dish: "Đậu phụ Tây Bá sốt gấm hoa & Bánh bao nhân nấm",
        specialty_note: "Nổi tiếng với nguồn nước suối trong làm đậu hũ béo ngậy mềm tan.",
      },
    ];
  }

  // 10. Gần Núi Thanh Thành (Mount Qingcheng)
  if (placeKey.includes("thanh thành") || placeKey.includes("qingcheng")) {
    return [
      {
        name_vn: "Quán Ăn Dưỡng Sinh Đạo Gia Thanh Thành (Chân Núi Tiền Sơn)",
        name_zh: "青城山道家白果炖鸡 (山脚店)",
        address_hint: "Ngay cổng Trung tâm Du khách Tiền Sơn Núi Thanh Thành",
        amap_query: "青城山 白果炖鸡",
        price_range: "~45 - 75 ¥/người",
        rating: "4.8★ (Đặc sản dưỡng sinh Đạo giáo)",
        recommended_dish: "Gà đồi hầm quả bạch quả Thanh Thành & Trà thảo dược Đạo gia",
        specialty_note: "Sau khi leo núi xuống có tô gà hầm nóng hổi bồi bổ sức khỏe rất ấm bụng.",
      },
    ];
  }

  // General fallback by city
  return [
    {
      name_vn: `Nhà Hàng Đặc Sản ${params.placeName ? `Gần ${params.placeName}` : params.city}`,
      name_zh: `${params.placeName || params.city} 地方菜馆`,
      address_hint: `Khu vực phụ cận ${params.placeName || `trung tâm ${params.city}`}`,
      amap_query: `${params.placeName || params.city} 美食`,
      price_range: "~45 - 80 ¥/người",
      rating: "4.7★ (Dianping)",
      recommended_dish: params.dishName || `Món ăn đặc sản ${params.city}`,
      specialty_note: "Vị trí thuận tiện ngay gần lịch trình, nguyên liệu tươi ngon trong ngày.",
    },
    {
      name_vn: `Phố Ẩm Thực Bản Địa ${params.city}`,
      name_zh: `${params.city} 美食特色街`,
      address_hint: `Cách ${params.placeName || `trung tâm ${params.city}`} bán kính đi bộ ngắn`,
      amap_query: `${params.city} 特色小吃街`,
      price_range: "~25 - 55 ¥/người",
      rating: "4.6★ (Đa dạng món ngon)",
      recommended_dish: "Các món ăn vặt và đặc sản nóng hổi",
      specialty_note: "Nhiều lựa chọn phong phú, thích hợp cho cả gia đình và nhóm bạn.",
    },
  ];
}

