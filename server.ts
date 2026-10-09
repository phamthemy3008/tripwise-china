import express, { Request, Response } from "express";
import multer from "multer";
import mammoth from "mammoth";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { parseTripWithGemini, suggestActivities, suggestRestaurants } from "./src/lib/gemini.js";
import { SAMPLE_TRIPS } from "./src/data/sampleTrips.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Setup persistent data storage for shared trips & itineraries
const DATA_DIR = path.resolve(process.cwd(), "data");
const SHARED_TRIPS_FILE = path.join(DATA_DIR, "shared_trips.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadSharedTrips(): Record<string, any> {
  ensureDataDir();
  const map: Record<string, any> = {};
  // Pre-seed with SAMPLE_TRIPS so their IDs are directly shareable
  for (const sample of SAMPLE_TRIPS) {
    if (sample.id) {
      map[sample.id] = sample;
    }
  }

  if (fs.existsSync(SHARED_TRIPS_FILE)) {
    try {
      const fileData = fs.readFileSync(SHARED_TRIPS_FILE, "utf-8");
      const parsed = JSON.parse(fileData);
      if (parsed && typeof parsed === "object") {
        Object.assign(map, parsed);
      }
    } catch (e) {
      console.warn("Could not read shared_trips.json, using defaults:", e);
    }
  }
  return map;
}

const sharedTripsStore = loadSharedTrips();

function persistSharedTrip(id: string, trip: any) {
  try {
    ensureDataDir();
    sharedTripsStore[id] = trip;
    fs.writeFileSync(SHARED_TRIPS_FILE, JSON.stringify(sharedTripsStore, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to persist shared trip to disk:", err);
  }
}

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

        if (fileName.endsWith(".json")) {
          try {
            const jsonParsed = JSON.parse(buffer.toString("utf-8"));
            if (jsonParsed.trip_title && Array.isArray(jsonParsed.days)) {
              if (!jsonParsed.id) {
                jsonParsed.id = `trip_${Date.now()}`;
              }
              if (!jsonParsed.created_at) {
                jsonParsed.created_at = Date.now();
              }
              serverTrips.unshift(jsonParsed);
              res.json({
                success: true,
                data: jsonParsed,
              });
              return;
            }
          } catch (e: any) {
            res.status(400).json({ error: "File JSON không hợp lệ: " + e.message });
            return;
          }
        } else if (fileName.endsWith(".docx")) {
          const result = await mammoth.extractRawText({ buffer });
          extractedText = result.value;
        } else if (fileName.endsWith(".txt") || fileName.endsWith(".md")) {
          extractedText = buffer.toString("utf-8");
        } else {
          res.status(400).json({
            error: "Định dạng file không hỗ trợ. Vui lòng tải file .json, .docx, .txt hoặc .md",
          });
          return;
        }
      } else if (req.body?.text) {
        extractedText = req.body.text;
        // Check if raw text is JSON format
        if (extractedText.trim().startsWith("{")) {
          try {
            const jsonParsed = JSON.parse(extractedText.trim());
            if (jsonParsed.trip_title && Array.isArray(jsonParsed.days)) {
              if (!jsonParsed.id) jsonParsed.id = `trip_${Date.now()}`;
              if (!jsonParsed.created_at) jsonParsed.created_at = Date.now();
              serverTrips.unshift(jsonParsed);
              res.json({ success: true, data: jsonParsed });
              return;
            }
          } catch {
            // continue with AI parsing
          }
        }
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

// Helper to extract Google Doc ID or Drive File ID from any URL format
function extractGoogleDocId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  // Published web doc /document/d/e/...
  const pubMatch = trimmed.match(/\/document\/d\/e\/([a-zA-Z0-9_-]+)/);
  if (pubMatch) return pubMatch[1];

  // Standard Google Docs: /document/u/X/d/... or /document/d/...
  const docMatch = trimmed.match(/\/document\/(?:u\/\d+\/)?d\/([a-zA-Z0-9_-]+)/);
  if (docMatch) return docMatch[1];

  // Google Drive file: /file/u/X/d/... or /file/d/...
  const fileMatch = trimmed.match(/\/file\/(?:u\/\d+\/)?d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) return fileMatch[1];

  // Google Drive open link: ?id=... or &id=...
  const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch) return idMatch[1];

  // Generic /d/{id}
  const genericMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]{20,})/);
  if (genericMatch) return genericMatch[1];

  // Pure doc / file ID (typically 20+ characters)
  if (/^[a-zA-Z0-9_-]{20,}$/.test(trimmed)) return trimmed;
  return null;
}

// Helper to convert HTML into clean structured plain text
function cleanHtmlText(html: string): string {
  if (!html) return "";
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, "")
    .replace(/<\/(h[1-6]|p|div|tr|li|section|article)>/gi, "\n")
    .replace(/<\/td>/gi, " | ")
    .replace(/<br\s*[\/]?>/gi, "\n")
    .replace(/<[^>]+>/gi, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n\n")
    .trim();
}

// Helper to extract 100% of text from Google Docs API JSON AST
function extractAllTextFromGoogleDoc(docData: any): string {
  if (!docData) return "";
  const parts: string[] = [];

  function parseElements(elements: any[]) {
    if (!Array.isArray(elements)) return;
    for (const el of elements) {
      if (el.paragraph?.elements) {
        let pText = "";
        for (const pe of el.paragraph.elements) {
          if (pe.textRun?.content) {
            pText += pe.textRun.content;
          }
        }
        if (pText.trim()) parts.push(pText.trim());
      } else if (el.table?.tableRows) {
        for (const row of el.table.tableRows) {
          const rowCells: string[] = [];
          for (const cell of row.tableCells || []) {
            const cellParts: string[] = [];
            for (const contentEl of cell.content || []) {
              if (contentEl.paragraph?.elements) {
                let cellP = "";
                for (const pe of contentEl.paragraph.elements) {
                  if (pe.textRun?.content) cellP += pe.textRun.content;
                }
                if (cellP.trim()) cellParts.push(cellP.trim());
              }
            }
            if (cellParts.length > 0) {
              rowCells.push(cellParts.join(" "));
            }
          }
          if (rowCells.length > 0) {
            parts.push(rowCells.join(" | "));
          }
        }
      } else if (el.tableOfContents?.content) {
        parseElements(el.tableOfContents.content);
      }
    }
  }

  if (docData.body?.content) {
    parseElements(docData.body.content);
  }
  return parts.join("\n");
}

// Fetch Google Docs / Drive file content with maximum fidelity across multiple strategies
async function fetchGoogleDocContent(docId: string, accessToken?: string): Promise<string> {
  const browserHeaders: Record<string, string> = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,application/vnd.openxmlformats-officedocument.wordprocessingml.document,*/*;q=0.8",
  };

  // ==========================================
  // STRATEGY A: OAuth API Access (For User's Personal Docs / Drive Files)
  // ==========================================
  if (accessToken) {
    // A1: Google Docs API (Structured JSON for native Google Docs)
    try {
      const apiRes = await fetch(`https://docs.googleapis.com/v1/documents/${docId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      });
      if (apiRes.ok) {
        const docData = await apiRes.json();
        const apiText = extractAllTextFromGoogleDoc(docData);
        if (apiText && apiText.trim().length > 30) {
          console.log(`[Google Docs API] Success: ${apiText.length} characters extracted.`);
          return apiText;
        }
      }
    } catch (err: any) {
      console.warn("[Google Docs API Error]:", err?.message);
    }

    // A2: Google Drive API Export (For native Docs / Sheets to text)
    try {
      const driveExportRes = await fetch(
        `https://www.googleapis.com/drive/v3/files/${docId}/export?mimeType=text/plain`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (driveExportRes.ok) {
        const text = await driveExportRes.text();
        if (text && text.trim().length > 30) {
          console.log(`[Google Drive Export] Success: ${text.length} characters.`);
          return text;
        }
      }
    } catch (err: any) {
      console.warn("[Google Drive Export Error]:", err?.message);
    }

    // A3: Google Drive API Media Download (For .docx, .txt uploaded to Drive)
    try {
      const driveMediaRes = await fetch(
        `https://www.googleapis.com/drive/v3/files/${docId}?alt=media`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (driveMediaRes.ok) {
        const arrayBuffer = await driveMediaRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        // Check for PK ZIP header (Word .docx)
        if (buffer.length > 4 && buffer[0] === 0x50 && buffer[1] === 0x4b) {
          const mammothResult = await mammoth.extractRawText({ buffer });
          if (mammothResult.value && mammothResult.value.trim().length > 30) {
            console.log(`[Google Drive Media .docx] Success: ${mammothResult.value.length} characters.`);
            return mammothResult.value;
          }
        } else {
          const plainText = buffer.toString("utf-8");
          if (plainText && !plainText.includes("<!DOCTYPE html>") && plainText.trim().length > 30) {
            return plainText;
          }
        }
      }
    } catch (err: any) {
      console.warn("[Google Drive Media Error]:", err?.message);
    }
  }

  // ==========================================
  // STRATEGY B: Public / Link-Shared Documents
  // ==========================================

  // B1: Google Docs mobilebasic view (Lightweight HTML view without login wall)
  try {
    const mobileUrl = `https://docs.google.com/document/d/${docId}/mobilebasic`;
    const mobileRes = await fetch(mobileUrl, {
      headers: browserHeaders,
      redirect: "follow",
    });
    if (mobileRes.ok) {
      const html = await mobileRes.text();
      if (!html.includes('service="wise"') && !html.includes("accounts.google.com/ServiceLogin")) {
        const cleaned = cleanHtmlText(html);
        if (cleaned && cleaned.length > 40) {
          console.log(`[Google Docs mobilebasic] Success: ${cleaned.length} characters.`);
          return cleaned;
        }
      }
    }
  } catch (err: any) {
    console.warn("[Google Docs mobilebasic Error]:", err?.message);
  }

  // B2: Export as .docx & parse with mammoth (Captures 100% of tables & columns)
  try {
    const exportDocxUrl = `https://docs.google.com/document/d/${docId}/export?format=docx`;
    const docxRes = await fetch(exportDocxUrl, {
      headers: browserHeaders,
      redirect: "follow",
    });
    const contentType = docxRes.headers.get("content-type") || "";
    if (docxRes.ok && !contentType.includes("text/html")) {
      const arrayBuffer = await docxRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      if (buffer.length > 4 && buffer[0] === 0x50 && buffer[1] === 0x4b) {
        const mammothResult = await mammoth.extractRawText({ buffer });
        if (mammothResult.value && mammothResult.value.trim().length > 30) {
          console.log(`[Google Docs docx export] Success: ${mammothResult.value.length} characters.`);
          return mammothResult.value;
        }
      }
    }
  } catch (err: any) {
    console.warn("[Google Docs docx export Error]:", err?.message);
  }

  // B3: Export as .txt
  try {
    const exportTxtUrl = `https://docs.google.com/document/d/${docId}/export?format=txt`;
    const txtRes = await fetch(exportTxtUrl, {
      headers: browserHeaders,
      redirect: "follow",
    });
    const contentType = txtRes.headers.get("content-type") || "";
    if (txtRes.ok && !contentType.includes("text/html")) {
      const txt = await txtRes.text();
      if (txt && !txt.includes("<!DOCTYPE html>") && txt.trim().length > 20) {
        console.log(`[Google Docs txt export] Success: ${txt.length} characters.`);
        return txt;
      }
    }
  } catch (err: any) {
    console.warn("[Google Docs txt export Error]:", err?.message);
  }

  // B4: Export as HTML
  try {
    const exportHtmlUrl = `https://docs.google.com/document/d/${docId}/export?format=html`;
    const htmlRes = await fetch(exportHtmlUrl, {
      headers: browserHeaders,
      redirect: "follow",
    });
    if (htmlRes.ok) {
      const html = await htmlRes.text();
      if (!html.includes("accounts.google.com/ServiceLogin")) {
        const cleaned = cleanHtmlText(html);
        if (cleaned && cleaned.length > 40) {
          console.log(`[Google Docs html export] Success: ${cleaned.length} characters.`);
          return cleaned;
        }
      }
    }
  } catch (err: any) {
    console.warn("[Google Docs html export Error]:", err?.message);
  }

  // B5: Google Drive public download
  try {
    const driveDlUrl = `https://drive.google.com/uc?id=${docId}&export=download`;
    const driveDlRes = await fetch(driveDlUrl, {
      headers: browserHeaders,
      redirect: "follow",
    });
    if (driveDlRes.ok) {
      const arrayBuffer = await driveDlRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      if (buffer.length > 4 && buffer[0] === 0x50 && buffer[1] === 0x4b) {
        const mammothResult = await mammoth.extractRawText({ buffer });
        if (mammothResult.value && mammothResult.value.trim().length > 30) {
          return mammothResult.value;
        }
      } else {
        const text = buffer.toString("utf-8");
        if (text && !text.includes("<!DOCTYPE html>") && text.trim().length > 30) {
          return text;
        }
      }
    }
  } catch (err: any) {
    console.warn("[Google Drive direct download Error]:", err?.message);
  }

  // B6: Published Web Doc (/pub)
  try {
    const pubUrl = `https://docs.google.com/document/d/e/${docId}/pub`;
    const pubRes = await fetch(pubUrl, { headers: browserHeaders, redirect: "follow" });
    if (pubRes.ok) {
      const html = await pubRes.text();
      const cleaned = cleanHtmlText(html);
      if (cleaned && cleaned.length > 40) return cleaned;
    }
  } catch (err) {
    // ignore
  }

  return "";
}

// API: Parse from Google Docs Link / ID
app.post("/api/fetch-google-doc", async (req: Request, res: Response) => {
  try {
    const { url, accessToken } = req.body;
    if (!url) {
      res.status(400).json({ error: "Vui lòng cung cấp liên kết Google Docs hoặc Google Drive." });
      return;
    }

    const docId = extractGoogleDocId(url);
    if (!docId) {
      res.status(400).json({
        error:
          "Định dạng liên kết không hợp lệ. Hỗ trợ liên kết Google Docs (docs.google.com/document/d/...) và Google Drive (drive.google.com/file/d/...).",
      });
      return;
    }

    const extractedText = await fetchGoogleDocContent(docId, accessToken);
    if (!extractedText.trim()) {
      res.status(400).json({
        error:
          "Không thể đọc nội dung tài liệu. Vui lòng kiểm tra:\n1. Bật quyền chia sẻ: 'Bất kỳ ai có đường liên kết đều có thể xem' (Anyone with the link can view).\n2. Hoặc nếu là file riêng tư trong Google Drive, hãy bấm nút 'Cấp quyền Google Docs' để ứng dụng đọc trực tiếp.",
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
        error:
          "Không thể đồng bộ nội dung từ Google Docs/Drive. Vui lòng kiểm tra quyền chia sẻ liên kết (Bất kỳ ai có liên kết đều có thể xem) hoặc cấp quyền Google Workspace trong tài khoản.",
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

// API: Suggest restaurants for dish / place / city
app.post("/api/suggest-restaurants", async (req: Request, res: Response) => {
  try {
    const { dishName, dishZh, city, placeName } = req.body;
    if (!city && !dishName && !placeName) {
      res.status(400).json({ error: "Thiếu thông tin thành phố hoặc món ăn." });
      return;
    }
    const restaurants = await suggestRestaurants({
      dishName,
      dishZh,
      city: city || "Trung Quốc",
      placeName,
    });
    res.json({ success: true, data: restaurants });
  } catch (error: any) {
    console.error("Suggest restaurants error:", error);
    res.status(500).json({ error: error.message || "Lỗi khi gợi ý quán ăn" });
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
  const tripId = trip.id || `trip_${Date.now()}`;
  const preparedTrip = { ...trip, id: tripId };
  
  const index = serverTrips.findIndex((t) => t.id === tripId);
  if (index >= 0) {
    serverTrips[index] = preparedTrip;
  } else {
    serverTrips.unshift(preparedTrip);
  }
  persistSharedTrip(tripId, preparedTrip);
  res.json({ success: true, data: preparedTrip });
});

// API: Share Itinerary publicly (Generate permanent share ID and persist)
app.post("/api/share", (req: Request, res: Response) => {
  try {
    const { trip } = req.body;
    if (!trip || !trip.trip_title || !Array.isArray(trip.days)) {
      res.status(400).json({ error: "Dữ liệu lịch trình không hợp lệ để chia sẻ" });
      return;
    }
    const shareId = trip.id || `trip_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const sharedTrip = {
      ...trip,
      id: shareId,
      shared_at: Date.now(),
      is_shared: true,
    };

    // Save to disk store
    persistSharedTrip(shareId, sharedTrip);

    // Keep in serverTrips list
    const existingIdx = serverTrips.findIndex((t) => t.id === shareId);
    if (existingIdx >= 0) {
      serverTrips[existingIdx] = sharedTrip;
    } else {
      serverTrips.unshift(sharedTrip);
    }

    res.json({
      success: true,
      shareId,
      data: sharedTrip,
    });
  } catch (error: any) {
    console.error("Share Itinerary Error:", error);
    res.status(500).json({ error: error.message || "Lỗi khi chia sẻ lịch trình" });
  }
});

// API: Get Shared Itinerary by shareId (Accessible publicly without authentication)
app.get("/api/share/:id", (req: Request, res: Response) => {
  const id = req.params.id;
  // 1. Check persistent sharedTripsStore
  if (sharedTripsStore[id]) {
    res.json({ success: true, data: sharedTripsStore[id] });
    return;
  }
  // 2. Check serverTrips
  const fromServer = serverTrips.find((t) => t.id === id);
  if (fromServer) {
    res.json({ success: true, data: fromServer });
    return;
  }
  // 3. Check SAMPLE_TRIPS
  const fromSample = SAMPLE_TRIPS.find((t) => t.id === id);
  if (fromSample) {
    res.json({ success: true, data: fromSample });
    return;
  }
  res.status(404).json({
    success: false,
    error: "Không tìm thấy lịch trình được chia sẻ hoặc liên kết không tồn tại.",
  });
});

app.get("/api/trips/:id", (req: Request, res: Response) => {
  const id = req.params.id;
  const trip =
    serverTrips.find((t) => t.id === id) ||
    sharedTripsStore[id] ||
    SAMPLE_TRIPS.find((t) => t.id === id);

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
