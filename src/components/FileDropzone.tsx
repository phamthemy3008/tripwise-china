import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileText,
  Sparkles,
  Loader2,
  FileCode,
  CheckCircle2,
  Link2,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  KeyRound,
} from "lucide-react";
import { TripDocument } from "../types/itinerary";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

interface FileDropzoneProps {
  onParsedSuccess: (trip: TripDocument) => void;
  onSelectSample: (tripId: string) => void;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  onParsedSuccess,
  onSelectSample,
}) => {
  const { user, googleAccessToken, requestGoogleWorkspaceAccess } = useAuth();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState("");
  const [gdocUrl, setGdocUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<"gdoc" | "file" | "text">("gdoc");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "json" && ext !== "docx" && ext !== "txt" && ext !== "md") {
      toast.error("Vui lòng chọn file định dạng .json, .docx, .txt hoặc .md");
      return;
    }
    setSelectedFile(file);
    toast.success(`Đã nhận file: ${file.name}`);
  };

  const handleSubmit = async () => {
    if (activeTab === "file" && !selectedFile) {
      toast.warning("Vui lòng tải lên file lịch trình .json, .docx, .txt hoặc .md");
      return;
    }
    if (activeTab === "text" && !textInput.trim()) {
      toast.warning("Vui lòng dán văn bản lịch trình du lịch");
      return;
    }
    if (activeTab === "gdoc" && !gdocUrl.trim()) {
      toast.warning("Vui lòng dán liên kết tài liệu Google Docs hoặc Google Drive");
      return;
    }

    setIsProcessing(true);
    const toastId = toast.loading(
      activeTab === "gdoc"
        ? "Đang đọc Google Docs & AI quét tách từng ngày..."
        : "Hệ thống đang quét tách từng ngày (Chunk Scanning)..."
    );

    try {
      // Fast path: If client uploaded a .json file, parse directly in browser with 100% fidelity
      if (activeTab === "file" && selectedFile && selectedFile.name.toLowerCase().endsWith(".json")) {
        try {
          const text = await selectedFile.text();
          const jsonParsed = JSON.parse(text);
          if (jsonParsed.trip_title && Array.isArray(jsonParsed.days)) {
            if (!jsonParsed.id) jsonParsed.id = `trip_${Date.now()}`;
            if (!jsonParsed.created_at) jsonParsed.created_at = Date.now();
            toast.success(
              `Đã nạp chính xác 100% tất cả ${jsonParsed.days.length} ngày từ file JSON!`,
              { id: toastId }
            );
            onParsedSuccess(jsonParsed);
            setIsProcessing(false);
            return;
          }
        } catch (jsonErr: any) {
          console.warn("Client JSON parse error, falling back to server:", jsonErr);
        }
      }

      // Fast path: If user pasted raw JSON
      if (activeTab === "text" && textInput.trim().startsWith("{")) {
        try {
          const jsonParsed = JSON.parse(textInput.trim());
          if (jsonParsed.trip_title && Array.isArray(jsonParsed.days)) {
            if (!jsonParsed.id) jsonParsed.id = `trip_${Date.now()}`;
            if (!jsonParsed.created_at) jsonParsed.created_at = Date.now();
            toast.success(
              `Đã nạp chính xác 100% tất cả ${jsonParsed.days.length} ngày!`,
              { id: toastId }
            );
            onParsedSuccess(jsonParsed);
            setIsProcessing(false);
            return;
          }
        } catch {
          // continue with chunk scanner
        }
      }

      if (activeTab === "gdoc") {
        const response = await fetch("/api/fetch-google-doc", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: gdocUrl.trim(),
            accessToken: googleAccessToken || undefined,
          }),
        });

        const resJson = await response.json();
        if (!response.ok || !resJson.success) {
          throw new Error(resJson.error || "Không thể đọc nội dung Google Docs");
        }

        toast.success(
          `Trích xuất thành công ${resJson.data.days?.length || 0} ngày từ Google Docs!`,
          { id: toastId }
        );
        onParsedSuccess(resJson.data);
      } else {
        const formData = new FormData();
        if (activeTab === "file" && selectedFile) {
          formData.append("file", selectedFile);
        } else {
          formData.append("text", textInput);
        }

        const response = await fetch("/api/parse-itinerary", {
          method: "POST",
          body: formData,
        });

        const resJson = await response.json();
        if (!response.ok || !resJson.success) {
          throw new Error(resJson.error || "Không thể phân tích dữ liệu lịch trình");
        }

        toast.success(
          `Đã quét và trích xuất thành công trọn vẹn ${resJson.data.days?.length || 0} ngày!`,
          { id: toastId }
        );
        onParsedSuccess(resJson.data);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Lỗi khi xử lý lịch trình", { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadOfficial16Days = async () => {
    setIsProcessing(true);
    const toastId = toast.loading("Đang nạp trực tiếp toàn bộ 16 ngày lịch trình chính thức...");
    try {
      const res = await fetch("/itinerary_16_days_zhangjiajie_chongqing_chengdu.json");
      if (!res.ok) throw new Error("Không thể tải file mẫu");
      const data = await res.json();
      if (!data.id) data.id = `trip_16d_${Date.now()}`;
      toast.success(`Nạp thành công đầy đủ 100% cả 16 ngày (${data.days?.length} ngày)!`, {
        id: toastId,
      });
      onParsedSuccess(data);
    } catch {
      onSelectSample("trip_zhangjiajie_chengdu_16d15n");
      toast.success("Đã nạp lịch trình mẫu 16 ngày!", { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setGdocUrl(text);
        toast.info("Đã dán liên kết từ bộ nhớ tạm");
      }
    } catch {
      toast.error("Không thể tự động dán. Vui lòng nhấn Ctrl+V / Cmd+V");
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 shadow-xl border border-slate-200/80 dark:border-slate-800">
      <div className="text-center max-w-xl mx-auto mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>AI Trích xuất Lịch trình Tự động</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Nhập Lịch Trình Du Lịch
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
          Hỗ trợ đọc từ Google Docs (tự động đồng bộ khi sửa), Google Drive, tải file Word (.docx), hoặc dán văn bản trực tiếp.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl max-w-md mx-auto mb-4 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("gdoc")}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
            activeTab === "gdoc"
              ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          <Link2 className="w-3.5 h-3.5" />
          <span>Google Docs / Sync</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("file")}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
            activeTab === "file"
              ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>File Word (.docx) / JSON</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("text")}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
            activeTab === "text"
              ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Dán văn bản</span>
        </button>
      </div>

      {/* Chunk Scanning Feature Notice */}
      <div className="mb-5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div className="text-left text-xs">
          <p className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <span>✨ Tính Năng Mới: Quét Tách Từng Ngày (Chunk Scanner)</span>
            <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] rounded-md font-extrabold uppercase">100% Đầy Đủ</span>
          </p>
          <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
            Dù tài liệu có 1 ngày, 5 ngày hay 16 ngày, hệ thống sẽ tự động bóc tách từng chặng và quét lần lượt, không bao giờ bị cắt ngắn hoặc chỉ dừng lại ở 2 ngày.
          </p>
        </div>
      </div>

      {/* Google Docs Tab */}
      {activeTab === "gdoc" && (
        <div className="space-y-4">
          <div className="bg-blue-50/60 dark:bg-blue-950/20 p-4 rounded-2xl border border-blue-200/60 dark:border-blue-900/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                <Link2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Dán đường dẫn liên kết Google Docs hoặc Google Drive của bạn:
              </span>
              <button
                type="button"
                onClick={handlePasteClipboard}
                className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Dán từ Clipboard
              </button>
            </div>

            <input
              type="url"
              value={gdocUrl}
              onChange={(e) => setGdocUrl(e.target.value)}
              placeholder="https://docs.google.com/document/d/... hoặc https://drive.google.com/file/d/..."
              className="w-full rounded-xl border border-blue-300 dark:border-blue-800 bg-white dark:bg-slate-900 p-3 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />

            {/* Google Account OAuth Status Banner */}
            <div className="mt-3">
              {googleAccessToken ? (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>
                    Đã cấp quyền Google Workspace cho tài khoản: <strong>{user?.email || "Cá nhân"}</strong>. Có thể đọc cả file riêng tư và file chia sẻ!
                  </span>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-blue-100/60 dark:bg-blue-900/30 border border-blue-300/60 dark:border-blue-800 text-blue-900 dark:text-blue-200 text-xs">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Đang ở tài khoản: <strong>{user?.email || "Người dùng"}</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => requestGoogleWorkspaceAccess()}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shrink-0 cursor-pointer shadow-xs"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Cấp quyền đọc Google Docs cá nhân</span>
                  </button>
                </div>
              )}
            </div>

            <div className="mt-3 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed space-y-1">
              <p className="flex items-start gap-1.5">
                <span className="text-blue-600 font-bold shrink-0">&bull;</span>
                <span>
                  <strong>Đối với tài liệu chia sẻ:</strong> Bạn chỉ cần bấm <strong>Chia sẻ (Share)</strong> trên Google Docs -&gt; chọn <strong>Bất kỳ ai có đường liên kết đều có thể xem (Anyone with the link can view)</strong>.
                </span>
              </p>
              <p className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold shrink-0">&bull;</span>
                <span>
                  <strong>Tính năng Đồng Bộ (Live Sync):</strong> Ứng dụng sẽ lưu liên kết này. Khi bạn sửa Google Docs, chỉ cần bấm nút <strong>"Đồng bộ Google Docs"</strong> trên app là lịch trình tự động cập nhật lại!
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* File Dropzone Area */}
      {activeTab === "file" && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 sm:p-10 text-center cursor-pointer transition-all ${
            dragActive
              ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 scale-[0.99]"
              : "border-slate-300 dark:border-slate-700 hover:border-slate-400 bg-slate-50/50 dark:bg-slate-800/40"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.docx,.txt,.md"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            {selectedFile ? (
              <CheckCircle2 className="w-7 h-7 text-emerald-500" />
            ) : (
              <UploadCloud className="w-7 h-7" />
            )}
          </div>

          {selectedFile ? (
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {selectedFile.name}
              </p>
              <p className="text-xs text-slate-500">
                {(selectedFile.size / 1024).toFixed(1)} KB &bull; Bấm để đổi file khác
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Kéo thả file vào đây hoặc{" "}
                <span className="text-amber-600 dark:text-amber-400 underline">
                  chọn từ thiết bị
                </span>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hỗ trợ JSON (.json), Microsoft Word (.docx), Text (.txt), Markdown (.md)
              </p>
            </div>
          )}
        </div>
      )}

      {/* Text Paste Area */}
      {activeTab === "text" && (
        <div className="space-y-2">
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            rows={7}
            placeholder={`Dán nội dung lịch trình du lịch tại đây...\nVí dụ:\nNgày 1: Bay tới Bắc Kinh, nhận phòng tại khách sạn Vương Phủ Tỉnh. Chiều tham quan Tử Cấm Thành, ăn vịt quay Toàn Tụ Đức...\nNgày 2: Leo Vạn Lý Trường Thành Bát Đạt Lĩnh...`}
            className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 p-4 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      )}

      {/* Submit Button */}
      <div className="mt-5">
        <button
          type="button"
          disabled={isProcessing}
          onClick={handleSubmit}
          className="w-full py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-slate-950 font-extrabold text-sm transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
              <span>Đang phân tích cấu trúc bằng Gemini AI...</span>
            </>
          ) : activeTab === "gdoc" ? (
            <>
              <RefreshCw className="w-4 h-4" />
              <span>Đọc &amp; Phân Tích từ Google Docs</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Phân Tích &amp; Tạo Lịch Trình Thông Minh</span>
            </>
          )}
        </button>
      </div>

      {/* Quick Sample Selector & Official 16-Day Trip */}
      <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
        {/* Featured 16-Day Official Itinerary */}
        <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 border border-amber-500/30">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-black uppercase mb-1">
                ⭐ Lịch trình chính thức 16 ngày (14/11 – 29/11/2026)
              </div>
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Trương Gia Giới – Vũ Long – Trùng Khánh – Thành Đô – Nga Mi Sơn
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                16 ngày 15 đêm &bull; Đầy đủ 6 khách sạn, vé máy bay, tàu cao tốc, Amap &amp; ẩm thực chi tiết 100%
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <a
                href="/itinerary_16_days_zhangjiajie_chongqing_chengdu.json"
                download="Lich_Trinh_16_Ngay_Chinh_Thuc.json"
                className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold text-center transition-colors cursor-pointer"
                title="Tải file JSON chuẩn để lưu trữ hoặc nạp lại bất cứ lúc nào"
              >
                📥 Tải file JSON
              </a>
              <button
                type="button"
                onClick={handleLoadOfficial16Days}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Nạp Ngay 16 Ngày Chuẩn</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <FileCode className="w-3.5 h-3.5 text-amber-500" />
            Lịch trình mẫu khác:
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => onSelectSample("sample_beijing_shanghai_6d5n")}
            className="p-3 text-left rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 hover:border-amber-300 transition-all cursor-pointer group"
          >
            <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 block mb-0.5">
              Bắc Kinh - Thượng Hải - Hàng Châu
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
              6 ngày 5 đêm &bull; Tử Cấm Thành &bull; Trường Thành &bull; Tây Hồ
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSelectSample("sample_chongqing_chengdu_5d4n")}
            className="p-3 text-left rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 hover:border-amber-300 transition-all cursor-pointer group"
          >
            <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 block mb-0.5">
              Trùng Khánh 8D &amp; Thành Đô Gấu Trúc
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
              5 ngày 4 đêm &bull; Hồng Nhai Động &bull; Cáp treo &bull; Biến Mặt
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
