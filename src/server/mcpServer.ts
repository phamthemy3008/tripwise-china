import { Request, Response, Application } from "express";
import { SAMPLE_TRIPS } from "../data/sampleTrips.js";
import { calculateTripBudgetSummary, DEFAULT_EXCHANGE_RATE } from "../lib/budgetUtils.js";
import { suggestActivities, suggestRestaurants, parseTripWithGemini } from "../lib/gemini.js";
import { TripDocument, ActivityEvent } from "../types/itinerary.js";

// MCP Protocol Specification Version
export const MCP_PROTOCOL_VERSION = "2024-11-05";
export const MCP_SERVER_NAME = "vivuchina-mcp-server";
export const MCP_SERVER_VERSION = "1.0.0";

// Request & Event Logging for MCP Inspector UI
export interface McpLogEntry {
  id: string;
  timestamp: number;
  clientIp?: string;
  sessionId?: string;
  method: string;
  toolName?: string;
  durationMs: number;
  status: "success" | "error";
  requestSummary: string;
  error?: string;
}

const mcpLogs: McpLogEntry[] = [];
const MAX_LOGS = 60;

function addMcpLog(entry: Omit<McpLogEntry, "id" | "timestamp">) {
  const log: McpLogEntry = {
    ...entry,
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: Date.now(),
  };
  mcpLogs.unshift(log);
  if (mcpLogs.length > MAX_LOGS) {
    mcpLogs.pop();
  }
}

// Active SSE client sessions
interface SseClient {
  id: string;
  res: Response;
  createdAt: number;
}

const activeSseClients = new Map<string, SseClient>();

// China Survival Guide Resource text
const CHINA_SURVIVAL_GUIDE_TEXT = `# CẨM NANG SINH TỒN DU LỊCH TRUNG QUỐC (VIVU CHINA MCP)

## 1. Thanh toán không tiền mặt (Alipay & WeChat Pay)
- 99% cửa hàng, taxi và ga tàu không nhận tiền mặt mệnh giá lớn.
- Tải ứng dụng Alipay phiên bản Quốc tế (International Version).
- Liên kết thẻ tín dụng quốc tế Visa/Mastercard (miễn phí quẹt thẻ cho giao dịch dưới 200 RMB / ~700.000 VNĐ).
- Mẫu câu hỏi thanh toán:
  * 扫码支付 (sǎomǎ zhīfù - Quét mã thanh toán)
  * 我扫你还是你扫我？ (wǒ sǎo nǐ háishì nǐ sǎo wǒ? - Tôi quét mã của bạn hay bạn quét mã của tôi?)

## 2. Bản đồ & Chỉ đường (Amap / Gaode Map 高德地图)
- Google Maps bị lệch tọa độ GPS tại Trung Quốc và không cập nhật giao thông công cộng.
- Cài đặt Gaode Map (Amap - 高德地图) để tìm đường đi bộ, xe buýt, tàu điện ngầm chính xác theo thời gian thực.
- Tích hợp sẵn gọi xe taxi DiDi giá chuẩn.

## 3. Tàu cao tốc & Đặt vé (Railway 12306)
- App chính thức: Railway 12306 (có tiếng Anh).
- Đăng ký và xác minh hộ chiếu trước chuyến đi ít nhất 3 ngày.
- Khi vào ga tàu: Sử dụng cổng kiểm soát thủ công (Manual Gate / 人工通道) để nhân viên quét hộ chiếu.

## 4. Mạng Internet & Vượt tường lửa
- Mua eSIM du lịch Trung Quốc có tính năng Roaming (qua Hong Kong / Singapore) để truy cập Google, Facebook, Zalo bình thường không cần bật VPN.
- Khuyên dùng: eSIM Trip.com, Airalo hoặc Nomad.

## 5. Số điện thoại khẩn cấp tại Trung Quốc
- Cảnh sát: 110
- Cứu thương: 120
- Cứu hỏa: 119
- Tai nạn giao thông: 122
`;

const RAILWAY_STATIONS_GUIDE_TEXT = `# BẢNG TRA CỨU GA TÀU CAO TỐC & SÂN BAY TRUNG QUỐC (TIẾNG TRUNG CHỮ HÁN & PINYIN)

## 1. Thành phố Trùng Khánh (Chongqing - 重庆)
- Ga Trùng Khánh Bắc: 重庆北站 (Chóngqìng Běizhàn) - Ga chính tàu cao tốc đi Thành Đô, Trương Gia Giới
- Ga Trùng Khánh Tây: 重庆西站 (Chóngqìng Xīzhàn) - Ga tàu cao tốc phía Tây
- Ga Sa Bình Bá: 沙坪坝站 (Shāpíngbà zhàn)
- Ga tàu điện ngầm Lý Tử Bá (Tàu xuyên chung cư): 李子坝站 (Lǐzǐbà zhàn) - Tuyến Metro số 2
- Sân bay Quốc tế Giang Bắc Trùng Khánh: 重庆江北国际机场 (Chóngqìng Jiāngběi Guójì Jīchǎng - CKG)

## 2. Thành phố Thành Đô (Chengdu - 成都)
- Ga Thành Đô Đông: 成都东站 (Chéngdū Dōngzhàn) - Ga tàu cao tốc lớn nhất Tứ Xuyên
- Ga Thành Đô Nam: 成都南站 (Chéngdū Nánzhàn)
- Ga Thanh Thành Sơn: 青城山站 (Qīngchéngshān zhàn) - Đi núi Đạo Giáo Thanh Thành Sơn
- Ga Ly Đôi Công Viên: 离堆公园站 (Líduīgōngyuán zhàn) - Đi Thủy Lợi Đô Giang Yển
- Ga Lạc Sơn: 乐山站 (Lèshān zhàn) - Đi Đại Phật Lạc Sơn
- Ga Nga Mi Sơn: 峨眉山站 (Éméishān zhàn) - Đi núi Nga Mi
- Sân bay Quốc tế Thiên Phủ: 成都天府国际机场 (Chéngdū Tiānfǔ Guójì Jīchǎng - TFU)
- Sân bay Song Lưu: 成都双流国际机场 (Chéngdū Shuāngliú Guójì Jīchǎng - CTU)

## 3. Trương Gia Giới (Zhangjiajie - 张家界)
- Ga Trương Gia Giới Tây: 张家界西站 (Zhāngjiājiè Xīzhàn) - Ga tàu cao tốc mới kết nối Phù Dung Trấn, Phượng Hoàng Cổ Trấn
- Ga Trương Gia Giới: 张家界站 (Zhāngjiājiè zhàn) - Ga truyền thống
- Ga Phù Dung Trấn: 芙蓉镇站 (Fúróngzhèn zhàn)
- Ga Phượng Hoàng Cổ Trấn: 凤凰古城站 (Fènghuáng Gǔchéng zhàn)
- Sân bay Hà Hoa Trương Gia Giới: 张家界荷花国际机场 (DYG)
`;

// Definition of all 8 MCP Tools
export const MCP_TOOLS = [
  {
    name: "list_trips",
    description: "Liệt kê danh sách tất cả các lịch trình du lịch hiện có trong hệ thống (ID, tên chuyến đi, số ngày, điểm đến, tổng số hoạt động và ngân sách).",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Giới hạn số lượng lịch trình trả về (mặc định 20)",
        },
      },
    },
  },
  {
    name: "get_trip_details",
    description: "Lấy chi tiết toàn bộ lịch trình hoặc một ngày cụ thể (các điểm tham quan, tên tiếng Trung chữ Hán, khung giờ, ghi chú, khách sạn, ga tàu di chuyển, chi phí).",
    inputSchema: {
      type: "object",
      properties: {
        trip_id: {
          type: "string",
          description: "ID của chuyến đi (ví dụ: sample_16d_zjj_cq_cd hoặc ID từ list_trips)",
        },
        day_number: {
          type: "number",
          description: "Số thứ tự ngày cần xem (tùy chọn, từ ngày 1 trở đi. Nếu để trống sẽ trả về toàn bộ các ngày)",
        },
      },
      required: ["trip_id"],
    },
  },
  {
    name: "search_activities",
    description: "Tìm kiếm các hoạt động, địa danh, quán ăn, điểm check-in hoặc ga tàu trong lịch trình theo từ khóa (tiếng Việt hoặc tiếng Trung).",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Từ khóa tìm kiếm (ví dụ: Vũ Lăng Nguyên, lẩu Trùng Khánh, tàu cao tốc, lẩu cay, Trương Gia Giới, Lý Tử Bá)",
        },
        trip_id: {
          type: "string",
          description: "ID chuyến đi cần tìm kiếm (tùy chọn, nếu không có sẽ tìm trong tất cả chuyến đi)",
        },
        city: {
          type: "string",
          description: "Lọc theo thành phố (ví dụ: Trùng Khánh, Thành Đô, Trương Gia Giới)",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "suggest_travel_activities",
    description: "Gợi ý các điểm tham quan, danh lam thắng cảnh, điểm vui chơi nổi tiếng tại một thành phố ở Trung Quốc có chữ Hán và kinh nghiệm thực tế.",
    inputSchema: {
      type: "object",
      properties: {
        city: {
          type: "string",
          description: "Tên thành phố (ví dụ: Trùng Khánh, Thành Đô, Trương Gia Giới, Bắc Kinh, Thượng Hải, Cửu Trại Câu)",
        },
        category: {
          type: "string",
          enum: ["all", "sightseeing", "food", "cultural", "nightlife"],
          description: "Phân loại địa điểm cần gợi ý",
        },
        day_number: {
          type: "number",
          description: "Số thứ tự ngày trong lịch trình (mặc định: 1)",
        },
      },
      required: ["city"],
    },
  },
  {
    name: "suggest_restaurants",
    description: "Gợi ý quán ăn ngon, nhà hàng đặc sản và món ăn truyền thống tại Trung Quốc theo món ăn hoặc thành phố.",
    inputSchema: {
      type: "object",
      properties: {
        city: {
          type: "string",
          description: "Tên thành phố (ví dụ: Trùng Khánh, Thành Đô, Tây An, Quảng Châu)",
        },
        dish_name: {
          type: "string",
          description: "Tên món ăn (ví dụ: Lẩu cay Ma Lạt, Vịt quay, Đậu phụ Ma Bà, Mì Đan Đan)",
        },
        place_name: {
          type: "string",
          description: "Tên địa điểm lân cận",
        },
      },
    },
  },
  {
    name: "calculate_trip_budget",
    description: "Tính toán và phân tích chi tiết ngân sách chuyến đi: tổng chi tiêu, tỷ giá NDT/VND, phân loại theo danh mục (khách sạn, vé máy bay, tàu hỏa/di chuyển, vé tham quan, ăn uống) và theo từng ngày.",
    inputSchema: {
      type: "object",
      properties: {
        trip_id: {
          type: "string",
          description: "ID chuyến đi cần tính ngân sách",
        },
        exchange_rate: {
          type: "number",
          description: "Tỷ giá quy đổi NDT sang VNĐ (mặc định: 3500)",
        },
      },
      required: ["trip_id"],
    },
  },
  {
    name: "add_trip_activity",
    description: "Thêm một hoạt động/sự kiện mới vào một ngày trong lịch trình du lịch (tên hoạt động, tên tiếng Trung chữ Hán, khung giờ, địa điểm, chi phí).",
    inputSchema: {
      type: "object",
      properties: {
        trip_id: {
          type: "string",
          description: "ID chuyến đi cần cập nhật",
        },
        day_number: {
          type: "number",
          description: "Số thứ tự ngày (1-indexed)",
        },
        activity_title: {
          type: "string",
          description: "Tên hoạt động hoặc địa điểm (tiếng Việt)",
        },
        place_zh: {
          type: "string",
          description: "Tên chữ Hán tiếng Trung của địa điểm (để tra Amap / Gaode)",
        },
        time_slot: {
          type: "string",
          description: "Khung giờ (ví dụ: 09:00 - 11:30)",
        },
        notes: {
          type: "string",
          description: "Ghi chú kinh nghiệm, vé vào cửa hoặc phương thức di chuyển",
        },
        cost_rmb: {
          type: "number",
          description: "Chi phí ước tính bằng Nhân Dân Tệ (NDT)",
        },
        cost_category: {
          type: "string",
          enum: ["ticket", "food", "transport", "hotel", "flight", "shopping", "other"],
          description: "Danh mục chi phí",
        },
      },
      required: ["trip_id", "day_number", "activity_title"],
    },
  },
  {
    name: "parse_itinerary_text",
    description: "Sử dụng AI phân tích văn bản ghi chú lịch trình du lịch tự do thành cấu trúc dữ liệu JSON chuẩn với từng ngày, hoạt động và tên tiếng Trung.",
    inputSchema: {
      type: "object",
      properties: {
        raw_text: {
          type: "string",
          description: "Nội dung văn bản ghi chú chuyến đi thô",
        },
      },
      required: ["raw_text"],
    },
  },
];

// MCP Resources Catalog
export const MCP_RESOURCES = [
  {
    uri: "trips://catalog",
    name: "Danh mục chuyến đi ViVu China",
    description: "Danh sách tổng hợp tất cả các chuyến đi, số ngày, điểm đến và trạng thái",
    mimeType: "application/json",
  },
  {
    uri: "guide://china_survival",
    name: "Cẩm nang sinh tồn du lịch Trung Quốc",
    description: "Hướng dẫn cài đặt thanh toán Alipay, WeChat, bản đồ Amap, tàu cao tốc 12306, eSIM và số khẩn cấp",
    mimeType: "text/markdown",
  },
  {
    uri: "guide://railway_stations",
    name: "Bảng đối chiếu ga tàu cao tốc & metro Trung Quốc",
    description: "Tên chữ Hán, phiên âm Pinyin và tiếng Việt của các ga tàu ở Trùng Khánh, Thành Đô, Trương Gia Giới",
    mimeType: "text/markdown",
  },
];

// MCP Prompts Catalog
export const MCP_PROMPTS = [
  {
    name: "plan_china_trip",
    description: "Lập kế hoạch lịch trình du lịch Trung Quốc thông minh theo ngày với đầy đủ tên chữ Hán và phương tiện di chuyển",
    arguments: [
      {
        name: "destination",
        description: "Điểm đến (ví dụ: Trương Gia Giới - Trùng Khánh - Thành Đô)",
        required: true,
      },
      {
        name: "duration_days",
        description: "Số ngày (ví dụ: 7 ngày, 10 ngày, 16 ngày)",
        required: true,
      },
      {
        name: "travel_style",
        description: "Phong cách du lịch (ví dụ: ẩm thực, thiên nhiên, văn hóa lịch sử, tiết kiệm)",
        required: false,
      },
    ],
  },
  {
    name: "audit_trip_budget",
    description: "Phân tích, rà soát và tối ưu ngân sách chi tiêu của chuyến đi",
    arguments: [
      {
        name: "trip_id",
        description: "ID chuyến đi cần phân tích ngân sách",
        required: true,
      },
    ],
  },
  {
    name: "china_travel_assistant",
    description: "Đóng vai chuyên gia du lịch Trung Quốc trả lời thắc mắc về visa, thủ tục, ứng dụng bản địa và văn hóa",
    arguments: [
      {
        name: "question",
        description: "Câu hỏi cần tư vấn",
        required: true,
      },
      {
        name: "city",
        description: "Thành phố liên quan (nếu có)",
        required: false,
      },
    ],
  },
];

export interface McpContext {
  getTrips: () => TripDocument[];
  saveTrip: (id: string, trip: TripDocument) => void;
}

/**
 * Executes an MCP Tool Call and returns JSON-RPC content array
 */
async function executeTool(name: string, args: Record<string, any> = {}, ctx: McpContext) {
  const trips = ctx.getTrips();

  switch (name) {
    case "list_trips": {
      const limit = Number(args.limit) || 20;
      const list = trips.slice(0, limit).map((t) => {
        const totalEvents = (t.days || []).reduce((acc, d) => acc + (d.events?.length || 0), 0);
        const cities = Array.from(new Set((t.days || []).map((d) => d.city).filter(Boolean)));
        return {
          id: t.id,
          title: t.trip_title,
          duration: t.duration || `${t.days?.length || 0} ngày`,
          total_days: t.days?.length || 0,
          total_activities: totalEvents,
          destinations: cities,
          is_shared: Boolean(t.is_shared),
          created_at: t.created_at ? new Date(t.created_at).toISOString() : undefined,
          updated_at: t.updated_at ? new Date(t.updated_at).toISOString() : undefined,
        };
      });

      return {
        count: list.length,
        trips: list,
      };
    }

    case "get_trip_details": {
      const tripId = args.trip_id;
      if (!tripId) {
        throw new Error("Thiếu tham số 'trip_id'");
      }
      const trip = trips.find((t) => t.id === tripId) || SAMPLE_TRIPS.find((t) => t.id === tripId);
      if (!trip) {
        throw new Error(`Không tìm thấy chuyến đi có ID: '${tripId}'`);
      }

      if (args.day_number !== undefined && args.day_number !== null) {
        const dayNum = Number(args.day_number);
        const day = trip.days.find((d) => d.day_number === dayNum);
        if (!day) {
          throw new Error(`Không tìm thấy ngày ${dayNum} trong chuyến đi '${trip.trip_title}'`);
        }
        return {
          trip_id: trip.id,
          trip_title: trip.trip_title,
          day,
        };
      }

      return trip;
    }

    case "search_activities": {
      const query = (args.query || "").toString().toLowerCase().trim();
      if (!query) {
        throw new Error("Vui lòng cung cấp từ khóa 'query' để tìm kiếm.");
      }
      const targetTripId = args.trip_id;
      const targetCity = (args.city || "").toString().toLowerCase().trim();

      const filteredTrips = targetTripId
        ? trips.filter((t) => t.id === targetTripId)
        : trips;

      const results: any[] = [];

      for (const trip of filteredTrips) {
        for (const day of trip.days || []) {
          if (targetCity && day.city && !day.city.toLowerCase().includes(targetCity)) {
            continue;
          }

          // Check hotel
          if (day.hotel) {
            const hotelText = `${day.hotel.name_vn || ""} ${day.hotel.name_zh || ""} ${day.hotel.address || ""}`.toLowerCase();
            if (hotelText.includes(query)) {
              results.push({
                trip_id: trip.id,
                trip_title: trip.trip_title,
                day_number: day.day_number,
                city: day.city,
                type: "hotel",
                title: day.hotel.name_vn,
                chinese_name: day.hotel.name_zh,
                address: day.hotel.address,
                cost_rmb: day.hotel.cost_rmb,
              });
            }
          }

          // Check events
          for (const ev of day.events || []) {
            const evText = `${ev.activity_title} ${ev.place_name || ""} ${ev.place_zh || ""} ${ev.tips || ""} ${ev.description || ""} ${ev.cost_note || ""}`.toLowerCase();
            if (evText.includes(query)) {
              results.push({
                trip_id: trip.id,
                trip_title: trip.trip_title,
                day_number: day.day_number,
                city: day.city,
                type: "activity",
                time_slot: ev.time_slot,
                title: ev.activity_title,
                place_name: ev.place_name,
                chinese_name: ev.place_zh,
                tips: ev.tips || ev.description,
                cost_rmb: ev.cost_rmb,
                cost_category: ev.cost_category,
                amap_url: ev.place_zh ? `https://uri.amap.com/search?keyword=${encodeURIComponent(ev.place_zh)}` : undefined,
              });
            }
          }
        }
      }

      return {
        query,
        total_matches: results.length,
        results,
      };
    }

    case "suggest_travel_activities": {
      const city = args.city;
      if (!city) throw new Error("Thiếu tên thành phố 'city'");
      const category = args.category || "all";
      const dayNumber = Number(args.day_number) || 1;

      const suggestions = await suggestActivities({
        city,
        dayNumber,
        existingPlaces: [],
        category,
      });

      return {
        city,
        category,
        count: suggestions.length,
        suggestions,
      };
    }

    case "suggest_restaurants": {
      const city = args.city || "Trung Quốc";
      const dishName = args.dish_name;
      const placeName = args.place_name;

      const restaurants = await suggestRestaurants({
        city,
        dishName,
        placeName,
      });

      return {
        city,
        dish: dishName,
        count: restaurants.length,
        restaurants,
      };
    }

    case "calculate_trip_budget": {
      const tripId = args.trip_id;
      if (!tripId) throw new Error("Thiếu tham số 'trip_id'");
      const trip = trips.find((t) => t.id === tripId) || SAMPLE_TRIPS.find((t) => t.id === tripId);
      if (!trip) {
        throw new Error(`Không tìm thấy chuyến đi có ID: '${tripId}'`);
      }

      const rate = Number(args.exchange_rate) || trip.exchange_rate_rmb_vnd || DEFAULT_EXCHANGE_RATE;
      const budgetSummary = calculateTripBudgetSummary({
        ...trip,
        exchange_rate_rmb_vnd: rate,
      });

      return {
        trip_id: trip.id,
        trip_title: trip.trip_title,
        exchange_rate: rate,
        total_spent_rmb: budgetSummary.totalSpentRmb,
        total_spent_vnd: budgetSummary.totalSpentVnd,
        formatted_total_vnd: new Intl.NumberFormat("vi-VN").format(budgetSummary.totalSpentVnd) + " đ",
        budget_cap_rmb: trip.budget_cap_rmb,
        budget_cap_vnd: trip.total_budget_cap_vnd,
        categories: budgetSummary.categoryBreakdowns.map((cat) => ({
          category: cat.category,
          label: cat.categoryLabel,
          total_rmb: cat.totalRmb,
          total_vnd: cat.totalVnd,
          items_count: cat.count,
        })),
        day_by_day_expenses: budgetSummary.daySummaries.map((ds) => ({
          day: ds.dayNumber,
          date: ds.dateStr,
          city: ds.cityName,
          total_rmb: ds.totalRmb,
          total_vnd: ds.totalVnd,
        })),
      };
    }

    case "add_trip_activity": {
      const { trip_id, day_number, activity_title, place_name, place_zh, time_slot, notes, cost_rmb, cost_category } = args;
      if (!trip_id) throw new Error("Thiếu tham số 'trip_id'");
      if (!day_number) throw new Error("Thiếu tham số 'day_number'");
      if (!activity_title) throw new Error("Thiếu tham số 'activity_title'");

      const trip = trips.find((t) => t.id === trip_id);
      if (!trip) throw new Error(`Không tìm thấy chuyến đi có ID: '${trip_id}'`);

      const dayIdx = trip.days.findIndex((d) => d.day_number === Number(day_number));
      if (dayIdx === -1) {
        throw new Error(`Chuyến đi không có ngày số ${day_number}`);
      }

      const rate = trip.exchange_rate_rmb_vnd || 3500;
      const newEvent: ActivityEvent = {
        time_slot: time_slot || "Buổi chiều",
        activity_title,
        place_name: place_name || activity_title,
        place_zh: place_zh || "",
        description: notes || "",
        tips: notes || "",
        cost_rmb: typeof cost_rmb === "number" ? cost_rmb : undefined,
        cost_vnd: typeof cost_rmb === "number" ? cost_rmb * rate : undefined,
        cost_category: cost_category || "ticket",
      };

      const updatedDays = [...trip.days];
      updatedDays[dayIdx] = {
        ...updatedDays[dayIdx],
        events: [...(updatedDays[dayIdx].events || []), newEvent],
      };

      const updatedTrip: TripDocument = {
        ...trip,
        days: updatedDays,
        updated_at: new Date().toISOString(),
      };

      ctx.saveTrip(trip.id || trip_id, updatedTrip);

      return {
        success: true,
        message: `Đã thêm hoạt động '${activity_title}' vào Ngày ${day_number}`,
        added_event: newEvent,
      };
    }

    case "parse_itinerary_text": {
      const rawText = args.raw_text;
      if (!rawText || !rawText.trim()) {
        throw new Error("Nội dung văn bản 'raw_text' không được để trống");
      }
      const parsed = await parseTripWithGemini(rawText);
      return parsed;
    }

    default:
      throw new Error(`Công cụ MCP không được hỗ trợ: '${name}'`);
  }
}

/**
 * Handles incoming JSON-RPC 2.0 requests
 */
export async function handleJsonRpcRequest(
  request: any,
  ctx: McpContext,
  clientIp?: string,
  sessionId?: string
): Promise<any> {
  const startTime = Date.now();
  const id = request?.id;
  const method = request?.method;
  const params = request?.params || {};

  // Standard JSON-RPC validation
  if (!method || typeof method !== "string") {
    return {
      jsonrpc: "2.0",
      id: id ?? null,
      error: { code: -32600, message: "Invalid Request: 'method' must be a string." },
    };
  }

  try {
    switch (method) {
      // 1. Handshake & Initialization
      case "initialize": {
        const clientInfo = params.clientInfo || {};
        const responseResult = {
          protocolVersion: MCP_PROTOCOL_VERSION,
          capabilities: {
            tools: { listChanged: false },
            resources: { subscribe: false, listChanged: false },
            prompts: { listChanged: false },
            logging: {},
          },
          serverInfo: {
            name: MCP_SERVER_NAME,
            version: MCP_SERVER_VERSION,
          },
          instructions:
            "ViVu China MCP Server: Cung cấp đầy đủ công cụ quản lý lịch trình du lịch Trung Quốc, tra cứu tên chữ Hán, bản đồ Amap, gợi ý điểm tham quan, ẩm thực và tính toán ngân sách chi tiết.",
        };

        addMcpLog({
          clientIp,
          sessionId,
          method: "initialize",
          durationMs: Date.now() - startTime,
          status: "success",
          requestSummary: `Client connected: ${clientInfo.name || "Unknown"} v${clientInfo.version || "1.0"}`,
        });

        return {
          jsonrpc: "2.0",
          id,
          result: responseResult,
        };
      }

      // 2. Initialized Notification
      case "notifications/initialized": {
        return id !== undefined ? { jsonrpc: "2.0", id, result: {} } : null;
      }

      // 3. Ping
      case "ping": {
        return {
          jsonrpc: "2.0",
          id,
          result: {},
        };
      }

      // 4. Tools List
      case "tools/list": {
        addMcpLog({
          clientIp,
          sessionId,
          method: "tools/list",
          durationMs: Date.now() - startTime,
          status: "success",
          requestSummary: `Listed ${MCP_TOOLS.length} tools`,
        });

        return {
          jsonrpc: "2.0",
          id,
          result: {
            tools: MCP_TOOLS,
          },
        };
      }

      // 5. Tools Call
      case "tools/call": {
        const toolName = params.name;
        const toolArgs = params.arguments || {};

        if (!toolName) {
          throw new Error("Thiếu tham số 'name' của công cụ trong params.");
        }

        const toolResult = await executeTool(toolName, toolArgs, ctx);

        addMcpLog({
          clientIp,
          sessionId,
          method: "tools/call",
          toolName,
          durationMs: Date.now() - startTime,
          status: "success",
          requestSummary: `Called tool '${toolName}' with args: ${JSON.stringify(toolArgs).substring(0, 100)}`,
        });

        return {
          jsonrpc: "2.0",
          id,
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify(toolResult, null, 2),
              },
            ],
            isError: false,
          },
        };
      }

      // 6. Resources List
      case "resources/list": {
        // Include dynamic trip URIs
        const trips = ctx.getTrips();
        const tripResources = trips.map((t) => ({
          uri: `trip://${t.id}`,
          name: `Lịch trình: ${t.trip_title}`,
          description: `${t.duration || `${t.days?.length || 0} ngày`} - ${t.days?.map((d) => d.city).filter(Boolean).slice(0, 3).join(", ")}`,
          mimeType: "application/json",
        }));

        const allResources = [...MCP_RESOURCES, ...tripResources];

        addMcpLog({
          clientIp,
          sessionId,
          method: "resources/list",
          durationMs: Date.now() - startTime,
          status: "success",
          requestSummary: `Listed ${allResources.length} resources`,
        });

        return {
          jsonrpc: "2.0",
          id,
          result: {
            resources: allResources,
          },
        };
      }

      // 7. Resources Read
      case "resources/read": {
        const uri = params.uri;
        if (!uri) throw new Error("Thiếu tham số 'uri' của tài nguyên.");

        let textContent = "";
        let mimeType = "text/plain";

        if (uri === "trips://catalog") {
          const trips = ctx.getTrips();
          textContent = JSON.stringify(
            trips.map((t) => ({
              id: t.id,
              title: t.trip_title,
              duration: t.duration,
              total_days: t.days?.length,
            })),
            null,
            2
          );
          mimeType = "application/json";
        } else if (uri === "guide://china_survival") {
          textContent = CHINA_SURVIVAL_GUIDE_TEXT;
          mimeType = "text/markdown";
        } else if (uri === "guide://railway_stations") {
          textContent = RAILWAY_STATIONS_GUIDE_TEXT;
          mimeType = "text/markdown";
        } else if (uri.startsWith("trip://")) {
          const tripId = uri.replace("trip://", "");
          const trip = ctx.getTrips().find((t) => t.id === tripId) || SAMPLE_TRIPS.find((t) => t.id === tripId);
          if (!trip) throw new Error(`Không tìm thấy tài nguyên chuyến đi: '${uri}'`);
          textContent = JSON.stringify(trip, null, 2);
          mimeType = "application/json";
        } else {
          throw new Error(`Tài nguyên không tìm thấy: '${uri}'`);
        }

        addMcpLog({
          clientIp,
          sessionId,
          method: "resources/read",
          durationMs: Date.now() - startTime,
          status: "success",
          requestSummary: `Read resource '${uri}'`,
        });

        return {
          jsonrpc: "2.0",
          id,
          result: {
            contents: [
              {
                uri,
                mimeType,
                text: textContent,
              },
            ],
          },
        };
      }

      // 8. Prompts List
      case "prompts/list": {
        addMcpLog({
          clientIp,
          sessionId,
          method: "prompts/list",
          durationMs: Date.now() - startTime,
          status: "success",
          requestSummary: `Listed ${MCP_PROMPTS.length} prompts`,
        });

        return {
          jsonrpc: "2.0",
          id,
          result: {
            prompts: MCP_PROMPTS,
          },
        };
      }

      // 9. Prompts Get
      case "prompts/get": {
        const promptName = params.name;
        const promptArgs = params.arguments || {};
        if (!promptName) throw new Error("Thiếu tham số 'name' trong prompts/get");

        let messages: any[] = [];
        let description = "";

        if (promptName === "plan_china_trip") {
          const dest = promptArgs.destination || "Trùng Khánh & Thành Đô";
          const days = promptArgs.duration_days || "7 ngày";
          const style = promptArgs.travel_style || "Trải nghiệm văn hóa & ẩm thực";
          description = `Lên lịch trình ${dest} (${days})`;
          messages = [
            {
              role: "user",
              content: {
                type: "text",
                text: `Bạn là chuyên gia tư vấn du lịch Trung Quốc của ViVu China. Hãy lên lịch trình chi tiết ${days} cho hành trình ${dest} theo phong cách ${style}. Mỗi ngày cần có tên thành phố, các điểm tham quan với tên chữ Hán chuẩn để tìm bản đồ Amap/Gaode, ga tàu cao tốc di chuyển, và món ăn đặc sản nhất định phải thử.`,
              },
            },
          ];
        } else if (promptName === "audit_trip_budget") {
          const tripId = promptArgs.trip_id;
          const trip = ctx.getTrips().find((t) => t.id === tripId) || SAMPLE_TRIPS[0];
          description = `Rà soát ngân sách chuyến đi '${trip?.trip_title}'`;
          messages = [
            {
              role: "user",
              content: {
                type: "text",
                text: `Hãy phân tích chi tiết ngân sách cho chuyến đi '${trip?.trip_title}' (${trip?.days?.length} ngày). Đánh giá tỷ trọng các khoản chi (khách sạn, vé máy bay, vé tàu cao tốc 12306, vé tham quan, ăn uống), kiểm tra xem có chi phí ẩn nào còn thiếu không và đề xuất các mẹo tiết kiệm chi phí hiệu quả nhất khi du lịch Trung Quốc.`,
              },
            },
          ];
        } else if (promptName === "china_travel_assistant") {
          const q = promptArgs.question || "Làm sao để thanh toán Alipay không bị lỗi?";
          const city = promptArgs.city ? `tại ${promptArgs.city}` : "tại Trung Quốc";
          description = `Tư vấn du lịch ${city}`;
          messages = [
            {
              role: "user",
              content: {
                type: "text",
                text: `Tôi đang chuẩn bị du lịch ${city}. Bạn hãy giải đáp chi tiết câu hỏi sau của tôi: "${q}". Cung cấp các bước thực hành rõ ràng, tên ứng dụng và kinh nghiệm thực tế.`,
              },
            },
          ];
        } else {
          throw new Error(`Không tìm thấy prompt template: '${promptName}'`);
        }

        addMcpLog({
          clientIp,
          sessionId,
          method: "prompts/get",
          durationMs: Date.now() - startTime,
          status: "success",
          requestSummary: `Retrieved prompt template '${promptName}'`,
        });

        return {
          jsonrpc: "2.0",
          id,
          result: {
            description,
            messages,
          },
        };
      }

      default:
        return {
          jsonrpc: "2.0",
          id,
          error: {
            code: -32601,
            message: `Method not found: '${method}'`,
          },
        };
    }
  } catch (err: any) {
    const errorMsg = err?.message || "Internal MCP error";
    addMcpLog({
      clientIp,
      sessionId,
      method,
      durationMs: Date.now() - startTime,
      status: "error",
      error: errorMsg,
      requestSummary: `Failed execution: ${errorMsg}`,
    });

    return {
      jsonrpc: "2.0",
      id,
      error: {
        code: -32603,
        message: errorMsg,
      },
    };
  }
}

/**
 * Registers all MCP routes on the Express server:
 * - GET /api/mcp/sse (SSE stream)
 * - POST /api/mcp/message (SSE client message ingress)
 * - POST /api/mcp (Direct JSON-RPC 2.0 endpoint)
 * - GET /api/mcp (Server overview & docs)
 * - GET /api/mcp/status (Server status, metrics)
 * - GET /api/mcp/logs (Real-time MCP execution logs)
 * - POST /api/mcp/test-tool (Direct browser test runner)
 */
export function registerMcpRoutes(app: Application, ctx: McpContext) {
  // 1. SSE Connection for MCP Clients (Claude Desktop, Cursor, Zed, Cline)
  app.get("/api/mcp/sse", (req: Request, res: Response) => {
    const sessionId = `mcp_sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const clientIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "X-Accel-Buffering": "no",
    });

    // Store active SSE client
    const client: SseClient = {
      id: sessionId,
      res,
      createdAt: Date.now(),
    };
    activeSseClients.set(sessionId, client);

    addMcpLog({
      clientIp,
      sessionId,
      method: "sse_connect",
      durationMs: 0,
      status: "success",
      requestSummary: `New MCP SSE connection opened. Session: ${sessionId}`,
    });

    // Send the endpoint event as per MCP specification
    res.write(`event: endpoint\ndata: /api/mcp/message?sessionId=${sessionId}\n\n`);

    // Keepalive ping every 25 seconds
    const pingInterval = setInterval(() => {
      try {
        res.write(": keepalive\n\n");
      } catch {
        clearInterval(pingInterval);
      }
    }, 25000);

    req.on("close", () => {
      clearInterval(pingInterval);
      activeSseClients.delete(sessionId);
      addMcpLog({
        clientIp,
        sessionId,
        method: "sse_disconnect",
        durationMs: Date.now() - client.createdAt,
        status: "success",
        requestSummary: `MCP SSE connection closed. Session: ${sessionId}`,
      });
    });
  });

  // 2. SSE Ingress Message endpoint
  app.post("/api/mcp/message", async (req: Request, res: Response) => {
    const sessionId = req.query.sessionId as string;
    const clientIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;
    const sseClient = sessionId ? activeSseClients.get(sessionId) : undefined;

    const response = await handleJsonRpcRequest(req.body, ctx, clientIp, sessionId);

    if (response) {
      // Send back through SSE stream if active
      if (sseClient) {
        try {
          sseClient.res.write(`event: message\ndata: ${JSON.stringify(response)}\n\n`);
        } catch (e) {
          console.warn("Failed to stream MCP response to SSE client:", e);
        }
      }
      // Also return directly in HTTP response for maximum compatibility
      res.status(200).json(response);
    } else {
      res.status(202).send("Accepted");
    }
  });

  // 3. Direct JSON-RPC 2.0 HTTP POST endpoint (Works with cURL, Claude Code, Fetch, CLI)
  app.post("/api/mcp", async (req: Request, res: Response) => {
    const clientIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;
    const response = await handleJsonRpcRequest(req.body, ctx, clientIp);
    if (response) {
      res.status(200).json(response);
    } else {
      res.status(204).end();
    }
  });

  // 4. MCP Info & Documentation Landing
  app.get("/api/mcp", (req: Request, res: Response) => {
    const host = req.get("host") || "localhost:3000";
    const protocol = req.protocol === "https" || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
    const baseUrl = `${protocol}://${host}`;

    res.json({
      name: MCP_SERVER_NAME,
      version: MCP_SERVER_VERSION,
      protocolVersion: MCP_PROTOCOL_VERSION,
      status: "online",
      description: "Model Context Protocol (MCP) Server for ViVu China Travel Itineraries & Assistant.",
      endpoints: {
        sse: `${baseUrl}/api/mcp/sse`,
        jsonrpc_http: `${baseUrl}/api/mcp`,
        status: `${baseUrl}/api/mcp/status`,
        logs: `${baseUrl}/api/mcp/logs`,
      },
      capabilities: {
        tools: MCP_TOOLS.map((t) => ({ name: t.name, description: t.description })),
        resources: MCP_RESOURCES.map((r) => ({ uri: r.uri, name: r.name })),
        prompts: MCP_PROMPTS.map((p) => ({ name: p.name, description: p.description })),
      },
      client_config_example: {
        claude_desktop: {
          mcpServers: {
            vivuchina: {
              url: `${baseUrl}/api/mcp/sse`,
            },
          },
        },
      },
    });
  });

  // 5. Server Status & Diagnostics
  app.get("/api/mcp/status", (req: Request, res: Response) => {
    const host = req.get("host") || "localhost:3000";
    const protocol = req.protocol === "https" || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
    const baseUrl = `${protocol}://${host}`;

    res.json({
      status: "online",
      server_name: MCP_SERVER_NAME,
      version: MCP_SERVER_VERSION,
      protocol_version: MCP_PROTOCOL_VERSION,
      active_sse_clients: activeSseClients.size,
      total_tools: MCP_TOOLS.length,
      total_resources: MCP_RESOURCES.length + ctx.getTrips().length,
      total_prompts: MCP_PROMPTS.length,
      total_logged_requests: mcpLogs.length,
      server_time: new Date().toISOString(),
      sse_url: `${baseUrl}/api/mcp/sse`,
      http_url: `${baseUrl}/api/mcp`,
    });
  });

  // 6. Request Logs for Inspector UI
  app.get("/api/mcp/logs", (_req: Request, res: Response) => {
    res.json({
      success: true,
      logs: mcpLogs,
    });
  });

  // 7. Test Tool directly from web UI
  app.post("/api/mcp/test-tool", async (req: Request, res: Response) => {
    const { name, args } = req.body;
    const clientIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;
    const startTime = Date.now();

    try {
      if (!name) {
        res.status(400).json({ error: "Thiếu tên công cụ ('name')" });
        return;
      }
      const result = await executeTool(name, args || {}, ctx);
      const durationMs = Date.now() - startTime;

      addMcpLog({
        clientIp,
        method: "test-tool",
        toolName: name,
        durationMs,
        status: "success",
        requestSummary: `Direct UI Test: ${name}`,
      });

      res.json({
        success: true,
        tool: name,
        durationMs,
        result,
      });
    } catch (err: any) {
      const durationMs = Date.now() - startTime;
      addMcpLog({
        clientIp,
        method: "test-tool",
        toolName: name,
        durationMs,
        status: "error",
        error: err.message,
        requestSummary: `Direct UI Test Failed: ${name}`,
      });

      res.status(400).json({
        success: false,
        error: err.message || "Lỗi khi chạy công cụ",
      });
    }
  });
}
