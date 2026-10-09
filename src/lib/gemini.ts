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

  const prompt = `Bạn là trợ lý chuyên gia hoạch định lịch trình du lịch Trung Quốc thông minh. 
Nhiệm vụ của bạn là phân tích toàn bộ văn bản lịch trình du lịch sau đây và trích xuất thành định dạng JSON chuẩn xác theo cấu trúc schema.
Lưu ý quan trọng cho du lịch Trung Quốc:
1. Trích xuất chính xác tên tiếng Trung (place_zh, dish_name_zh, hotel.name_zh) để người dùng có thể sao chép 1 chạm và tài xế/người bản xứ hiểu được.
2. Với place_zh và amap_query: Tạo từ khóa tiếng Trung chuẩn để tìm kiếm trên Amap (Bản đồ Cao Đức 高德地图).
3. Với món ăn: Gợi ý các món đặc sản địa phương tương ứng với từng bữa hoặc thành phố đó, cung cấp từ khóa tìm ảnh tiếng Trung cho Baidu và Google Images.
4. Phân chia rõ các mốc thời gian: Sáng, Chiều, Tối.

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
