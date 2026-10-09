import React from "react";
import { Shield, Smartphone, CreditCard, Train, Wifi, Navigation, X, Check, ExternalLink } from "lucide-react";
import { CopyChip } from "./CopyChip";

interface ChinaSurvivalGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChinaSurvivalGuide: React.FC<ChinaSurvivalGuideProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 rounded-xl text-amber-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                Cẩm Nang Sinh Tồn Du Lịch Trung Quốc
              </h3>
              <p className="text-xs text-slate-400">
                Những điều bắt buộc phải chuẩn bị trước khi hạ cánh
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* Item 1: Alipay & WeChat */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center gap-2.5 font-bold text-slate-900 dark:text-white mb-2">
              <CreditCard className="w-4 h-4 text-blue-500" />
              <span>1. Thanh toán không tiền mặt (Alipay &amp; WeChat Pay)</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-2 text-xs">
              99% hàng quán và taxi tại Trung Quốc không nhận tiền mặt mệnh giá lớn. Tải ứng dụng Alipay phiên bản Quốc tế, liên kết thẻ Visa/Mastercard (phí 0% cho giao dịch dưới 200 NDT / 700.000 VNĐ).
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-semibold text-slate-500">Mẫu câu hỏi quét mã:</span>
              <CopyChip text="扫码支付 (Quét mã thanh toán)" label="扫码支付" />
              <CopyChip text="我扫你还是你扫我？ (Tôi quét bạn hay bạn quét tôi?)" label="我扫你" />
            </div>
          </div>

          {/* Item 2: Amap (Gaode) */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center gap-2.5 font-bold text-slate-900 dark:text-white mb-2">
              <Navigation className="w-4 h-4 text-emerald-500" />
              <span>2. Bản đồ Amap (Cao Đức 地图 - 高德地图)</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs">
              Google Maps bị lệch tọa độ và không cập nhật tại Trung Quốc. Bản đồ Amap tích hợp chính xác xe bus, tàu điện ngầm theo thời gian thực và gọi xe taxi DiDi tích hợp sẵn. Ứng dụng TripWise này có nút 1-chạm mở trực tiếp Amap cho từng địa điểm!
            </p>
          </div>

          {/* Item 3: Tàu cao tốc 12306 */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center gap-2.5 font-bold text-slate-900 dark:text-white mb-2">
              <Train className="w-4 h-4 text-red-500" />
              <span>3. Đặt vé tàu cao tốc (App Railway 12306)</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs">
              Tải app chính thức <strong>Railway 12306</strong> (có giao diện tiếng Anh), đăng ký xác minh bằng Hộ chiếu (Passport) trước ngày đi. Khi vào ga chỉ cần quét hộ chiếu tại cửa kiểm soát thủ công (Manual Gate).
            </p>
          </div>

          {/* Item 4: Mạng Internet & VPN */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center gap-2.5 font-bold text-slate-900 dark:text-white mb-2">
              <Wifi className="w-4 h-4 text-purple-500" />
              <span>4. eSIM Du Lịch &amp; Vượt Tường Lửa (Great Firewall)</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs">
              Mua eSIM chuyển vùng quốc tế (roaming qua Hong Kong / Singapore) để truy cập Google, Facebook, Zalo bình thường mà <strong>không cần bật VPN</strong>. Tuy nhiên, lưu ý tính năng offline persistence của ứng dụng này vẫn giúp bạn tra cứu khi ngắt mạng!
            </p>
          </div>

          {/* Item 5: Giao tiếp phiên dịch */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center gap-2.5 font-bold text-slate-900 dark:text-white mb-2">
              <Smartphone className="w-4 h-4 text-amber-500" />
              <span>5. Các câu giao tiếp khẩn cấp chữ Hán</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span>Nhà vệ sinh ở đâu?</span>
                <CopyChip text="请问洗手间在哪里？" label="洗手间" />
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span>Không lấy ớt cay:</span>
                <CopyChip text="不要辣，一点辣都不要" label="不要辣" />
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span>Xin hóa đơn / biên nhận:</span>
                <CopyChip text="请给我发票 / 小票" label="请给发票" />
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span>Tôi muốn đi đến địa chỉ này:</span>
                <CopyChip text="师傅，请送我到这个地方" label="师傅送我到..." />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Đã hiểu &amp; Quay lại lịch trình
          </button>
        </div>
      </div>
    </div>
  );
};
