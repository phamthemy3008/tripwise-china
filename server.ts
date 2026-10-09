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

// Helper to extract 100% of text from Google Docs JSON including tables, rows, cells, and paragraphs
function extractAllTextFromGoogleDoc(docData: any): string {
  if (!docData?.body?.content) return "";
  let fullText = "";

  function walk(elements: any[]) {
    for (const el of elements) {
      if (el.paragraph?.elements) {
        for (const pe of el.paragraph.elements) {
          if (pe.textRun?.content) {
            fullText += pe.textRun.content;
          }
        }
      } else if (el.table?.tableRows) {
        for (const row of el.table.tableRows) {
          const cells: string[] = [];
          for (const cell of row.tableCells || []) {
            if (cell.content) {
              const start = fullText.length;
              walk(cell.content);
              const cellText = fullText.substring(start).trim();
              fullText = fullText.substring(0, start);
              if (cellText) cells.push(cellText);
            }
          }
          if (cells.length > 0) {
            fullText += cells.join(" | ") + "\n";
          }
        }
      } else if (el.tableOfContents?.content) {
        walk(el.tableOfContents.content);
      }
    }
  }

  walk(docData.body.content);
  return fullText;
}

// Fetch Google Docs text with maximum fidelity (docx export with mammoth > Docs API > txt export)
async function fetchGoogleDocContent(docId: string, accessToken?: string): Promise<string> {
  // Strategy 1: Export as .docx & parse with mammoth (Captures 100% of tables, lists & columns!)
  try {
    const exportDocxUrl = `https://docs.google.com/document/d/${docId}/export?format=docx`;
    const docxRes = await fetch(exportDocxUrl, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });
    if (docxRes.ok) {
      const arrayBuffer = await docxRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const mammothResult = await mammoth.extractRawText({ buffer });
      if (mammothResult.value && mammothResult.value.trim().length > 30) {
        return mammothResult.value;
      }
    }
  } catch (err) {
    console.warn("Google Docs docx export fallback:", err);
  }

  // Strategy 2: Google Docs API (if accessToken available) with recursive table/cell walker
  if (accessToken) {
    try {
      const apiRes = await fetch(`https://docs.googleapis.com/v1/documents/${docId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (apiRes.ok) {
        const docData = await apiRes.json();
        const apiText = extractAllTextFromGoogleDoc(docData);
        if (apiText && apiText.trim().length > 30) {
          return apiText;
        }
      }
    } catch (err) {
      console.warn("Google Docs API fallback:", err);
    }
  }

  // Strategy 3: Export as .txt
  try {
    const exportTxtUrl = `https://docs.google.com/document/d/${docId}/export?format=txt`;
    const txtRes = await fetch(exportTxtUrl, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });
    if (txtRes.ok) {
      const txt = await txtRes.text();
      if (txt && !txt.includes("<!DOCTYPE html>") && txt.trim().length > 20) {
        return txt;
      }
    }
  } catch (err) {
    console.warn("Google Docs txt export fallback:", err);
  }

  return "";
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

    const extractedText = await fetchGoogleDocContent(docId, accessToken);
    if (!extractedText.trim()) {
      res.status(400).json({
        error:
          "Không thể đọc tài liệu Google Docs này. Hãy đảm bảo tài liệu được bật quyền: 'Bất kỳ ai có đường liên kết đều có thể xem' (Anyone with the link can view).",
      });
      return;
    }

    // Process with Gemini with full fidelity
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

// API: Re-sync existing trip from its Google Doc safely
app.post("/api/sync-google-doc", async (req: Request, res: Response) => {
  try {
    const { docUrl, tripId, existingTrip, accessToken } = req.body;
    if (!docUrl) {
      res.status(400).json({ error: "Không tìm thấy liên kết Google Docs nguồn." });
      return;
    }

    const docId = extractGoogleDocId(docUrl);
    if (!docId) {
      res.status(400).json({ error: "ID tài liệu Google Docs không hợp lệ." });
      return;
    }

    const extractedText = await fetchGoogleDocContent(docId, accessToken);
    if (!extractedText.trim()) {
      res.status(400).json({
        error: "Không thể kết nối đến Google Docs. Vui lòng kiểm tra quyền chia sẻ liên kết.",
      });
      return;
    }

    const updated = await parseTripWithGemini(extractedText);
    const targetTripId = tripId || existingTrip?.id;
    if (targetTripId) updated.id = targetTripId;
    if (existingTrip?.created_at) updated.created_at = existingTrip.created_at;
    updated.source_doc_url = docUrl;
    updated.source_doc_id = docId;
    updated.last_synced_at = Date.now();

    // Preserve any custom user-added activities that are not in the new doc
    if (existingTrip?.days && updated?.days) {
      updated.days = updated.days.map((newDay) => {
        const oldDay = existingTrip.days.find((d: any) => d.day_number === newDay.day_number);
        if (!oldDay) return newDay;
        const customEvents = (oldDay.events || []).filter((oldEvent: any) => {
          return !newDay.events.some((ne: any) =>
            ne.place_name?.toLowerCase() === oldEvent.place_name?.toLowerCase() ||
            (ne.place_zh && ne.place_zh === oldEvent.place_zh)
          );
        });
        return {
          ...newDay,
          events: [...newDay.events, ...customEvents],
        };
      });
    }

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
