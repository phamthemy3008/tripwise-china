import React, { useState, useEffect } from "react";
import {
  Server,
  Terminal,
  Cpu,
  Bot,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Play,
  Code,
  FileText,
  Layers,
  Sparkles,
  Clock,
  Download,
  AlertCircle,
  X,
  Radio,
  BookOpen,
  Search,
  Wallet,
  Compass,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { TripDocument } from "../types/itinerary";

interface McpHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrip?: TripDocument | null;
  onTripUpdated?: (trip: TripDocument) => void;
}

interface McpToolDef {
  name: string;
  description: string;
  defaultArgs: Record<string, any>;
  icon: any;
  category: string;
}

const MCP_TOOLS_LIST: McpToolDef[] = [
  {
    name: "list_trips",
    description: "Liệt kê danh sách tất cả các lịch trình du lịch hiện có trong hệ thống (ID, tên chuyến đi, số ngày, điểm đến, tổng số hoạt động).",
    defaultArgs: { limit: 10 },
    icon: Compass,
    category: "Lịch trình",
  },
  {
    name: "get_trip_details",
    description: "Lấy chi tiết toàn bộ lịch trình hoặc một ngày cụ thể (các điểm tham quan, tên tiếng Trung chữ Hán, khung giờ, ghi chú, khách sạn, ga tàu di chuyển, chi phí).",
    defaultArgs: { trip_id: "sample_16d_zjj_cq_cd", day_number: 1 },
    icon: FileText,
    category: "Lịch trình",
  },
  {
    name: "search_activities",
    description: "Tìm kiếm các hoạt động, địa danh, quán ăn, điểm check-in hoặc ga tàu trong lịch trình theo từ khóa (tiếng Việt hoặc tiếng Trung).",
    defaultArgs: { query: "Lý Tử Bá", city: "Trùng Khánh" },
    icon: Search,
    category: "Tra cứu",
  },
  {
    name: "calculate_trip_budget",
    description: "Tính toán và phân tích chi tiết ngân sách chuyến đi: tổng chi tiêu, tỷ giá NDT/VND, phân loại theo danh mục (khách sạn, vé máy bay, tàu hỏa/di chuyển, vé tham quan, ăn uống) và theo từng ngày.",
    defaultArgs: { trip_id: "sample_16d_zjj_cq_cd", exchange_rate: 3500 },
    icon: Wallet,
    category: "Ngân sách",
  },
  {
    name: "suggest_travel_activities",
    description: "Gợi ý các điểm tham quan, danh lam thắng cảnh, điểm vui chơi nổi tiếng tại một thành phố ở Trung Quốc có chữ Hán và kinh nghiệm thực tế.",
    defaultArgs: { city: "Trùng Khánh", category: "sightseeing", day_number: 1 },
    icon: Sparkles,
    category: "Gợi ý AI",
  },
  {
    name: "suggest_restaurants",
    description: "Gợi ý quán ăn ngon, nhà hàng đặc sản và món ăn truyền thống tại Trung Quốc theo món ăn hoặc thành phố.",
    defaultArgs: { city: "Thành Đô", dish_name: "Lẩu cay Tứ Xuyên" },
    icon: Sparkles,
    category: "Gợi ý AI",
  },
  {
    name: "add_trip_activity",
    description: "Thêm một hoạt động/sự kiện mới vào một ngày trong lịch trình du lịch (tên hoạt động, tên tiếng Trung chữ Hán, khung giờ, địa điểm, chi phí).",
    defaultArgs: {
      trip_id: "sample_16d_zjj_cq_cd",
      day_number: 1,
      activity_title: "Thưởng thức Trà Sữa Bá Vương Trà Cơ (Chagee)",
      place_zh: "霸王茶姬 (解放碑店)",
      time_slot: "16:00 - 17:00",
      notes: "Nổi tiếng với Trà Sữa Nhài Tuyết Sơn Bá Khí",
      cost_rmb: 22,
      cost_category: "food",
    },
    icon: Code,
    category: "Chỉnh sửa",
  },
  {
    name: "parse_itinerary_text",
    description: "Sử dụng AI phân tích văn bản ghi chú lịch trình du lịch tự do thành cấu trúc dữ liệu JSON chuẩn với từng ngày, hoạt động và tên tiếng Trung.",
    defaultArgs: {
      raw_text: "Ngày 1: Bay đến Trùng Khánh, nhận phòng tại Jiefangbei, tối đi ngắm Hồng Nhai Động và ăn lẩu cay Tứ Xuyên.",
    },
    icon: Bot,
    category: "Gợi ý AI",
  },
];

export const McpHubModal: React.FC<McpHubModalProps> = ({
  isOpen,
  onClose,
  currentTrip,
}) => {
  const [activeTab, setActiveTab] = useState<"connect" | "inspector" | "resources" | "logs">("connect");
  const [serverStatus, setServerStatus] = useState<any>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Inspector state
  const [selectedTool, setSelectedTool] = useState<string>("list_trips");
  const [argsJson, setArgsJson] = useState<string>("{\n  \"limit\": 10\n}");
  const [isExecutingTool, setIsExecutingTool] = useState(false);
  const [toolResult, setToolResult] = useState<any>(null);
  const [toolExecutionError, setToolExecutionError] = useState<string | null>(null);
  const [toolDuration, setToolDuration] = useState<number | null>(null);

  // Logs state
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [autoRefreshLogs, setAutoRefreshLogs] = useState(false);

  // Resources state
  const [viewingResource, setViewingResource] = useState<{ uri: string; title: string; content: string } | null>(null);
  const [isLoadingResource, setIsLoadingResource] = useState(false);

  // Determine actual server base URL
  const [baseUrl, setBaseUrl] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const sseUrl = `${baseUrl}/api/mcp/sse`;
  const httpUrl = `${baseUrl}/api/mcp`;

  // Fetch status on open
  useEffect(() => {
    if (isOpen) {
      fetchStatus();
      fetchLogs();
    }
  }, [isOpen]);

  // Auto refresh logs
  useEffect(() => {
    let interval: any;
    if (isOpen && autoRefreshLogs && activeTab === "logs") {
      interval = setInterval(() => {
        fetchLogs(true);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isOpen, autoRefreshLogs, activeTab]);

  const fetchStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const res = await fetch("/api/mcp/status");
      if (res.ok) {
        const data = await res.json();
        setServerStatus(data);
      }
    } catch {
      // ignore
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const fetchLogs = async (silent = false) => {
    if (!silent) setIsLoadingLogs(true);
    try {
      const res = await fetch("/api/mcp/logs");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.logs)) {
          setLogs(data.logs);
        }
      }
    } catch {
      // ignore
    } finally {
      if (!silent) setIsLoadingLogs(false);
    }
  };

  const copyToClipboard = (text: string, key: string, label: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedKey(key);
        toast.success(`Đã sao chép ${label}!`);
        setTimeout(() => setCopiedKey(null), 2500);
      })
      .catch(() => {
        toast.error("Không thể sao chép");
      });
  };

  const handleSelectTool = (toolName: string) => {
    setSelectedTool(toolName);
    const toolDef = MCP_TOOLS_LIST.find((t) => t.name === toolName);
    if (toolDef) {
      const initialArgs = { ...toolDef.defaultArgs };
      if (currentTrip?.id && (initialArgs as any).trip_id) {
        (initialArgs as any).trip_id = currentTrip.id;
      }
      setArgsJson(JSON.stringify(initialArgs, null, 2));
    }
    setToolResult(null);
    setToolExecutionError(null);
    setToolDuration(null);
  };

  const handleExecuteTool = async () => {
    setIsExecutingTool(true);
    setToolResult(null);
    setToolExecutionError(null);
    setToolDuration(null);

    let parsedArgs: any = {};
    try {
      if (argsJson.trim()) {
        parsedArgs = JSON.parse(argsJson);
      }
    } catch (err: any) {
      setIsExecutingTool(false);
      setToolExecutionError(`Lỗi định dạng JSON tham số: ${err.message}`);
      toast.error("JSON tham số không hợp lệ");
      return;
    }

    const start = performance.now();
    try {
      const res = await fetch("/api/mcp/test-tool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: selectedTool,
          args: parsedArgs,
        }),
      });

      const data = await res.json();
      const end = performance.now();
      setToolDuration(Math.round(end - start));

      if (res.ok && data.success) {
        setToolResult(data.result);
        toast.success(`Chạy thành công công cụ '${selectedTool}'`);
        fetchLogs(true);
      } else {
        setToolExecutionError(data.error || "Lỗi thực thi công cụ");
        toast.error(data.error || "Thực thi thất bại");
      }
    } catch (err: any) {
      setToolExecutionError(err.message || "Không thể kết nối tới MCP Server");
    } finally {
      setIsExecutingTool(false);
    }
  };

  const handleReadResource = async (uri: string, title: string) => {
    setIsLoadingResource(true);
    setViewingResource({ uri, title, content: "Đang tải dữ liệu tài nguyên..." });
    try {
      const res = await fetch("/api/mcp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "resources/read",
          params: { uri },
        }),
      });
      const data = await res.json();
      if (data.result?.contents?.[0]?.text) {
        setViewingResource({
          uri,
          title,
          content: data.result.contents[0].text,
        });
      } else {
        setViewingResource({
          uri,
          title,
          content: "Không tìm thấy nội dung tài nguyên hoặc định dạng không hỗ trợ.",
        });
      }
    } catch (e: any) {
      setViewingResource({
        uri,
        title,
        content: `Lỗi khi tải tài nguyên: ${e.message}`,
      });
    } finally {
      setIsLoadingResource(false);
    }
  };

  const claudeDesktopConfig = JSON.stringify(
    {
      mcpServers: {
        vivuchina: {
          url: sseUrl,
        },
      },
    },
    null,
    2
  );

  const cursorMcpConfig = JSON.stringify(
    {
      mcpServers: {
        vivuchina: {
          url: sseUrl,
        },
      },
    },
    null,
    2
  );

  const curlTestCommand = `curl -X POST ${httpUrl} \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"list_trips","arguments":{}}}'`;

  const downloadConfigFile = () => {
    const blob = new Blob([claudeDesktopConfig], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "claude_desktop_config.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Đã tải xuống file cấu hình claude_desktop_config.json!");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-5xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative p-2.5 bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 rounded-2xl shadow-lg shadow-amber-500/20">
              <Server className="w-6 h-6 stroke-[2.2]" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-slate-900"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
                  Model Context Protocol <span className="text-amber-400">(MCP) Hub</span>
                </h3>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  MCP Online
                </span>
                <span className="text-xs text-slate-400 hidden md:inline">
                  Chuẩn kết nối AI Mở (Anthropic / Claude / Cursor)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Cung cấp các công cụ tra cứu địa điểm, dịch chữ Hán, bản đồ Amap và tính toán ngân sách cho trợ lý AI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchStatus}
              disabled={isLoadingStatus}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Làm mới trạng thái MCP"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingStatus ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 sm:gap-2 px-4 sm:px-6 pt-3 border-b border-slate-800 bg-slate-950/60 overflow-x-auto text-xs sm:text-sm">
          <button
            onClick={() => setActiveTab("connect")}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "connect"
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Kết Nối AI (Claude / Cursor)</span>
          </button>
          <button
            onClick={() => setActiveTab("inspector")}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "inspector"
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>MCP Inspector (Thử Công Cụ)</span>
            <span className="px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-400 text-[10px] font-black">
              8 Tools
            </span>
          </button>
          <button
            onClick={() => setActiveTab("resources")}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "resources"
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Tài Nguyên & Prompts</span>
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "logs"
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Nhật Ký Yêu Cầu (Logs)</span>
            {logs.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold">
                {logs.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: CONNECT */}
          {activeTab === "connect" && (
            <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-150">
              {/* Quick Status Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Giao Thức MCP</div>
                  <div className="text-lg font-black text-white mt-1">2024-11-05 (JSON-RPC)</div>
                  <div className="text-xs text-emerald-400 mt-0.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> SSE & Streamlined HTTP
                  </div>
                </div>

                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Công Cụ Sẵn Sàng</div>
                  <div className="text-lg font-black text-amber-400 mt-1">8 Tools & 4 Resources</div>
                  <div className="text-xs text-slate-300 mt-0.5">Lịch trình, bản đồ, ngân sách, tàu cao tốc</div>
                </div>

                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Kết Nối SSE Đang Mở</div>
                  <div className="text-lg font-black text-indigo-400 mt-1">
                    {serverStatus?.active_sse_clients ?? 0} Clients
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">Hỗ trợ Claude Desktop & Cursor IDE</div>
                </div>
              </div>

              {/* Endpoint URLs */}
              <div className="bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-slate-700/80 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Radio className="w-4 h-4 text-amber-400" />
                  Điểm cuối MCP Endpoint (Live URLs)
                </h4>
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-950/80 rounded-xl border border-slate-800 font-mono text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                        SSE
                      </span>
                      <span className="text-slate-300 truncate">{sseUrl}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(sseUrl, "sse_url", "URL kết nối SSE")}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold cursor-pointer shrink-0"
                    >
                      {copiedKey === "sse_url" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === "sse_url" ? "Đã chép" : "Sao chép URL"}</span>
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-950/80 rounded-xl border border-slate-800 font-mono text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold text-[10px]">
                        HTTP
                      </span>
                      <span className="text-slate-300 truncate">{httpUrl}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(httpUrl, "http_url", "URL JSON-RPC HTTP")}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold cursor-pointer shrink-0"
                    >
                      {copiedKey === "http_url" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === "http_url" ? "Đã chép" : "Sao chép URL"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Instructions 1: Claude Desktop */}
              <div className="bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-amber-500/20 rounded-lg text-amber-400">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">Cấu hình Claude Desktop</h4>
                      <p className="text-xs text-slate-400">
                        Thêm vào tệp <code className="text-amber-300">claude_desktop_config.json</code>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={downloadConfigFile}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-400" />
                      <span>Tải file .json</span>
                    </button>
                    <button
                      onClick={() => copyToClipboard(claudeDesktopConfig, "claude_cfg", "cấu hình Claude Desktop")}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black cursor-pointer"
                    >
                      {copiedKey === "claude_cfg" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === "claude_cfg" ? "Đã chép" : "Sao chép JSON"}</span>
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-amber-200/90 overflow-x-auto">
                  <pre>{claudeDesktopConfig}</pre>
                </div>

                <div className="text-[11px] text-slate-400 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="font-bold text-slate-300">Đường dẫn tệp cấu hình trên máy tính:</span>
                  <ul className="list-disc list-inside mt-1 space-y-0.5 font-mono text-[10px] text-slate-300">
                    <li>macOS: ~/Library/Application Support/Claude/claude_desktop_config.json</li>
                    <li>Windows: %APPDATA%\Claude\claude_desktop_config.json</li>
                  </ul>
                </div>
              </div>

              {/* Instructions 2: Cursor IDE */}
              <div className="bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-blue-500/20 rounded-lg text-blue-400">
                      <Code className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">Cấu hình Cursor IDE / Windsurf</h4>
                      <p className="text-xs text-slate-400">Vào Settings → Features → MCP → Add New MCP Server</p>
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(cursorMcpConfig, "cursor_cfg", "cấu hình Cursor")}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 cursor-pointer"
                  >
                    {copiedKey === "cursor_cfg" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === "cursor_cfg" ? "Đã chép" : "Sao chép"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Name</div>
                    <div className="font-mono text-amber-300 mt-0.5">vivuchina</div>
                  </div>
                  <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Type</div>
                    <div className="font-mono text-emerald-400 mt-0.5">sse</div>
                  </div>
                  <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Server URL</div>
                    <div className="font-mono text-slate-200 mt-0.5 truncate">{sseUrl}</div>
                  </div>
                </div>
              </div>

              {/* Instructions 3: cURL test */}
              <div className="bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-purple-500/20 rounded-lg text-purple-400">
                      <Terminal className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">Kiểm tra nhanh bằng cURL / Terminal</h4>
                      <p className="text-xs text-slate-400">Gọi trực tiếp phương thức JSON-RPC tools/call</p>
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(curlTestCommand, "curl_cmd", "lệnh cURL")}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 cursor-pointer"
                  >
                    {copiedKey === "curl_cmd" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === "curl_cmd" ? "Đã chép" : "Sao chép cURL"}</span>
                  </button>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-300/90 overflow-x-auto">
                  <pre>{curlTestCommand}</pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INSPECTOR (TOOL RUNNER) */}
          {activeTab === "inspector" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-in fade-in duration-150">
              {/* Left Column: Tool Selector */}
              <div className="lg:col-span-4 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                  Chọn công cụ MCP ({MCP_TOOLS_LIST.length})
                </h4>
                <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
                  {MCP_TOOLS_LIST.map((tool) => {
                    const isSelected = selectedTool === tool.name;
                    const Icon = tool.icon;
                    return (
                      <button
                        key={tool.name}
                        onClick={() => handleSelectTool(tool.name)}
                        className={`w-full text-left p-3 rounded-2xl transition-all border flex items-start gap-2.5 cursor-pointer ${
                          isSelected
                            ? "bg-amber-500/15 border-amber-500/50 text-white shadow-md shadow-amber-500/5"
                            : "bg-slate-800/40 border-slate-800 hover:bg-slate-800 text-slate-300"
                        }`}
                      >
                        <div
                          className={`p-1.5 rounded-xl mt-0.5 ${
                            isSelected ? "bg-amber-500 text-slate-950" : "bg-slate-700/60 text-slate-300"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-mono text-xs font-bold text-amber-300 truncate">
                              {tool.name}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                              {tool.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                            {tool.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Execution Panel */}
              <div className="lg:col-span-8 space-y-4">
                {/* Tool Description & Run Action */}
                <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/80">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-black text-amber-400">
                          {selectedTool}
                        </span>
                        {toolDuration !== null && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            ⚡ {toolDuration} ms
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 mt-1">
                        {MCP_TOOLS_LIST.find((t) => t.name === selectedTool)?.description}
                      </p>
                    </div>

                    <button
                      onClick={handleExecuteTool}
                      disabled={isExecutingTool}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer shrink-0 disabled:opacity-50"
                    >
                      {isExecutingTool ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Đang thực thi...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current" />
                          <span>Chạy Công Cụ (Execute)</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Arguments Editor */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Tham số đầu vào (JSON Arguments):
                    </label>
                    <textarea
                      rows={5}
                      value={argsJson}
                      onChange={(e) => setArgsJson(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-amber-200/90 focus:outline-none focus:border-amber-500/50"
                      placeholder={'{\n  "arg": "value"\n}'}
                    />
                  </div>
                </div>

                {/* Execution Output */}
                <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-amber-400" />
                      Kết quả trả về (JSON Response)
                    </h5>
                    {toolResult && (
                      <button
                        onClick={() =>
                          copyToClipboard(
                            JSON.stringify(toolResult, null, 2),
                            "tool_res",
                            "kết quả công cụ"
                          )
                        }
                        className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
                      >
                        {copiedKey === "tool_res" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === "tool_res" ? "Đã chép" : "Sao chép kết quả"}</span>
                      </button>
                    )}
                  </div>

                  {toolExecutionError && (
                    <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold">Lỗi khi thực thi công cụ</div>
                        <div className="text-[11px] mt-0.5 opacity-90">{toolExecutionError}</div>
                      </div>
                    </div>
                  )}

                  <div className="min-h-[220px] max-h-[360px] overflow-y-auto p-3.5 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-200">
                    {toolResult ? (
                      <pre className="whitespace-pre-wrap">{JSON.stringify(toolResult, null, 2)}</pre>
                    ) : !toolExecutionError ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-500 py-10">
                        <Terminal className="w-8 h-8 stroke-1 text-slate-600 mb-2" />
                        <p className="text-xs">Bấm &quot;Chạy Công Cụ&quot; ở trên để xem kết quả trực tiếp từ server MCP</p>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RESOURCES & PROMPTS */}
          {activeTab === "resources" && (
            <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-150">
              {/* Resources Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  Tài nguyên MCP (MCP Resources)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-amber-300 font-bold">
                        guide://china_survival
                      </span>
                      <button
                        onClick={() =>
                          handleReadResource(
                            "guide://china_survival",
                            "Cẩm nang sinh tồn du lịch Trung Quốc"
                          )
                        }
                        className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/30 cursor-pointer"
                      >
                        Đọc tài nguyên
                      </button>
                    </div>
                    <div className="font-bold text-white text-sm">Cẩm nang sinh tồn du lịch Trung Quốc</div>
                    <p className="text-xs text-slate-400">
                      Hướng dẫn cài đặt thanh toán Alipay, WeChat, bản đồ Amap, tàu cao tốc 12306, eSIM và số khẩn cấp.
                    </p>
                  </div>

                  <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-amber-300 font-bold">
                        guide://railway_stations
                      </span>
                      <button
                        onClick={() =>
                          handleReadResource(
                            "guide://railway_stations",
                            "Bảng đối chiếu ga tàu cao tốc & metro"
                          )
                        }
                        className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/30 cursor-pointer"
                      >
                        Đọc tài nguyên
                      </button>
                    </div>
                    <div className="font-bold text-white text-sm">Bảng đối chiếu ga tàu cao tốc &amp; metro</div>
                    <p className="text-xs text-slate-400">
                      Tên chữ Hán, phiên âm Pinyin và tiếng Việt của các ga tàu lớn ở Trùng Khánh, Thành Đô, Trương Gia Giới.
                    </p>
                  </div>

                  <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-amber-300 font-bold">
                        trips://catalog
                      </span>
                      <button
                        onClick={() =>
                          handleReadResource(
                            "trips://catalog",
                            "Danh mục toàn bộ các chuyến đi"
                          )
                        }
                        className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/30 cursor-pointer"
                      >
                        Đọc tài nguyên
                      </button>
                    </div>
                    <div className="font-bold text-white text-sm">Danh mục toàn bộ các chuyến đi</div>
                    <p className="text-xs text-slate-400">
                      Danh sách tổng hợp ID, tiêu đề chuyến đi, số ngày và điểm đến trong hệ thống.
                    </p>
                  </div>

                  {currentTrip && (
                    <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-amber-300 font-bold truncate max-w-[200px]">
                          trip://{currentTrip.id}
                        </span>
                        <button
                          onClick={() =>
                            handleReadResource(
                              `trip://${currentTrip.id}`,
                              `Chuyến đi: ${currentTrip.trip_title}`
                            )
                          }
                          className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/30 cursor-pointer"
                        >
                          Đọc tài nguyên
                        </button>
                      </div>
                      <div className="font-bold text-white text-sm truncate">{currentTrip.trip_title}</div>
                      <p className="text-xs text-slate-400">
                        Chi tiết toàn bộ {currentTrip.days?.length} ngày, danh sách hoạt động, khách sạn và chi phí.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Resource Viewer Modal/Box */}
              {viewingResource && (
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div>
                      <div className="font-bold text-white text-sm">{viewingResource.title}</div>
                      <div className="font-mono text-[11px] text-amber-300">{viewingResource.uri}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          copyToClipboard(
                            viewingResource.content,
                            "res_content",
                            "nội dung tài nguyên"
                          )
                        }
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
                      >
                        {copiedKey === "res_content" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === "res_content" ? "Đã chép" : "Sao chép"}</span>
                      </button>
                      <button
                        onClick={() => setViewingResource(null)}
                        className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto p-3 bg-slate-900 rounded-xl font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {viewingResource.content}
                  </div>
                </div>
              )}

              {/* Prompts Section */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-amber-400" />
                  Mẫu Lệnh Hướng Dẫn AI (MCP Prompts)
                </h4>
                <div className="space-y-3">
                  <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-amber-300 font-bold">plan_china_trip</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                          Prompt Template
                        </span>
                      </div>
                      <div className="font-bold text-white text-sm mt-1">Lập kế hoạch lịch trình du lịch Trung Quốc theo ngày</div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Yêu cầu AI xây dựng lịch trình chi tiết kèm tên chữ Hán để tra Amap và ga tàu cao tốc.
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          "Bạn là chuyên gia tư vấn du lịch Trung Quốc của ViVu China. Hãy lên lịch trình chi tiết 7 ngày cho hành trình Trùng Khánh - Thành Đô theo phong cách ẩm thực và văn hóa. Mỗi ngày cần có tên thành phố, các điểm tham quan với tên chữ Hán chuẩn để tìm bản đồ Amap/Gaode, ga tàu cao tốc di chuyển, và món ăn đặc sản nhất định phải thử.",
                          "p_plan",
                          "prompt mẫu"
                        )
                      }
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold border border-slate-700 cursor-pointer shrink-0"
                    >
                      {copiedKey === "p_plan" ? "Đã chép" : "Sao chép Prompt"}
                    </button>
                  </div>

                  <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-amber-300 font-bold">audit_trip_budget</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                          Prompt Template
                        </span>
                      </div>
                      <div className="font-bold text-white text-sm mt-1">Đánh giá và tối ưu ngân sách chi tiêu du lịch</div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Phân tích các khoản chi khách sạn, vé máy bay, tàu 12306 và tìm kiếm chi phí ẩn.
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `Hãy phân tích chi tiết ngân sách cho chuyến đi '${currentTrip?.trip_title || "Du lịch Trung Quốc"}'. Đánh giá tỷ trọng các khoản chi (khách sạn, vé máy bay, vé tàu cao tốc 12306, vé tham quan, ăn uống), kiểm tra xem có chi phí ẩn nào còn thiếu không và đề xuất các mẹo tiết kiệm chi phí hiệu quả nhất khi du lịch Trung Quốc.`,
                          "p_audit",
                          "prompt mẫu"
                        )
                      }
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold border border-slate-700 cursor-pointer shrink-0"
                    >
                      {copiedKey === "p_audit" ? "Đã chép" : "Sao chép Prompt"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LIVE LOGS */}
          {activeTab === "logs" && (
            <div className="space-y-4 max-w-4xl mx-auto animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/40 p-3.5 rounded-2xl border border-slate-700/80">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-white text-xs sm:text-sm">
                    Nhật ký gọi MCP theo thời gian thực ({logs.length} bản ghi gần nhất)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoRefreshLogs}
                      onChange={(e) => setAutoRefreshLogs(e.target.checked)}
                      className="rounded accent-amber-500"
                    />
                    <span>Tự động cập nhật (3s)</span>
                  </label>
                  <button
                    onClick={() => fetchLogs()}
                    disabled={isLoadingLogs}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLogs ? "animate-spin" : ""}`} />
                    <span>Làm mới</span>
                  </button>
                </div>
              </div>

              {logs.length === 0 ? (
                <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 text-center text-slate-500">
                  <Terminal className="w-8 h-8 stroke-1 mx-auto mb-2 text-slate-600" />
                  <p className="text-sm font-semibold text-slate-400">Chưa có yêu cầu MCP nào</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Hãy kết nối Claude Desktop/Cursor hoặc vào tab &quot;MCP Inspector&quot; để chạy thử các công cụ!
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {logs.map((log) => {
                    const isSuccess = log.status === "success";
                    const timeStr = new Date(log.timestamp).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    });

                    return (
                      <div
                        key={log.id}
                        className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              isSuccess ? "bg-emerald-400" : "bg-red-400"
                            }`}
                          ></span>
                          <span className="text-slate-400 text-[11px] shrink-0">{timeStr}</span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-bold text-[10px] shrink-0">
                            {log.method}
                          </span>
                          {log.toolName && (
                            <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold text-[10px] shrink-0">
                              {log.toolName}
                            </span>
                          )}
                          <span className="text-slate-300 truncate text-[11px]">
                            {log.requestSummary}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <span className="text-[10px] text-slate-400">
                            {log.durationMs}ms
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              isSuccess
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-red-500/10 text-red-400"
                            }`}
                          >
                            {log.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>
              ViVu China MCP Server v1.0.0 &bull; Chuẩn Model Context Protocol cho AI Agents
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://modelcontextprotocol.io"
              target="_blank"
              rel="noreferrer"
              className="hover:text-amber-300 flex items-center gap-1 transition-colors"
            >
              <span>Tài liệu MCP chính thức</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
