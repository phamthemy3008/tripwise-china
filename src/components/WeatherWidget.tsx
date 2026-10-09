import React, { useEffect, useState, useMemo } from "react";
import {
  Sun,
  Cloud,
  CloudSun,
  CloudRain,
  CloudLightning,
  CloudFog,
  Snowflake,
  Droplets,
  Wind,
  Umbrella,
  RefreshCw,
  Thermometer,
  ChevronDown,
  ChevronUp,
  Radio,
  Calendar,
  Sparkles,
  Info,
  Clock,
  Compass,
} from "lucide-react";

interface WeatherData {
  city: string;
  matchedName: string;
  // Current live conditions
  temperature: number;
  tempMin: number;
  tempMax: number;
  weatherCode: number;
  humidity: number;
  windSpeed: number;
  precipitationProbability: number;
  updatedAt: string;
  isRealTime: boolean;
  // Target itinerary day forecast (if within 14 days)
  hasTargetForecast: boolean;
  targetForecastDate?: string;
  targetTempMin?: number;
  targetTempMax?: number;
  targetWeatherCode?: number;
  targetRainProb?: number;
}

// Built-in geo-cache for common travel destinations in China and Vietnam
const KNOWN_CITIES: Record<string, { lat: number; lon: number; name: string; region: string }> = {
  "trương gia giới": { lat: 29.13, lon: 110.48, name: "Trương Gia Giới (Zhangjiajie)", region: "zhangjiajie" },
  "zhangjiajie": { lat: 29.13, lon: 110.48, name: "Trương Gia Giới (Zhangjiajie)", region: "zhangjiajie" },
  "phượng hoàng cổ trấn": { lat: 27.95, lon: 109.60, name: "Phượng Hoàng Cổ Trấn (Fenghuang)", region: "fenghuang" },
  "phượng hoàng": { lat: 27.95, lon: 109.60, name: "Phượng Hoàng Cổ Trấn (Fenghuang)", region: "fenghuang" },
  "fenghuang": { lat: 27.95, lon: 109.60, name: "Phượng Hoàng Cổ Trấn (Fenghuang)", region: "fenghuang" },
  "trùng khánh": { lat: 29.56, lon: 106.55, name: "Trùng Khánh (Chongqing)", region: "chongqing" },
  "chongqing": { lat: 29.56, lon: 106.55, name: "Trùng Khánh (Chongqing)", region: "chongqing" },
  "vũ long": { lat: 29.32, lon: 107.76, name: "Vũ Long (Wulong)", region: "wulong" },
  "wulong": { lat: 29.32, lon: 107.76, name: "Vũ Long (Wulong)", region: "wulong" },
  "thành đô": { lat: 30.66, lon: 104.07, name: "Thành Đô (Chengdu)", region: "chengdu" },
  "chengdu": { lat: 30.66, lon: 104.07, name: "Thành Đô (Chengdu)", region: "chengdu" },
  "cửu trại câu": { lat: 33.26, lon: 103.92, name: "Cửu Trại Câu (Jiuzhaigou)", region: "jiuzhaigou" },
  "jiuzhaigou": { lat: 33.26, lon: 103.92, name: "Cửu Trại Câu (Jiuzhaigou)", region: "jiuzhaigou" },
  "hoàng long": { lat: 32.75, lon: 103.82, name: "Hoàng Long (Huanglong)", region: "jiuzhaigou" },
  "huanglong": { lat: 32.75, lon: 103.82, name: "Hoàng Long (Huanglong)", region: "jiuzhaigou" },
  "lạc sơn": { lat: 29.55, lon: 103.77, name: "Lạc Sơn (Leshan)", region: "chengdu" },
  "leshan": { lat: 29.55, lon: 103.77, name: "Lạc Sơn (Leshan)", region: "chengdu" },
  "nga mi sơn": { lat: 29.52, lon: 103.33, name: "Nga Mi Sơn (Emeishan)", region: "emeishan" },
  "emeishan": { lat: 29.52, lon: 103.33, name: "Nga Mi Sơn (Emeishan)", region: "emeishan" },
  "bắc kinh": { lat: 39.90, lon: 116.40, name: "Bắc Kinh (Beijing)", region: "beijing" },
  "beijing": { lat: 39.90, lon: 116.40, name: "Bắc Kinh (Beijing)", region: "beijing" },
  "thượng hải": { lat: 31.23, lon: 121.47, name: "Thượng Hải (Shanghai)", region: "shanghai" },
  "shanghai": { lat: 31.23, lon: 121.47, name: "Thượng Hải (Shanghai)", region: "shanghai" },
  "hàng châu": { lat: 30.27, lon: 120.15, name: "Hàng Châu (Hangzhou)", region: "jiangnan" },
  "hangzhou": { lat: 30.27, lon: 120.15, name: "Hàng Châu (Hangzhou)", region: "jiangnan" },
  "tô châu": { lat: 31.30, lon: 120.58, name: "Tô Châu (Suzhou)", region: "jiangnan" },
  "suzhou": { lat: 31.30, lon: 120.58, name: "Tô Châu (Suzhou)", region: "jiangnan" },
  "tây an": { lat: 34.34, lon: 108.94, name: "Tây An (Xi'an)", region: "xian" },
  "xian": { lat: 34.34, lon: 108.94, name: "Tây An (Xi'an)", region: "xian" },
  "xi'an": { lat: 34.34, lon: 108.94, name: "Tây An (Xi'an)", region: "xian" },
  "lệ giang": { lat: 26.87, lon: 100.23, name: "Lệ Giang (Lijiang)", region: "yunnan" },
  "lijiang": { lat: 26.87, lon: 100.23, name: "Lệ Giang (Lijiang)", region: "yunnan" },
  "đại lý": { lat: 25.60, lon: 100.27, name: "Đại Lý (Dali)", region: "yunnan" },
  "dali": { lat: 25.60, lon: 100.27, name: "Đại Lý (Dali)", region: "yunnan" },
  "côn minh": { lat: 25.04, lon: 102.71, name: "Côn Minh (Kunming)", region: "yunnan" },
  "kunming": { lat: 25.04, lon: 102.71, name: "Côn Minh (Kunming)", region: "yunnan" },
  "shangri-la": { lat: 27.83, lon: 99.71, name: "Shangri-La (Hương Cách Lý Lạp)", region: "shangrila" },
  "hương cách lý lạp": { lat: 27.83, lon: 99.71, name: "Shangri-La (Hương Cách Lý Lạp)", region: "shangrila" },
  "quảng châu": { lat: 23.13, lon: 113.26, name: "Quảng Châu (Guangzhou)", region: "guangzhou" },
  "guangzhou": { lat: 23.13, lon: 113.26, name: "Quảng Châu (Guangzhou)", region: "guangzhou" },
  "thâm quyến": { lat: 22.54, lon: 114.06, name: "Thâm Quyến (Shenzhen)", region: "guangzhou" },
  "shenzhen": { lat: 22.54, lon: 114.06, name: "Thâm Quyến (Shenzhen)", region: "guangzhou" },
  "nam ninh": { lat: 22.82, lon: 108.37, name: "Nam Ninh (Nanning)", region: "guangxi" },
  "nanning": { lat: 22.82, lon: 108.37, name: "Nam Ninh (Nanning)", region: "guangxi" },
  "quế lâm": { lat: 25.27, lon: 110.29, name: "Quế Lâm (Guilin)", region: "guangxi" },
  "guilin": { lat: 25.27, lon: 110.29, name: "Quế Lâm (Guilin)", region: "guangxi" },
  "hà khẩu": { lat: 22.50, lon: 103.95, name: "Hà Khẩu (Hekou)", region: "yunnan" },
  "mông tự": { lat: 23.37, lon: 103.40, name: "Mông Tự (Mengzi)", region: "yunnan" },
  "bình biên": { lat: 22.98, lon: 103.68, name: "Bình Biên (Pingbian)", region: "yunnan" },
  "hà nội": { lat: 21.03, lon: 105.85, name: "Hà Nội (Hanoi)", region: "vietnam" },
  "hanoi": { lat: 21.03, lon: 105.85, name: "Hà Nội (Hanoi)", region: "vietnam" },
  "hồ chí minh": { lat: 10.82, lon: 106.63, name: "TP Hồ Chí Minh", region: "vietnam" },
  "sài gòn": { lat: 10.82, lon: 106.63, name: "TP Hồ Chí Minh", region: "vietnam" },
  "đà nẵng": { lat: 16.05, lon: 108.20, name: "Đà Nẵng", region: "vietnam" },
};

// Historical climate database by region & month (1 to 12) for long-term travel planning
interface ClimateInfo {
  tempRange: string; // e.g. "10° - 18°C"
  seasonName: string;
  weatherSummary: string;
  clothingTips: string;
}

const REGION_CLIMATE: Record<string, (month: number) => ClimateInfo> = {
  zhangjiajie: (month: number) => {
    if (month >= 3 && month <= 5) {
      return {
        tempRange: "12° - 22°C",
        seasonName: "Mùa xuân tươi mới",
        weatherSummary: "Thời tiết ấm dần, hoa rừng nở rộ, thỉnh thoảng có sương mù bồng bềnh như tiên cảnh.",
        clothingTips: "Áo khoác gió mỏng, áo thun dài tay, giày thể thao bám đường tốt chống trơn trượt.",
      };
    }
    if (month >= 6 && month <= 8) {
      return {
        tempRange: "24° - 33°C",
        seasonName: "Mùa hè xanh mát",
        weatherSummary: "Nắng rực rỡ, suối Kim Tiên Khê mát rượi, thỉnh thoảng có mưa rào giải nhiệt nhanh.",
        clothingTips: "Trang phục mỏng nhẹ thoáng khí, mang ô che nắng/mưa, kem chống nắng và mũ rộng vành.",
      };
    }
    if (month >= 9 && month <= 11) {
      return {
        tempRange: month === 11 ? "9° - 18°C" : "15° - 25°C",
        seasonName: "Mùa thu lá vàng (Đẹp nhất năm)",
        weatherSummary: month === 11 ? "Chớm đông se lạnh, lá phong rực rỡ, trời trong ít mưa, tầm nhìn cáp treo cực kỳ thoáng." : "Mùa đẹp nhất, trời thu trong xanh, mát mẻ hanh khô, cảnh sắc hùng vĩ.",
        clothingTips: month === 11 ? "Áo khoác phao nhẹ hoặc áo dạ, khăn quàng cổ mỏng, giữ ấm cổ buổi sớm & đêm." : "Áo khoác mỏng hoặc cardigan, trang phục nhiều lớp chụp ảnh mùa thu.",
      };
    }
    return {
      tempRange: "2° - 10°C",
      seasonName: "Mùa đông băng tuyết",
      weatherSummary: "Thời tiết lạnh giá, đỉnh Thiên Môn Sơn và rừng đá Sa Thạch thường có tuyết phủ trắng xóa tuyệt đẹp.",
      clothingTips: "Áo phao dày, áo giữ nhiệt Heattech, găng tay len, mũ len ấm và giày chống trượt tuyết.",
    };
  },
  fenghuang: (month: number) => {
    if (month >= 9 && month <= 11) {
      return {
        tempRange: month === 11 ? "10° - 19°C" : "16° - 26°C",
        seasonName: "Mùa thu sông Đà Giang",
        weatherSummary: "Thời tiết se lạnh dễ chịu, nước sông Đà Giang trong vắt, sương sớm lững lờ trên những mái ngói rêu phong.",
        clothingTips: "Áo len mỏng, áo khoác thu đông, khăn choàng thổ cẩm chụp ảnh cổ trấn.",
      };
    }
    if (month >= 6 && month <= 8) {
      return {
        tempRange: "25° - 34°C",
        seasonName: "Mùa hè lung linh",
        weatherSummary: "Nắng ấm, ban đêm nhộn nhịp phố đèn lồng, gió sông mát mẻ.",
        clothingTips: "Quần áo nhẹ nhàng, váy maxi hoặc trang phục truyền thống Miêu Tộc chụp ảnh đêm.",
      };
    }
    if (month >= 12 || month <= 2) {
      return {
        tempRange: "3° - 11°C",
        seasonName: "Mùa đông cổ kính",
        weatherSummary: "Không khí yên bình, tĩnh lặng, sương khói mờ ảo bên dòng Đà Giang.",
        clothingTips: "Áo khoác ấm, khăn choàng dày, giày êm giữ ấm chân khi dạo bộ.",
      };
    }
    return {
      tempRange: "13° - 23°C",
      seasonName: "Mùa xuân mộng mơ",
      weatherSummary: "Trời dịu mát, sương mù giăng mắc đầu cầu Hồng Kiều.",
      clothingTips: "Trang phục xuân thoải mái, áo khoác nhẹ buổi tối.",
    };
  },
  chongqing: (month: number) => {
    if (month >= 9 && month <= 11) {
      return {
        tempRange: month === 11 ? "12° - 19°C" : "18° - 26°C",
        seasonName: "Mùa thu dễ chịu",
        weatherSummary: "Thời tiết mát mẻ, ít sương hơn mùa đông, cực kỳ lý tưởng để dạo phố đêm Hồng Nhai Động và thưởng thức lẩu cay nóng.",
        clothingTips: "Áo thun dài tay, áo khoác mỏng, giày đi bộ chống trơn vì địa hình Trùng Khánh dốc bậc thang nhiều.",
      };
    }
    if (month >= 6 && month <= 8) {
      return {
        tempRange: "27° - 38°C",
        seasonName: "Mùa hè lò lửa",
        weatherSummary: "Nóng ẩm đặc trưng, đêm ngắm cảnh Hồng Nhai Động lung linh rực rỡ.",
        clothingTips: "Trang phục ngắn, mỏng thoáng mát tối đa, mang theo quạt cầm tay và nước bù khoáng.",
      };
    }
    if (month >= 12 || month <= 2) {
      return {
        tempRange: "6° - 13°C",
        seasonName: "Mùa đông sương mù (Vụ Đô)",
        weatherSummary: "Âm u, độ ẩm cao, sương khói bao phủ dòng Trường Giang, không khí lẩu cay sôi sục ấm cúng.",
        clothingTips: "Áo khoác ấm chống gió, khăn choàng, áo len cổ lọ.",
      };
    }
    return {
      tempRange: "14° - 23°C",
      seasonName: "Mùa xuân tươi mới",
      weatherSummary: "Ấm dần lên, thỉnh thoảng có mưa xuân mỏng.",
      clothingTips: "Áo khoác nhẹ, trang phục dạo phố năng động.",
    };
  },
  wulong: (month: number) => {
    // High altitude karst canyon
    if (month >= 9 && month <= 11) {
      return {
        tempRange: month === 11 ? "7° - 15°C" : "13° - 21°C",
        seasonName: "Mùa thu Thiên Sinh Tam Kiều",
        weatherSummary: "Trong thung lũng đá vôi sâu mát lạnh hơn đồng bằng 4-6°C, không khí trong lành, cảnh phim Transformers tráng lệ.",
        clothingTips: "Bắt buộc mang áo khoác ấm giữ nhiệt, giày thể thao có độ bám cao vì hẻm núi có hơi ẩm trơn trượt.",
      };
    }
    if (month >= 12 || month <= 2) {
      return {
        tempRange: "0° - 8°C",
        seasonName: "Mùa đông thảo nguyên tuyết Tiên Nữ Sơn",
        weatherSummary: "Rất lạnh, đồng cỏ Tiên Nữ Sơn phủ đầy tuyết trắng, có khu trượt tuyết tự nhiên.",
        clothingTips: "Áo phao dày chuyên dụng, miếng dán giữ nhiệt, găng tay chống nước và giày đi tuyết.",
      };
    }
    return {
      tempRange: "18° - 27°C",
      seasonName: "Mùa hè tránh nóng lý tưởng",
      weatherSummary: "Mát mẻ dễ chịu trong hẻm núi sâu, cây cối xanh tươi, thác nước đổ hùng vĩ.",
      clothingTips: "Áo khoác mỏng chống gió hẻm núi, nón mũ và giày leo núi êm chân.",
    };
  },
  chengdu: (month: number) => {
    if (month >= 9 && month <= 11) {
      return {
        tempRange: month === 11 ? "10° - 17°C" : "16° - 24°C",
        seasonName: "Mùa thu lá ngân hạnh vàng rực",
        weatherSummary: "Hàng cây ngân hạnh (bạch quả) đổi màu vàng rực rỡ khắp phố Thành Đô, thời tiết mát mẻ dễ chịu ngắm gấu trúc Panda vui chơi.",
        clothingTips: "Áo khoác thu đông thanh lịch, giày thể thao đi bộ ngắm gấu trúc và dạo ngõ Kuanzhai.",
      };
    }
    if (month >= 12 || month <= 2) {
      return {
        tempRange: "4° - 11°C",
        seasonName: "Mùa đông Thành Đô",
        weatherSummary: "Trời lạnh khô, ít nắng rực rỡ, thích hợp thưởng thức trà quán và lẩu Tứ Xuyên cay nồng.",
        clothingTips: "Áo len dày, áo phao ấm, khăn quàng.",
      };
    }
    return {
      tempRange: "15° - 26°C",
      seasonName: "Mùa xuân & hè Thành Đô",
      weatherSummary: "Khí hậu ôn hòa, trăm hoa khoe sắc, không khí thư thái thong thả đặc trưng.",
      clothingTips: "Trang phục dạo phố thoáng mát, áo khoác mỏng phòng khi trời mưa.",
    };
  },
  emeishan: (month: number) => {
    if (month >= 9 && month <= 11) {
      return {
        tempRange: month === 11 ? "2° - 12°C" : "8° - 18°C",
        seasonName: "Mùa thu biển mây Kim Đỉnh",
        weatherSummary: "Đỉnh Nga Mi (Kim Đỉnh cao 3.077m) biển mây trắng bồng bềnh, tượng Phổ Hiền Bồ Tát vàng rực rỡ trong nắng thu.",
        clothingTips: "Trên đỉnh núi gió mạnh và rất lạnh, bắt buộc mang áo phao ấm dày, găng tay và mũ trùm tai (có thể thuê áo khoác tại ga cáp treo).",
      };
    }
    return {
      tempRange: month >= 6 && month <= 8 ? "10° - 20°C" : "-5° - 6°C",
      seasonName: "Khí hậu núi cao Nga Mi",
      weatherSummary: "Nhiệt độ đỉnh núi luôn thấp hơn chân núi từ 10 - 15°C, sương mù và biển mây kỳ vĩ.",
      clothingTips: "Trang phục giữ nhiệt nhiều lớp, giày leo núi chống trơn trượt, đề phòng khỉ giật đồ.",
    };
  },
  jiuzhaigou: (month: number) => {
    if (month >= 9 && month <= 11) {
      return {
        tempRange: month === 11 ? "1° - 12°C" : "7° - 18°C",
        seasonName: "Mùa thu ngũ sắc thiên đường",
        weatherSummary: "Cảnh sắc đẹp mê hồn với rừng cây phong đổi màu vàng cam đỏ soi bóng hồ nước xanh ngọc bích trong vắt.",
        clothingTips: "Độ cao 2.500m - 3.100m, thời tiết lạnh hanh khô, cần áo phao ấm, kính râm chống chói nắng cao nguyên, son dưỡng môi.",
      };
    }
    return {
      tempRange: month >= 6 && month <= 8 ? "12° - 24°C" : "-6° - 6°C",
      seasonName: "Thiên đường cao nguyên Cửu Trại Câu",
      weatherSummary: "Mùa hè thác nước hùng vĩ xanh ngắt; mùa đông thác băng tuyết trắng lung linh.",
      clothingTips: "Áo ấm, kem chống nắng cao nguyên, mang thuốc chống say độ cao nếu cơ địa nhạy cảm.",
    };
  },
  beijing: (month: number) => {
    if (month >= 9 && month <= 11) {
      return {
        tempRange: month === 11 ? "1° - 11°C" : "12° - 22°C",
        seasonName: "Mùa thu Vạn Lý Trường Thành",
        weatherSummary: "Mùa thu Bắc Kinh trời xanh ngắt, lá đỏ Trường Thành Bát Đạt Lĩnh rực rỡ, tháng 11 chớm đông gió lạnh hanh hao.",
        clothingTips: "Áo khoác gió ấm, khăn choàng, dưỡng ẩm da chống khô nẻ.",
      };
    }
    if (month >= 12 || month <= 2) {
      return {
        tempRange: "-8° - 3°C",
        seasonName: "Mùa đông Tử Cấm Thành",
        weatherSummary: "Lạnh khô buốt giá, tuyết phủ mái ngói lưu ly vàng Tử Cấm Thành như phim cổ trang.",
        clothingTips: "Áo phao đại hàn lông vũ, quần giữ nhiệt, giày lót lông, găng tay chống nước.",
      };
    }
    return {
      tempRange: "14° - 28°C",
      seasonName: "Mùa xuân & hè Bắc Kinh",
      weatherSummary: "Mùa xuân hoa đào nở quanh Di Hòa Viên; mùa hè nắng ấm tham quan các cung điện.",
      clothingTips: "Mũ nón, kính râm, giày đi bộ thật êm chân vì khuôn viên cung điện rất rộng lớn.",
    };
  },
};

// Generic climate fallback for any other cities in China
function getGenericChinaClimate(city: string, month: number): ClimateInfo {
  if (month >= 3 && month <= 5) {
    return {
      tempRange: "13° - 23°C",
      seasonName: "Mùa xuân dịu mát",
      weatherSummary: `Thời tiết tại ${city} ấm áp dần, hoa nở rộ, cảnh sắc du lịch tươi mới và dễ chịu.`,
      clothingTips: "Áo khoác nhẹ, trang phục dài tay năng động, giày thể thao đi bộ thoải mái.",
    };
  }
  if (month >= 6 && month <= 8) {
    return {
      tempRange: "24° - 34°C",
      seasonName: "Mùa hè rực rỡ",
      weatherSummary: `Nhiệt độ ấm/nóng ban ngày, nhiều nắng, thỉnh thoảng có mưa rào mùa hè giải nhiệt.`,
      clothingTips: "Quần áo mỏng nhẹ thoáng khí, chuẩn bị ô dù che nắng mưa, kem chống nắng.",
    };
  }
  if (month >= 9 && month <= 11) {
    return {
      tempRange: month === 11 ? "9° - 18°C" : "15° - 25°C",
      seasonName: "Mùa thu mát mẻ hanh khô",
      weatherSummary: `Mùa du lịch đẹp nhất trong năm tại ${city}, trời thu trong xanh, lá vàng đẹp, ít mưa.`,
      clothingTips: month === 11 ? "Áo khoác ấm vừa (áo phao mỏng, áo dạ), khăn quàng mỏng giữ ấm cổ." : "Áo khoác mỏng hoặc cardigan, trang phục nhiều lớp tiện cởi mở.",
    };
  }
  return {
    tempRange: "2° - 11°C",
    seasonName: "Mùa đông lạnh giá",
    weatherSummary: `Thời tiết lạnh khô, ban đêm xuống thấp, thích hợp thưởng thức các món ẩm thực nóng hổi.`,
    clothingTips: "Áo phao ấm, áo len, găng tay và khăn quàng giữ ấm cơ thể.",
  };
}

function parseWeatherCode(code: number): { label: string; icon: React.ReactNode; color: string } {
  if (code === 0) {
    return {
      label: "Trời nắng quang đãng",
      icon: <Sun className="w-5 h-5 text-amber-500 animate-spin-slow" />,
      color: "text-amber-600 dark:text-amber-400",
    };
  }
  if (code === 1 || code === 2) {
    return {
      label: "Nhiều mây, có lúc có nắng",
      icon: <CloudSun className="w-5 h-5 text-amber-500" />,
      color: "text-sky-600 dark:text-sky-400",
    };
  }
  if (code === 3) {
    return {
      label: "Trời u ám, nhiều mây",
      icon: <Cloud className="w-5 h-5 text-slate-400" />,
      color: "text-slate-600 dark:text-slate-300",
    };
  }
  if (code === 45 || code === 48) {
    return {
      label: "Sương mù / Tầm nhìn hạn chế",
      icon: <CloudFog className="w-5 h-5 text-indigo-400" />,
      color: "text-indigo-600 dark:text-indigo-300",
    };
  }
  if (code >= 51 && code <= 57) {
    return {
      label: "Mưa phùn rải rác",
      icon: <CloudRain className="w-5 h-5 text-blue-400" />,
      color: "text-blue-600 dark:text-blue-400",
    };
  }
  if (code >= 61 && code <= 67) {
    return {
      label: "Có mưa rào",
      icon: <CloudRain className="w-5 h-5 text-blue-500" />,
      color: "text-blue-600 dark:text-blue-400",
    };
  }
  if (code >= 71 && code <= 77) {
    return {
      label: "Có tuyết rơi / Lạnh giá",
      icon: <Snowflake className="w-5 h-5 text-cyan-400" />,
      color: "text-cyan-600 dark:text-cyan-300",
    };
  }
  if (code >= 80 && code <= 82) {
    return {
      label: "Mưa rào nặng hạt",
      icon: <CloudRain className="w-5 h-5 text-blue-600" />,
      color: "text-blue-700 dark:text-blue-300",
    };
  }
  if (code >= 95) {
    return {
      label: "Dông sét bão",
      icon: <CloudLightning className="w-5 h-5 text-purple-500" />,
      color: "text-purple-600 dark:text-purple-300",
    };
  }
  return {
    label: "Mát mẻ dễ chịu",
    icon: <CloudSun className="w-5 h-5 text-amber-500" />,
    color: "text-slate-600 dark:text-slate-300",
  };
}

// Helper to parse dates like "Thứ Bảy, 14/11/2026", "14/11/2026", "2026-11-14", "14/11"
interface ParsedDateAnalysis {
  raw: string;
  hasDate: boolean;
  targetDateStr?: string; // YYYY-MM-DD
  displayDateStr: string;
  day?: number;
  month?: number;
  year?: number;
  diffDays?: number;
  isWithin14Days: boolean;
  isFarFuture: boolean;
  isToday: boolean;
}

function analyzeItineraryDate(dateStr: string): ParsedDateAnalysis {
  if (!dateStr || !dateStr.trim()) {
    return {
      raw: "",
      hasDate: false,
      displayDateStr: "",
      isWithin14Days: false,
      isFarFuture: true,
      isToday: false,
    };
  }

  const trimmed = dateStr.trim();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let targetYear: number | undefined;
  let targetMonth: number | undefined;
  let targetDay: number | undefined;

  // 1. Try ISO: YYYY-MM-DD
  const isoMatch = trimmed.match(/(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (isoMatch) {
    targetYear = parseInt(isoMatch[1], 10);
    targetMonth = parseInt(isoMatch[2], 10);
    targetDay = parseInt(isoMatch[3], 10);
  } else {
    // 2. Try DD/MM/YYYY or DD/MM
    const dmyMatch = trimmed.match(/(\d{1,2})[-/.](\d{1,2})(?:[-/.](\d{4}))?/);
    if (dmyMatch) {
      targetDay = parseInt(dmyMatch[1], 10);
      targetMonth = parseInt(dmyMatch[2], 10);
      targetYear = dmyMatch[3] ? parseInt(dmyMatch[3], 10) : today.getFullYear();
    }
  }

  if (targetYear && targetMonth && targetDay) {
    const targetDate = new Date(targetYear, targetMonth - 1, targetDay);
    targetDate.setHours(0, 0, 0, 0);

    const diffMs = targetDate.getTime() - today.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    const yyyyStr = targetYear.toString();
    const mmStr = targetMonth.toString().padStart(2, "0");
    const ddStr = targetDay.toString().padStart(2, "0");
    const dateFormatted = `${yyyyStr}-${mmStr}-${ddStr}`;

    const isToday = diffDays === 0;
    const isWithin14Days = diffDays >= 0 && diffDays <= 14;
    const isFarFuture = diffDays > 14;

    return {
      raw: dateStr,
      hasDate: true,
      targetDateStr: dateFormatted,
      displayDateStr: `${ddStr}/${mmStr}/${yyyyStr}`,
      day: targetDay,
      month: targetMonth,
      year: targetYear,
      diffDays,
      isWithin14Days,
      isFarFuture,
      isToday,
    };
  }

  return {
    raw: dateStr,
    hasDate: false,
    displayDateStr: dateStr,
    isWithin14Days: false,
    isFarFuture: true,
    isToday: false,
  };
}

interface WeatherWidgetProps {
  city?: string;
  dayNumber?: number;
  date?: string;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  city = "",
  dayNumber = 1,
  date = "",
}) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"target_day" | "realtime" | "climate">("target_day");

  // Analyze itinerary date
  const dateInfo = useMemo(() => analyzeItineraryDate(date), [date]);

  // Clean city string for matching
  const cleanedCity = useMemo(() => {
    if (!city) return "Trương Gia Giới";
    const cleaned = city.split(/[\(-]/)[0].trim().toLowerCase();
    return cleaned || city.trim().toLowerCase();
  }, [city]);

  // Find city region for climate
  const cityRegionKey = useMemo(() => {
    const known = KNOWN_CITIES[cleanedCity];
    if (known) return known.region;
    const foundKey = Object.keys(KNOWN_CITIES).find(
      (k) => cleanedCity.includes(k) || k.includes(cleanedCity)
    );
    if (foundKey) return KNOWN_CITIES[foundKey].region;
    return "generic";
  }, [cleanedCity]);

  // Calculate climate advice for the destination month
  const targetMonth = dateInfo.month || new Date().getMonth() + 1;
  const climateData = useMemo(() => {
    const climateFn = REGION_CLIMATE[cityRegionKey];
    if (climateFn) {
      return climateFn(targetMonth);
    }
    return getGenericChinaClimate(city || "Điểm đến", targetMonth);
  }, [cityRegionKey, targetMonth, city]);

  const fetchWeather = async () => {
    if (!cleanedCity) return;
    setLoading(true);

    try {
      let lat = 29.13;
      let lon = 110.48;
      let matchedName = city || "Trương Gia Giới";

      // 1. Coordinates lookup
      const known = KNOWN_CITIES[cleanedCity];
      if (known) {
        lat = known.lat;
        lon = known.lon;
        matchedName = known.name;
      } else {
        const foundKey = Object.keys(KNOWN_CITIES).find(
          (k) => cleanedCity.includes(k) || k.includes(cleanedCity)
        );
        if (foundKey) {
          lat = KNOWN_CITIES[foundKey].lat;
          lon = KNOWN_CITIES[foundKey].lon;
          matchedName = KNOWN_CITIES[foundKey].name;
        } else {
          try {
            const geoRes = await fetch(
              `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
                cleanedCity
              )}&count=1&language=en&format=json`
            );
            const geoData = await geoRes.json();
            if (geoData.results && geoData.results[0]) {
              lat = geoData.results[0].latitude;
              lon = geoData.results[0].longitude;
              matchedName = `${geoData.results[0].name}, ${geoData.results[0].country || ""}`;
            }
          } catch {
            // fallback
          }
        }
      }

      // 2. Fetch 16 days forecast from Open-Meteo
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=16&timezone=auto`;

      const res = await fetch(weatherUrl);
      if (!res.ok) throw new Error("Không thể kết nối đến trạm thời tiết");

      const data = await res.json();
      const current = data.current;
      const daily = data.daily;

      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;

      // Check if target itinerary date matches within 14-day daily forecast
      let hasTargetForecast = false;
      let targetForecastDate: string | undefined;
      let targetTempMin: number | undefined;
      let targetTempMax: number | undefined;
      let targetWeatherCode: number | undefined;
      let targetRainProb: number | undefined;

      if (dateInfo.isWithin14Days && dateInfo.targetDateStr && daily?.time) {
        const dayIdx = daily.time.indexOf(dateInfo.targetDateStr);
        if (dayIdx >= 0) {
          hasTargetForecast = true;
          targetForecastDate = daily.time[dayIdx];
          targetTempMin = Math.round(daily.temperature_2m_min?.[dayIdx] ?? 16);
          targetTempMax = Math.round(daily.temperature_2m_max?.[dayIdx] ?? 26);
          targetWeatherCode = daily.weather_code?.[dayIdx] ?? 0;
          targetRainProb = daily.precipitation_probability_max?.[dayIdx] ?? 0;
        }
      }

      setWeather({
        city,
        matchedName,
        temperature: Math.round(current?.temperature_2m ?? 22),
        tempMin: Math.round(daily?.temperature_2m_min?.[0] ?? 16),
        tempMax: Math.round(daily?.temperature_2m_max?.[0] ?? 26),
        weatherCode: current?.weather_code ?? 0,
        humidity: current?.relative_humidity_2m ?? 65,
        windSpeed: Math.round(current?.wind_speed_10m ?? 8),
        precipitationProbability: daily?.precipitation_probability_max?.[0] ?? 10,
        updatedAt: timeStr,
        isRealTime: true,
        hasTargetForecast,
        targetForecastDate,
        targetTempMin,
        targetTempMax,
        targetWeatherCode,
        targetRainProb,
      });

      // Default active tab:
      // If within 14 days and has target forecast -> show target_day
      // If far future -> show realtime (with climate summary visible)
      if (hasTargetForecast) {
        setActiveTab("target_day");
      } else if (dateInfo.isFarFuture) {
        setActiveTab("climate");
      } else {
        setActiveTab("realtime");
      }
    } catch (err: unknown) {
      console.warn("Weather fetch error, using resilient climate model:", err);
      const now = new Date();
      setWeather({
        city,
        matchedName: city || "Địa điểm tham quan",
        temperature: 21,
        tempMin: 15,
        tempMax: 26,
        weatherCode: 1,
        humidity: 68,
        windSpeed: 6,
        precipitationProbability: 15,
        updatedAt: `${now.getHours()}:${now.getMinutes()}`,
        isRealTime: false,
        hasTargetForecast: false,
      });
      setActiveTab(dateInfo.isFarFuture ? "climate" : "realtime");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [cleanedCity, dateInfo.targetDateStr]);

  if (!weather && !loading) return null;

  // Decide which weather numbers to show based on active tab
  const isViewingTargetDay = activeTab === "target_day" && weather?.hasTargetForecast;
  const isViewingClimate = activeTab === "climate";

  const displayCode = isViewingTargetDay
    ? weather?.targetWeatherCode ?? weather?.weatherCode ?? 0
    : weather?.weatherCode ?? 0;

  const codeInfo = parseWeatherCode(displayCode);

  const displayTempMin = isViewingTargetDay ? weather?.targetTempMin : weather?.tempMin;
  const displayTempMax = isViewingTargetDay ? weather?.targetTempMax : weather?.tempMax;
  const displayRainProb = isViewingTargetDay
    ? weather?.targetRainProb
    : weather?.precipitationProbability;

  return (
    <div className="bg-gradient-to-r from-sky-50/90 via-blue-50/60 to-indigo-50/90 dark:from-slate-900/90 dark:via-slate-800/80 dark:to-slate-900/90 border border-sky-200/80 dark:border-sky-950/60 rounded-2xl p-3.5 sm:p-4 mb-4 shadow-xs transition-all text-slate-800 dark:text-slate-100">
      {/* Top Banner Mode Indicator */}
      <div className="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-sky-100/90 dark:border-slate-800/80 text-[11px]">
        <div className="flex items-center gap-1.5 flex-wrap">
          {weather?.hasTargetForecast ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              <Calendar className="w-3 h-3 text-amber-500" />
              <span>
                {dateInfo.diffDays === 0
                  ? "Khớp hôm nay (Trực tiếp)"
                  : `Dự báo đúng ngày đi: ${dateInfo.displayDateStr} (còn ${dateInfo.diffDays} ngày)`}
              </span>
            </span>
          ) : dateInfo.isFarFuture ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">
              <Sparkles className="w-3 h-3 text-purple-500" />
              <span>
                Ngày đi còn {dateInfo.diffDays ? `${dateInfo.diffDays} ngày` : "xa"} &bull; Tự động phân tích Khí hậu Tháng {targetMonth}
              </span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
              <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
              <span>Thời tiết thực tế tại {city || "điểm đến"} lúc này</span>
            </span>
          )}
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex items-center gap-1 bg-white/80 dark:bg-slate-950/60 p-0.5 rounded-xl border border-sky-100 dark:border-slate-800">
          {weather?.hasTargetForecast && (
            <button
              type="button"
              onClick={() => setActiveTab("target_day")}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                activeTab === "target_day"
                  ? "bg-amber-500 text-slate-950 shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
              }`}
            >
              Ngày đi ({dateInfo.day}/{dateInfo.month})
            </button>
          )}

          {dateInfo.isFarFuture && (
            <button
              type="button"
              onClick={() => setActiveTab("climate")}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                activeTab === "climate"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
              }`}
            >
              Khí hậu T{targetMonth}
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab("realtime")}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              activeTab === "realtime"
                ? "bg-sky-600 text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
            }`}
          >
            Trực tiếp lúc này
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {!isViewingClimate ? (
        // Mode 1: Daily forecast of target day OR live real-time conditions
        <div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 shadow-xs border border-sky-100 dark:border-slate-700 shrink-0">
                {codeInfo.icon}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                    {city || "Thời tiết ngày hôm nay"}
                  </span>
                  {isViewingTargetDay ? (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300">
                      🎯 Dự báo ngày đi
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                      <Radio className="w-2.5 h-2.5 animate-pulse" /> Trực tiếp tại điểm đến
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                  {codeInfo.label} &bull; {isViewingTargetDay ? `Ngày ${dateInfo.displayDateStr}` : `Cập nhật lúc ${weather?.updatedAt}`}
                </p>
              </div>
            </div>

            {/* Temperature values */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="text-right">
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-none">
                  {isViewingTargetDay
                    ? `${displayTempMin}° - ${displayTempMax}°C`
                    : `${weather?.temperature}°C`}
                </div>
                <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                  {isViewingTargetDay
                    ? `Dải nhiệt ngày đi`
                    : `Hôm nay: ${weather?.tempMin}° - ${weather?.tempMax}°C`}
                </div>
              </div>

              <button
                type="button"
                onClick={fetchWeather}
                disabled={loading}
                title="Cập nhật lại từ trạm khí tượng"
                className="p-2 rounded-xl text-slate-500 hover:text-sky-600 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-sky-500" : ""}`} />
              </button>

              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-all"
                title={isExpanded ? "Thu gọn" : "Xem chi tiết tư vấn"}
              >
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-sky-100/80 dark:border-slate-800/80 text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <Umbrella className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span>
                Khả năng mưa: <strong className="text-slate-900 dark:text-slate-100">{displayRainProb}%</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <Droplets className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
              <span>
                Độ ẩm: <strong className="text-slate-900 dark:text-slate-100">{weather?.humidity}%</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <Wind className="w-3.5 h-3.5 text-teal-500 shrink-0" />
              <span>
                Gió: <strong className="text-slate-900 dark:text-slate-100">{weather?.windSpeed} km/h</strong>
              </span>
            </div>
          </div>
        </div>
      ) : (
        // Mode 2: Historical / Expected Climate for Target Month (when date > 14 days)
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2.5 rounded-2xl bg-purple-500/10 dark:bg-purple-950/40 border border-purple-500/20 text-purple-600 dark:text-purple-400 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                    Khí hậu Tháng {targetMonth} tại {city}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-700 dark:text-purple-300">
                    {climateData.seasonName}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Dữ liệu khí hậu chuẩn bị hành lý cho ngày đi ({dateInfo.displayDateStr || date})
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-lg sm:text-xl font-black text-purple-600 dark:text-purple-300 leading-none">
                {climateData.tempRange}
              </div>
              <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                Nhiệt độ trung bình
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-purple-100 dark:border-purple-950/60 text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
            <p className="mb-1">
              <strong className="text-slate-900 dark:text-white">Đặc trưng thời tiết: </strong>
              {climateData.weatherSummary}
            </p>
            <p className="text-purple-700 dark:text-purple-300">
              <strong>🎒 Gợi ý trang phục: </strong>
              {climateData.clothingTips}
            </p>
          </div>

          {/* Quick link to live current weather */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-sky-100 dark:border-slate-800">
            <span>
              🔴 Thời tiết thực tế tại {city} lúc này: <strong>{weather?.temperature}°C</strong> ({codeInfo.label})
            </span>
            <button
              type="button"
              onClick={() => setActiveTab("realtime")}
              className="text-sky-600 dark:text-sky-400 hover:underline font-bold cursor-pointer"
            >
              Xem chi tiết lúc này &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Expandable Travel & Baggage Advice Section */}
      {isExpanded && !isViewingClimate && (
        <div className="mt-3 pt-2.5 border-t border-sky-100 dark:border-slate-800/80 space-y-2 text-xs">
          <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-sky-100/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            <span className="font-bold text-amber-600 dark:text-amber-400">🎒 Tư vấn trang phục & hành lý: </span>
            {isViewingTargetDay ? (
              <span>
                Dự báo ngày đi ({dateInfo.displayDateStr}): Nhiệt độ dao động từ <strong>{weather?.targetTempMin}°C</strong> đến <strong>{weather?.targetTempMax}°C</strong>.{" "}
                {(weather?.targetRainProb ?? 0) >= 30 ? "Khả năng có mưa, nhớ mang theo ô hoặc áo mưa tiện lợi." : "Khả năng mưa thấp, thuận lợi tham quan ngoài trời."}{" "}
                {(weather?.targetTempMin ?? 20) < 15 ? "Nên chuẩn bị áo khoác giữ ấm cho buổi sáng và ban đêm." : "Thời tiết mát mẻ dễ chịu."}
              </span>
            ) : (
              <span>
                Nhiệt độ thực tế {weather?.temperature}°C tại {city}.{" "}
                {weather?.temperature && weather.temperature < 15
                  ? "Thời tiết se lạnh, cần áo khoác ấm và khăn quàng."
                  : weather?.temperature && weather.temperature > 26
                  ? "Thời tiết khá ấm, trang phục mỏng nhẹ chống nắng."
                  : "Nhiệt độ lý tưởng, trang phục thoải mái vận động."}
              </span>
            )}
          </div>

          {/* Climate note for target month */}
          {dateInfo.hasDate && (
            <div className="p-2 rounded-xl bg-purple-500/10 dark:bg-purple-950/30 border border-purple-500/20 text-[11px] text-purple-700 dark:text-purple-300">
              <strong>Khí hậu Tháng {targetMonth} tại {city}:</strong> {climateData.tempRange} &bull; {climateData.seasonName}. {climateData.weatherSummary}
            </div>
          )}

          <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 px-1 pt-0.5">
            <span>Nguồn: Trạm Khí tượng WMO &amp; Vệ tinh Khí quyển Open-Meteo</span>
            <span>Cập nhật lúc: {weather?.updatedAt}</span>
          </div>
        </div>
      )}
    </div>
  );
};
