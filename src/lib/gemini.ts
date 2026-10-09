import { GoogleGenAI, Type } from "@google/genai";
import { TripDocument } from "../types/itinerary.js";

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

// List of fallback models in order of rate-limit friendliness
// 1. gemini-3.1-flash-lite: Lowest latency & highest rate-limit quota (avoids 429 Rate Limit)
// 2. gemini-flash-latest: Stable default
// 3. gemini-3.8-flash: Standard Flash model
const CANDIDATE_MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
  "gemini-3.8-flash",
];

export async function parseTripWithGemini(rawText: string): Promise<TripDocument> {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY chưa được cấu hình trên máy chủ.");
  }

  const prompt = `Bạn là trợ lý chuyên gia hoạch định lịch trình du lịch Trung Quốc thông minh và cực kỳ tỉ mỉ. 
Nhiệm vụ của bạn là phân tích toàn bộ văn bản lịch trình du lịch sau đây và trích xuất thành định dạng JSON chuẩn xác theo cấu trúc schema.

QUY TẮC BẮT BUỘC VỀ ĐỘ CHI TIẾT & BẢO TOÀN DỮ LIỆU:
1. TUYỆT ĐỐI KHÔNG TỰ Ý TÓM TẮT HAY BỎ SÓT BẤT KỲ ĐỊA ĐIỂM, HOẠT ĐỘNG HOẶC MỐC THỜI GIAN NÀO CÓ TRONG TÀI LIỆU GỐC!
2. Mỗi điểm tham quan, mỗi chặng di chuyển, mỗi bữa ăn, hoặc mỗi hoạt động trong ngày PHẢI ĐƯỢC TÁCH THÀNH MỘT EVENT ĐỘC LẬP trong mảng events. Nếu một ngày có 5 đến 10 hoạt động, phải trích xuất ĐẦY ĐỦ cả 5 đến 10 event chi tiết!
3. Trường description và tips: Giữ lại toàn bộ chi tiết hướng dẫn tham quan, giá vé vào cửa, giờ mở cửa, cách đi lại, lưu ý trang phục từ tài liệu gốc. Không được viết sơ sài một câu chung chung!
4. Trích xuất chính xác tên chữ Hán (place_zh, dish_name_zh, hotel.name_zh) chuẩn chữ Hán giản thể Trung Quốc để người dùng copy 1 chạm cho tài xế/người bản xứ hoặc tra cứu Amap.
5. Phân chia rõ mốc thời gian: Sáng, Trưa, Chiều, Tối kèm khung giờ chi tiết (time_range, ví dụ: 08:30 - 11:30).
6. Khách sạn: Trích xuất đầy đủ tên khách sạn (name_vn và name_zh), địa chỉ và số điện thoại nếu có.

Nội dung lịch trình gốc:
${rawText}`;

  const schema = {
    type: Type.OBJECT,
    properties: {
      trip_title: { type: Type.STRING, description: "Tiêu đề chuyến đi, ví dụ: Bắc Kinh - Thượng Hải - Tô Châu" },
      duration: { type: Type.STRING, description: "Tổng thời gian, ví dụ: 6 ngày 5 đêm" },
      days: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            day_number: { type: Type.INTEGER, description: "Số thứ tự ngày, bắt đầu từ 1" },
            date: { type: Type.STRING, description: "Ngày tháng cụ thể hoặc Ngày 1" },
            city: { type: Type.STRING, description: "Thành phố / Tỉnh thành" },
            title: { type: Type.STRING, description: "Tóm tắt nổi bật trong ngày" },
            hotel: {
              type: Type.OBJECT,
              properties: {
                name_vn: { type: Type.STRING, description: "Tên khách sạn tiếng Việt/Anh" },
                name_zh: { type: Type.STRING, description: "Tên khách sạn chữ Hán chuẩn" },
                address: { type: Type.STRING, description: "Địa chỉ chi tiết" },
                phone: { type: Type.STRING, description: "Số điện thoại nếu có" }
              },
              required: ["name_vn", "name_zh"]
            },
            events: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  time_slot: { type: Type.STRING, description: "Sáng | Chiều | Tối" },
                  time_range: { type: Type.STRING, description: "Khoảng thời gian ví dụ 08:30 - 11:30" },
                  activity_title: { type: Type.STRING, description: "Tên hoạt động hoặc địa điểm ghé thăm" },
                  description: { type: Type.STRING, description: "Mô tả chi tiết hoạt động" },
                  place_name: { type: Type.STRING, description: "Tên địa danh tiếng Việt" },
                  place_zh: { type: Type.STRING, description: "Tên địa danh chữ Hán chuẩn" },
                  amap_query: { type: Type.STRING, description: "Từ khóa định vị tìm kiếm trên Gaode Amap" },
                  transport_hint: { type: Type.STRING, description: "Tuyến Metro / Tàu điện ngầm / Phương tiện di chuyển cụ thể, ví dụ: Metro Line 1 ga Thiên An Môn Đông" },
                  ticket_hint: { type: Type.STRING, description: "Thông tin vé vào cửa, giá vé ước tính hoặc lưu ý đặt vé trước (ví dụ: 60 RMB, cần đặt trước 7 ngày trên mini-app WeChat)" },
                  duration_hint: { type: Type.STRING, description: "Thời lượng tham quan ước tính, ví dụ: 2.5 - 3 tiếng" },
                  tips: { type: Type.STRING, description: "Lưu ý di chuyển, vé vào cửa hoặc trang phục" },
                  dishes: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        dish_name_vn: { type: Type.STRING, description: "Tên món ăn tiếng Việt" },
                        dish_name_zh: { type: Type.STRING, description: "Tên món ăn chữ Hán" },
                        google_img_keyword: { type: Type.STRING, description: "Từ khóa tra ảnh Google" },
                        baidu_img_keyword: { type: Type.STRING, description: "Từ khóa tra ảnh Baidu" }
                      },
                      required: ["dish_name_vn", "dish_name_zh"]
                    }
                  }
                },
                required: ["time_slot", "activity_title", "place_name", "place_zh"]
              }
            }
          },
          required: ["day_number", "date", "city", "title", "events"]
        }
      }
    },
    required: ["trip_title", "duration", "days"]
  };

  let lastError: any = null;

  // Try candidate models in cascade to handle Rate Limits seamlessly
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
        const parsedData = JSON.parse(response.text);
        return {
          ...parsedData,
          id: `trip_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          created_at: Date.now(),
        } as TripDocument;
      }
    } catch (err: any) {
      console.warn(`Model ${modelName} gặp lỗi hoặc bị Rate Limit. Thử model tiếp theo...`, err.message);
      lastError = err;
      // Continue to next model in CANDIDATE_MODELS
    }
  }

  throw new Error(
    `Không thể phân tích bằng AI (Đã thử qua các model: ${CANDIDATE_MODELS.join(", ")}): ${lastError?.message || "Rate limit"}`
  );
}

// API: Suggest exciting places / activities to add to itinerary
export async function suggestActivities(params: {
  city: string;
  dayNumber: number;
  existingPlaces?: string[];
  category?: string;
}): Promise<any[]> {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY chưa được cấu hình trên máy chủ.");
  }

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
              google_img_keyword: { type: Type.STRING, description: "Từ khóa tra ảnh Google" },
              baidu_img_keyword: { type: Type.STRING, description: "Từ khóa tra ảnh Baidu" },
            },
            required: ["dish_name_vn", "dish_name_zh"],
          },
        },
      },
      required: ["time_slot", "activity_title", "place_name", "place_zh"],
    },
  };

  let lastError: any = null;
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
      lastError = err;
    }
  }

  throw new Error(`Lỗi gợi ý địa điểm: ${lastError?.message || "Rate limit"}`);
}
