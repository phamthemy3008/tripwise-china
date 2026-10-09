import React from "react";
import { useAuth } from "../context/AuthContext";
import {
  Compass,
  FileText,
  Navigation,
  Utensils,
  ShieldCheck,
  WifiOff,
  Sparkles,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";

export const LoginScreen: React.FC = () => {
  const { signInWithGoogle, isConfigured } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white flex flex-col justify-between p-4 sm:p-6 font-sans">
      {/* Top Header */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between pt-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white">
              TripWise <span className="text-amber-400">China</span>
            </h1>
            <p className="text-[10px] text-slate-400">
              Trợ lý Du lịch Trung Quốc Thông minh
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
          <ShieldCheck className="w-3 h-3 text-emerald-400" /> Bản Riêng Tư
        </span>
      </div>

      {/* Main Card */}
      <div className="max-w-md w-full mx-auto my-auto py-8">
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Heading */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-amber-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Yêu cầu đăng nhập để tiếp tục</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Đăng Nhập Tài Khoản
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
              Mỗi người dùng sở hữu không gian lưu trữ lịch trình riêng biệt, tự động đồng bộ đám mây và hỗ trợ tra cứu ngoại tuyến.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="space-y-2.5 mb-7 text-xs">
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/50 border border-slate-800">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-slate-300">
                AI Gemini trích xuất lịch trình tự động từ file Word (.docx) &amp; text
              </span>
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/50 border border-slate-800">
              <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 shrink-0">
                <Navigation className="w-4 h-4" />
              </div>
              <span className="text-slate-300">
                1-chạm sao chép chữ Hán &amp; dẫn đường Bản đồ Amap Cao Đức
              </span>
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/50 border border-slate-800">
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                <WifiOff className="w-4 h-4" />
              </div>
              <span className="text-slate-300">
                Lưu trữ ngoại tuyến an toàn khi mất sóng 4G hoặc ngắt VPN tại Trung Quốc
              </span>
            </div>
          </div>

          {/* Google Sign-in Button */}
          <button
            type="button"
            onClick={signInWithGoogle}
            className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-sm transition-all shadow-lg shadow-white/10 active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer group"
          >
            {/* Google G Logo */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Đăng nhập với Google</span>
            <ArrowRight className="w-4 h-4 ml-auto text-slate-400 group-hover:translate-x-1 transition-transform" />
          </button>

          {!isConfigured && (
            <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-[11px] leading-relaxed flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong>Lưu ý:</strong> Chưa cấu hình Firebase Keys trong <code>.env</code>. Bấm nút trên sẽ kích hoạt <strong>Chế độ Xem thử (Demo Account)</strong> để bạn trải nghiệm ngay.
              </div>
            </div>
          )}

          <p className="text-[11px] text-slate-500 text-center mt-4">
            Bằng việc đăng nhập, lịch trình của bạn được bảo mật riêng tư trên Cloud Firestore cá nhân.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-md w-full mx-auto text-center pb-2">
        <p className="text-[11px] text-slate-500">
          TripWise China &bull; Mobile-first PWA &bull; Bảo mật Firebase Google OAuth
        </p>
      </div>
    </div>
  );
};
