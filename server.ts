import express, { Request, Response } from "express";
import multer from "multer";
import mammoth from "mammoth";
import dotenv from "dotenv";
import { parseTripWithGemini, suggestActivities } from "./src/lib/gemini.js";
import { SAMPLE_TRIPS } from "./src/data/sampleTrips.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Setup Multer for in-memory file parsing (.docx, .txt, .md)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
});

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// In-memory / server cache for trips
let serverTrips = [...SAMPLE_TRIPS];

// API: Parse Itinerary endpoint (File or Raw Text -> Gemini AI)
app.post(
  "/api/parse-itinerary",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      let extractedText = "";

      if (req.file) {
        const buffer = req.file.buffer;
        const fileName = req.file.originalname.toLowerCase();

        if (fileName.endsWith(".docx")) {
          const result = await mammoth.extractRawText({ buffer });
          extractedText = result.value;
        } else if (fileName.endsWith(".txt") || fileName.endsWith(".md")) {
          extractedText = buffer.toString("utf-8");
        } else {
          res.status(400).json({
            error: "Định dạng file không hỗ trợ. Vui lòng tải file .docx, .txt hoặc .md",
          });
          return;
        }
      } else if (req.body?.text) {
        extractedText = req.body.text;
      } else {
        res.status(400).json({
          error: "Vui lòng tải lên file hoặc nhập nội dung văn bản lịch trình.",
        });
        return;
      }

      if (!extractedText.trim()) {
        res.status(400).json({ error: "Nội dung văn bản lịch trình trống." });
        return;
      }

      // Process with Gemini 2.5 Flash
      const structuredItinerary = await parseTripWithGemini(extractedText);

      // Cache on server
      serverTrips.unshift(structuredItinerary);

      res.json({
        success: true,
        data: structuredItinerary,
      });
    } catch (error: any) {
      console.error("Parse Itinerary Error:", error);
      res.status(500).json({
        error: error.message || "Lỗi máy chủ trong quá trình xử lý lịch trình bằng AI",
      });
    }
  }
);

// Helper to extract Google Doc ID from URL
function extractGoogleDocId(input: string): string | null {
  const match = input.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
  if (match) return match[1];
  if (/^[a-zA-Z0-9-_]{20,}$/.test(input.trim())) return input.trim();
  return null;
}

// API: Parse from Google Docs Link / ID
app.post("/api/fetch-google-doc", async (req: Request, res: Response) => {
  try {
    const { url, accessToken } = req.body;
    if (!url) {
      res.status(400).json({ error: "Vui lòng cung cấp liên kết Google Docs." });
      return;
    }

    const docId = extractGoogleDocId(url);
    if (!docId) {
      res.status(400).json({
        error: "Định dạng liên kết Google Docs không hợp lệ. Ví dụ: https://docs.google.com/document/d/.../edit",
      });
      return;
    }

    let extractedText = "";

    // 1. If accessToken is provided, try Google Docs API
    if (accessToken) {
      try {
        const apiRes = await fetch(
          `https://docs.googleapis.com/v1/documents/${docId}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        if (apiRes.ok) {
          const docData = await apiRes.json();
          // Extract structural text from Google Docs JSON
          const content = docData.body?.content || [];
          extractedText = content
            .map((c: any) =>
              c.paragraph?.elements
                ?.map((e: any) => e.textRun?.content || "")
                .join("") || ""
            )
            .join("\n");
        }
      } catch (e) {
        console.warn("Google Docs API fetch error, falling back to export endpoint:", e);
      }
    }

    // 2. Fallback / Public Export endpoint
    if (!extractedText.trim()) {
      const exportUrl = `https://docs.google.com/document/d/${docId}/export?format=txt`;
      const exportRes = await fetch(exportUrl, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });

      if (!exportRes.ok) {
        res.status(400).json({
          error:
            "Không thể đọc tài liệu Google Docs này. Hãy đảm bảo tài liệu được bật chế độ chia sẻ: 'Bất kỳ ai có đường liên kết đều có thể xem' (Anyone with the link can view).",
        });
        return;
      }

      extractedText = await exportRes.text();
    }

    if (!extractedText.trim() || extractedText.includes("<!DOCTYPE html>")) {
      res.status(400).json({
        error:
          "Nội dung Google Docs trống hoặc tài liệu yêu cầu quyền truy cập. Hãy bật quyền xem liên kết trên Google Docs.",
      });
      return;
    }

    // Process with Gemini 2.5 Flash
    const structuredItinerary = await parseTripWithGemini(extractedText);
    structuredItinerary.source_doc_url = url;
    structuredItinerary.source_doc_id = docId;
    structuredItinerary.last_synced_at = Date.now();

    res.json({
      success: true,
      data: structuredItinerary,
    });
  } catch (error: any) {
    console.error("Fetch Google Doc Error:", error);
    res.status(500).json({
      error: error.message || "Lỗi khi đọc và phân tích Google Docs",
    });
  }
});

// API: Re-sync existing trip from its Google Doc
app.post("/api/sync-google-doc", async (req: Request, res: Response) => {
  try {
    const { docUrl, tripId, accessToken } = req.body;
    if (!docUrl) {
      res.status(400).json({ error: "Không tìm thấy liên kết Google Docs nguồn." });
      return;
    }

    const docId = extractGoogleDocId(docUrl);
    if (!docId) {
      res.status(400).json({ error: "ID tài liệu Google Docs không hợp lệ." });
      return;
    }

    let extractedText = "";

    // Try Docs API if accessToken provided
    if (accessToken) {
      try {
        const apiRes = await fetch(
          `https://docs.googleapis.com/v1/documents/${docId}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        if (apiRes.ok) {
          const docData = await apiRes.json();
          extractedText = (docData.body?.content || [])
            .map((c: any) =>
              c.paragraph?.elements
                ?.map((e: any) => e.textRun?.content || "")
                .join("") || ""
            )
            .join("\n");
        }
      } catch (e) {
        console.warn("Docs API sync fallback:", e);
      }
    }

    if (!extractedText.trim()) {
      const exportUrl = `https://docs.google.com/document/d/${docId}/export?format=txt`;
      const exportRes = await fetch(exportUrl, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
      if (!exportRes.ok) {
        res.status(400).json({
          error: "Không thể kết nối đến Google Docs. Vui lòng kiểm tra quyền chia sẻ.",
        });
        return;
      }
      extractedText = await exportRes.text();
    }

    const updated = await parseTripWithGemini(extractedText);
    if (tripId) updated.id = tripId;
    updated.source_doc_url = docUrl;
    updated.source_doc_id = docId;
    updated.last_synced_at = Date.now();

    res.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    console.error("Sync Google Doc Error:", error);
    res.status(500).json({
      error: error.message || "Lỗi đồng bộ Google Docs",
    });
  }
});

// API: Suggest activities for city/day
app.post("/api/suggest-activities", async (req: Request, res: Response) => {
  try {
    const { city, dayNumber, existingPlaces, category } = req.body;
    if (!city) {
      res.status(400).json({ error: "Thiếu thông tin thành phố." });
      return;
    }
    const suggestions = await suggestActivities({
      city,
      dayNumber: Number(dayNumber) || 1,
      existingPlaces: existingPlaces || [],
      category: category || "all",
    });
    res.json({ success: true, data: suggestions });
  } catch (error: any) {
    console.error("Suggest activities error:", error);
    res.status(500).json({ error: error.message || "Lỗi khi gợi ý địa điểm" });
  }
});

// API: CRUD Trips
app.get("/api/trips", (_req: Request, res: Response) => {
  res.json({ success: true, data: serverTrips });
});

app.post("/api/trips", (req: Request, res: Response) => {
  const trip = req.body;
  if (!trip || !trip.trip_title) {
    res.status(400).json({ error: "Dữ liệu lịch trình không hợp lệ" });
    return;
  }
  const index = serverTrips.findIndex((t) => t.id === trip.id);
  if (index >= 0) {
    serverTrips[index] = trip;
  } else {
    serverTrips.unshift(trip);
  }
  res.json({ success: true, data: trip });
});

app.get("/api/trips/:id", (req: Request, res: Response) => {
  const trip = serverTrips.find((t) => t.id === req.params.id);
  if (!trip) {
    res.status(404).json({ error: "Không tìm thấy chuyến đi" });
    return;
  }
  res.json({ success: true, data: trip });
});

// API: Public client runtime configuration
app.get("/api/config", (_req: Request, res: Response) => {
  res.json({
    firebase: {
      apiKey: process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY || "",
      authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN || "",
      projectId: process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || "",
      storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET || "",
      messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID || "",
      appId: process.env.VITE_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID || "",
    },
  });
});

// Configure Vite middleware in development, static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static build in production
    const path = await import("path");
    const distPath = path.resolve(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  app.listen(PORT, () => {
    console.log(`TripWise China Server running on port ${PORT}`);
  });
}

startServer();
