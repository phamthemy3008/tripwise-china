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
} from "lucide-react";
import { TripDocument } from "../types/itinerary";
import { toast } from "sonner";

interface FileDropzoneProps {
  onParsedSuccess: (trip: TripDocument) => void;
  onSelectSample: (tripId: string) => void;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  onParsedSuccess,
  onSelectSample,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState("");
  const [gdocUrl, setGdocUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<"file" | "text" | "gdoc">("file");
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
    if (ext !== "docx" && ext !== "txt" && ext !== "md") {
      toast.error("Vui lòng chọn file định dạng .docx, .txt hoặc .md");
      return;
    }
    setSelectedFile(file);
    toast.success(`Đã nhận file: ${file.name}`);
  };

  const handleSubmit = async () => {
    if (activeTab === "file" && !selectedFile) {
      toast.warning("Vui lòng tải lên file lịch trình .docx, .txt hoặc .md");
      return;
    }
    if (activeTab === "text" && !textInput.trim()) {
      toast.warning("Vui lòng dán văn bản lịch trình du lịch");
      return;
    }
    if (activeTab === "gdoc" && !gdocUrl.trim()) {
      toast.warning("Vui lòng dán liên kết tài liệu Google Docs");
      return;
    }

    setIsProcessing(true);
    const toastId = toast.loading(
      activeTab === "gdoc"
        ? "Đang đọc tài liệu Google Docs & AI phân tích..."
        : "Gemini AI đang trích xuất dữ liệu lịch trình..."
    );

    try {
      if (activeTab === "gdoc") {
        const response = await fetch("/api/fetch-google-doc", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: gdocUrl }),
        });

        const resJson = await response.json();
        if (!response.ok || !resJson.success) {
          throw new Error(resJson.error || "Không thể đọc Google Docs");
        }

        toast.success("Trích xuất Google Docs thành công!", { id: toastId });
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

        toast.success("Trích xuất lịch trình thành công bằng Gemini AI!", {
          id: toastId,
        });
        onParsedSuccess(resJson.data);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Lỗi khi xử lý lịch trình", { id: toastId });
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
          Hỗ trợ đọc từ Google Docs (tự động đồng bộ khi sửa), tải file Word (.docx), hoặc dán văn bản trực tiếp.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl max-w-md mx-auto mb-5 overflow-x-auto">
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
          <span>File Word (.docx)</span>
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

      {/* Google Docs Tab */}
      {activeTab === "gdoc" && (
        <div className="space-y-4">
          <div className="bg-blue-50/60 dark:bg-blue-950/20 p-4 rounded-2xl border border-blue-200/60 dark:border-blue-900/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                <Link2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Dán đường dẫn liên kết Google Docs của bạn:
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
              placeholder="https://docs.google.com/document/d/.../edit"
              className="w-full rounded-xl border border-blue-300 dark:border-blue-800 bg-white dark:bg-slate-900 p-3 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />

            <div className="mt-3 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed space-y-1">
              <p className="flex items-start gap-1.5">
                <span className="text-blue-600 font-bold shrink-0">&bull;</span>
                <span>
                  <strong>Lưu ý quyền xem:</strong> Trên Google Docs, bấm <strong>Chia sẻ (Share)</strong> -&gt; chọn <strong>Bất kỳ ai có đường liên kết đều có thể xem (Anyone with the link can view)</strong>.
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
            accept=".docx,.txt,.md"
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
                Hỗ trợ Microsoft Word (.docx), Text (.txt), Markdown (.md)
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

      {/* Quick Sample Selector */}
      <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <FileCode className="w-3.5 h-3.5 text-amber-500" />
            Lịch trình mẫu có sẵn (Thử nghiệm ngay):
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
