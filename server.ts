import express, { Request, Response } from "express";
import multer from "multer";
import mammoth from "mammoth";
import dotenv from "dotenv";
import { parseTripWithGemini } from "./src/lib/gemini.js";
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
