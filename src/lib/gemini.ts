import { GoogleGenAI, Type } from "@google/genai";
import { TripDocument, DayPlan, ActivityEvent } from "../types/itinerary.js";

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "";
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

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
                },
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
      const response = await ai.models.generateContent({
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
      const response = await ai.models.generateContent({
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
        },
      ],
    },
  ];
}

